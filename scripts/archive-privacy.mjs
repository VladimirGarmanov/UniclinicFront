import { load } from 'cheerio';

export const privacyReport = [];
export const removedReviewIds = new Set();
const plain = value => load(String(value || ''), null, false).text().replace(/\s+/g, ' ').trim();
const email = /[\w.+-]+@[\w.-]+\.[a-zа-я]{2,}/iu;
const phone = /(?:\+?\d[\s().–-]*){10,15}/u;
const identity = /(?:паспорт|снилс|полис\s*(?:ОМС|№)|проживаю|мой адрес|мой номер|свяжитесь со мной|проспект|переулок|ул(?:ица|\.)\s|кв(?:артира|\.)\s|дата рождения|родил[а-я]*\s+\d)/iu;
// JS \b is ASCII-only: use explicit Cyrillic boundaries for patient names.
const cyrillicName = /(?:^|[^А-ЯЁа-яё])[А-ЯЁ][а-яё-]+\s+[А-ЯЁ][а-яё-]+\s+[А-ЯЁ][а-яё-]+/u;
const initials = /[А-ЯЁ][а-яё-]+\s+[А-ЯЁ]\.\s*[А-ЯЁ]\./u;
const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function prepareArchive(raw, kind, doctorNames) {
  const result = { items: [] };
  for (const item of raw.items || []) {
    const name = String(item.name || '');
    const preview = String(item.preview_text || '');
    const detail = String(item.detail_text || '');
    const content = plain([name, preview, detail].join(' '));
    const body = plain(preview || detail);
    const base = { id: item.id, code: item.code, active: item.active, date_create: item.date_create,
      timestamp_x: item.timestamp_x, date_active_from: item.date_active_from || item.active_from,
      active_from: item.active_from || item.date_active_from };
    if (kind === 'reviews' && (!body || /случайно не поставила оценку|скорректируйте.*оценк|исправьте.*оценк/iu.test(body))) {
      removedReviewIds.add(Number(item.id));
      result.items.push({ ...base, name: 'Отзыв удалён', gone: true });
      continue;
    }
    let probe = content;
    for (const doctor of doctorNames) probe = probe.replace(new RegExp(escape(doctor), 'giu'), 'врач');
    const reasons = [];
    if (item.active === 'N' || item.active === false) reasons.push('inactive_in_cms');
    if (email.test(probe)) reasons.push('email');
    if (phone.test(probe)) reasons.push('phone');
    if (identity.test(probe)) reasons.push('identifier_or_address');
    if (kind === 'questions' && (cyrillicName.test(probe) || initials.test(probe))) reasons.push('possible_full_name');
    // A name supplied in a private form may also have been copied into the narrative.
    const patient = item.properties?.NAME?.value || item.review_fields?.name || item.flat_properties?.NAME;
    if (typeof patient === 'string' && patient.trim().split(/\s+/).length >= 2 && content.toLowerCase().includes(patient.trim().toLowerCase())) reasons.push('submitted_name');
    if (reasons.length) {
      privacyReport.push({ kind, id: item.id, code: kind === 'questions' ? item.code : `review-${item.id}`, reasons });
      result.items.push({ ...base, name: kind === 'questions' ? `Вопрос №${item.id}` : `Отзыв №${item.id}`,
        withheld: true, preview_text: 'Публикация временно скрыта для проверки персональных данных.',
        detail_text: '', detail_text_type: 'text' });
      continue;
    }
    // Only this explicit public projection enters SSG and hydration; discard CMS metadata and form fields.
    result.items.push({ ...base, name: kind === 'questions' ? name : `Отзыв №${item.id}`,
      preview_text: preview, detail_text: detail, preview_text_type: item.preview_text_type, detail_text_type: item.detail_text_type,
      ...(kind === 'reviews' ? { review_fields: { name: 'Пациент', mark: item.review_fields?.mark || item.flat_properties?.MARK } } : {}) });
  }
  return result;
}
