import React from 'react';
import TrophyIcon from './icons/TrophyIcon';
import BasketballIcon from './icons/BasketballIcon';
import SoccerIcon from './icons/SoccerIcon';
import VolleyballIcon from './icons/VolleyballIcon';
import { Sport, type Theme } from '../types';
import PaletteIcon from './icons/PaletteIcon';

interface LandingPageProps {
    onGetStarted: () => void;
    toggleTheme: () => void;
    theme: Theme;
}

const SportCard: React.FC<{ icon: React.ReactNode, title: string }> = ({ icon, title }) => (
    <div className="bg-light-card/80 dark:bg-dark-card/50 p-6 rounded-xl flex flex-col items-center justify-center text-center ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-brand-blue/20">
        <div className="mb-4 text-brand-blue">{icon}</div>
        <h3 className="font-bold text-2xl font-display text-light-text dark:text-dark-text">{title}</h3>
    </div>
);

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, toggleTheme, theme }) => {
    
    const getTitleClass = (theme: Theme) => {
        const themeClasses: Partial<Record<Theme, string>> = {
            viola: 'text-gradient-viola',
            dark: 'text-gradient-dark',
            coder: 'text-gradient-coder',
            light: 'text-gradient-light',
        };
        return themeClasses[theme] || 'text-brand-blue';
    };

    return (
        <div className="min-h-screen w-full bg-light-background dark:bg-dark-background text-light-text dark:text-dark-text flex items-center justify-center p-4 relative">
             <button
                onClick={toggleTheme}
                className="absolute top-6 right-6 p-3 rounded-full bg-light-card/80 dark:bg-dark-card/50 hover:bg-light-border dark:hover:bg-dark-border ring-1 ring-white/10 transition-colors"
                aria-label="Cycle theme"
            >
                <PaletteIcon className="h-6 w-6" />
            </button>
            <div className="max-w-3xl text-center">
                <div className="inline-block p-5 bg-light-card dark:bg-dark-card rounded-2xl mb-6 ring-1 ring-white/10">
                    <TrophyIcon className="h-16 w-16 text-brand-blue" />
                </div>
                <h1 className={`text-5xl md:text-7xl font-bold font-display mb-4 ${getTitleClass(theme)}`}>
                    Project: Iskor-App
                </h1>
                <p className="text-lg md:text-xl text-light-text-muted dark:text-dark-text-muted mb-10 max-w-2xl mx-auto">
                    Turning Sports Matches into Legendary Showdowns.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
                   <SportCard
                        icon={<BasketballIcon className="h-12 w-12" />}
                        title={Sport.Basketball}
                    />
                    <SportCard
                        icon={<SoccerIcon className="h-12 w-12" />}
                        title={Sport.Soccer}
                    />
                    <SportCard
                        icon={<VolleyballIcon className="h-12 w-12" />}
                        title={Sport.Volleyball}
                    />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                    <button
                        onClick={onGetStarted}
                        className="w-full sm:w-auto bg-brand-blue hover:bg-opacity-90 text-white get-started-btn font-bold py-3 px-8 rounded-lg text-lg transition-transform duration-200 transform hover:scale-105"
                    >
                        Get Started
                    </button>
                </div>

                <p className="text-sm text-light-text-muted dark:text-dark-text-muted mb-4">
                    Perfect for sports organizers, coaches, PE teachers, and live streamers
                </p>
                <p className="text-xs text-light-text-muted/50 dark:text-dark-text-muted/50">
                    made by KPD13
                </p>
            </div>
        </div>
    );
};

export default LandingPage;