// Ces valeurs sont toutes publiques par nature (visibles côté client dans
// n'importe quel cas : site key Turnstile, etc.).
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
  websiteUrl: normalizeWebsiteUrl('my-memo-master.com'),
  appUrl: normalizeWebsiteUrl('app.my-memo-master.com'),
  turnstileSiteKey: '0x4AAAAAAC2JVuF9MNWoCGha'
};
