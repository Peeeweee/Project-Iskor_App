
import React, { useMemo } from 'react';
import type { Match, TeamStat } from '../types';

interface TeamDetailModalProps {
    team: TeamStat;
    matches: Match[];
    onClose: () => void;
}

const ResultLozenge: React.FC<{ didWin: boolean }> = ({ didWin }) => (
    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${didWin ? 'bg-green-500/20 text-green-400' : 'bg-brand-red/20 text-brand-red'}`}>
        {didWin ? 'WIN' : 'LOSS'}
    </span>
);

const TeamDetailModal: React.FC<TeamDetailModalProps> = ({ team, matches, onClose }) => {
    const teamMatches = useMemo(() => 
        matches
            .filter(m => m.teamA.name === team.teamConfig.name || m.teamB.name === team.teamConfig.name)
            .sort((a, b) => parseInt(b.id.split('-')[1]) - parseInt(a.id.split('-')[1])), 
        [matches, team.teamConfig.name]
    );

    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-modal-scale-in" 
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="team-details-title"
        >
            <div 
                className="bg-light-background dark:bg-dark-background rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col p-6 md:p-8 shadow-2xl relative" 
                onClick={e => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 p-2 rounded-full bg-light-card-secondary/80 hover:bg-light-border dark:bg-dark-card-secondary/80 dark:hover:bg-dark-border z-10"
                    aria-label="Close team details"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                
                {/* Header */}
                <div className="flex-shrink-0 pb-4 border-b border-light-border dark:border-dark-border">
                    <h2 id="team-details-title" className="text-3xl font-bold font-display" style={{ color: team.teamConfig.color }}>
                        {team.teamConfig.name}
                    </h2>
                    <div className="flex items-center gap-4 mt-2 text-light-text-muted dark:text-dark-text-muted">
                        <span className="font-semibold">Record: <span className="text-green-500">{team.wins}</span> - <span className="text-brand-red">{team.losses}</span></span>
                        <span>|</span>
                        <span>Total Games: {team.totalGames}</span>
                    </div>
                </div>

                {/* Match History */}
                <div className="flex-grow overflow-y-auto mt-4 pr-2 -mr-2">
                    <h3 className="font-bold mb-4 text-lg">Match History</h3>
                    <ul className="space-y-3">
                        {teamMatches.map(match => {
                            const isTeamA = match.teamA.name === team.teamConfig.name;
                            const ownScore = isTeamA ? match.finalScoreA : match.finalScoreB;
                            const opponent = isTeamA ? match.teamB : match.teamA;
                            const opponentScore = isTeamA ? match.finalScoreB : match.finalScoreA;
                            const didWin = (ownScore ?? 0) > (opponentScore ?? 0);

                            return (
                                <li key={match.id} className="flex justify-between items-center p-3 rounded-lg bg-light-card-secondary dark:bg-dark-card-secondary">
                                    <div>
                                        <p className="font-semibold">
                                            vs <span style={{ color: opponent.color }}>{opponent.name}</span>
                                        </p>
                                        <p className="text-sm text-light-text-muted dark:text-dark-text-muted">{match.sport}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-mono font-bold text-lg">{ownScore} - {opponentScore}</span>
                                        <ResultLozenge didWin={didWin} />
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default TeamDetailModal;
