import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { stateManager } from '../../services/stateManager';
import { useSidebar } from '../../hooks/useSidebar';

// Type temporaire pour View - à remplacer par l'import depuis App
export type View = 'home' | 'sports' | 'countries' | 'categories' | 'all-channels' | 'guide' | 'settings';

interface LayoutProps {
    children: React.ReactNode;
    title?: string;
    showBackButton?: boolean;
    onBack?: () => void;
    currentView: View;
    onViewChange: (view: View) => void;
}

export const Layout: React.FC<LayoutProps> = ({
    children,
    title = "MAYO TV",
    showBackButton = false,
    onBack,
    currentView,
    onViewChange
}) => {
    const [globalSearchTerm, setGlobalSearchTerm] = useState('');
    const sidebar = useSidebar();

    // Gestion de la recherche globale
    const handleGlobalSearchChange = (term: string) => {
        setGlobalSearchTerm(term);
        stateManager.setSearchQuery(term);
    };

    // Fermer la sidebar mobile lors du changement de vue
    const handleViewChange = (view: View) => {
        onViewChange(view);
        if (sidebar.isMobile) {
            sidebar.closeSidebar();
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <Sidebar
                isOpen={sidebar.isSidebarOpen}
                onClose={sidebar.closeSidebar}
                currentView={currentView}
                onViewChange={handleViewChange}
                isCollapsed={sidebar.isSidebarCollapsed}
                onToggleCollapse={sidebar.toggleSidebarCollapse}
                isVisible={sidebar.isSidebarVisible}
            />

            {/* Main content area */}
            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebar.getMainContentMargin()}`}>
                {/* Header */}
                <Header
                    title={title}
                    showBackButton={showBackButton}
                    onBack={onBack || (() => {})}
                    onToggleSidebar={sidebar.toggleSidebarVisibility}
                    globalSearchTerm={globalSearchTerm}
                    onGlobalSearchChange={handleGlobalSearchChange}
                    isSidebarOpen={sidebar.getSidebarState()}
                />

                {/* Page content */}
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};