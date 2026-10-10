export const redirects = {
  '/services/prices/besplatnoe-lechenie-po-polisu-oms': '/oms',
  '/services/prices/lechenie-po-kvote-po-programme-vmp': '/vmp',
  '/services/prices/lechenie-na-platnoy-osnove': '/paid-treatment',
  '/diseases/pakhovaya-gryzha-foto-simptomy-lechenie': '/diseases/pakhovaya-gryzha',
  '/articles/kolonoskopiya-chto-nado-znat-o-samom-vazhnom-issledovanii-v-zhizni-k': '/articles/kolonoskopiya-chto-nuzhno-znat',
  '/articles/kolorektalnyy-rak-pochemu-on-voznikaet-kak-ego-lechat-i-pochemu-patsienty-ne-obrashchayutsya-k-vrach': '/articles/kolorektalnyy-rak-prichiny-i-lechenie',
  '/articles/kakie-pravila-soblyudaet-vrach-koloproktolog-chtoby-ne-stat-sobstvennym-patsientom-mozhno-li-izbezha': '/articles/pravila-profilaktiki-koloproktologa',
  '/price-mnoc2023.pdf': '/prices', '/home': '/', '/doctors': '/team', '/faq': '/questions', '/stories': '/clinicalcases', '/about': '/', '/price': '/prices',
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
