const getDeviceLocale = () => {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    return typeof locale === 'string' ? locale : 'en';
  } catch (_err) {
    return 'en';
  }
};

const locale = getDeviceLocale().toLowerCase();
export const isTurkish = locale.startsWith('tr');

export const t = (trText, enText) => (isTurkish ? trText : enText);
