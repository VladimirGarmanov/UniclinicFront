const allowedEvents = new Set(['call_click', 'whatsapp_click', 'telegram_click', 'form_start', 'form_submit_success', 'form_submit_error']);
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
    const href = event.target.closest('a')?.getAttribute('href') || '';
    if (href.startsWith('tel:')) track('call_click');
    else if (/^https:\/\/wa.me\//.test(href)) track('whatsapp_click');
    else if (/^https:\/\/t.me\//.test(href)) track('telegram_click');
  });
  document.querySelectorAll('form[data-form]').forEach(form => {
    form.addEventListener('focusin', () => track('form_start', form.dataset.form), { once: true });
  });
}
