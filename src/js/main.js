import { config } from './config.js';
import { initNav } from './nav.js';
import { initForms } from './forms.js';

document.documentElement.style.setProperty('--project-name', `"${config.projectName}"`);
document.documentElement.style.setProperty('--contact-email', `"${config.contactEmail}"`);
document.documentElement.style.setProperty('--newsletter-frequency', `"${config.newsletterFrequency}"`);

document.getElementById('brandName').textContent = config.projectName;
document.getElementById('footerBrandName').textContent = config.projectName;
document.getElementById('footerProjectName').textContent = config.projectName;
document.getElementById('currentYear').textContent = new Date().getFullYear();

const contactHref = `mailto:${config.contactEmail}`;
[document.getElementById('contactEmailLink'), document.getElementById('footerContactLink')].forEach((node) => {
  node.textContent = config.contactEmail;
  node.href = contactHref;
});

[document.getElementById('navWebsiteLink'), document.getElementById('heroWebsiteLink')].forEach((node) => {
  if (!node) return;
  if (!config.websiteUrl) { node.hidden = true; return; }
  node.href = config.websiteUrl;
});

const emailjsReady = Boolean(
  window.emailjs &&
  config.emailjs.serviceId &&
  config.emailjs.templateId &&
  config.emailjs.publicKey
);

if (emailjsReady) {
  window.emailjs.init({ publicKey: config.emailjs.publicKey });
}

initNav();
initForms(emailjsReady);
