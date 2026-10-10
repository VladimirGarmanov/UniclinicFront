import React, { useState } from 'react';
import { sanitize } from '../../utils/sanitize';

// Live submissions have a separate bounded feed; they never download the entire database.
export default function RecentPublications({ kind }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  async function load(page = 1) {
    setLoading(true); setError('');
    try {
      const response = await fetch(`/api/${kind}?page=${page}`);
      if (!response.ok) throw new Error();
      setResult(await response.json());
    } catch { setError('Не удалось загрузить публикации. Попробуйте позже.'); }
    finally { setLoading(false); }
  }
  return <section className="recentPublications">
    <button type="button" disabled={loading} onClick={() => load(1)}>{loading ? 'Загрузка…' : kind === 'questions' ? 'Показать новые ответы' : 'Показать новые отзывы'}</button>
    {error && <p role="alert">{error}</p>}
    {result && !result.items.length && <p>Новых публикаций пока нет.</p>}
    {result?.items.map(item => <article className="qaCard" key={item.id} id={`${kind === 'questions' ? 'question' : 'review'}-${item.code}`}>
      <h3>{item.name}</h3><p>{item.preview_text}</p>
      {kind === 'questions' && (item.detail_text_type === 'html'
        ? <div dangerouslySetInnerHTML={{ __html: sanitize(item.detail_text) }} />
        : <p>{item.detail_text}</p>)}
    </article>)}
    {result && <nav className="archivePagination" aria-label="Новые публикации">
      {result.page > 1 && <button disabled={loading} onClick={() => load(result.page - 1)}>Предыдущая</button>}
      {result.page < result.pages && <button disabled={loading} onClick={() => load(result.page + 1)}>Следующая</button>}
    </nav>}
  </section>;
}
