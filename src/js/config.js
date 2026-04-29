const defaults = {
  projectName: 'MyMemoMaster',
  contactEmail: 'support@my-memo-master.com',
  newsletterFrequency: 'rapport trimestriel',
  websiteUrl: 'my-memo-master.com',
  emailjsServiceId: 'service_wfecz27',
  emailjsTemplateId: 'template_9if0w4d',
  emailjsPublicKey: 'BGhxxqDqYr7jkpsRB',
  turnstileSiteKey: ''
};

const resolveEnvValue = (value, fallback = '') => {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith('__')) return fallback;
  return trimmed;
};

const normalizeWebsiteUrl = (value) => {
  if (!value) return '';
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
};

const env = window.MMM_ENV || {};

export const config = {
  projectName: resolveEnvValue(env.projectName, defaults.projectName),
  contactEmail: resolveEnvValue(env.contactEmail, defaults.contactEmail),
  newsletterFrequency: resolveEnvValue(env.newsletterFrequency, defaults.newsletterFrequency),
  websiteUrl: normalizeWebsiteUrl(resolveEnvValue(env.websiteUrl, defaults.websiteUrl)),
  emailjs: {
    serviceId: resolveEnvValue(env.emailjsServiceId, defaults.emailjsServiceId),
    templateId: resolveEnvValue(env.emailjsTemplateId, defaults.emailjsTemplateId),
    publicKey: resolveEnvValue(env.emailjsPublicKey, defaults.emailjsPublicKey)
  },
  turnstileSiteKey: resolveEnvValue(env.turnstileSiteKey, defaults.turnstileSiteKey)
};
