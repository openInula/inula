import { createI18n } from 'vue-i18n';

const messages = {
  en: {
    introduction: 'Hello, I am Dora.',
  },
  es: {
    introduction: 'Ola, yo soy Dora.',
  },
};

const i18n = createI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages,
});

export default i18n;
