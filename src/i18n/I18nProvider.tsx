import { useState, useCallback, type ReactNode } from 'react';
import { I18nContext, getTranslations, type TranslationKeys } from './index';

interface I18nProviderProps {
  children: ReactNode;
  defaultLocale?: string;
}

export const I18nProvider = ({ children, defaultLocale = 'fr' }: I18nProviderProps) => {
  const [locale, setLocaleState] = useState(defaultLocale);
  const [translations, setTranslations] = useState<TranslationKeys>(getTranslations(defaultLocale));

  const setLocale = useCallback((newLocale: string) => {
    setLocaleState(newLocale);
    setTranslations(getTranslations(newLocale));
  }, []);

  const t = useCallback((key: keyof TranslationKeys): string => {
    return translations[key] || key;
  }, [translations]);

  const value = {
    locale,
    translations,
    setLocale,
    t,
  };

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};