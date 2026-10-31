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

  const submitButton = feedbackForm.querySelector('button[type="submit"]');

  feedbackForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!feedbackForm.reportValidity()) return;
    const turnstileToken = getTurnstileToken(feedbackForm);
    if (config.turnstileSiteKey && !turnstileToken) {
      setStatusMessage(feedbackMessageStatus, 'Veuillez compléter le CAPTCHA avant de continuer.', 'error');
      return;
    }

    submitButton.disabled = true;
    try {
      const response = await fetch(config.feedbackEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: feedbackForm.feedbackMessage.value,
          turnstileToken
        })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setStatusMessage(feedbackMessageStatus, 'Merci pour votre retour, il nous a bien été transmis.');
      feedbackForm.reset();
    } catch {
      setStatusMessage(
        feedbackMessageStatus,
        `L’envoi a échoué. Vous pouvez nous écrire directement à ${config.contactEmail}.`,
        'error'
      );
    } finally {
      submitButton.disabled = false;
      resetTurnstile(feedbackForm);
    }
  });
}
