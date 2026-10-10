import React from 'react';
import { Link } from '../../utils/router';
function date(value) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return { iso: value, text: value.split('-').reverse().join('.') };
  const match = String(value || '').match(/^(\d{2})\.(\d{2})\.(\d{4})/);
  return match ? { iso: `${match[3]}-${match[2]}-${match[1]}`, text: match[0] } : null;
}
export default function ContentByline({ item }) {
  const authors = (item.properties?.AUTHOR?.values || []).map(value => value.value?.element).filter(Boolean);
  const published = date(item.fields?.DATE_CREATE);
  const updated = date(item.editorial?.updatedAt || item.fields?.TIMESTAMP_X);
  const reviewer = item.editorial?.reviewer;
  const reviewed = date(item.editorial?.reviewedAt);
  return <div className="contentByline">
    {authors.length > 0 && <p>Автор: {authors.map((author, index) => <React.Fragment key={author.ID}>{index > 0 && ', '}<Link to={`/doctors/${author.CODE}`}>{author.NAME}</Link></React.Fragment>)}</p>}
    {published && <p>Дата публикации: <time dateTime={published.iso}>{published.text}</time></p>}
    {updated && <p>Дата обновления страницы: <time dateTime={updated.iso}>{updated.text}</time></p>}
    {reviewer && reviewed && <p>Проверил врач: <Link to={`/doctors/${reviewer.code}`}>{reviewer.name}</Link>{reviewer.credentials && `, ${reviewer.credentials}`} · <time dateTime={reviewed.iso}>{reviewed.text}</time></p>}
  </div>;
}
