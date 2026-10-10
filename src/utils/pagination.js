export const PAGE_SIZE = 20;
export function archivePage(data, items, search = '') {
  if (data.pagination) return { items, ...data.pagination };
  const page = Math.max(1, Number(new URLSearchParams(search).get('page')) || 1);
  const visible = items.filter(item => !item.gone && !item.withheld && item.active !== false && item.active !== 'N');
  const pages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  return { items: visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), page, pages, total: visible.length };
}
export const pageUrl = (base, page) => page === 1 ? base : `${base}?page=${page}`;
