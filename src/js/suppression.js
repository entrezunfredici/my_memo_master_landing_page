import { config } from './config.js';
import './legal.js';

const form = document.getElementById('deletionForm');
const status = document.getElementById('deletionStatus');
const mailLink = document.getElementById('deletionMailLink');

mailLink.textContent = config.contactEmail;
mailLink.href = `mailto:${config.contactEmail}`;

const requestLabels = {
  account: 'Suppression de mon compte et de toutes mes données',
  data: 'Suppression de certaines de mes données',
  leftovers: 'Effacement des contenus conservés après suppression du compte'
};

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  const data = new FormData(form);
  const label = requestLabels[data.get('reqType')];
  const details = String(data.get('reqDetails') || '').trim();

  const body = [
    'Bonjour,',
    '',
    `Je souhaite exercer mon droit à l'effacement : ${label}.`,
    '',
    `Nom : ${data.get('reqName')}`,
    `Adresse e-mail du compte : ${data.get('reqEmail')}`,
    ...(details ? ['', 'Précisions :', details] : []),
    '',
    'Je confirme que la suppression est irréversible et que je suis le titulaire du compte (ou son représentant légal).',
    '',
    'Cordialement'
  ].join('\n');

  const subject = `Demande de suppression — ${label}`;
  window.location.href = `mailto:${config.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  status.textContent = 'Votre messagerie devrait s’ouvrir avec la demande prête à envoyer. Envoyez-la depuis l’adresse e-mail de votre compte.';
  status.classList.add('is-visible');
});
