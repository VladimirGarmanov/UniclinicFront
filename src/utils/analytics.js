const allowedEvents = new Set(['consultation_banner_click', 'call_click', 'whatsapp_click', 'telegram_click', 'form_start', 'form_submit_success', 'form_submit_error', 'price_view', 'doctor_view']);
export function track(event, formType) {
  if (!allowedEvents.has(event) || location.pathname.startsWith('/questions/admin')) return;
  const parts = location.pathname.split('/').filter(Boolean);
  const payload = { event, page_type: parts[0] || 'home', page_url: location.pathname, entity_slug: parts.at(-1) || '', ...(formType ? { form_type: formType } : {}) };
  // No query strings, field values, exception messages or third-party calls.
  globalThis.dataLayer = globalThis.dataLayer || [];
  globalThis.dataLayer.push(payload);
  globalThis.dispatchEvent(new CustomEvent('clinic:analytics', { detail: payload }));
}
export function installAnalytics() {
  document.addEventListener('click', event => {
    const link = event.target.closest('a');
    const href = link?.getAttribute('href') || '';
    if (link?.dataset.analytics === 'consultation_banner_click') track('consultation_banner_click');
    if (href.startsWith('tel:')) track('call_click');
    else if (/^https:\/\/wa.me\//.test(href)) track('whatsapp_click');
    else if (/^https:\/\/t.me\//.test(href)) track('telegram_click');
  });
  if (location.pathname.startsWith('/doctors/')) track('doctor_view');
  const price = document.querySelector('[data-analytics-view="price_view"], .pricesTable');
  if (price && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { track('price_view'); observer.disconnect(); }
    });
    observer.observe(price);
  }
  document.querySelectorAll('form[data-form]').forEach(form => {
    form.addEventListener('focusin', () => track('form_start', form.dataset.form), { once: true });
  });
}
