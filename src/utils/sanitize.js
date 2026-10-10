import { normalizeUrl, unavailable } from '../config/urls.js';
import { imageProps } from './images.js';
import sanitizeHtml from 'sanitize-html';

const imageDescriptions = {
  '/upload/medialibrary/3ce/3ceb918dd62847f0b2c7bb2c97b1670b.jpg': 'Схема расположения внутренних и наружных геморроидальных узлов',
  '/upload/medialibrary/6b9/6b918352120e9e8578d7781506d3a0fc.jpg': 'Схема лигирования внутреннего геморроидального узла латексным кольцом',
  '/upload/medialibrary/39e/39e2f7a095484061f7dc26542643984d.jpg': 'Сравнение лигирования, склерозирования и дезартеризации геморроидальных узлов',
};
export function sanitize(value = '') {
  return sanitizeHtml(String(value), {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img', 'iframe'],
    allowedAttributes: {
      '*': ['class', 'id'],
      a: ['href', 'title', 'target', 'rel', 'data-video-src'],
      img: ['src', 'srcset', 'sizes', 'alt', 'width', 'height', 'loading', 'decoding'],
      iframe: ['src', 'title', 'width', 'height', 'loading', 'allowfullscreen', 'referrerpolicy'],
      td: ['colspan', 'rowspan'], th: ['colspan', 'rowspan', 'scope'],
    },
    allowedSchemes: ['https', 'http', 'mailto', 'tel'],
    allowedSchemesByTag: { img: ['https'], iframe: ['https'] },
    allowedIframeHostnames: ['www.youtube-nocookie.com', 'www.youtube.com', 'yandex.ru'],
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attribs) => {
        const href = normalizeUrl(attribs.href || '');
        return unavailable.has(href) ? { tagName: 'span', attribs: {} } : { tagName, attribs: { ...attribs, href, rel: 'noopener noreferrer' } };
      },
      img: (tagName, attribs) => {
        const props = imageProps(attribs.src);
        const { srcSet, ...rest } = props;
        const alt = imageDescriptions[normalizeUrl(attribs.src)] ?? (/\.(?:jpe?g|png|gif|webp|svg)$/i.test(attribs.alt || '') ? 'Иллюстрация' : attribs.alt || '');
        return { tagName, attribs: { ...attribs, alt, ...Object.fromEntries(Object.entries(rest).map(([key, value]) => [key, String(value)])), ...(srcSet ? { srcset: srcSet } : {}) } };
      },
      iframe: (tagName, attribs) => {
        const src = (attribs.src || '').replace('www.youtube.com', 'www.youtube-nocookie.com');
        if (/^https:\/\/www\.youtube-nocookie\.com\/embed\/[\w-]+(?:[?].*)?$/.test(src)) {
          return { tagName: 'a', attribs: { href: src, class: 'videoPreview', 'data-video-src': src, rel: 'noopener noreferrer' }, text: 'Загрузить видео с YouTube' };
        }
        return { tagName, attribs: { ...attribs, src, loading: 'lazy', title: attribs.title || 'Видео или карта', referrerpolicy: 'strict-origin-when-cross-origin' } };
      },
    },
  });
}
