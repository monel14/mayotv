import { createContext, useContext } from 'react';

// Types pour l'internationalisation
export interface TranslationKeys {
  // Navigation
  'nav.home': string;
  'nav.countries': string;
  'nav.categories': string;
  'nav.languages': string;
  'nav.allChannels': string;
  'nav.guide': string;
  'nav.sports': string;
  'nav.settings': string;
  'nav.help': string;
  'nav.logout': string;
  
  // Actions
  'action.back': string;
  'action.search': string;
  'action.collapse': string;
  'action.expand': string;
  'action.showSidebar': string;
  'action.hideSidebar': string;
  
  // Common
  'common.loading': string;
  'common.error': string;
  'common.noResults': string;
  'common.searchPlaceholder': string;
  'common.searchAllChannels': string;
  
  // Titles
  'title.searchResults': string;
  'title.footballSports': string;
  'title.allChannels': string;
  'title.tvGuide': string;
  'title.home': string;
  
  // Filters
  'filter.byCountry': string;
  'filter.byCategory': string;
  'filter.byLanguage': string;
}

// Traductions françaises (par défaut)
export const frTranslations: TranslationKeys = {
  // Navigation
  'nav.home': 'Accueil',
  'nav.countries': 'Pays',
  'nav.categories': 'Catégories',
  'nav.languages': 'Langues',
  'nav.allChannels': 'Toutes les chaînes',
  'nav.guide': 'Guide TV',
  'nav.sports': 'Football & Sports',
  'nav.settings': 'Paramètres',
  'nav.help': 'Aide',
  'nav.logout': 'Déconnexion',
  
  // Actions
  'action.back': 'Retour',
  'action.search': 'Rechercher',
  'action.collapse': 'Réduire',
  'action.expand': 'Étendre',
  'action.showSidebar': 'Afficher la sidebar',
  'action.hideSidebar': 'Masquer la sidebar',
  
  // Common
  'common.loading': 'Chargement...',
  'common.error': 'Erreur',
  'common.noResults': 'Aucun résultat',
  'common.searchPlaceholder': 'Rechercher...',
  'common.searchAllChannels': 'Rechercher toutes les chaînes...',
  
  // Titles
  'title.searchResults': 'Résultats de recherche',
  'title.footballSports': 'Football & Sports',
  'title.allChannels': 'Toutes les chaînes',
  'title.tvGuide': 'Guide TV',
  'title.home': 'Accueil',
  
  // Filters
  'filter.byCountry': 'Filtrer par pays',
  'filter.byCategory': 'Filtrer par catégorie',
  'filter.byLanguage': 'Filtrer par langue',
};

// Traductions anglaises
export const enTranslations: TranslationKeys = {
  // Navigation
  'nav.home': 'Home',
  'nav.countries': 'Countries',
  'nav.categories': 'Categories',
  'nav.languages': 'Languages',
  'nav.allChannels': 'All Channels',
  'nav.guide': 'TV Guide',
  'nav.sports': 'Football & Sports',
  'nav.settings': 'Settings',
  'nav.help': 'Help',
  'nav.logout': 'Logout',
  
  // Actions
  'action.back': 'Back',
  'action.search': 'Search',
  'action.collapse': 'Collapse',
  'action.expand': 'Expand',
  'action.showSidebar': 'Show sidebar',
  'action.hideSidebar': 'Hide sidebar',
  
  // Common
  'common.loading': 'Loading...',
  'common.error': 'Error',
  'common.noResults': 'No results',
  'common.searchPlaceholder': 'Search...',
  'common.searchAllChannels': 'Search all channels...',
  
  // Titles
  'title.searchResults': 'Search Results',
  'title.footballSports': 'Football & Sports',
  'title.allChannels': 'All Channels',
  'title.tvGuide': 'TV Guide',
  'title.home': 'Home',
  
  // Filters
  'filter.byCountry': 'Filter by country',
  'filter.byCategory': 'Filter by category',
  'filter.byLanguage': 'Filter by language',
};

// Contexte pour l'internationalisation
export interface I18nContextType {
  locale: string;
  translations: TranslationKeys;
  setLocale: (locale: string) => void;
  t: (key: keyof TranslationKeys) => string;
}

export const I18nContext = createContext<I18nContextType | null>(null);

// Hook pour utiliser les traductions
export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
};

// Fonction utilitaire pour obtenir les traductions selon la locale
export const getTranslations = (locale: string): TranslationKeys => {
  switch (locale) {
    case 'en':
      return enTranslations;
    case 'fr':
    default:
      return frTranslations;
  }
};