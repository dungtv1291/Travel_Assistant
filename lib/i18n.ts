import { I18n } from 'i18n-js';
import ko from '../locales/ko';
import en from '../locales/en';
import vi from '../locales/vi';

const i18n = new I18n({ ko, en, vi });

i18n.locale = 'ko';
i18n.enableFallback = true;
i18n.defaultLocale = 'ko';

export default i18n;
export type SupportedLocale = 'ko' | 'en' | 'vi';
