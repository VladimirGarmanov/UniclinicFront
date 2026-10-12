import React, { useEffect, useState } from 'react';
export default function LiveEditorial() {
  const [items, setItems] = useState([]);
  useEffect(() => { let active = true; fetch('/api/publications?limit=6').then(response => response.ok ? response.json() : { items: [] }).then(data => { if (active) setItems(data.items || []); }).catch(() => {}); return () => { active = false; }; }, []);
  if (!items.length) return null;
  return <section className="homeContainer homeSection"><h2>Новое на сайте</h2><div className="homeCards3">{items.map(item => <article className="homeMediaCard" key={item.url}><div className="homeMediaBody"><h3><a href={item.url}>{item.title}</a></h3><p>{item.summary}</p><time dateTime={item.published_at}>{item.published_at.slice(0, 10)}</time></div></article>)}</div></section>;
}
