

import type { ReactNode } from 'react';
// Import du type View depuis App
import type { View } from '../../App';

// --- Icon Components (Heroicons) ---

const HomeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

const GlobeAltIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3m0 18a9 9 0 009-9m-9 9a9 9 0 00-9-9" />
    </svg>
);

const TagIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-5 5a2 2 0 01-2.828 0l-7-7A2 2 0 013 8V3a2 2 0 012-2z" />
    </svg>
);

const TvIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

const CalendarDaysIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const SportsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const Cog6ToothIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-1.007 1.11-1.226a11.983 11.983 0 012.59 0c.55.219 1.02.684 1.11 1.226 1.054 6.356-4.24 11.546-4.8 5.43-.04-.495-.44-.881-.93-.881s-.89.386-.93.881c-.56 6.116-5.854.926-4.8-5.43zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
    </svg>
);

const QuestionMarkCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ArrowLeftOnRectangleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
);

const ChevronDoubleLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
    </svg>
);

const ChevronDoubleRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" />
    </svg>
);

// --- Logo Component ---
// const MayoTVLogo = ({ isCollapsed }: { isCollapsed: boolean }) => (
//     <div className={`flex items-center gap-3 px-4 h-16 transition-opacity duration-200 ${isCollapsed ? 'opacity-0' : 'opacity-100'}`}>
//         <svg
//             className="h-8 w-8 text-primary"
//             viewBox="0 0 32 32"
//             fill="currentColor"
//             xmlns="http://www.w3.org/2000/svg"
//             aria-hidden="true"
//         >
//             <path d="M16,2A14,14,0,1,0,30,16,14,14,0,0,0,16,2Zm0,26A12,12,0,1,1,28,16,12,12,0,0,1,16,28Z" />
//             <path d="M11 10 L 11 22 L 16 18 L 16 22 L 21 16 L 16 10 L 16 14 z" />
//         </svg>
//         {!isCollapsed && <span className="text-2xl font-bold tracking-wider text-slate-800">MAYO TV</span>}
//     </div>
// );


// --- NavItem Component ---

interface NavItemProps {
    icon: ReactNode;
    label: string;
    isActive?: boolean;
    onClick?: () => void;
    isCollapsed: boolean;
}

const NavItem = ({ icon, label, isActive = false, onClick, isCollapsed }: NavItemProps) => (
    <li>
        <button
            type="button"
            onClick={onClick}
            className={`w-full flex items-center p-2.5 text-base font-medium rounded-lg transition-all duration-200 ${isCollapsed ? 'justify-center' : ''} ${isActive
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                }`}
            aria-current={isActive ? 'page' : undefined}
            title={isCollapsed ? label : undefined}
        >
            <span className="flex-shrink-0 w-6 h-6">{icon}</span>
            {!isCollapsed && <span className="ml-4 whitespace-nowrap flex-1">{label}</span>}
        </button>
    </li>
);

// --- Sidebar Component ---

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    currentView: View;
    onViewChange: (view: View) => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
    isVisible: boolean;
    isMobile: boolean;
}

export const Sidebar = ({ isOpen, onClose, currentView, onViewChange, isCollapsed, onToggleCollapse, isVisible, isMobile }: SidebarProps) => {
    // Sur desktop, si pas visible, on ne rend rien
    // Sur mobile, on rend toujours mais on contrôle avec translate
    if (!isMobile && !isVisible) {
        return null;
    }
    const mainNavLinks: { id: string; icon: React.ReactNode; label: string; viewId?: View }[] = [
        { id: 'home', icon: <HomeIcon />, label: 'Accueil', viewId: 'home' },
        { id: 'sports', icon: <SportsIcon />, label: 'Football & Sports', viewId: 'sports' },
        { id: 'countries', icon: <GlobeAltIcon />, label: 'Pays', viewId: 'countries' },
        { id: 'categories', icon: <TagIcon />, label: 'Catégories', viewId: 'categories' },
        { id: 'all-channels', icon: <TvIcon />, label: 'Toutes les chaînes', viewId: 'all-channels' },
        { id: 'guide', icon: <CalendarDaysIcon />, label: 'Guide TV', viewId: 'guide' },
    ];

    const secondaryNavLinks = [
        { id: 'settings', icon: <Cog6ToothIcon />, label: 'Paramètres' },
        { id: 'help', icon: <QuestionMarkCircleIcon />, label: 'Aide' },
        { id: 'logout', icon: <ArrowLeftOnRectangleIcon />, label: 'Déconnexion' },
    ];

    const handleNavClick = (viewId?: View) => {
        if (viewId) {
            onViewChange(viewId);
        }
        // For other links, you can add their handlers here in the future
    };

    return (
        <>
            {/* Overlay for mobile */}
            <div
                className={`fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
                aria-hidden="true"
            ></div>

            <aside
                className={`fixed top-16 bottom-0 left-0 z-40 bg-white text-slate-600 flex flex-col transition-all duration-300 ease-in-out flex-shrink-0 border-r border-slate-200 shadow-lg ${isCollapsed ? 'w-20' : 'w-64'
                    } ${
                    // Sur mobile : contrôlé par isOpen, sur desktop : toujours visible
                    isMobile
                        ? (isOpen ? 'translate-x-0' : '-translate-x-full')
                        : 'translate-x-0'
                    }`}
                aria-label="Sidebar"
            >
                <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
                    <nav className="flex-1 px-4 py-4">
                        <ul className="space-y-2">
                            {mainNavLinks.map(link => (
                                <NavItem
                                    key={link.id}
                                    icon={link.icon}
                                    label={link.label}
                                    isActive={link.viewId === currentView}
                                    onClick={() => handleNavClick(link.viewId)}
                                    isCollapsed={isCollapsed}
                                />
                            ))}
                        </ul>
                    </nav>

                    <div className="mt-auto p-4">
                        <ul className="space-y-2 pt-4 border-t border-slate-200">
                            {secondaryNavLinks.map(link => (
                                <NavItem
                                    key={link.id}
                                    icon={link.icon}
                                    label={link.label}
                                    isCollapsed={isCollapsed}
                                />
                            ))}
                        </ul>
                        <div className="hidden md:block mt-4">
                            <button
                                onClick={onToggleCollapse}
                                className="w-full flex items-center justify-center p-2.5 text-base font-medium rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors duration-200"
                                aria-label={isCollapsed ? "Étendre la sidebar" : "Réduire la sidebar"}
                                title={isCollapsed ? "Étendre la sidebar" : "Réduire la sidebar"}
                            >
                                <span className="flex-shrink-0 w-6 h-6">{isCollapsed ? <ChevronDoubleRightIcon /> : <ChevronDoubleLeftIcon />}</span>
                                {!isCollapsed && <span className="ml-2 text-sm">Réduire</span>}
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};