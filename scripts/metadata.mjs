import { clinic } from '../src/config/site.js';
import { load } from 'cheerio';
const plain = value => load(String(value || ''), null, false).text().replace(/\s+/g, ' ').trim();
export function isoDate(value) {
  const match = String(value || '').match(/^(\d{2})\.(\d{2})\.(\d{4})/);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : /^\d{4}-\d{2}-\d{2}/.test(value || '') ? value.slice(0, 10) : undefined;
}
function rawMetadata(route, h1) {
  const name = plain(h1 || route.name);
  const brand = clinic.name;
  const title = text => `${text} | ${brand}`;
  if (route.url === '/') return { title: title('Проктолог в Москве: геморрой, трещины и свищи'), description: 'Колопроктология и хирургия в клинике МГУ в Москве, на Ломоносовском проспекте. Лечение по ОМС, ВМП и платно. Онлайн-консультация и запись на приём.' };
  if (route.url === '/diseases/gemorroy') return { title: title('Геморрой: симптомы, причины и лечение'), description: 'Симптомы, причины, стадии и диагностика геморроя. Методы лечения и профилактики. Запись на консультацию колопроктолога в клинику МГУ в Москве.' };
  if (route.url === '/services/lechenie-gemorroya') return { title: title('Лечение геморроя в Москве: цены, запись, врачи'), description: 'Лечение геморроя в клинике МГУ в Москве: методы, подготовка, врачи и стоимость услуг. Условия ОМС и платного лечения. Запись онлайн и по телефону.' };
  if (route.page) return { title: title(name + (route.page > 1 ? ` — страница ${route.page}` : '')), description: `${route.name} клиники МГУ.${route.page > 1 ? ` Страница ${route.page}.` : ''} Архив публикаций и форма обращения в клинику.` };
  if (route.parent === '/questions' || route.parent === '/reviews') return { title: title(name), description: `${route.parent === '/questions' ? 'Архивный вопрос' : 'Архивный отзыв'} №${route.item.id}. ${route.item.withheld ? 'Публикация скрыта для проверки персональных данных.' : 'Контакты клиники и возможность оставить обращение.'}` };
  if (route.parent === '/diseases') return { title: title(`${name}: симптомы, причины, лечение`), description: `${name}: симптомы, причины и диагностика. Информация о заболевании, методы лечения и запись к специалисту в клинику МГУ в Москве.` };
  if (route.parent === '/services') return { title: title(`${name} в Москве: цены и запись`), description: `${name} в клинике МГУ в Москве. Информация об услуге, подготовке и специалистах. Стоимость и условия лечения можно уточнить при записи.` };
  if (route.parent === '/team') {
    const properties = route.item.properties || {};
    const specialty = plain(properties.PROF?.values?.[0]?.value || properties.DOLZHNOST?.values?.[0]?.value || 'Врач');
    return { title: title(`${name}: запись на приём`), description: `${name}. ${specialty}. Сведения о специалисте, направления работы и запись на консультацию в клинику МГУ в Москве.` };
  }
  if (route.parent === '/articles' || route.parent === '/clinicalcases' || route.parent === '/news') {
    const summary = plain(route.item.fields?.PREVIEW_TEXT || route.item.preview_text);
    // Cut at a word boundary, never manufacture a claim of medical review or publication consent.
    const excerpt = summary.length > 165 ? summary.slice(0, 166).replace(/\s+\S*$/, '').replace(/[,.!?:;]$/, '') + '…' : summary;
    return { title: title(name), description: excerpt || `${name}. Материал клиники МГУ. Контакты и запись на консультацию в Москве.` };
  }
  return { title: title(name), description: `${name}. Клиника МГУ в Москве: информация для пациентов, контакты и запись на консультацию.` };
}

function shorten(text, limit) {
  if (text.length <= limit) return text;
  const prefix = text.slice(0, limit + 1);
  const boundary = prefix.lastIndexOf(' ');
  return prefix.slice(0, boundary > limit / 2 ? boundary : limit).replace(/[\s,:;—–-]+$/, '');
}
export function metadata(route, h1) {
  const result = rawMetadata(route, h1);
  const suffix = ` | ${clinic.name}`;
  // Lengths are editorial targets, not search engine hard limits. Keep full H1s.
  if (result.title.length > 70 && !route.noindex) {
    const subject = plain(h1 || route.name);
    const compact = route.parent === '/diseases' ? `${subject}: симптомы и лечение` : route.parent === '/services' ? `${subject} в Москве` : subject;
    result.title = shorten(compact, 65 - suffix.length) + suffix;
  }
  result.description = shorten(result.description.replace(/…$/, ''), 159).replace(/[,:;]$/, '') + (/[.!?]$/.test(shorten(result.description, 159)) ? '' : '.');
  return result;
}
