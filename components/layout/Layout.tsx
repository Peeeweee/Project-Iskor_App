import React from 'react';
import Header from './Header';
import type { Theme, View } from '../../types';

interface LayoutProps {
    children: React.ReactNode;
    activeView: View;
    navigateTo: (view: View) => void;
    theme: Theme;
    toggleTheme: () => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, navigateTo, theme, toggleTheme, searchQuery, setSearchQuery }) => {
    return (
        <div className="min-h-screen flex flex-col bg-light-background text-light-text dark:bg-dark-background dark:text-dark-text">
            <Header 
                activeView={activeView}
                navigateTo={navigateTo}
                theme={theme}
                toggleTheme={toggleTheme}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
            />
            <main className="flex-1 w-full max-w-screen-xl mx-auto">
                {children}
            </main>
        </div>
    );
};

export default Layout;