import React from 'react';
import catalog from '../generated/catalog.json';
export default function Sitemap() {
  return <section className="utilityPage"><h1>Карта сайта</h1><ul>{catalog.map(item => <li key={item.url}><a href={item.url}>{item.name}</a></li>)}</ul></section>;
}
