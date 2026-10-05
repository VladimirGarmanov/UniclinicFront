#!/usr/bin/env python3
"""Explicit, local-on-server deployment for uniclinic.pro on Ubuntu 24.04.

This tool never SSHes, pushes Git, rewrites history, deletes releases, or resets a DB.
Run --help on any platform. Mutating commands require root on the target Ubuntu host.
"""
import argparse
from datetime import datetime, timezone
import fcntl
import hashlib
import json
import os
from pathlib import Path
import platform
import pwd
import re
import secrets
import shutil
import socket
import sqlite3
import subprocess
import sys
import tarfile
import tempfile
import time
from urllib.request import urlopen

FRONT = Path(__file__).resolve().parents[1]
BASE = Path('/srv/uniclinic')
RELEASES = BASE / 'releases'
CURRENT = BASE / 'current'
PREVIOUS = BASE / 'previous'
CACHE = Path('/var/cache/uniclinic')
SETTINGS = Path('/etc/uniclinic')
DATABASE = Path('/var/lib/uniclinic/questions.db')
BACKUPS = Path('/var/backups/uniclinic')
NGINX_SITE = Path('/etc/nginx/conf.d/uniclinic.conf')
UNIT = Path('/etc/systemd/system/uniclinic-api.service')
NODE_VERSION = '24.21.0'
NODE_ROOT = Path('/opt/uniclinic/toolchain') / ('node-v' + NODE_VERSION)
NODE_BIN = NODE_ROOT / 'bin'
# Official nodejs.org v24.21.0 SHASUMS256.txt; download is also authenticated by HTTPS.
NODE_SHA256 = {
    'x64': 'fd8e59d5a511510f6a298afb548f18c7d2b1be404d8b4a27d94fbe49f56cb2d6',
    'arm64': '6ad1325edbdb5649c379b75a237147a666c95d4f9ae8d340fef2d1575d289ad2',
}
MARKER = '# Managed by Uniclinic deployment.'


def run(*args, cwd=None, capture=False, check=True):
    return subprocess.run([str(arg) for arg in args], cwd=cwd, check=check,
                          text=True, stdout=subprocess.PIPE if capture else None,
                          stderr=subprocess.PIPE if capture else None)


def say(message):
    print(message, flush=True)


def require_host():
    if platform.system() != 'Linux' or os.geteuid() != 0:
        raise RuntimeError('Run this command as root on the Ubuntu server, not on your Mac.')
    release = dict(line.split('=', 1) for line in Path('/etc/os-release').read_text().splitlines() if '=' in line)
    if release.get('ID', '').strip('"') != 'ubuntu' or release.get('VERSION_ID', '').strip('"') != '24.04':
        raise RuntimeError('Supported target: Ubuntu 24.04. No changes made; adapt the installer for a different OS.')


def atomic_text(file, text, mode=0o644):
    file.parent.mkdir(parents=True, exist_ok=True)
    temporary = file.with_name(file.name + '.new')
    with temporary.open('w', encoding='utf-8') as stream:
        os.chmod(temporary, mode)
        stream.write(text)
    temporary.replace(file)


def atomic_link(target, link):
    if link.exists() and not link.is_symlink():
        raise RuntimeError(f'Refusing to replace a real directory/file: {link}')
    temporary = link.with_name(link.name + '.new')
    if temporary.is_symlink():
        temporary.unlink()
    temporary.symlink_to(target)
    temporary.replace(link)


def ensure_account(name, home):
    try:
        return pwd.getpwnam(name)
    except KeyError:
        run('useradd', '--system', '--user-group', '--home-dir', home, '--shell', '/usr/sbin/nologin', name)
        return pwd.getpwnam(name)


def check_nginx_ownership():
    if NGINX_SITE.exists() and MARKER not in NGINX_SITE.read_text():
        raise RuntimeError(f'Refusing to overwrite an unmanaged config: {NGINX_SITE}')
    if UNIT.exists() and not (SETTINGS / 'managed').exists():
        raise RuntimeError(f'Refusing to take ownership of existing service: {UNIT}')
    if not shutil.which('nginx'):
        return
    result = run('nginx', '-T', capture=True)
    current_file = ''
    conflicts = set()
    owned = {str(NGINX_SITE)}
    if CURRENT.is_symlink() and CURRENT.resolve().parent == RELEASES and (SETTINGS / 'managed').is_file():
        owned.update({str(CURRENT / 'deploy/nginx.conf'), str(CURRENT.resolve() / 'deploy/nginx.conf')})
    for line in result.stdout.splitlines():
        if line.startswith('# configuration file '):
            current_file = line.removeprefix('# configuration file ').removesuffix(':')
        if re.search(r'^\s*server_name\s+.*uniclinic\.pro', line) and current_file not in owned:
            conflicts.add(current_file)
    if conflicts:
        raise RuntimeError('Existing uniclinic vhost must be reviewed/disabled manually first: ' + ', '.join(sorted(conflicts)))


def install_node():
    if (NODE_BIN / 'node').exists():
        return
    architecture = {'x86_64': 'x64', 'aarch64': 'arm64'}.get(platform.machine())
    if architecture not in NODE_SHA256:
        raise RuntimeError('Node installer supports x86_64 and aarch64 only.')
    filename = f'node-v{NODE_VERSION}-linux-{architecture}.tar.xz'
    NODE_ROOT.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='uniclinic-node-') as temp:
        archive = Path(temp) / filename
        say(f'Downloading official Node {NODE_VERSION} ({architecture})…')
        with urlopen(f'https://nodejs.org/dist/v{NODE_VERSION}/{filename}', timeout=120) as response, archive.open('wb') as stream:
            shutil.copyfileobj(response, stream)
        with archive.open('rb') as stream:
            digest = hashlib.file_digest(stream, 'sha256').hexdigest()
        if digest != NODE_SHA256[architecture]:
            raise RuntimeError('Node SHA-256 mismatch. Installation stopped.')
        with tarfile.open(archive) as source:
            source.extractall(temp, filter='data')
        shutil.move(str(Path(temp) / filename.removesuffix('.tar.xz')), NODE_ROOT)
    run(NODE_BIN / 'node', '--version')


def setup():
    check_nginx_ownership()
    run('apt-get', 'update')
    run('apt-get', 'install', '-y', 'git', 'nginx', 'certbot', 'python3-venv', 'python3-dev',
        'build-essential', 'curl', 'ca-certificates', 'xz-utils', 'rsync', 'fonts-dejavu-core')
    runtime = ensure_account('uniclinic', '/var/lib/uniclinic')
    builder = ensure_account('uniclinic-build', str(CACHE))
    for directory in (BASE, RELEASES, BASE / 'shared', BASE / 'shared/assets', BASE / 'shared/media'):
        directory.mkdir(parents=True, exist_ok=True, mode=0o755)
    for directory in (DATABASE.parent, CACHE):
        directory.mkdir(parents=True, exist_ok=True, mode=0o700)
    os.chown(DATABASE.parent, runtime.pw_uid, runtime.pw_gid)
    os.chown(CACHE, builder.pw_uid, builder.pw_gid)
    SETTINGS.mkdir(parents=True, exist_ok=True, mode=0o700)
    BACKUPS.mkdir(parents=True, exist_ok=True, mode=0o700)
    for directory in (DATABASE.parent, CACHE, SETTINGS, BACKUPS):
        directory.chmod(0o700)
    env_file = SETTINGS / 'backend.env'
    if not env_file.exists():
        # Do not copy any old .env from Git. Never print a generated password into logs.
        atomic_text(env_file, '\n'.join([
            'ADMIN_PASSWORD=' + secrets.token_urlsafe(32), f'DB_PATH={DATABASE}',
            'SITE_ORIGIN=https://uniclinic.pro', 'CORS_ORIGINS=https://uniclinic.pro',
            'COOKIE_SECURE=true', 'CONSENT_VERSION=2026-10-04',
            'SMTP_HOST=', 'SMTP_PORT=465', 'SMTP_USERNAME=', 'SMTP_PASSWORD=',
            'SMTP_USE_SSL=true', 'MAIL_FROM=', 'MAIL_TO=', '',
        ]), 0o600)
    atomic_text(SETTINGS / 'managed', 'uniclinic.pro\n', 0o600)
    install_node()
    Path('/var/www/acme/.well-known/acme-challenge').mkdir(parents=True, exist_ok=True)
    if not NGINX_SITE.exists():
        shutil.copyfile(FRONT / 'deploy/nginx-bootstrap.conf', NGINX_SITE)
    run('nginx', '-t')
    run('systemctl', 'enable', '--now', 'nginx')
    run('systemctl', 'reload', 'nginx')
    hook = Path('/etc/letsencrypt/renewal-hooks/deploy/uniclinic-nginx')
    atomic_text(hook, '#!/bin/sh\nset -eu\n/usr/sbin/nginx -t\n/bin/systemctl reload nginx\n', 0o755)
    run('systemctl', 'enable', '--now', 'certbot.timer')
    say('Setup ready. Secrets: /etc/uniclinic/backend.env (root only). No patient database was created or replaced.')


def require_setup():
    if not (SETTINGS / 'managed').is_file() or not (NODE_BIN / 'node').exists():
        raise RuntimeError('Run setup first.')


def initialize_database(source=None, empty=False):
    require_setup()
    if DATABASE.exists():
        raise RuntimeError(f'Database already exists; it will not be replaced: {DATABASE}')
    temporary = DATABASE.with_suffix('.importing')
    if temporary.exists():
        raise RuntimeError(f'Inspect a previous incomplete import first: {temporary}')
    fd = os.open(temporary, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
    os.close(fd)
    if not empty:
        if not source or not source.is_file():
            temporary.unlink()
            raise RuntimeError('Provide --from-file with a SQLite backup, or explicitly choose --empty.')
        with sqlite3.connect(source.resolve().as_uri() + '?mode=ro', uri=True) as old, sqlite3.connect(temporary) as new:
            if not old.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name='questions'").fetchone():
                raise RuntimeError('Source does not contain the questions table. Import not activated.')
            old.backup(new)
            if new.execute('PRAGMA integrity_check').fetchone()[0] != 'ok':
                raise RuntimeError('Source DB is damaged. Import retained for inspection, not activated.')
    runtime = pwd.getpwnam('uniclinic')
    os.chown(temporary, runtime.pw_uid, runtime.pw_gid)
    temporary.replace(DATABASE)
    say('Database prepared; the API will apply additive migrations on first start.')


def backup_database():
    if not DATABASE.is_file():
        raise RuntimeError('Database is missing. Use database --from-file or database --empty explicitly.')
    destination = BACKUPS / ('db-' + datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%fZ') + '.sqlite')
    fd = os.open(destination, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
    os.close(fd)
    with sqlite3.connect(DATABASE.resolve().as_uri() + '?mode=ro', uri=True) as original, sqlite3.connect(destination) as copy:
        original.backup(copy)
        if copy.execute('PRAGMA integrity_check').fetchone()[0] != 'ok':
            raise RuntimeError('Backup integrity check failed; activation stopped.')
    say(f'Database backup: {destination}')
    return destination


def clean_commit(repo):
    if not (repo / '.git').exists():
        raise RuntimeError(f'Clone the repository first: {repo}')
    if run('git', '-C', repo, 'status', '--porcelain', capture=True).stdout.strip():
        raise RuntimeError(f'Commit or preserve local changes first; deploy never resets/cleans a checkout: {repo}')
    tracked = run('git', '-C', repo, 'ls-tree', '-r', '--name-only', 'HEAD', capture=True).stdout.splitlines()
    if '.env' in tracked or any(name.endswith(('.db', '.sqlite', '.pem')) for name in tracked):
        raise RuntimeError(f'Commit removal of tracked secrets/database files before deploying: {repo}')
    return run('git', '-C', repo, 'rev-parse', 'HEAD', capture=True).stdout.strip()


def archive_repository(repo, destination):
    destination.mkdir(parents=True, exist_ok=False)
    # Git archive exports only the exact committed revision, never .git or untracked secrets.
    with tempfile.TemporaryFile() as archive:
        subprocess.run(['git', '-C', str(repo), 'archive', '--format=tar', 'HEAD'], stdout=archive, check=True)
        archive.seek(0)
        with tarfile.open(fileobj=archive) as source:
            source.extractall(destination, filter='data')


def build_release(backend):
    require_setup()
    front_sha, back_sha = clean_commit(FRONT), clean_commit(backend)
    if shutil.disk_usage(BASE).free < 4 * 1024**3:
        raise RuntimeError('At least 4 GiB free disk space is needed to prepare a release without deleting old data.')
    name = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ') + f'-{front_sha[:8]}-{back_sha[:8]}'
    release = RELEASES / name
    release.mkdir()
    work = CACHE / name
    work.mkdir()
    front_work = work / 'frontend'
    archive_repository(FRONT, front_work)
    archive_repository(backend, release / 'backend')
    shutil.copytree(front_work / 'deploy', release / 'deploy')
    run('chown', '-R', 'uniclinic-build:uniclinic-build', work, release)
    # npm lifecycle scripts execute as a dedicated build account, not as root/runtime user.
    common = ['runuser', '-u', 'uniclinic-build', '--', 'env', f'PATH={NODE_BIN}:/usr/bin:/bin', f'npm_config_cache={CACHE}/npm']
    run(*common, 'npm', 'ci', '--no-audit', '--no-fund', cwd=front_work)
    run(*common, 'env', 'SITE_ORIGIN=https://uniclinic.pro', 'STAGING=false', 'npm', 'run', 'build', cwd=front_work)
    run(*common, 'npm', 'run', 'check', cwd=front_work)
    python = release / 'backend/.venv/bin/python'
    run(*common, 'python3', '-m', 'venv', release / 'backend/.venv')
    run(*common, python, '-m', 'pip', 'install', '--disable-pip-version-check', '-r', release / 'backend/requirements.lock')
    # The venv is created at its final absolute path; moving it would break shebangs.
    shutil.copytree(front_work / 'build', release / 'frontend')
    shutil.copyfile(release / 'frontend/nginx-maps.conf', release / 'deploy/nginx-maps.conf')
    manifest = json.loads((release / 'frontend/routes.json').read_text())
    if manifest['siteOrigin'] != 'https://uniclinic.pro' or manifest['staging']:
        raise RuntimeError('Refusing to activate a staging/wrong-domain artifact.')
    for folder in ('assets', 'media'):
        run('rsync', '-a', '--ignore-existing', str(release / 'frontend' / folder) + '/', str(BASE / 'shared' / folder) + '/')
        run('chown', '-R', 'root:root', BASE / 'shared' / folder)
    atomic_text(release / 'release.json', json.dumps({'frontend': front_sha, 'backend': back_sha, 'domain': 'uniclinic.pro'}, indent=2) + '\n')
    atomic_text(release / '.ready', 'ready\n')
    run('chown', '-R', 'root:root', release)
    say(f'Release prepared: {release}')
    return release


def certificate():
    require_setup()
    say('Both uniclinic.pro and www.uniclinic.pro must resolve to 194.156.116.81. Ports 80/443 must be reachable.')
    # Certbot asks the operator for email/terms on first run; this script does not accept terms silently.
    run('certbot', 'certonly', '--webroot', '-w', '/var/www/acme', '--cert-name', 'uniclinic.pro',
        '-d', 'uniclinic.pro', '-d', 'www.uniclinic.pro', '--keep-until-expiring')


def valid_release(target):
    resolved = target.resolve()
    if resolved.parent != RELEASES or not (resolved / '.ready').is_file():
        raise RuntimeError(f'Not a complete managed release: {target}')
    return resolved


def wait_for_health():
    for _ in range(30):
        result = run('curl', '--silent', '--fail', '--max-time', '2', 'http://127.0.0.1:8000/api/health', capture=True, check=False)
        if result.returncode == 0:
            try:
                if json.loads(result.stdout).get('ok') is True:
                    return
            except ValueError:
                pass
        time.sleep(1)
    raise RuntimeError('API did not become healthy; inspect journalctl -u uniclinic-api.')


def verify_site():
    for url, expected in [('/', '200'), ('/api/health', '200'), ('/sitemap.xml', '200'), ('/__deployment_missing_page__', '404')]:
        code = run('curl', '--silent', '--show-error', '--max-time', '15', '--resolve', 'uniclinic.pro:443:127.0.0.1',
                   '-o', '/dev/null', '-w', '%{http_code}', 'https://uniclinic.pro' + url, capture=True).stdout
        if code != expected:
            raise RuntimeError(f'HTTPS check {url}: expected {expected}, received {code}')


def activate(target):
    target = valid_release(target)
    check_nginx_ownership()
    if not Path('/etc/letsencrypt/live/uniclinic.pro/fullchain.pem').is_file():
        raise RuntimeError('Run certificate first.')
    old = CURRENT.resolve() if CURRENT.is_symlink() else None
    if old == target:
        raise RuntimeError('This release is already active.')
    if not old and run('systemctl', 'is-active', 'uniclinic-api', capture=True, check=False).returncode == 0:
        raise RuntimeError('An unmanaged API service is active; stop and inspect it manually.')
    if not old:
        with socket.socket() as probe:
            try:
                probe.bind(('127.0.0.1', 8000))
            except OSError as error:
                raise RuntimeError('Port 8000 is already occupied; inspect the existing process manually.') from error
    backup_database()
    snapshot = BACKUPS / ('config-' + datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%fZ'))
    snapshot.mkdir(mode=0o700)
    for source, name in [(NGINX_SITE, 'nginx.conf'), (UNIT, 'api.service')]:
        if source.exists():
            shutil.copyfile(source, snapshot / name)
    try:
        atomic_link(target, CURRENT)
        # Snapshot above preserves bootstrap/old configs. Only this project's owned files change.
        atomic_text(NGINX_SITE, MARKER + '\ninclude /srv/uniclinic/current/deploy/nginx.conf;\n')
        shutil.copyfile(target / 'deploy/uniclinic-api.service', UNIT)
        run('nginx', '-t')
        run('systemctl', 'daemon-reload')
        run('systemctl', 'enable', 'uniclinic-api')
        run('systemctl', 'restart', 'uniclinic-api')
        wait_for_health()
        run('systemctl', 'is-active', '--quiet', 'uniclinic-api')
        run('systemctl', 'reload', 'nginx')
        verify_site()
    except BaseException:
        say('Activation failed. Restoring the previous release/config; the DB backup is retained.')
        run('systemctl', 'stop', 'uniclinic-api', check=False)
        if old:
            atomic_link(old, CURRENT)
        elif CURRENT.is_symlink():
            CURRENT.unlink()
        for destination, name in [(NGINX_SITE, 'nginx.conf'), (UNIT, 'api.service')]:
            if (snapshot / name).exists():
                shutil.copyfile(snapshot / name, destination)
            elif destination.exists():
                destination.unlink()
        run('systemctl', 'daemon-reload', check=False)
        if old:
            run('systemctl', 'restart', 'uniclinic-api', check=False)
        if run('nginx', '-t', check=False).returncode == 0:
            run('systemctl', 'reload', 'nginx', check=False)
        raise
    if old:
        atomic_link(old, PREVIOUS)
    say(f'LIVE: https://uniclinic.pro — {target.name}')


def status():
    say(f'Current: {CURRENT.resolve() if CURRENT.is_symlink() else "none"}')
    say(f'Previous: {PREVIOUS.resolve() if PREVIOUS.is_symlink() else "none"}')
    run('systemctl', '--no-pager', '--full', 'status', 'uniclinic-api', check=False)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=['setup', 'database', 'build', 'certificate', 'activate', 'deploy', 'update', 'rollback', 'backup', 'status'])
    parser.add_argument('--backend', type=Path, default=FRONT.parent / 'UniclinicBack')
    parser.add_argument('--release', type=Path, help='Prepared release path for activate (or an explicit rollback target)')
    database_options = parser.add_mutually_exclusive_group()
    database_options.add_argument('--from-file', type=Path, help='Existing SQLite backup to import, never overwritten')
    database_options.add_argument('--empty', action='store_true', help='Explicitly start with an empty private-submissions DB')
    args = parser.parse_args()
    args.backend = args.backend.resolve()
    require_host()
    os.umask(0o022)
    with Path('/run/lock/uniclinic-deploy.lock').open('w') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        if args.action == 'setup':
            setup()
        elif args.action == 'database':
            initialize_database(args.from_file, args.empty)
        elif args.action in {'build', 'deploy', 'update'}:
            require_setup()
            if args.action != 'build' and not DATABASE.is_file():
                raise RuntimeError('Choose database --from-file or database --empty before deployment.')
            if args.action == 'update':
                for repo in (FRONT, args.backend):
                    clean_commit(repo)
                    if run('git', '-C', repo, 'branch', '--show-current', capture=True).stdout.strip() != 'main':
                        raise RuntimeError(f'Update expects the main branch: {repo}')
                    run('git', '-C', repo, 'pull', '--ff-only', 'origin', 'main')
                # Relaunch so this very update uses the new deployment code too.
                os.execv(sys.executable, [sys.executable, str(FRONT / 'deploy/server.py'), 'deploy', '--backend', str(args.backend)])
            target = build_release(args.backend)
            if args.action == 'deploy':
                certificate()
                activate(target)
        elif args.action == 'certificate':
            certificate()
        elif args.action == 'activate':
            if not args.release:
                parser.error('activate requires --release')
            activate(args.release)
        elif args.action == 'rollback':
            if not args.release and not PREVIOUS.is_symlink():
                raise RuntimeError('No previous release recorded.')
            activate(args.release or PREVIOUS)
        elif args.action == 'backup':
            backup_database()
        else:
            status()


if __name__ == '__main__':
    try:
        main()
    except (RuntimeError, OSError, subprocess.CalledProcessError) as error:
        print(f'DEPLOY STOPPED: {error}', file=sys.stderr)
        sys.exit(1)
