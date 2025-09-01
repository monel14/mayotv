import { useState, useEffect } from 'react';
import { useUIState, stateManager } from '../services/stateManager';

export const useSidebar = () => {
    const uiState = useUIState();
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    // Détecter si on est sur mobile
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            console.log('Mobile check:', mobile, 'window width:', window.innerWidth);
            setIsMobile(mobile);
            
            if (mobile) {
                // Sur mobile, la sidebar est toujours visible mais fermée par défaut
                setIsSidebarVisible(true);
                stateManager.setSidebarOpen(false);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Toggle de la visibilité complète de la sidebar
    const toggleSidebarVisibility = () => {
        console.log('Toggle sidebar visibility called', { isMobile, isSidebarVisible, uiState });
        
        if (isMobile) {
            // Sur mobile, on toggle l'ouverture/fermeture
            stateManager.setSidebarOpen(!uiState.sidebarOpen);
        } else {
            // Sur desktop, on toggle la visibilité complète
            const newVisibility = !isSidebarVisible;
            console.log('Setting sidebar visibility to:', newVisibility);
            setIsSidebarVisible(newVisibility);
            
            // Si on rend la sidebar visible, on s'assure qu'elle n'est pas réduite
            if (newVisibility) {
                stateManager.setSidebarCollapsed(false);
            }
        }
    };

    // Fermer la sidebar (mobile uniquement)
    const closeSidebar = () => {
        if (isMobile) {
            stateManager.setSidebarOpen(false);
        }
    };

    // Toggle collapse/expand (desktop uniquement)
    const toggleSidebarCollapse = () => {
        if (!isMobile && isSidebarVisible) {
            stateManager.setSidebarCollapsed(!uiState.sidebarCollapsed);
        }
    };

    // Calculer la largeur de marge pour le contenu principal
    const getMainContentMargin = () => {
        if (isMobile || !isSidebarVisible) {
            return 'ml-0';
        }
        return uiState.sidebarCollapsed ? 'md:ml-20' : 'md:ml-64';
    };

    // État de la sidebar pour l'icône du header
    const getSidebarState = () => {
        const result = isMobile ? (uiState.sidebarOpen ?? false) : isSidebarVisible;
        console.log('getSidebarState:', { isMobile, sidebarOpen: uiState.sidebarOpen, isSidebarVisible, result });
        return result;
    };

    return {
        // États
        isSidebarVisible,
        isSidebarOpen: uiState.sidebarOpen,
        isSidebarCollapsed: uiState.sidebarCollapsed,
        isMobile,
        
        // Actions
        toggleSidebarVisibility,
        closeSidebar,
        toggleSidebarCollapse,
        
        // Utilitaires
        getMainContentMargin,
        getSidebarState,
    };
};