import React from 'react';
import type { GameState, MatchConfig } from '../types';
import { Sport, GameStatus } from '../types';

interface BoxScoreProps {
    gameState: GameState;
    matchConfig: MatchConfig;
}

const BoxScore: React.FC<BoxScoreProps> = ({ gameState, matchConfig }) => {
    const isFinished = gameState.status === GameStatus.Finished;
    const isScoreBased = matchConfig.gameMode === 'score';

    // Special case for finished, score-based games to show a single "FINAL" column.
    if (isScoreBased && isFinished) {
        const finalScores = (gameState.periodScores || [])[0];
        // Don't render if the score data isn't available for some reason.
        if (!finalScores) return null;

        const renderScoreBasedRow = (team: 'A' | 'B') => {
            const teamData = gameState[team === 'A' ? 'teamA' : 'teamB'];
            const teamKey = team === 'A' ? 'a' : 'b';
            return (
                <tr>
                    <td className="p-3 font-bold text-left sticky left-0 bg-light-card dark:bg-dark-card" style={{ color: teamData.color }}>
                        {teamData.name}
                    </td>
                    <td className="p-3 text-center font-mono font-semibold">{finalScores[teamKey]}</td>
                    <td className="p-3 text-center font-mono font-bold text-lg">{teamData.score}</td>
                </tr>
            );
        };

        return (
            <div className="w-full max-w-7xl mx-auto mb-4 p-4 rounded-lg shadow-md bg-light-card text-light-text dark:bg-dark-card dark:text-dark-text">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-light-card-secondary dark:bg-dark-card-secondary text-light-text dark:text-dark-text">
                                <th className="p-3 text-sm font-bold uppercase text-left sticky left-0 bg-light-card-secondary dark:bg-dark-card-secondary">Team</th>
                                <th className="p-3 text-sm font-bold uppercase">FINAL</th>
                                <th className="p-3 text-sm font-bold uppercase">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-light-border dark:divide-dark-border text-light-text dark:text-dark-text">
                            {renderScoreBasedRow('A')}
                            {renderScoreBasedRow('B')}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    // Original logic for time-based games (live or finished)
    const periodLabel = matchConfig.sport === Sport.Volleyball ? 'S' : matchConfig.sport === Sport.Soccer ? 'H' : 'Q';
    const periods = Array.from({ length: matchConfig.periods }, (_, i) => i + 1);

    const getScoreForPeriod = (team: 'A' | 'B', period: number) => {
        const teamKey = team === 'A' ? 'a' : 'b';
        const periodScores = gameState.periodScores || [];

        // For finished games OR past periods, the periodScores array is the source of truth.
        if (periodScores[period - 1] !== undefined) {
            return periodScores[period - 1][teamKey];
        }
        
        // For the current, live period, calculate the score.
        if (period === gameState.currentPeriod && gameState.status !== GameStatus.Finished) {
            const sumOfPreviousScores = periodScores.reduce((sum, score) => sum + (score?.[teamKey] || 0), 0);
            return gameState[team === 'A' ? 'teamA' : 'teamB'].score - sumOfPreviousScores;
        }
        
        // It's a future period.
        return '-';
    };
    
    const lastFinalizedPeriod = (gameState.periodScores || []).length;

    const renderRow = (team: 'A' | 'B') => {
        const teamData = gameState[team === 'A' ? 'teamA' : 'teamB'];
        return (
            <tr>
                <td className="p-3 font-bold text-left sticky left-0 bg-light-card dark:bg-dark-card" style={{ color: teamData.color }}>
                    {teamData.name}
                </td>
                {periods.map(p => (
                    <td 
                      key={p} 
                      className={`p-3 text-center font-mono font-semibold ${p === lastFinalizedPeriod ? 'animate-[slide-in-left_0.5s_ease-out]' : ''}`}
                    >
                        {getScoreForPeriod(team, p)}
                    </td>
                ))}
                <td className="p-3 text-center font-mono font-bold text-lg">{teamData.score}</td>
            </tr>
        );
    };

    return (
        <div className="w-full max-w-7xl mx-auto mb-4 p-4 rounded-lg shadow-md bg-light-card text-light-text dark:bg-dark-card dark:text-dark-text">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-light-card-secondary dark:bg-dark-card-secondary text-light-text dark:text-dark-text">
                            <th className="p-3 text-sm font-bold uppercase text-left sticky left-0 bg-light-card-secondary dark:bg-dark-card-secondary">Team</th>
                            {periods.map(p => (
                                <th key={p} className="p-3 text-sm font-bold uppercase">{`${periodLabel}${p}`}</th>
                            ))}
                            <th className="p-3 text-sm font-bold uppercase">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-light-border dark:divide-dark-border text-light-text dark:text-dark-text">
                        {renderRow('A')}
                        {renderRow('B')}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BoxScore;
