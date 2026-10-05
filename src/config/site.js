// Existing header/footer values. Owner must confirm hours/email before release.
export const clinic = {
  name: 'Отделение хирургии МНОЦ МГУ имени М. В. Ломоносова',
  phone: '+7 (967) 136-77-06', phoneHref: 'tel:+79671367706',
  email: 'info@uniclinic.pro',
  address: 'Москва, Ломоносовский проспект, 27, корпус 10',
  hours: 'Пн–Пт: 08:00–17:00',
};
export function toggleAccessibility() {
  document.documentElement.classList.toggle('accessible');
  localStorage.setItem('accessible', document.documentElement.classList.contains('accessible') ? '1' : '0');
}
