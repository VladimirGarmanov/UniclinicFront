import React from 'react';
import { useParams } from '../utils/router';
import { treatments } from '../config/treatments';
import NotFound from './NotFound/NotFound';
export default function Treatment() {
  const { slug } = useParams();
  const item = treatments.find(item => item.code === slug);
  if (!item) return <NotFound />;
  return <section className="utilityPage"><nav aria-label="Навигация"><a href="/">Главная</a> / <a href="/prices">Цены</a></nav><h1>{item.name}</h1><p>{item.text}</p><p><a href="/contacts">Контакты клиники</a></p></section>;
}
