import de from '@/locales/de.json';
import en from '@/locales/en.json';

const LANG = process.env.NEXT_PUBLIC_LANG?.toLowerCase() || 'en';

type TranslationMap = Record<string, string>;

const translations: Record<string, TranslationMap> = {
    de,
    en,
};

function t(key: string, vars: Record<string, string | number> = {}): string {
    const lang = translations[LANG] || translations['en'];
    let text = lang[key] || key;

    for (const [k, v] of Object.entries(vars)) {
        text = text.replace(`{{${k}}}`, String(v));
    }

    return text;
}

export { t };
