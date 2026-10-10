import { load } from 'cheerio';
import { auditRevision, hemorrhoidFaq, hemorrhoidSources, medicalReviews, topicPairs } from '../src/config/editorial.js';
import { normalizeUrl, unavailable } from '../src/config/urls.js';

function correctText(value) {
  if (Array.isArray(value)) return value.map(correctText);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, correctText(item)]));
  if (typeof value !== 'string') return value;
  return value.replace(/содержание сетчатки/g, 'содержание клетчатки')
    .replace(/большое количество в рационе содержание клетчатки/g, 'достаточное содержание клетчатки')
    .replace(/геммороидэктом/gi, 'геморроидэктом')
    .replace(/Инфраредкоагуляция/g, 'Инфракрасная коагуляция')
    .replace(/Инфраредкоагуляции/g, 'Инфракрасной коагуляции')
    .replace(/Инфракраснаяфотокоагуляция/g, 'Инфракрасная фотокоагуляция')
    .replace(/HemorrhoidalArteryLigation/g, 'Hemorrhoidal Artery Ligation')
    .replace(/в т\.\. свечи/g, 'в том числе свечи');
}

const part = (description, text) => ({ description, value: { TEXT: text, TYPE: 'HTML' } });

export function prepareEditorial(item, file) {
  if (!item.fields) return item;
  const before = JSON.stringify(item);
  Object.assign(item, correctText(item));
  const props = item.properties || {};
  const base = { 'diseases_full.json': '/diseases', 'services_full.json': '/services', 'articles_full.json': '/articles', 'clinicalcases_full.json': '/clinicalcases' }[file];
  if (base) item.fields.CODE = normalizeUrl(`${base}/${item.fields.CODE}`).split('/').at(-1);
  const url = `${base}/${item.fields.CODE}`;
  item.editorial = { ...medicalReviews[url] };
  for (const key of ['DOCTORS', 'AUTHOR']) {
    if (props[key]?.values) props[key].values = props[key].values.filter(entry => !unavailable.has('/doctors/' + entry.value?.element?.CODE));
  }
  // Bitrix stores tab labels after #. Their sections already exist as h3 in TEXT.
  for (const part of props.PARTS?.values || []) {
    if (typeof part.description === 'string') part.description = part.description.split('#')[0].trim();
  }
  const intentPair = topicPairs.find(([disease]) => disease === item.fields.CODE);
  if (file === 'diseases_full.json' && intentPair && item.fields.CODE !== 'gemorroy') {
    for (const entry of props.PARTS?.values || []) {
      if (/^(Методы по устранению|Как лечить ВПЧ|Лечение(?:\s|$))/.test(entry.description)) {
        entry.description = 'Лечение и запись к врачу';
        entry.value.TEXT = `<p>Методы лечения, подготовка, врачи и стоимость описаны на странице <a href="/services/${intentPair[1]}">${intentPair[2]}: лечение в клинике</a>. План лечения определяется на консультации.</p>`;
      }
    }
  }
  if (file === 'services_full.json' && props.ADVANTAGES) {
    // This shared CMS block was attached even to diagnostic and benign conditions.
    // Keep oncology statements only on oncology pages; remove the universal recovery promise.
    const oncology = /rak|onko|opukhol/.test(item.fields.CODE);
    props.ADVANTAGES.values = props.ADVANTAGES.values.filter(entry =>
      ![560, ...(oncology ? [] : [559, 561])].includes(Number(entry.value?.element?.ID)));
  }
  if (file === 'services_full.json' && item.fields.CODE === 'lechenie-gemorroya') {
    delete props.ADVANTAGES;
    delete props.COMMON_TEXT;
    props.PARTS.values = props.PARTS.values.map(entry => /Преимущества/.test(entry.description)
      ? part('Лечение в клинике', '<p>Способ лечения обсуждается с колопроктологом после осмотра. Среди методов лечения геморроя — лигирование, склеротерапия, инфракрасная коагуляция и дезартеризация (HAL-RAR). Возможность амбулаторного вмешательства зависит от показаний.</p><p>Условия лечения по <a href="/oms">ОМС</a> и <a href="/paid-treatment">на платной основе</a>, стоимость и доступность конкретной методики уточняются при записи.</p>') : entry);
    // Replace the copied general disease definition with the commercial page's purpose.
    item.fields.PREVIEW_TEXT = 'Методы лечения геморроя, врачи и стоимость. Оставьте заявку для согласования консультации и плана обследования.';
    item.faq = hemorrhoidFaq;
    item.editorial.sources = hemorrhoidSources;
  }
  if (file === 'diseases_full.json' && item.fields.CODE === 'gemorroy') {
    const seen = new Set();
    for (const part of props.PARTS?.values || []) {
      if (!part.value?.TEXT) continue;
      const $ = load(part.value.TEXT, null, false);
      $('p').each((_, element) => {
        const text = $(element).text().replace(/\s+/g, ' ').trim();
        if (text.length > 100 && /беремен|лактаци/iu.test(text)) {
          if (seen.has(text)) $(element).remove();
          seen.add(text);
        }
      });
      part.value.TEXT = $.html();
    }
    props.PARTS.values = props.PARTS.values.filter(entry => !/какой врач может помочь/.test(entry.description));
    props.PARTS.values = props.PARTS.values.map(entry => entry.description === 'Лечение: что лучше?'
      ? part('Как выбирают лечение', '<p>Тактика зависит от формы и стадии заболевания, симптомов и результатов осмотра. Методы, стоимость и запись к врачу собраны на странице <a href="/services/lechenie-gemorroya">лечения геморроя</a>.</p>') : entry);
    // Remove the unsupported one-line pediatric subsection; adult guidance is not pediatric advice.
    for (const entry of props.PARTS.values) {
      const $ = load(entry.value.TEXT, null, false);
      $('h3').filter((_, el) => $(el).text().trim() === 'Геморрой у детей').each((_, el) => {
        $(el).nextUntil('h3').remove(); $(el).remove();
      });
      entry.value.TEXT = $.html();
    }
    item.faq = hemorrhoidFaq;
    item.editorial.sources = hemorrhoidSources;
  }
  const titleCorrections = {
    'krov-pri-pokhode-v-tualet': 'Кровь при походе в туалет',
    'strashnye-polipy': 'Полипы: диагностика и лечение',
    'istoriya-patsienta-trudnyy-put-lecheniya': 'Рак прямой кишки и заболевание сердца: подготовка и хирургическое лечение',
    'bolshaya-opukhol-pravykh-otdelov-obodochnoy-kishki': 'Удаление большой опухоли правых отделов ободочной кишки',
    'spastis-ot-raka-za-2-nedeli': 'Рак прямой кишки: обследование, операция и выписка',
    'moi-ne-dragotsennye-zhizn-do-i-posle-udaleniya-zhelchnogo-puzyrya': 'Удаление желчного пузыря: история лечения и восстановления',
    'istoriya-pro-gemorroy': 'Геморрой: история хирургического лечения и восстановления',
    'tsena-oshibki': 'Полип ободочной кишки: обследование и хирургическое лечение',
    'eshche-odna-istoriya-': 'Опухоль кишечника и вентральная грыжа: хирургическое лечение',
    'ne-dumala-chto-nakhoditsya-v-bolnitse-mozhet-byt-priyatno': 'Пупочная грыжа: опыт операции и восстановления',
    'kolonoskopiya-chto-nuzhno-znat': 'Колоноскопия: что нужно знать об исследовании',
    'obsledovaniya-patsientov-s-onkologicheskimi-zablevaniyami': 'Обследование пациентов с онкологическими заболеваниями',
  };
  if (titleCorrections[item.fields.CODE]) item.fields.NAME = titleCorrections[item.fields.CODE];
  item.fields.NAME = item.fields.NAME.trim();
  const { editorial, ...content } = item;
  if (before !== JSON.stringify(content) || Object.keys(editorial).length) item.editorial.updatedAt = auditRevision;
  return item;
}
