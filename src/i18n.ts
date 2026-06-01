import { createI18n } from 'vue-i18n'
import en from './locales/en'
import es from './locales/es'
import ru from './locales/ru'

// Detect browser locale and map to supported language
function detectLocale(): 'en' | 'es' | 'ru' {
  const raw = navigator.language || 'en'           // e.g. "es-ES", "ru-RU", "en-US"
  const lang = raw.split('-')[0].toLowerCase()     // "es", "ru", "en"
  if (lang === 'es') return 'es'
  if (lang === 'ru') return 'ru'
  return 'en'
}

export const i18n = createI18n({
  legacy: false,          // use Composition API mode
  locale: detectLocale(),
  fallbackLocale: 'en',
  messages: { en, es, ru },
})

export default i18n
