export const redirects = {
  '/home': '/', '/doctors': '/team', '/faq': '/questions', '/stories': '/clinicalcases', '/about': '/', '/price': '/prices',
  '/diseases/diastaz-pryamykh-myshc-zhivota': '/diseases/diastaz-pryamykh-myshts-zhivota',
  '/diseases/epitelialnyy-kopchikovyy-khod-(ekkh)': '/diseases/epitelialnyy-kopchikovyy-khod-ekkh',
};
// These references have no matching document in the supplied export. Keep the text without a dead link.
export const unavailable = new Set(['/doctors/donchenko-konstantin-aleksandrovich', '/doctors/kakotkin-viktor-viktorovich', '/content/files/colon-russian-patient.pdf']);
export function normalizeUrl(value = '') {
  const result = String(value).replace(/https?:\/\/(?:www\.)?uniclinic\.pro(?=\/|$)/gi, '');
  if (/^\/(?!\/)/.test(result)) {
    const match = result.match(/^([^?#]*)(.*)$/s);
    const normalized = match[1].replace(/\/+$/, '') || '/';
    return (redirects[normalized] || normalized) + match[2];
  }
  return result;
}
