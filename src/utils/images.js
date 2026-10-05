export function imageProps(source, { loading = 'lazy', sizes = '(max-width: 700px) 100vw, 800px' } = {}) {
  const src = String(source || '').replace(/^https?:\/\/(www\.)?uniclinic\.pro/, '');
  const optimized = globalThis.__IMAGE_DATA__?.[src];
  if (optimized && globalThis.__USED_IMAGES__) globalThis.__USED_IMAGES__[src] = optimized;
  return { src: optimized?.src || src, ...(optimized ? { srcSet: optimized.srcset, width: optimized.width, height: optimized.height, sizes } : {}), loading, decoding: 'async' };
}
