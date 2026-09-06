import { config } from './config.js';
import { initNav } from './nav.js';
import { initForms } from './forms.js';

document.documentElement.style.setProperty('--project-name', `"${config.projectName}"`);
document.documentElement.style.setProperty('--contact-email', `"${config.contactEmail}"`);

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

const appAccessLink = document.getElementById('appAccessLink');
if (appAccessLink && config.appUrl) {
  appAccessLink.href = config.appUrl;
}

initNav();

initForms();
