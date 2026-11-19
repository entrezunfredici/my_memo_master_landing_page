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

function bindForm({ form, status, endpoint, buildBody, successMessage }) {
  if (!form) return;
  const submitButton = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const turnstileToken = getTurnstileToken(form);
    if (config.turnstileSiteKey && !turnstileToken) {
      setStatusMessage(status, 'Veuillez compléter le CAPTCHA avant de continuer.', 'error');
      return;
    }

    submitButton.disabled = true;
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...buildBody(form), turnstileToken })
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setStatusMessage(status, successMessage);
      form.reset();
    } catch {
      setStatusMessage(
        status,
        `L’envoi a échoué. Vous pouvez nous écrire directement à ${config.contactEmail}.`,
        'error'
      );
    } finally {
      submitButton.disabled = false;
      resetTurnstile(form);
    }
  });
}

export function initForms() {
  bindForm({
    form: document.getElementById('feedbackForm'),
    status: document.getElementById('feedbackMessageStatus'),
    endpoint: config.feedbackEndpoint,
    buildBody: (form) => ({ message: form.feedbackMessage.value }),
    successMessage: 'Merci pour votre retour, il nous a bien été transmis.'
  });

  bindForm({
    form: document.getElementById('androidForm'),
    status: document.getElementById('androidStatus'),
    endpoint: config.androidWaitlistEndpoint,
    buildBody: (form) => ({ email: form.androidEmail.value.trim() }),
    successMessage: 'Merci ! Votre adresse a bien été ajoutée à la liste Android.'
  });
}
