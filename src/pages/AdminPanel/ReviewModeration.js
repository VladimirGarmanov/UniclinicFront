import React, { useEffect, useState } from 'react';
function Review({ item, onSaved }) {
  const [name, setName] = useState(item.public_name || 'Пациент');
  const [text, setText] = useState(item.public_review_text || '');
  const [approved, setApproved] = useState(false);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  async function save(publish) {
    setSaving(true); setMessage('');
    try {
      const response = await fetch(`/api/admin/reviews/${item.id}/moderate`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ public_name: name, public_review_text: text, publication_approved: approved, is_published: publish, status: publish ? 'published' : 'hidden' }) });
      if (!response.ok) throw new Error('Проверьте публичный текст и подтверждение публикации.');
      setMessage('Сохранено'); onSaved();
    } catch (error) { setMessage(error.message); } finally { setSaving(false); }
  }
  return <article className="adminPanelCard"><h3>Отзыв №{item.id}</h3><p>Автор: {item.reviewer_name} · Email: {item.email}</p><p>Исходный текст (только администратору): {item.review_text}</p><label className="adminPanelField">Публичное имя<input className="adminPanelInput" value={name} onChange={e => setName(e.target.value)} /></label><label className="adminPanelField">Публичный текст<textarea className="adminPanelTextarea" value={text} onChange={e => setText(e.target.value)} /></label><label className="adminPanelCheck"><input type="checkbox" checked={approved} onChange={e => setApproved(e.target.checked)} />Проверены текст, имя и допустимость публикации; приватные данные исключены.</label><button className="adminPanelButton" disabled={saving || !approved || !text.trim()} onClick={() => save(true)}>Опубликовать</button> <button className="adminPanelButton" disabled={saving} onClick={() => save(false)}>Скрыть</button><p role="status">{message}</p></article>;
}
export default function ReviewModeration() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  async function load() {
    try {
      const response = await fetch('/api/admin/reviews', { credentials: 'include' });
      if (!response.ok) throw new Error('Не удалось загрузить отзывы.');
      setItems((await response.json()).items || []);
    } catch (error) { setError(error.message); }
  }
  useEffect(() => { load(); }, []);
  return <section><h2>Модерация отзывов</h2><p role="alert">{error}</p>{items.map(item => <Review key={item.id} item={item} onSaved={load} />)}</section>;
}
