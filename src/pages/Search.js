import React, { useState } from 'react';
import catalog from '../generated/catalog.json';
export default function Search() {
  const [query, setQuery] = useState('');
  const results = query.trim().length >= 2 ? catalog.filter(item => item.name.toLocaleLowerCase('ru').includes(query.trim().toLocaleLowerCase('ru'))) : [];
  return <section className="utilityPage"><h1>Поиск по сайту</h1><label htmlFor="site-search">Название услуги, заболевания или врача</label><input id="site-search" type="search" value={query} onChange={e => setQuery(e.target.value)} autoComplete="off" /><p role="status">{query.length < 2 ? 'Введите минимум два символа.' : `Найдено: ${results.length}`}</p><ul>{results.map(item => <li key={item.url}><a href={item.url}>{item.name}</a></li>)}</ul></section>;
}
