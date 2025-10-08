import React from 'react';
import type { Theme, View, GameStatus } from '../../types';
import { GameStatus as GameStatusEnum } from '../../types';
import DashboardIcon from '../icons/DashboardIcon';
import SettingsIcon from '../icons/SettingsIcon';
import SunIcon from '../icons/SunIcon';
import MoonIcon from '../icons/MoonIcon';
import CheckIcon from '../icons/CheckIcon';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    theme: Theme;
    toggleTheme: () => void;
    navigateTo: (view: View) => void;
    isMatchActive: boolean;
    matchStatus: GameStatus | null;
}

const NavLink: React.FC<{ icon: React.ReactNode, label: string, onClick: () => void }> = ({ icon, label, onClick }) => (
    <button onClick={onClick} className="flex items-center w-full px-4 py-3 rounded-lg text-light-text-muted hover:bg-light-card-secondary hover:text-light-text dark:text-dark-text-muted dark:hover:bg-dark-card-secondary dark:hover:text-dark-text">
        <span className="mr-4">{icon}</span>
        <span className="font-semibold">{label}</span>
    </button>
);

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, theme, toggleTheme, navigateTo, isMatchActive, matchStatus }) => {
    const renderMatchStatusIndicator = () => {
        if (!isMatchActive) return null;

        if (matchStatus === GameStatusEnum.Finished) {
            return (
                <div className="mb-4 px-4 py-2 bg-green-500/20 rounded-lg flex items-center justify-center text-green-400">
                    <CheckIcon />
                    <span className="font-semibold text-sm ml-2">Match Finished</span>
                </div>
            );
        }

        return (
            <div className="mb-4 px-4 py-2 bg-green-500/10 rounded-lg flex items-center justify-center">
               <span className="relative flex h-3 w-3 mr-3">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
               </span>
               <span className="text-green-400 font-semibold text-sm">Match Active</span>
            </div>
        );
    };

    return (
        <>
            {/* Overlay for mobile */}
            <div
                className={`fixed inset-0 z-20 bg-black/50 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsOpen(false)}
            />

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-30 h-full w-64 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:w-72 flex flex-col p-4 bg-light-card dark:bg-dark-card shadow-lg
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <div className="flex items-center mb-10 px-2">
                    <h1 className="text-2xl font-bold font-display">Sports Scoreboard Pro</h1>
                </div>

                <nav className="flex-1 space-y-2">
                    <NavLink icon={<DashboardIcon />} label="Dashboard" onClick={() => navigateTo('dashboard')} />
                    <NavLink icon={<SettingsIcon />} label="Settings" onClick={() => navigateTo('settings')} />
                </nav>
                
                {renderMatchStatusIndicator()}

                <div className="space-y-4">
                    <button
                        onClick={toggleTheme}
                        title="Toggle Theme"
                        className="w-full flex items-center justify-center gap-3 p-3 rounded-lg bg-light-card-secondary hover:bg-light-border dark:bg-dark-card-secondary dark:hover:bg-dark-border"
                    >
                        {theme === 'dark' ? <><SunIcon /> Light Mode</> : <><MoonIcon /> Dark Mode</>}
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
