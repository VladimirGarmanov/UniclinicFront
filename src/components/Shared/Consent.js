import React from 'react';
export const CONSENT_VERSION = '2026-10-04';
export default function Consent() {
  return <label className="consentField">
    <input type="checkbox" name="consent" required />
    <span>Я даю <a href="/personal-data" target="_blank" rel="noreferrer">согласие на обработку персональных данных</a> и ознакомлен(а) с <a href="/privacy" target="_blank" rel="noreferrer">политикой конфиденциальности</a>.</span>
  </label>;
}
