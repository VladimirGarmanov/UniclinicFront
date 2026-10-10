import React, { useEffect, useState } from 'react';
export default function AppointmentRequests() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  async function load() {
    try {
      const response = await fetch('/api/admin/appointments', { credentials: 'include' });
      if (!response.ok) throw new Error();
      setItems((await response.json()).items); setError('');
    } catch { setError('Не удалось загрузить заявки.'); }
  }
  useEffect(() => { load(); }, []);
  async function status(id, value) {
    try {
      const response = await fetch(`/api/admin/appointments/${id}/status`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: value }) });
      if (!response.ok) throw new Error();
      await load();
    } catch { setError('Не удалось сохранить статус заявки.'); }
  }
  return <section><h2>Заявки на запись</h2><button onClick={load}>Обновить заявки</button>
    {error && <p role="alert">{error}</p>}
    {items.map(item => <article className="adminPanelCard" key={item.id}>
      <h3>{item.public_code} · {item.request_type === "callback" ? "Обратный звонок" : "Запись на приём"}</h3><p>{item.patient_name} · {item.phone}</p>
      <p>{item.service_name} {item.doctor_name}</p><p>{item.created_at}</p>
      <label>Статус <select value={item.status} onChange={event => status(item.id, event.target.value)}>
        <option value="new">Новая</option><option value="contacted">Связались</option><option value="closed">Закрыта</option>
      </select></label>
    </article>)}
  </section>;
}
