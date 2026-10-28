import { config } from './config.js';
import { initNav } from './nav.js';

document.getElementById('brandName').textContent = config.projectName;
document.getElementById('footerBrandName').textContent = config.projectName;
document.getElementById('footerProjectName').textContent = config.projectName;
document.getElementById('currentYear').textContent = new Date().getFullYear();

const footerContactLink = document.getElementById('footerContactLink');
footerContactLink.textContent = config.contactEmail;
footerContactLink.href = `mailto:${config.contactEmail}`;

initNav();
