import React from 'react';
import { Link } from '../../utils/router';
import { pageUrl } from '../../utils/pagination';
export default function Pagination({ base, page, pages }) {
  if (pages <= 1) return null;
  return <nav className="archivePagination" aria-label="Страницы архива">
    {page > 1 && <Link to={pageUrl(base, page - 1)} rel="prev">← Предыдущая</Link>}
    <span>Страница {page} из {pages}</span>
    {page < pages && <Link to={pageUrl(base, page + 1)} rel="next">Следующая →</Link>}
  </nav>;
}
