import React, { useState } from 'react';
import type { Match } from '../types';
import MatchDetailModal from './MatchDetailModal';
import SportIcon from './SportIcon';

interface MatchesByDifferentialModalProps {
  label: string;
  matches: (Match & { finalScoreA: number; finalScoreB: number; })[];
  onClose: () => void;
}

const MatchesByDifferentialModal: React.FC<MatchesByDifferentialModalProps> = ({ label, matches, onClose }) => {
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

    return (
        <>
            <div
                className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-modal-scale-in"
                onClick={onClose}
                role="dialog"
                aria-modal="true"
            >
                <div
                    className="bg-light-background dark:bg-dark-background rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col p-6 md:p-8 shadow-2xl relative"
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
                        <h2 className="text-3xl font-bold font-display">
                            Matches with Score Differential of {label}
                        </h2>
                        <p className="text-light-text-muted dark:text-dark-text-muted">{matches.length} {matches.length === 1 ? 'match' : 'matches'} found</p>
                    </div>

                    <div className="flex-grow overflow-y-auto mt-4 pr-2">
                        <ul className="space-y-3">
                            {matches.map(match => (
                                <li 
                                    key={match.id}
                                    onClick={() => setSelectedMatch(match)}
                                    className="p-4 rounded-lg bg-light-card dark:bg-dark-card hover:bg-light-card-secondary dark:hover:bg-dark-card-secondary cursor-pointer transition-colors duration-200"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <SportIcon sport={match.sport} className="w-6 h-6" />
                                            <div>
                                                <span className="font-bold" style={{ color: match.teamA.color }}>{match.teamA.name}</span>
                                                <span className="mx-2">vs</span>
                                                <span className="font-bold" style={{ color: match.teamB.color }}>{match.teamB.name}</span>
                                            </div>
                                        </div>
                                        <div className="font-mono text-lg font-bold">
                                            {match.finalScoreA} - {match.finalScoreB}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {selectedMatch && (
                <MatchDetailModal 
                    match={selectedMatch} 
                    onClose={() => setSelectedMatch(null)} 
                />
            )}
        </>
    );
};

export default MatchesByDifferentialModal;
