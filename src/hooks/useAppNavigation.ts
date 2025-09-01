import { useState, useCallback } from 'react';

export type View = 'home' | 'countries' | 'categories' | 'languages' | 'all-channels' | 'guide' | 'sports';

export const useAppNavigation = (closeSidebar: () => void) => {
    const [view, setView] = useState<View>('home');
    const [selectedCountry, setSelectedCountry] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedLanguage, setSelectedLanguage] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [globalSearchTerm, setGlobalSearchTerm] = useState<string>('');

    const handleViewChange = useCallback((newView: View) => {
        setView(newView);
        setSelectedCountry('');
        setSelectedCategory('');
        setSelectedLanguage('');
        setSearchTerm('');
        closeSidebar();
    }, [closeSidebar]);

    const handleSelectCountry = useCallback((countryCode: string) => {
        setSelectedCountry(countryCode);
        setSelectedCategory('');
        setSelectedLanguage('');
        setSearchTerm('');
        closeSidebar();
    }, [closeSidebar]);

    const handleSelectCategory = useCallback((categoryId: string) => {
        setSelectedCategory(categoryId);
        setSelectedCountry('');
        setSelectedLanguage('');
        setSearchTerm('');
        closeSidebar();
    }, [closeSidebar]);

    const handleSelectLanguage = useCallback((languageCode: string) => {
        setSelectedLanguage(languageCode);
        setSelectedCountry('');
        setSelectedCategory('');
        setSearchTerm('');
        closeSidebar();
    }, [closeSidebar]);

    const handleGlobalSearchChange = useCallback((term: string) => {
        setGlobalSearchTerm(term);
        if (term) {
            setSelectedCountry('');
            setSelectedCategory('');
            setSelectedLanguage('');
            setSearchTerm('');
        }
    }, []);

    const handleBack = useCallback(() => {
        if (globalSearchTerm) {
            setGlobalSearchTerm('');
        } else if (selectedCountry || selectedCategory || selectedLanguage) {
            setSelectedCountry('');
            setSelectedCategory('');
            setSelectedLanguage('');
            setSearchTerm('');
        }
    }, [globalSearchTerm, selectedCountry, selectedCategory, selectedLanguage]);

    return {
        view,
        selectedCountry,
        selectedCategory,
        selectedLanguage,
        searchTerm,
        globalSearchTerm,
        handleViewChange,
        handleSelectCountry,
        handleSelectCategory,
        handleSelectLanguage,
        handleGlobalSearchChange,
        handleBack,
        setSearchTerm
    };
};