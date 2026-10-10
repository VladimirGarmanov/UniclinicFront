import React from 'react';
import { useParams, useLocation } from '../utils/router';
import AppointmentForm from '../components/Shared/AppointmentForm';
import { treatments } from '../config/treatments';
import NotFound from './NotFound/NotFound';
export default function Treatment() {
  const { slug } = useParams();
  const { pathname } = useLocation();
  const item = treatments.find(item => item.url === pathname || item.code === slug);
  if (!item) return <NotFound />;
  return <section className="utilityPage"><nav aria-label="Навигация"><a href="/">Главная</a> / <a href="/prices">Цены и условия лечения</a></nav>
    <h1>{item.name}</h1><p>{item.text}</p>
    <h2>Порядок обращения</h2><ol>{item.steps.map(step => <li key={step}>{step}</li>)}</ol>
    <h2>Документы</h2><p>{item.documents}</p>
    <h2>Сроки</h2><p>Срок рассмотрения документов и дату приёма или госпитализации уточняйте при обращении. Отправка заявки не подтверждает запись или выделение квоты.</p>
    <p><a href="/prices">Прайс</a> · <a href="/team">Врачи</a> · <a href="/contacts">Как добраться</a></p>
    <AppointmentForm service={item.name} />
  </section>;
}
