import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useUIState, stateManager } from '../../services/stateManager';

export type View = 'home' | 'sports' | 'countries' | 'categories' | 'all-channels' | 'guide' | 'settings';

interface SimpleLayoutProps {
    children: React.ReactNode;
    currentView: View;
    onViewChange: (view: View) => void;
}

export const SimpleLayout: React.FC<SimpleLayoutProps> = ({
    children,
    currentView,
    onViewChange
}) => {
    const uiState = useUIState();
    const [globalSearchTerm, setGlobalSearchTerm] = useState('');
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);

    // Toggle simple de la sidebar
    const handleToggleSidebar = () => {
        console.log('Simple toggle called, current visibility:', isSidebarVisible);
        setIsSidebarVisible(!isSidebarVisible);
    };

    // Fermer la sidebar sur mobile
    const handleCloseSidebar = () => {
        stateManager.setSidebarOpen(false);
    };

    // Toggle collapse
    const handleToggleCollapse = () => {
        stateManager.setSidebarCollapsed(!uiState.sidebarCollapsed);
    };

    // Recherche globale
    const handleGlobalSearchChange = (term: string) => {
        setGlobalSearchTerm(term);
        stateManager.setSearchQuery(term);
    };

    // Changement de vue
    const handleViewChange = (view: View) => {
        onViewChange(view);
        // Fermer la sidebar sur mobile
        if (window.innerWidth < 768) {
            handleCloseSidebar();
        }
    };

    console.log('SimpleLayout render:', { isSidebarVisible, uiState });

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <Sidebar
                isOpen={uiState.sidebarOpen}
                onClose={handleCloseSidebar}
                currentView={currentView}
                onViewChange={handleViewChange}
                isCollapsed={uiState.sidebarCollapsed}
                onToggleCollapse={handleToggleCollapse}
                isVisible={isSidebarVisible}
            />

            {/* Main content area */}
            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
                isSidebarVisible ? (uiState.sidebarCollapsed ? 'md:ml-20' : 'md:ml-64') : 'ml-0'
            }`}>
                {/* Header */}
                <Header
                    title="MAYO TV"
                    showBackButton={false}
                    onBack={() => {}}
                    onToggleSidebar={handleToggleSidebar}
                    globalSearchTerm={globalSearchTerm}
                    onGlobalSearchChange={handleGlobalSearchChange}
                    isSidebarOpen={isSidebarVisible}
                />

                {/* Page content */}
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};