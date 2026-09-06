import { config } from './config.js';

const getTurnstileToken = (form) =>
  form.querySelector('[name="cf-turnstile-response"]')?.value || '';

const resetTurnstile = (form) => {
  if (typeof window.turnstile === 'undefined') return;
  const widget = form.querySelector('.cf-turnstile');
  if (widget) window.turnstile.reset(widget);
};

const setStatusMessage = (node, message, tone = 'success') => {
  node.textContent = message;
  node.classList.add('is-visible');
  node.classList.toggle('is-error', tone === 'error');
};

export function initForms() {
  const feedbackForm = document.getElementById('feedbackForm');
  const feedbackMessageStatus = document.getElementById('feedbackMessageStatus');

  feedbackForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!feedbackForm.reportValidity()) return;
    if (config.turnstileSiteKey && !getTurnstileToken(feedbackForm)) {
      setStatusMessage(feedbackMessageStatus, 'Veuillez compléter le CAPTCHA avant de continuer.', 'error');
      return;
    }
    feedbackMessageStatus.classList.add('is-visible');
    feedbackForm.reset();
    resetTurnstile(feedbackForm);
  });
}
