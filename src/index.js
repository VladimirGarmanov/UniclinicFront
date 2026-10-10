import React from 'react';
import { hydrateRoot, createRoot } from 'react-dom/client';
import { BrowserRouter } from './utils/router';
import './index.css';
import { installAnalytics } from './utils/analytics';

async function start() {
  const data = document.getElementById('page-data');
  globalThis.__PAGE_DATA__ = data ? JSON.parse(data.textContent) : await fetch('/__page-data' + location.pathname + location.search).then(r => r.json()).catch(() => ({}));
  globalThis.__IMAGE_DATA__ = JSON.parse(document.getElementById('image-data')?.textContent || '{}');
  try { if (localStorage.getItem('accessible') === '1') document.documentElement.classList.add('accessible'); } catch {}
  const { default: App } = await import('./App');
  const app = <BrowserRouter><App /></BrowserRouter>;
  const root = document.getElementById('root');
  if (root.hasChildNodes()) hydrateRoot(root, app); else createRoot(root).render(app);
  installAnalytics();
  document.addEventListener('click', event => {
    const link = event.target.closest('a[data-video-src]');
    if (!link) return;
    const src = link.dataset.videoSrc;
    if (!/^https:\/\/www\.youtube-nocookie\.com\/embed\//.test(src)) return;
    event.preventDefault();
    const frame = document.createElement('iframe');
    frame.src = src; frame.title = 'Видео'; frame.allowFullscreen = true;
    frame.referrerPolicy = 'strict-origin-when-cross-origin'; frame.className = 'loadedVideo';
    link.replaceWith(frame);
  });
}
start();
