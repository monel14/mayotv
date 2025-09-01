import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useUIState, stateManager } from '../../services/stateManager';

export type View = 'home' | 'sports' | 'countries' | 'categories' | 'all-channels' | 'guide' | 'settings';

interface DirectLayoutProps {
    children: React.ReactNode;
    currentView: View;
    onViewChange: (view: View) => void;
}

export const DirectLayout: React.FC<DirectLayoutProps> = ({
    children,
    currentView,
    onViewChange
}) => {
    const uiState = useUIState();
    const [globalSearchTerm, setGlobalSearchTerm] = useState('');
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);

    console.log('DirectLayout render:', { 
        isSidebarVisible, 
        sidebarOpen: uiState.sidebarOpen, 
        sidebarCollapsed: uiState.sidebarCollapsed 
    });

    // Toggle simple et direct
    const handleToggleSidebar = () => {
        console.log('DirectLayout toggle called, current visibility:', isSidebarVisible);
        const newVisibility = !isSidebarVisible;
        setIsSidebarVisible(newVisibility);
        console.log('New visibility set to:', newVisibility);
    };

    // Autres handlers
    const handleCloseSidebar = () => {
        stateManager.setSidebarOpen(false);
    };

    const handleToggleCollapse = () => {
        stateManager.setSidebarCollapsed(!uiState.sidebarCollapsed);
    };

    const handleGlobalSearchChange = (term: string) => {
        setGlobalSearchTerm(term);
        stateManager.setSearchQuery(term);
    };

    const handleViewChange = (view: View) => {
        onViewChange(view);
        if (window.innerWidth < 768) {
            handleCloseSidebar();
        }
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Debug info */}
            <div className="fixed top-20 right-4 z-50 bg-black text-white p-2 text-xs rounded">
                Sidebar Visible: {isSidebarVisible ? 'YES' : 'NO'}
            </div>

            {/* Sidebar */}
            <Sidebar
                isOpen={uiState.sidebarOpen ?? false}
                onClose={handleCloseSidebar}
                currentView={currentView}
                onViewChange={handleViewChange}
                isCollapsed={uiState.sidebarCollapsed ?? false}
                onToggleCollapse={handleToggleCollapse}
                isVisible={isSidebarVisible}
            />

            {/* Main content area */}
            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
                isSidebarVisible ? (uiState.sidebarCollapsed ? 'md:ml-20' : 'md:ml-64') : 'ml-0'
            }`}>
                {/* Header */}
                <Header
                    title="MAYO TV - Direct Test"
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