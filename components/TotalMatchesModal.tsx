import React from 'react';
import type { Match } from '../types';
import SportIcon from './SportIcon';
import TrophyIcon from './icons/TrophyIcon';
import { getDateFromId } from '../utils';

const MatchInfoCard: React.FC<{ match: Match & { finalScoreA: number, finalScoreB: number }; index: number }> = ({ match, index }) => {
    const isTie = match.finalScoreA === match.finalScoreB;
    const isAWinner = match.finalScoreA > match.finalScoreB;
    const isBWinner = match.finalScoreB > match.finalScoreA;

    const winner = isAWinner ? match.teamA : (isBWinner ? match.teamB : null);

    return (
        <div 
            className="bg-light-card-secondary dark:bg-dark-card-secondary p-4 rounded-lg animate-slide-in-bottom"
            style={{ animationDelay: `${index * 50}ms` }}
        >
            <div className="flex items-center gap-4">
                <div className="flex flex-col items-center justify-center w-20 text-center text-light-text-muted dark:text-dark-text-muted">
                    <SportIcon sport={match.sport} className="h-7 w-7" />
                    <div className="mt-1">
                        <span className="text-xs font-semibold block">{match.sport}</span>
                        <span className="text-xs font-mono">{getDateFromId(match.id, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                </div>
                <div className="flex-1 grid grid-cols-[1fr_auto_1fr] items-center gap-x-2 sm:gap-x-4">
                    <div className={`flex items-center justify-end gap-3 text-right ${isAWinner ? 'font-bold' : ''}`}>
                        <span className="text-base sm:text-lg truncate" style={{ color: match.teamA.color }}>{match.teamA.name}</span>
                        {isAWinner && <TrophyIcon className="h-5 w-5 text-yellow-400 order-first sm:order-last" />}
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 font-mono text-xl sm:text-2xl">
                        <span className={`px-2 py-1 rounded-md ${isAWinner ? 'bg-light-card dark:bg-dark-card shadow-sm' : ''}`}>{match.finalScoreA}</span>
                        <span>-</span>
                        <span className={`px-2 py-1 rounded-md ${isBWinner ? 'bg-light-card dark:bg-dark-card shadow-sm' : ''}`}>{match.finalScoreB}</span>
                    </div>

                    <div className={`flex items-center justify-start gap-3 text-left ${isBWinner ? 'font-bold' : ''}`}>
                         {isBWinner && <TrophyIcon className="h-5 w-5 text-yellow-400" />}
                        <span className="text-base sm:text-lg truncate" style={{ color: match.teamB.color }}>{match.teamB.name}</span>
                    </div>
                </div>
                 <div className="w-16 text-center">
                    {isTie && <span className="px-3 py-1 text-xs font-bold rounded-full bg-gray-500/20 text-gray-400">TIE</span>}
                    {winner && (
                         <div className="flex flex-col items-center text-xs font-semibold text-yellow-500">
                             <TrophyIcon className="h-4 w-4" />
                             <span>Winner</span>
                         </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const TotalMatchesModal: React.FC<{ matches: (Match & { finalScoreA: number, finalScoreB: number })[]; onClose: () => void; }> = ({ matches, onClose }) => {
    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in" 
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="total-matches-title"
        >
            <div 
                className="bg-light-background dark:bg-dark-card rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col p-6 md:p-8 shadow-2xl relative animate-modal-scale-in" 
                onClick={e => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 p-2 rounded-full bg-light-card-secondary/80 hover:bg-light-border dark:bg-dark-card-secondary/80 dark:hover:bg-dark-border z-10"
                    aria-label="Close match list"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="flex-shrink-0 pb-4 border-b border-light-border dark:border-dark-border">
                    <h2 id="total-matches-title" className="text-3xl font-bold font-display text-center">
                        All Completed Matches
                    </h2>
                    <p className="text-center text-light-text-muted dark:text-dark-text-muted font-semibold">{matches.length} Total</p>
                </div>
                
                <div className="flex-grow overflow-y-auto mt-4 pr-2 -mr-4">
                     <div className="space-y-3">
                        {matches.map((match, index) => (
                            <MatchInfoCard key={match.id} match={match} index={index} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TotalMatchesModal;