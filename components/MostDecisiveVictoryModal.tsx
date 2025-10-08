import React, { useState, useMemo } from 'react';
import type { Match } from '../types';
import { Sport } from '../types';
import SportIcon from './SportIcon';
import TrophyIcon from './icons/TrophyIcon';
import TrendingUpIcon from './icons/TrendingUpIcon';

const getDateFromId = (id: string): string => {
    try {
        const timestamp = parseInt(id.split('-')[1], 10);
        if (isNaN(timestamp)) return 'Unknown Date';
        return new Date(timestamp).toLocaleDateString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    } catch (e) {
        return 'Unknown Date';
    }
};

interface SportRecordCardProps {
    sport: Sport;
    record: { match: (Match & { finalScoreA: number, finalScoreB: number }) | null; diff: number };
    index: number;
}

const sportColorClasses: Record<Sport, { bg: string; text: string; }> = {
    [Sport.Basketball]: { bg: 'bg-orange-500/10', text: 'text-orange-500' },
    [Sport.Soccer]: { bg: 'bg-green-500/10', text: 'text-green-500' },
    [Sport.Volleyball]: { bg: 'bg-sky-500/10', text: 'text-sky-500' },
};


const SportRecordCard: React.FC<SportRecordCardProps> = ({ sport, record, index }) => {
    const { match, diff } = record;
    const colorClass = sportColorClasses[sport];

    const setScores = useMemo(() => {
        if (sport !== Sport.Volleyball || !match?.periodScores) {
            return null;
        }
        return match.periodScores.reduce((acc, score) => {
            if (score.a > score.b) {
                acc.a++;
            } else if (score.b > score.a) {
                acc.b++;
            }
            return acc;
        }, { a: 0, b: 0 });
    }, [sport, match]);

    if (!match) {
        return (
            <div className={`bg-light-card-secondary dark:bg-dark-card-secondary p-5 rounded-lg flex flex-col items-center justify-center text-center animate-slide-in-bottom h-full`} style={{ animationDelay: `${index * 100}ms` }}>
                <div className={`p-3 rounded-full mb-3 ${colorClass.bg}`}>
                    <SportIcon sport={sport} className={`h-8 w-8 ${colorClass.text}`} />
                </div>
                <h3 className={`font-bold text-xl ${colorClass.text}`}>{sport}</h3>
                <p className="text-light-text-muted dark:text-dark-text-muted mt-2">No games played yet.</p>
            </div>
        );
    }
    
    const isAWinner = match.finalScoreA > match.finalScoreB;
    const winner = isAWinner ? match.teamA : match.teamB;

    return (
        <div className={`bg-light-card-secondary dark:bg-dark-card-secondary p-5 rounded-lg flex flex-col animate-slide-in-bottom h-full`} style={{ animationDelay: `${index * 100}ms` }}>
            <div className={`flex items-center gap-3 mb-4 pb-4 border-b border-light-border dark:border-dark-border ${colorClass.text}`}>
                <SportIcon sport={sport} className="h-7 w-7" />
                <h3 className="font-bold text-xl">{sport}</h3>
            </div>

            <div className="text-sm text-light-text-muted dark:text-dark-text-muted mb-3 flex justify-between items-center">
                <span>{getDateFromId(match.id)}</span>
                <span className="flex items-center gap-1 font-semibold">
                    <TrendingUpIcon />
                    +{diff} Point Victory
                </span>
            </div>
            
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center mb-4">
                <span className="text-lg font-bold truncate" style={{ color: match.teamA.color }}>{match.teamA.name}</span>
                <span className="text-lg font-mono text-light-text-muted dark:text-dark-text-muted">vs</span>
                <span className="text-lg font-bold truncate" style={{ color: match.teamB.color }}>{match.teamB.name}</span>
            </div>

            <div className={`text-center font-mono font-bold text-3xl ${setScores ? 'mb-2' : 'mb-4'}`}>
                {match.finalScoreA} - {match.finalScoreB}
            </div>

            {setScores && (
                <div className="text-center text-sm font-semibold text-light-text-muted dark:text-dark-text-muted mb-4">
                    Set Score: {setScores.a} - {setScores.b}
                </div>
            )}

            <div className="mt-auto pt-4 border-t border-light-border dark:border-dark-border text-center font-semibold text-sm">
                <div className="flex items-center justify-center gap-2 text-yellow-500">
                    <TrophyIcon className="h-5 w-5" />
                    <span>Winner: {winner?.name}</span>
                </div>
            </div>
        </div>
    );
};


interface MostDecisiveVictoryModalProps {
    mostDecisiveVictoriesBySportTime: Record<Sport, { match: (Match & { finalScoreA: number, finalScoreB: number }) | null; diff: number }>;
    mostDecisiveVictoriesBySportScore: Record<Sport, { match: (Match & { finalScoreA: number, finalScoreB: number }) | null; diff: number }>;
    onClose: () => void;
}

const MostDecisiveVictoryModal: React.FC<MostDecisiveVictoryModalProps> = ({ mostDecisiveVictoriesBySportTime, mostDecisiveVictoriesBySportScore, onClose }) => {
    const [activeMode, setActiveMode] = useState<'time' | 'score'>('time');

    const dataToDisplay = activeMode === 'time' ? mostDecisiveVictoriesBySportTime : mostDecisiveVictoriesBySportScore;
    const sports = Object.keys(dataToDisplay) as Sport[];
    
    const segmentedButtonClasses = (isActive: boolean) => 
      `w-full px-4 py-2 text-sm font-semibold rounded-md focus:outline-none ${
        isActive ? 'bg-brand-blue text-white' : 'bg-light-card hover:bg-light-border dark:bg-dark-card dark:hover:bg-dark-border'
      }`;

    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in" 
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="decisive-victory-title"
        >
            <div 
                className="bg-light-background dark:bg-dark-card rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col p-6 md:p-8 shadow-2xl relative animate-modal-scale-in" 
                onClick={e => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 p-2 rounded-full bg-light-card-secondary/80 hover:bg-light-border dark:bg-dark-card-secondary/80 dark:hover:bg-dark-border z-10"
                    aria-label="Close decisive victory breakdown"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="flex-shrink-0 pb-4 mb-4 border-b border-light-border dark:border-dark-border">
                    <h2 id="decisive-victory-title" className="text-3xl font-bold font-display text-center">
                        Most Decisive Victories by Sport
                    </h2>
                     <div className="mt-4 max-w-xs mx-auto p-1 rounded-lg flex space-x-1 bg-light-card-secondary dark:bg-dark-card-secondary">
                        <button onClick={() => setActiveMode('time')} className={segmentedButtonClasses(activeMode === 'time')}>Time-based</button>
                        <button onClick={() => setActiveMode('score')} className={segmentedButtonClasses(activeMode === 'score')}>Score-based</button>
                    </div>
                </div>
                
                <div className="flex-grow overflow-y-auto pr-2 -mr-4">
                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {sports.map((sport, index) => (
                           <SportRecordCard
                                key={sport}
                                sport={sport}
                                record={dataToDisplay[sport]}
                                index={index}
                           />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MostDecisiveVictoryModal;