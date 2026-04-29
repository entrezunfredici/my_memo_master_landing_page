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

const setSubmitButtonState = (form, isBusy, busyLabel) => {
  const btn = form.querySelector('button[type="submit"]');
  if (!btn) return;
  if (!btn.dataset.defaultLabel) btn.dataset.defaultLabel = btn.textContent;
  btn.disabled = isBusy;
  btn.textContent = isBusy ? busyLabel : btn.dataset.defaultLabel;
};

export function initForms(emailjsReady) {
  const newsletterForm = document.getElementById('newsletterForm');
  const newsletterMessage = document.getElementById('newsletterMessage');

  newsletterForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!newsletterForm.reportValidity()) return;

    if (!emailjsReady) {
      setStatusMessage(
        newsletterMessage,
        `Le service d'envoi n'est pas configuré correctement. Vous pouvez nous écrire à ${config.contactEmail}.`,
        'error'
      );
      return;
    }

    if (config.turnstileSiteKey && !getTurnstileToken(newsletterForm)) {
      setStatusMessage(newsletterMessage, 'Veuillez compléter le CAPTCHA avant de continuer.', 'error');
      return;
    }

    const formData = new FormData(newsletterForm);
    const firstName = String(formData.get('firstName') || '').trim();
    const email = String(formData.get('email') || '').trim();

    setSubmitButtonState(newsletterForm, true, 'Envoi en cours...');

    try {
      await window.emailjs.send(config.emailjs.serviceId, config.emailjs.templateId, {
        to_email: email,
        email,
        user_email: email,
        reply_to: email,
        to_name: firstName || email,
        name: firstName || email,
        first_name: firstName,
        firstName,
        project_name: config.projectName,
        website_url: config.websiteUrl,
        newsletter_frequency: config.newsletterFrequency
      });

      setStatusMessage(
        newsletterMessage,
        `Merci${firstName ? ` ${firstName},` : ''} votre email de bienvenue vient d'être envoyé.`
      );
      newsletterForm.reset();
      resetTurnstile(newsletterForm);
    } catch {
      setStatusMessage(
        newsletterMessage,
        `L'inscription a échoué pour le moment. Réessayez dans un instant ou contactez ${config.contactEmail}.`,
        'error'
      );
      resetTurnstile(newsletterForm);
    } finally {
      setSubmitButtonState(newsletterForm, false, 'Envoi en cours...');
    }
  });

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
