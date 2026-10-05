import { normalizeUrl, unavailable } from '../config/urls.js';
import { imageProps } from './images.js';
import sanitizeHtml from 'sanitize-html';

export function sanitize(value = '') {
  return sanitizeHtml(String(value), {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img', 'iframe'],
    allowedAttributes: {
      '*': ['class', 'id'],
      a: ['href', 'title', 'target', 'rel'],
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
        return { tagName, attribs: { ...attribs, ...Object.fromEntries(Object.entries(rest).map(([key, value]) => [key, String(value)])), ...(srcSet ? { srcset: srcSet } : {}) } };
      },
      iframe: (tagName, attribs) => ({ tagName, attribs: { ...attribs, src: (attribs.src || '').replace('www.youtube.com', 'www.youtube-nocookie.com'), loading: 'lazy', title: attribs.title || 'Видео или карта', referrerpolicy: 'strict-origin-when-cross-origin' } }),
    },
  });
}
