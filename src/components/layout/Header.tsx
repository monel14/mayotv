

import type { ReactNode } from 'react';
import { memo } from 'react';
import { SearchInput } from '../common/SearchInput';

interface HeaderProps {
    title: string;
    showBackButton: boolean;
    onBack: () => void;
    onToggleSidebar: () => void;
    globalSearchTerm: string;
    onGlobalSearchChange: (term: string) => void;
    isSidebarOpen: boolean;
}

type HeaderButtonProps = {
    onClick?: () => void;
    children: ReactNode;
    ariaLabel: string;
};

const HeaderButton = ({ onClick, children, ariaLabel }: HeaderButtonProps) => (
    <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel}
        className="p-2 rounded-full transition-colors hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
    >
        {children}
    </button>
);

export const Header = memo(({ title, showBackButton, onBack, onToggleSidebar, globalSearchTerm, onGlobalSearchChange, isSidebarOpen }: HeaderProps) => {
    return (
        <header className="bg-primary text-white p-4 flex items-center justify-between gap-4 flex-shrink-0 shadow-md h-16 fixed top-0 left-0 right-0 z-50">
            <div className="flex items-center gap-4 flex-1 min-w-0">
                {showBackButton ? (
                     <>
                        <HeaderButton onClick={onBack} ariaLabel="Go back">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                        </HeaderButton>
                        <h1 className="text-xl font-bold truncate">{title}</h1>
                    </>
                ) : (
                    <>
                        {/* Sidebar toggle button - always visible */}
                        <HeaderButton 
                            onClick={onToggleSidebar} 
                            ariaLabel={isSidebarOpen ? "Masquer la sidebar" : "Afficher la sidebar"}
                        >
                            {isSidebarOpen ? (
                                // X icon when sidebar is open
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            ) : (
                                // Hamburger icon when sidebar is closed
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            )}
                        </HeaderButton>
                        
                        {/* Logo and title when sidebar is hidden */}
                        <div className="flex items-center gap-3">
                            <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
                            <h1 className="text-2xl font-bold tracking-wider truncate">{title}</h1>
                        </div>
                    </>
                )}
            </div>
            
            <div className="w-full max-w-xs">
                <SearchInput 
                    value={globalSearchTerm}
                    onChange={(e) => onGlobalSearchChange(e.target.value)}
                    variant="header"
                    placeholder="Search all channels..."
                />
            </div>
        </header>
    );
});