import React from 'react';
import { Sport } from '../types';
import SportIcon from './SportIcon';

interface MostPlayedSportModalProps {
    onClose: () => void;
    matchesBySport: Record<Sport, number>;
}

const sportColorMap: Record<Sport, string> = {
    [Sport.Basketball]: '#F97316', // orange-500
    [Sport.Soccer]: '#10B981', // emerald-500
    [Sport.Volleyball]: '#0EA5E9', // sky-500
};

const SportPopularityItem: React.FC<{ sport: Sport; count: number; total: number; index: number }> = ({ sport, count, total, index }) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    
    return (
        <div 
            className="bg-light-card-secondary dark:bg-dark-card-secondary p-4 rounded-lg animate-slide-in-bottom"
            style={{ animationDelay: `${index * 75}ms` }}
        >
            <div className="flex items-center justify-between mb-2">
{/* FIX: The SportIcon component does not accept a style prop. The style is applied to a wrapper div instead. */}
                <div className="flex items-center gap-3" style={{ color: sportColorMap[sport]}}>
                    <SportIcon sport={sport} className="h-6 w-6" />
                    <span className="font-bold text-lg">{sport}</span>
                </div>
                <span className="font-mono font-bold text-xl">{count}</span>
            </div>
            <div className="w-full bg-light-border dark:bg-dark-border rounded-full h-3 overflow-hidden">
                <div 
                    className="h-full rounded-full animate-chart-bar"
                    style={{ 
                        width: `${percentage}%`, 
                        backgroundColor: sportColorMap[sport],
                        animationDelay: `${index * 75 + 100}ms`
                    }}
                />
            </div>
        </div>
    );
};


const MostPlayedSportModal: React.FC<MostPlayedSportModalProps> = ({ onClose, matchesBySport }) => {
    const totalMatches = Object.values(matchesBySport).reduce((sum: number, count: number) => sum + count, 0);

    const sortedSports = (Object.entries(matchesBySport) as [Sport, number][])
        .sort(([, countA], [, countB]) => countB - countA);

    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in" 
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="most-played-sport-title"
        >
            <div 
                className="bg-light-background dark:bg-dark-card rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col p-6 md:p-8 shadow-2xl relative animate-modal-scale-in" 
                onClick={e => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 p-2 rounded-full bg-light-card-secondary/80 hover:bg-light-border dark:bg-dark-card-secondary/80 dark:hover:bg-dark-border z-10"
                    aria-label="Close sport breakdown"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="flex-shrink-0 pb-4 border-b border-light-border dark:border-dark-border">
                    <h2 id="most-played-sport-title" className="text-3xl font-bold font-display text-center">
                        Sport Popularity Breakdown
                    </h2>
                    <p className="text-center text-light-text-muted dark:text-dark-text-muted font-semibold">{totalMatches} Total Matches</p>
                </div>
                
                <div className="flex-grow overflow-y-auto mt-4 pr-2 -mr-4">
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {sortedSports.map(([sport, count], index) => (
                           <SportPopularityItem
                                key={sport}
                                sport={sport}
                                count={count}
                                total={totalMatches}
                                index={index}
                           />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MostPlayedSportModal;