// Brand and hours confirmed by the owner on 2026-10-05; remaining contact facts retain existing values.
export const clinic = {
  name: 'Клиника МГУ',
  legalName: 'Отделение хирургии МНОЦ МГУ имени М. В. Ломоносова',
  phone: '+7 (967) 136-77-06', phoneHref: 'tel:+79671367706',
  email: 'info@uniclinic.pro',
  address: 'Москва, Ломоносовский проспект, 27, корпус 10',
  hours: 'Пн–Пт: 08:00–17:00',
  openingHours: 'Mo-Fr 08:00-17:00',
  // Add verified building/entrance media here; empty means no invented location photo.
  contactPhotos: [],
};
export function toggleAccessibility() {
  document.documentElement.classList.toggle('accessible');
  localStorage.setItem('accessible', document.documentElement.classList.contains('accessible') ? '1' : '0');
}
