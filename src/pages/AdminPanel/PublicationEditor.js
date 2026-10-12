import React, { useEffect, useState } from 'react';
const empty = { kind: 'articles', slug: '', title: '', summary: '', body: '', author: '', source_url: '', original_date: '', published: false, approved: false };
export default function PublicationEditor() {
  const [items, setItems] = useState([]), [entry, setEntry] = useState(empty), [busy, setBusy] = useState(false), [message, setMessage] = useState('');
  async function load() {
    const response = await fetch('/api/admin/publications', { credentials: 'include' });
    if (!response.ok) throw new Error('Не удалось загрузить материалы. Проверьте вход в админку.');
    setItems((await response.json()).items);
  }
  useEffect(() => { load().catch(error => setMessage(error.message)); }, []);
  function change(name, value) { setEntry(old => ({ ...old, [name]: value })); }
  async function save(event) {
    event.preventDefault(); setBusy(true); setMessage('');
    try {
      const response = await fetch('/api/admin/publications' + (entry.id ? '/' + entry.id : ''), { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(entry) });
      const result = await response.json();
      if (!response.ok) throw new Error(typeof result.detail === 'string' ? result.detail : 'Проверьте поля');
      setEntry(old => ({ ...old, id: result.id })); await load();
      setMessage(entry.published ? 'Материал опубликован: ' + result.url : 'Черновик сохранён.');
    } catch (error) { setMessage(error.message); } finally { setBusy(false); }
  }
  async function importPrepared() {
    setBusy(true);
    try {
      const response = await fetch('/api/admin/publications/import-prepared', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      if (!response.ok) throw new Error('Не удалось импортировать материалы');
      setMessage('Добавлено черновиков: ' + (await response.json()).imported); await load();
    } catch (error) { setMessage(error.message); } finally { setBusy(false); }
  }
  return <section className="editorialAdmin"><h2>Статьи, истории пациентов и новости</h2>
    <p>Вставьте текст из документа. Пустая строка разделяет абзацы, строка с «## » создаёт подзаголовок. HTML отображается как обычный текст.</p>
    <div className="adminPanelActions"><button type="button" onClick={() => { setEntry({ ...empty }); setMessage(''); }}>Новый материал</button><button type="button" disabled={busy} onClick={importPrepared}>Добавить подготовленные материалы из Telegram</button></div>
    <label>Открыть материал<select value={entry.id || ''} onChange={event => setEntry(items.find(item => item.id === Number(event.target.value)) || { ...empty })}><option value="">Новый материал</option>{items.map(item => <option value={item.id} key={item.id}>{item.published ? 'Опубликован' : 'Черновик'} · {item.title}</option>)}</select></label>
    <form onSubmit={save}>
      <label>Раздел<select value={entry.kind} disabled={Boolean(entry.id)} onChange={event => change('kind', event.target.value)}><option value="articles">Статьи</option><option value="clinicalcases">Истории пациентов</option><option value="news">Новости</option></select></label>
      <label>Адрес латиницей<input required disabled={Boolean(entry.id)} pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={120} value={entry.slug} onChange={event => change('slug', event.target.value)} /></label>
      <p>Адрес: /{entry.kind}/editorial-{entry.slug}</p>
      <label>Заголовок<input required minLength={5} maxLength={200} value={entry.title} onChange={event => change('title', event.target.value)} /></label>
      <label>Краткое описание<textarea required minLength={10} maxLength={600} value={entry.summary} onChange={event => change('summary', event.target.value)} /></label>
      <label>Текст<textarea rows={18} required minLength={40} maxLength={60000} value={entry.body} onChange={event => change('body', event.target.value)} /></label>
      <label>Автор<input maxLength={200} value={entry.author} onChange={event => change('author', event.target.value)} /></label>
      <label>Ссылка на первоисточник<input type="url" value={entry.source_url} onChange={event => change('source_url', event.target.value)} /></label>
      <label>Настоящая дата первоисточника, если известна<input type="date" value={entry.original_date} onChange={event => change('original_date', event.target.value)} /></label>
      <p>Дата размещения на сайте проставляется автоматически при первой публикации.</p>
      <label className="adminPanelCheck"><input type="checkbox" checked={Boolean(entry.approved)} onChange={event => change('approved', event.target.checked)} />Текст и источник проверены; права на публикацию и обезличивание истории пациента подтверждены.</label>
      <label className="adminPanelCheck"><input type="checkbox" checked={Boolean(entry.published)} onChange={event => change('published', event.target.checked)} />Опубликовать на сайте (снимите флажок, чтобы вернуть в черновик)</label>
      <button disabled={busy} type="submit">{busy ? 'Сохранение…' : 'Сохранить'}</button>
    </form>
    {message && <p role="status">{message}</p>}
    <details><summary>Предпросмотр текста</summary><article><h1>{entry.title}</h1><p>{entry.summary}</p>{entry.body.split('\n\n').map((paragraph, index) => paragraph.startsWith('## ') ? <h2 key={index}>{paragraph.slice(3)}</h2> : <p key={index} style={{ whiteSpace: 'pre-wrap' }}>{paragraph}</p>)}</article></details>
    {entry.published && entry.id && <a href={`/${entry.kind}/editorial-${entry.slug}`} target="_blank" rel="noopener noreferrer">Открыть опубликованный материал</a>}
  </section>;
}
