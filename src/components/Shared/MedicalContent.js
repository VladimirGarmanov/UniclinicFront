import React from 'react';
import { Link } from '../../utils/router';

export function Faq({ entries = [] }) {
  const complete = entries.filter(entry => entry.question?.trim() && entry.answer?.trim());
  if (!complete.length) return null;
  return <section className="contentPanel faqSection"><h2>Часто задаваемые вопросы</h2>
    {complete.map(entry => <details className="faqItem" key={entry.question}>
      <summary>{entry.question}</summary><p className="faqAnswer">{entry.answer}</p>
    </details>)}
  </section>;
}

export function RelatedContent({ item }) {
  const links = item.related || [];
  if (!links.length) return null;
  return <nav className="contentPanel relatedContent" aria-label="Материалы по теме">
    <h2>По теме</h2><ul>{links.map(link => <li key={link.url}><Link to={link.url}>{link.name}</Link></li>)}</ul>
  </nav>;
}

export function Sources({ item }) {
  const sources = item.editorial?.sources || [];
  if (!sources.length) return null;
  return <section className="contentPanel"><h2>Источники</h2>
    <ul>{sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.name}</a></li>)}</ul>
  </section>;
}

export function ClinicReviews({ entries = [] }) {
  if (!entries.length) return null;
  return <section className="contentPanel"><h2>Отзывы о клинике</h2>
    {entries.map(review => <blockquote key={review.url}><p>{review.text}</p><Link to={review.url}>Читать отзыв полностью</Link></blockquote>)}
    <p><Link to="/reviews">Все отзывы о клинике</Link></p>
  </section>;
}
