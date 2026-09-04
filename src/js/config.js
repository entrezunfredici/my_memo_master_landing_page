// Ces valeurs sont toutes publiques par nature (visibles côté client dans
// n'importe quel cas : clé publique EmailJS, site key Turnstile, etc.).
// Elles étaient auparavant injectées via des placeholders (__SERVICE_ID__...)
// dans index.html, mais le workflow de déploiement ne les substituait jamais
// (il fait un simple scp du dossier src/) : le site retombait donc toujours
// sur ces valeurs par défaut. On les déclare directement ici pour éviter une
// indirection qui ne servait à rien.
const normalizeWebsiteUrl = (value) => {
  if (!value) return '';
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
};

export const config = {
  projectName: 'MyMemoMaster',
  contactEmail: 'support@my-memo-master.com',
  newsletterFrequency: 'rapport trimestriel',
  websiteUrl: normalizeWebsiteUrl('my-memo-master.com'),
  emailjs: {
    serviceId: 'service_wfecz27',
    templateId: 'template_9if0w4d',
    publicKey: 'BGhxxqDqYr7jkpsRB'
  },
  turnstileSiteKey: '0x4AAAAAAC2JVuF9MNWoCGha'
};
