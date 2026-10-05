import fs from 'node:fs';
import path from 'node:path';
import { sanitize } from '../src/utils/sanitize.js';

export const sourceDir = path.resolve('src/assets/info');
export const siteOrigin = (process.env.SITE_ORIGIN || 'https://uniclinic.pro').replace(/\/$/, '');
if (!/^https:\/\/[^/]+$/.test(siteOrigin)) throw new Error('SITE_ORIGIN must be an HTTPS origin');
import { redirects, normalizeUrl } from '../src/config/urls.js';
export { redirects, normalizeUrl };
export const treatments = [
  { code: 'besplatnoe-lechenie-po-polisu-oms', name: 'Бесплатное лечение по полису ОМС', text: 'Вид социального страхования граждан Российской Федерации, представляющий собой обеспечение гарантий бесплатного оказания медицинской помощи при выявлении хирургических заболеваний.' },
  { code: 'lechenie-po-kvote-po-programme-vmp', name: 'Лечение по квоте (ВМП)', text: 'Оказание медицинской помощи при наиболее тяжелых заболеваниях ЖКТ, требующих обязательного использования дорогостоящего инструментария и/или применения сложных хирургических методик.' },
  { code: 'lechenie-na-platnoy-osnove', name: 'Лечение на платной основе', text: 'Предполагает возможность получения медицинской помощи при любом хирургическом заболевании, независимо от наличия полиса ОМС, без необходимости оформления дополнительных документов и получения квоты, для граждан всех стран мира.' },
];
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
export const datasets = {};
for (const file of fs.readdirSync(sourceDir).filter(file => file.endsWith('.json'))) {
  const raw = JSON.parse(fs.readFileSync(path.join(sourceDir, file), 'utf8'));
  const data = clean(raw);
  let items = data.items || data.data?.items;
  if (items) {
    // Preserve routes/content already rendered by the legacy frontend, including archived entries.
    if (data.items) data.items = items; else data.data.items = items;
    if (['questions.json', 'reviews.json'].includes(file)) {
      for (const item of items) {
        delete item.properties;
        if (item.flat_properties) delete item.flat_properties.NAME;
        if (item.review_fields) item.review_fields.name = 'Пациент';
        // Archive contact fields never enter HTML or hydration payloads.
        for (const field of ['preview_text', 'detail_text']) {
          if (typeof item[field] === 'string') item[field] = item[field].replace(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi, '[контакт скрыт]');
        }
      }
    }
  }
  datasets[file] = data;
}
export const itemsOf = data => data.items || data.data?.items || [];
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
export const routes = [
  { url: '/', name: 'Отделение хирургии университетской клиники МГУ', type: 'MedicalClinic' },
  ...Object.entries({ prices: 'Цены', contacts: 'Контакты', licenses: 'Лицензии', privacy: 'Политика конфиденциальности', 'personal-data': 'Обработка персональных данных', 'fecal-incontinence-scale': 'Шкала оценки анального недержания', 'need-proctologist-consultation': 'Нужна ли вам консультация проктолога?', sitemap: 'Карта сайта', search: 'Поиск', 'questions/admin': 'Панель администратора', '404': 'Страница не найдена' }).map(([url, name]) => ({ url: '/' + url, name, noindex: ['search', 'questions/admin', '404'].includes(url) })),
  ...treatments.map(item => ({ url: '/services/prices/' + item.code, name: item.name })),
];
for (const [list, detail, file, name, type] of sections) {
  routes.push({ url: '/' + list, name, file, list: true });
  for (const item of itemsOf(datasets[file])) {
    const code = file === 'reviews.json' ? `review-${item.id}` : codeOf(item);
    if (!code || /[/\\?#]/.test(code)) continue;
    routes.push({ url: `/${detail}/${code}`, name: nameOf(item), file, code, type, parent: '/' + list, item });
  }
}
const duplicates = routes.filter((route, index) => routes.findIndex(other => other.url === route.url) !== index);
if (duplicates.length) throw new Error('Duplicate content URLs: ' + duplicates.map(x => x.url).join(', '));
export const catalog = routes.filter(route => !route.noindex).map(({ url, name }) => ({ url, name }));

export function pageData(route) {
  const result = {};
  let file = route.file;
  if (!file) file = { '/licenses': 'licences_full.json', '/privacy': 'politics_full.json', '/personal-data': 'agreement_full.json' }[route.url];
  if (file) {
    const data = datasets[file];
    let items = itemsOf(data);
    if (route.code) items = items.filter(item => (file === 'reviews.json' ? `review-${item.id}` : codeOf(item)) === route.code);
    else if (route.list && !['questions.json', 'reviews.json'].includes(file)) {
      items = items.map(item => {
        const summary = structuredClone(item);
        if (summary.fields) { delete summary.fields.DETAIL_TEXT; summary.properties = file === 'doctors_full.json' ? Object.fromEntries(Object.entries(summary.properties || {}).filter(([key]) => ['PROF', 'DOLZHNOST', 'STEPEN', 'STAZH', 'SPEC'].includes(key))) : {}; }
        else { summary.properties = {}; }
        return summary;
      });
    }
    result[file] = data.items ? { items } : data.data?.items ? { data: { items } } : data;
  }
  if (['/sitemap', '/search'].includes(route.url)) result['catalog.json'] = catalog;
  return result;
}
