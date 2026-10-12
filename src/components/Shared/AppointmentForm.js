import React, { useState } from 'react';
import Consent, { CONSENT_VERSION } from './Consent';
import { clinic } from '../../config/site';
import { track } from '../../utils/analytics';

export default function AppointmentForm({ service = '', doctor = '', initialType = 'appointment', compact = false }) {
  const [requestType, setRequestType] = useState(initialType);
  const [state, setState] = useState({ loading: false, success: '', error: '' });
  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    const digits = String(fields.get('phone') || '').replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 15) {
      setState({ loading: false, success: '', error: 'Укажите телефон: от 7 до 15 цифр, включая код страны.' });
      return;
    }
    setState({ loading: true, success: '', error: '' });
    try {
      const response = await fetch('/api/appointments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        patient_name: fields.get('patient_name'), phone: fields.get('phone'), service_name: fields.get('service_name') || '', doctor_name: fields.get('doctor_name') || '', request_type: requestType,
        consent: fields.get('consent') === 'on', consent_version: CONSENT_VERSION,
      }) });
      if (!response.ok) throw new Error();
      form.reset();
      track('form_submit_success', requestType);
      setState({ loading: false, success: 'Заявка принята. Клиника свяжется с вами. Время приёма необходимо согласовать отдельно.', error: '' });
    } catch {
      track('form_submit_error', requestType);
      setState({ loading: false, success: '', error: 'Не удалось отправить заявку. Попробуйте ещё раз или позвоните в клинику.' });
    }
  }
  return <section id="appointment" className="appointmentBox">
    <h2>{compact ? "Перезвоните мне" : "Запись на приём или обратный звонок"}</h2>
    <p><a href={clinic.phoneHref}>{clinic.phone}</a> · {clinic.hours}</p>
    <p>{clinic.address}</p>
    <form data-form={requestType} onSubmit={submit}>
      <label>Как вам помочь?<select name="request_type" value={requestType} onChange={event => setRequestType(event.target.value)}><option value="appointment">Записаться на приём</option><option value="callback">Заказать обратный звонок</option></select></label>
      <div className="appointmentGrid">
        <label>Ваше имя<input name="patient_name" autoComplete="name" maxLength={255} required /></label>
        <label>Телефон<input name="phone" type="tel" inputMode="tel" autoComplete="tel" minLength={7} maxLength={40} required /></label>
        {!compact && <label>Услуга или направление<input name="service_name" defaultValue={service} maxLength={255} /></label>}
        {!compact && <label>Врач, если выбран<input name="doctor_name" defaultValue={doctor} maxLength={255} /></label>}
      </div>
      <Consent />
      <button type="submit" disabled={state.loading}>{state.loading ? 'Отправка…' : 'Оставить заявку'}</button>
      {state.success && <p role="status">{state.success}</p>}
      {state.error && <p role="alert">{state.error}</p>}
    </form>
  </section>;
}
