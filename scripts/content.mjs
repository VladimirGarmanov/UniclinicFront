import fs from 'node:fs';
import path from 'node:path';
import { load } from 'cheerio';
import { sanitize } from '../src/utils/sanitize.js';
import { prepareArchive, privacyReport, removedReviewIds } from './archive-privacy.mjs';
import { prepareEditorial } from './editorial.mjs';
import { topicPairs } from '../src/config/editorial.js';
import { treatments } from '../src/config/treatments.js';
import { serviceLandings } from '../src/config/service-landings.js';
export { treatments };
import { PAGE_SIZE } from '../src/utils/pagination.js';
export { privacyReport, removedReviewIds };

export const sourceDir = path.resolve('src/assets/info');
export const siteOrigin = (process.env.SITE_ORIGIN || 'https://uniclinic.pro').replace(/\/$/, '');
if (!/^https:\/\/[^/]+$/.test(siteOrigin)) throw new Error('SITE_ORIGIN must be an HTTPS origin');
import { redirects, normalizeUrl } from '../src/config/urls.js';
export { redirects, normalizeUrl };
function clean(value, key = '') {
  if (Array.isArray(value)) return value.map(item => clean(item));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value)
    .filter(([name]) => !/^(email|phone|patient_name|reviewer_name|document_root|created_by|modified_by)$/i.test(name))
    .map(([name, item]) => [name, clean(item, name)]));
  if (typeof value !== 'string') return value;
  if (/<\/?[a-z][\s\S]*>/i.test(value)) return sanitize(value.replace(/http:\/\//g, 'https://').replace(/https:\/\/(?:www\.)?uniclinic\.pro\//g, '/'));
  if (/^(?:https?:\/\/|\/upload\/)/.test(value)) return normalizeUrl(value);
  return value;
}
const doctorNames = JSON.parse(fs.readFileSync(path.join(sourceDir, 'doctors_full.json'), 'utf8')).items.map(item => item.fields.NAME);
export const datasets = {};
for (const file of fs.readdirSync(sourceDir).filter(file => file.endsWith('.json'))) {
  const raw = JSON.parse(fs.readFileSync(path.join(sourceDir, file), 'utf8'));
  const data = clean(['questions.json', 'reviews.json'].includes(file) ? prepareArchive(raw, file.replace('.json', ''), doctorNames) : raw);
  let items = data.items || data.data?.items;
  if (items) {
    // Preserve routes/content already rendered by the legacy frontend, including archived entries.
    if (data.items) data.items = items; else data.data.items = items;
    for (const item of items) prepareEditorial(item, file);
  }
  if (['questions.json', 'reviews.json'].includes(file)) data.items.sort((a, b) => {
    const date = item => { const value = item.date_active_from || item.active_from || item.date_create || ''; const match = value.match(/^(\d{2})\.(\d{2})\.(\d{4})/); return match ? `${match[3]}-${match[2]}-${match[1]}` : value; };
    return date(b).localeCompare(date(a)) || Number(b.id) - Number(a.id);
  });
  datasets[file] = data;
}
export const itemsOf = data => data.items || data.data?.items || [];
for (const landing of serviceLandings.filter(item => item.published || process.env.PREVIEW_DRAFTS === 'true')) {
  const source = datasets['services_full.json'].items.find(item => item.fields.CODE === landing.source);
  const item = {
    fields: { ID: landing.code, CODE: landing.code, NAME: landing.name, PREVIEW_TEXT: landing.lead, DATE_CREATE: '10.10.2026' },
    properties: { PARTS: { values: landing.sections.map(([description, text]) => ({ description, value: { TEXT: `<p>${text}</p>` } })) }, DOCTORS: structuredClone(source?.properties?.DOCTORS || {}) },
    editorial: { updatedAt: '2026-10-10' }, sourceService: landing.source, draft: !landing.published,
  };
  datasets['services_full.json'].items.push(item);
}
export const codeOf = item => item.fields?.CODE || item.code;
export const nameOf = item => item.fields?.NAME || item.name || 'Материал';
const sections = [
  ['team', 'doctors', 'doctors_full.json', 'Наша команда', 'Physician'],
  ['services', 'services', 'services_full.json', 'Услуги', 'MedicalWebPage'],
  ['diseases', 'diseases', 'diseases_full.json', 'Заболевания', 'MedicalWebPage'],
  ['technologies', 'technologies', 'technologies_full.json', 'Технологии', 'MedicalWebPage'],
  ['articles', 'articles', 'articles_full.json', 'Статьи', 'Article'],
  ['clinicalcases', 'clinicalcases', 'clinicalcases_full.json', 'Истории пациентов', 'Article'],
  ['news', 'news', 'news_full.json', 'Новости', 'Article'],
  ['questions', 'questions', 'questions.json', 'Вопросы и ответы', 'WebPage'],
  ['reviews', 'reviews', 'reviews.json', 'Отзывы', 'WebPage'],
];
const documents = sections.filter(([list]) => !['questions', 'reviews'].includes(list)).flatMap(([, detail, file]) =>
  itemsOf(datasets[file]).map(item => ({ item, file, url: `/${detail}/${codeOf(item)}`, name: nameOf(item) })));
const doctors = itemsOf(datasets['doctors_full.json']);
for (const document of documents) {
  const { item, url, file } = document;
  if (item.editorial?.reviewerCode) {
    const doctor = doctors.find(doctor => codeOf(doctor) === item.editorial.reviewerCode);
    if (!doctor || !/^\d{4}-\d{2}-\d{2}$/.test(item.editorial.reviewedAt || '')) throw new Error(`Invalid medical review: ${url}`);
    item.editorial.reviewer = { code: codeOf(doctor), name: nameOf(doctor), credentials: doctor.properties?.STEPEN?.values?.[0]?.value || '' };
  }
  if (!['diseases_full.json', 'services_full.json', 'articles_full.json', 'clinicalcases_full.json'].includes(file)) continue;
  const heading = nameOf(item).toLowerCase();
  const pair = topicPairs.find(([disease, service, , words]) => codeOf(item) === disease || codeOf(item) === service || words.some(word => heading.includes(word)));
  const links = [];
  if (item.sourceService) {
    const source = documents.find(document => document.url === `/services/${item.sourceService}`);
    if (source) links.push({ url: source.url, name: source.name });
  }
  for (const landing of serviceLandings.filter(landing => landing.published && landing.source === codeOf(item))) {
    links.push({ url: `/services/${landing.code}`, name: landing.name });
  }
  for (const value of item.properties?.SERVICES?.values || []) {
    const code = value.value?.element?.CODE;
    const found = documents.find(document => document.url === `/services/${code}`);
    if (found) links.push({ url: found.url, name: found.name });
  }
  if (pair) {
    for (const target of [`/diseases/${pair[0]}`, `/services/${pair[1]}`]) {
      const found = documents.find(document => document.url === target);
      if (found) links.push({ url: found.url, name: target.includes('/diseases/') ? `${pair[2]}: симптомы и диагностика` : `${found.name}: методы и запись` });
    }
    links.push(...documents.filter(other => other.file === 'articles_full.json' && pair[3].some(word => other.name.toLowerCase().includes(word))).slice(0, 3).map(({ url, name }) => ({ url, name })));
  }
  links.push({ url: '/prices', name: 'Цены на услуги' }, { url: '/team', name: 'Врачи клиники' });
  item.related = links.filter((link, index) => link.url !== url && links.findIndex(other => other.url === link.url) === index);
  if (file === 'services_full.json') {
    item.clinicReviews = itemsOf(datasets['reviews.json']).filter(review => !review.gone && !review.withheld && review.active !== 'N')
      .slice(0, 3).map(review => {
        const text = load(review.preview_text || review.detail_text || '', null, false).text().replace(/\s+/g, ' ').trim();
        return { url: `/reviews/review-${review.id}`, text: text.length > 420 ? text.slice(0, 421).replace(/\s+\S*$/, '') + '…' : text };
      });
  }
  // Generic booking answers are kept separate from missing medical CMS answers.
  if (!item.faq && ['services_full.json', 'diseases_full.json'].includes(file)) item.faq = [
    { question: 'Как записаться на консультацию?', answer: 'Оставьте имя и телефон в форме записи на этой странице или позвоните в клинику. Дату, врача и формат приёма необходимо согласовать с сотрудником клиники.' },
    { question: 'Где уточнить стоимость и подготовку?', answer: 'Прайс доступен в разделе «Цены». При записи уточните состав выбранной услуги, её стоимость и требования к подготовке.' },
  ];
}
export const routes = [
  { url: '/', name: 'Отделение хирургии университетской клиники МГУ', type: 'MedicalClinic' },
  ...Object.entries({ prices: 'Цены', contacts: 'Контакты', licenses: 'Лицензии', privacy: 'Политика конфиденциальности', 'personal-data': 'Обработка персональных данных', 'fecal-incontinence-scale': 'Шкала оценки анального недержания', 'need-proctologist-consultation': 'Нужна ли вам консультация проктолога?', sitemap: 'Карта сайта', search: 'Поиск', 'questions/admin': 'Панель администратора', '404': 'Страница не найдена' }).map(([url, name]) => ({ url: '/' + url, name, noindex: ['search', 'questions/admin', '404'].includes(url) })),
  ...treatments.map(item => ({ url: item.url, name: item.name })),
];
for (const [list, detail, file, name, type] of sections) {
  const archive = ['questions', 'reviews'].includes(list);
  const visible = itemsOf(datasets[file]).filter(item => !item.gone && !item.withheld && item.active !== false && item.active !== 'N');
  const pages = archive ? Math.max(1, Math.ceil(visible.length / PAGE_SIZE)) : 1;
  for (let page = 1; page <= pages; page++) routes.push({ url: '/' + list + (page > 1 ? `?page=${page}` : ''), name, file, list: true, ...(archive ? { page, pages } : {}) });
  for (const item of itemsOf(datasets[file])) {
    const code = file === 'reviews.json' ? `review-${item.id}` : codeOf(item);
    if (!code || /[/\\?#]/.test(code)) continue;
    routes.push({ url: `/${detail}/${code}`, name: nameOf(item), file, code, type, parent: '/' + list, item, ...(item.draft ? { noindex: true } : {}), ...(archive ? { noindex: true, robots: 'noindex, follow', status: item.gone ? 410 : 200 } : {}) });
  }
}
const duplicates = routes.filter((route, index) => routes.findIndex(other => other.url === route.url) !== index);
if (duplicates.length) throw new Error('Duplicate content URLs: ' + duplicates.map(x => x.url).join(', '));
export const catalog = routes.filter(route => !route.noindex && (!route.page || route.page === 1)).map(({ url, name }) => ({ url, name }));

export function pageData(route) {
  const result = {};
  let file = route.file;
  if (!file) file = { '/licenses': 'licences_full.json', '/privacy': 'politics_full.json', '/personal-data': 'agreement_full.json' }[route.url];
  if (file) {
    const data = datasets[file];
    let items = itemsOf(data);
    if (route.code) items = items.filter(item => (file === 'reviews.json' ? `review-${item.id}` : codeOf(item)) === route.code);
    else if (route.page) {
      items = items.filter(item => !item.gone && !item.withheld && item.active !== false && item.active !== 'N');
      items = items.slice((route.page - 1) * PAGE_SIZE, route.page * PAGE_SIZE);
    }
    else if (route.list) {
      items = items.filter(item => !item.draft);
      items = items.map(item => {
        const summary = structuredClone(item);
        for (const key of ['faq', 'related', 'clinicReviews', 'editorial']) delete summary[key];
        if (summary.fields) { delete summary.fields.DETAIL_TEXT; summary.properties = file === 'doctors_full.json' ? Object.fromEntries(Object.entries(summary.properties || {}).filter(([key]) => ['PROF', 'DOLZHNOST', 'STEPEN', 'STAZH', 'SPEC'].includes(key))) : {}; }
        else { summary.properties = {}; }
        return summary;
      });
    }
    result[file] = data.items ? { items, ...(route.page ? { pagination: { page: route.page, pages: route.pages } } : {}) } : data.data?.items ? { data: { items } } : data;
  }
  if (['/sitemap', '/search'].includes(route.url)) result['catalog.json'] = catalog;
  if (route.url === '/') {
    result['home-content.json'] = Object.fromEntries(['articles', 'news', 'clinicalcases'].map(section => {
      const rows = documents.filter(document => document.url.startsWith(`/${section}/`) && document.item.active !== 'N')
        .sort((a, b) => isoContentDate(b.item).localeCompare(isoContentDate(a.item))).slice(0, 6)
        .map(({ item, url, name }) => ({ title: name, href: url, img: item.preview_picture?.src || item.detail_picture?.src, date: isoContentDate(item) }));
      return [section, rows];
    }));
  }
  return result;
}

function isoContentDate(item) {
  const value = item.fields?.DATE_ACTIVE_FROM || item.active_from || item.fields?.DATE_CREATE || item.date_create || '';
  const match = value.match(/^(\d{2})\.(\d{2})\.(\d{4})/);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : value.slice(0, 10);
}
