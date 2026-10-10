import React from 'react';
import { Link } from '../../utils/router';
import { PRICES } from '../../pages/Prices/pricesData';
export default function ServicePrices({ code }) {
  // These entries already exist in the current price table; no inferred prices.
  const terms = {
    'lechenie-gemorroya': /геморроидальн/iu,
    'lechenie-analnoy-treschiny': /анальной трещины/iu,
    'lechenie-epitelialnogo-kopchikovogo-khoda': /копчикового хода/iu,
    'konsultatsiya-proktologa': /врача-колопроктолога/iu,
    'lechenie-pakhovoy-gryzhi': /пахов/iu,
    'lechenie-pupochnoy-gryzhi': /пупочной грыжи/iu,
    'lechenie-diastaza-pryamykh-myshts': /диастаз/iu,
    'lechenie-posleoperatsionnoy-gryzhi': /послеоперационной грыжи/iu,
    'lechenie-gryzh-beloy-linii-zhivota': /грыже белой линии/iu,
  };
  const rows = terms[code] ? PRICES.filter(row => terms[code].test(row.name)) : [];
  return <section className="servicePrices" data-analytics-view="price_view">
    <h2>Стоимость услуг</h2>
    {rows.length > 0 && <table><thead><tr><th>Услуга</th><th>Цена</th></tr></thead><tbody>{rows.map(row =>
      <tr key={row.name}><td>{row.name}</td><td>{new Intl.NumberFormat('ru-RU').format(row.price)} ₽</td></tr>)}</tbody></table>}
    <p><Link to="/prices">Полный прайс клиники</Link>. Стоимость выбранной услуги можно уточнить при записи.</p>
  </section>;
}
