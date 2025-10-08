

import React from 'react';
import type { Theme, View } from '../../types';
import PaletteIcon from '../icons/PaletteIcon';
import TrophyIcon from '../icons/TrophyIcon';
import SearchIcon from '../icons/SearchIcon';

interface HeaderProps {
    activeView: View;
    navigateTo: (view: View) => void;
    theme: Theme;
    toggleTheme: () => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

const NavLink: React.FC<{
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, isActive, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`px-3 py-2 rounded-md font-semibold whitespace-nowrap ${
                isActive
                    ? 'text-light-text dark:text-dark-text'
                    : 'text-light-text-muted hover:text-light-text dark:text-dark-text-muted dark:hover:text-dark-text'
            }`}
        >
            {label}
             {isActive && (
                <div className="mt-1 h-0.5 w-full bg-brand-blue rounded-full" />
            )}
        </button>
    );
};

const Header: React.FC<HeaderProps> = ({ activeView, navigateTo, theme, toggleTheme, searchQuery, setSearchQuery }) => {
    return (
        <header className="sticky top-0 z-20 w-full bg-light-card/80 dark:bg-dark-card/80 backdrop-blur-sm shadow-sm">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 md:px-8 flex items-center justify-between h-16 gap-4">
                <button onClick={() => navigateTo('landing')} className="flex items-center gap-2 flex-shrink-0">
                    <TrophyIcon className="h-8 w-8 text-brand-blue" />
                    <h1 className="text-xl font-bold font-display hidden sm:block">
                        Project: Iskor-App
                    </h1>
                </button>

                {(activeView === 'dashboard' || activeView === 'teams') && (
                    <div className="relative flex-1 max-w-lg mx-auto hidden md:block">
                        <input
                            type="text"
                            placeholder="Search teams, sports, matches..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-light-background dark:bg-dark-background border border-light-border dark:border-dark-border rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-brand-blue outline-none"
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-light-text-muted dark:text-dark-text-muted" />
                        </div>
                    </div>
                )}
                
                <div className="flex items-center flex-shrink-0">
                    <nav className="hidden lg:flex items-center gap-1">
                        <NavLink label="Dashboard" isActive={activeView === 'dashboard'} onClick={() => navigateTo('dashboard')} />
                        <NavLink label="Teams" isActive={activeView === 'teams'} onClick={() => navigateTo('teams')} />
                        <NavLink label="Analytics" isActive={activeView === 'analytics'} onClick={() => navigateTo('analytics')} />
                        <NavLink label="History" isActive={activeView === 'history'} onClick={() => navigateTo('history')} />
                        <NavLink label="Settings" isActive={activeView === 'settings'} onClick={() => navigateTo('settings')} />
                    </nav>
                     <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full hover:bg-light-card-secondary dark:hover:bg-dark-card-secondary"
                        aria-label="Cycle theme"
                     >
                        <PaletteIcon className="h-6 w-6" />
                     </button>
                </div>
            </div>
        </header>
    );
};

export default Header;