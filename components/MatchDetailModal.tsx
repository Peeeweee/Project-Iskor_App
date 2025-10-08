import React, { useState } from 'react';
import type { Match, GameState } from '../types';
import { GameStatus } from '../types';
import BoxScore from './BoxScore';
import MiniAudienceWindow from './MiniAudienceWindow';
import PictureInPictureIcon from './icons/PictureInPictureIcon';
import MatchResult from './MatchResult';

interface MatchDetailModalProps {
    match: Match;
    onClose: () => void;
}

const MatchDetailModal: React.FC<MatchDetailModalProps> = ({ match, onClose }) => {
    const [isProjectorOpen, setIsProjectorOpen] = useState(false);

    // Construct a comprehensive GameState object from the match prop for child components.
    const displayGameState: GameState = {
        teamA: { ...match.teamA, score: match.finalScoreA ?? 0 },
        teamB: { ...match.teamB, score: match.finalScoreB ?? 0 },
        currentPeriod: match.periods,
        status: GameStatus.Finished,
        periodScores: match.periodScores ?? [],
        // Derive setScores for volleyball for backward compatibility with older match data.
        setScores: match.sport === 'Volleyball' ? (match.periodScores || []).reduce((acc, score) => {
            if (score && score.a > score.b) acc.a++;
            if (score && score.b > score.a) acc.b++;
            return acc;
        }, { a: 0, b: 0 }) : undefined,
    };
    
    const isAWinner = (match.finalScoreA ?? 0) > (match.finalScoreB ?? 0);
    const winner = isAWinner ? match.teamA : ((match.finalScoreB ?? 0) > (match.finalScoreA ?? 0) ? match.teamB : null);
    const winnerColor = winner?.color ?? '#4f46e5';
    
    const hasPeriodData = match.periodScores && match.periodScores.length > 0;

    return (
        <>
            {isProjectorOpen && (
                <MiniAudienceWindow
                    config={match}
                    matchId={match.id}
                    onClose={() => setIsProjectorOpen(false)}
                />
            )}
            <div 
                className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-modal-scale-in" 
                onClick={onClose}
                role="dialog"
                aria-modal="true"
                aria-labelledby="match-details-title"
            >
                <div 
                    className="bg-light-background dark:bg-dark-background rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative" 
                    onClick={e => e.stopPropagation()}
                >
                    <button 
                        onClick={() => setIsProjectorOpen(true)}
                        className="absolute top-4 left-4 p-2 flex items-center gap-2 rounded-full bg-light-card-secondary/80 hover:bg-light-border dark:bg-dark-card-secondary/80 dark:hover:bg-dark-border z-10"
                        title="Project match results"
                    >
                        <PictureInPictureIcon />
                        <span className="text-sm font-semibold hidden sm:inline">Project</span>
                    </button>
                    <button 
                        onClick={onClose} 
                        className="absolute top-4 right-4 p-2 rounded-full bg-light-card-secondary/80 hover:bg-light-border dark:bg-dark-card-secondary/80 dark:hover:bg-dark-border z-10"
                        aria-label="Close match details"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <h2 id="match-details-title" className="text-3xl font-bold font-display text-center mb-6">Match Details</h2>

                    <div 
                        className="mb-6 animate-content-slide-up"
                        style={{
                            boxShadow: `0 0 30px -10px ${winnerColor}`,
                            borderRadius: '0.5rem',
                            animationDelay: '100ms'
                        } as React.CSSProperties}
                    >
                        <MatchResult match={match} />
                    </div>
                    
                    <div 
                        className="animate-content-slide-up"
                        style={{ animationDelay: '250ms' } as React.CSSProperties}
                    >
                        {hasPeriodData ? (
                            <BoxScore gameState={displayGameState} matchConfig={match} />
                        ) : (
                            <div className="text-center p-6 bg-light-card-secondary dark:bg-dark-card-secondary rounded-lg border border-light-border dark:border-dark-border">
                                <p className="font-semibold text-light-text dark:text-dark-text">
                                    Detailed period-by-period stats are not available for this match.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default MatchDetailModal;
