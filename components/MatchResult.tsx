import React from 'react';
import type { Match } from '../types';
import SportIcon from './SportIcon';

const TeamResult: React.FC<{ name: string; score: number | undefined; color: string; isWinner: boolean; }> = ({ name, score, color, isWinner }) => (
    <div 
        className={`flex flex-col items-center justify-center text-center p-6 rounded-lg transition-all duration-300 ${isWinner ? 'shadow-lg scale-105' : 'opacity-80'}`} 
        style={{ backgroundColor: color }}
    >
        <h2 className="font-display font-bold uppercase text-shadow-heavy text-white tracking-wider truncate w-full" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.5rem)' }}>
            {name}
        </h2>
        <p className="font-display font-bold text-shadow-heavy text-white leading-none" style={{ fontSize: 'clamp(4rem, 10vw, 10rem)' }}>
            {score ?? '-'}
        </p>
    </div>
);

const MatchResult: React.FC<{ match: Match }> = ({ match }) => {
    const { teamA, teamB, finalScoreA, finalScoreB, sport } = match;

    const isAWinner = (finalScoreA ?? -1) > (finalScoreB ?? -1);
    const isBWinner = (finalScoreB ?? -1) > (finalScoreA ?? -1);
    const isTie = finalScoreA === finalScoreB;

    return (
        <div className="relative bg-light-card dark:bg-dark-card rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-center">
                <TeamResult name={teamA.name} score={finalScoreA} color={teamA.color} isWinner={isAWinner} />
                
                <div className="text-center font-display uppercase text-light-text-muted dark:text-dark-text-muted my-4 md:my-0">
                    <p className="text-4xl md:text-6xl font-bold">VS</p>
                    <div className="flex items-center justify-center gap-2 mt-2">
                        <SportIcon sport={sport} className="h-6 w-6" />
                        <p className="text-lg md:text-xl font-semibold tracking-wider">{sport}</p>
                    </div>
                    {isTie && (
                        <p className="text-2xl font-bold uppercase mt-4">
                            Tie
                        </p>
                    )}
                </div>

                <TeamResult name={teamB.name} score={finalScoreB} color={teamB.color} isWinner={isBWinner} />
            </div>
        </div>
    );
};

export default MatchResult;
