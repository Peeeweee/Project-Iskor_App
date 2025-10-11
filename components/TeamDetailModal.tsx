import React, { useMemo, useState } from 'react';
import type { Match, TeamStat } from '../types';
import { Sport } from '../types';
import LineChart from './charts/LineChart';
import RadarChart from './charts/RadarChart';
import ChartModal from './ChartModal';
import MatchDetailModal from './MatchDetailModal';

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
    const [enlargedChart, setEnlargedChart] = useState<{ title: string; chart: React.ReactNode } | null>(null);
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

    const teamMatches = useMemo(() =>
        matches
            .filter(m => m.teamA.name === team.teamConfig.name || m.teamB.name === team.teamConfig.name)
            .sort((a, b) => parseInt(a.id.split('-')[1]) - parseInt(b.id.split('-')[1])),
        [matches, team.teamConfig.name]
    );

    const { winRateOverTime, pointsPerGame, radarChartData } = useMemo(() => {
        // Win Rate Over Time (rolling average over 5 games)
        const winRateData: { x: number; y: number }[] = [];
        if (teamMatches.length > 0) {
            const rollingWins: number[] = [];
            teamMatches.forEach((match, index) => {
                const isTeamA = match.teamA.name === team.teamConfig.name;
                const ownScore = isTeamA ? match.finalScoreA : match.finalScoreB;
                const opponentScore = isTeamA ? match.finalScoreB : match.finalScoreA;
                if ((ownScore ?? 0) > (opponentScore ?? 0)) {
                    rollingWins.push(1);
                } else {
                    rollingWins.push(0);
                }

                if (index >= 4) {
                    const rollingWinRate = rollingWins.slice(index - 4, index + 1).reduce((a, b) => a + b, 0) / 5;
                    winRateData.push({ x: index + 1, y: rollingWinRate * 100 });
                } else {
                    const rollingWinRate = rollingWins.reduce((a, b) => a + b, 0) / (index + 1);
                     winRateData.push({ x: index + 1, y: rollingWinRate * 100 });
                }
            });
        }

        // Points Per Game
        const ppgData: { x: number; y: number }[] = teamMatches.map((match, index) => {
            const isTeamA = match.teamA.name === team.teamConfig.name;
            const ownScore = isTeamA ? match.finalScoreA : match.finalScoreB;
            return { x: index + 1, y: ownScore ?? 0 };
        });

        // Radar Chart Data
        let radarData: any = { labels: [], datasets: [] };
        const teamSport = teamMatches.length > 0 ? teamMatches[0].sport : null;

        if (teamSport === Sport.Basketball) {
            const points = teamMatches.reduce((sum, match) => {
                const isTeamA = match.teamA.name === team.teamConfig.name;
                return sum + (isTeamA ? match.finalScoreA ?? 0 : match.finalScoreB ?? 0);
            }, 0) / teamMatches.length;

            const scoreDifferential = teamMatches.reduce((sum, match) => {
                const isTeamA = match.teamA.name === team.teamConfig.name;
                const ownScore = isTeamA ? match.finalScoreA ?? 0 : match.finalScoreB ?? 0;
                const opponentScore = isTeamA ? match.finalScoreB ?? 0 : match.finalScoreA ?? 0;
                return sum + (ownScore - opponentScore);
            }, 0) / teamMatches.length;

            const periodsWon = 0; // This data is not tracked yet
            const consistency = 0; // This data is not tracked yet

            radarData = {
                labels: ['Points', 'Score Diff.', 'Win %', 'Periods Won', 'Consistency'],
                datasets: [
                    {
                        label: team.teamConfig.name,
                        data: [points, scoreDifferential, (team.wins / team.totalGames) * 100, periodsWon, consistency],
                        color: team.teamConfig.color,
                        fillColor: `${team.teamConfig.color}40`,
                    },
                ],
            };
        } else if (teamSport === Sport.Soccer) {
            const goalsScored = teamMatches.reduce((sum, match) => {
                const isTeamA = match.teamA.name === team.teamConfig.name;
                return sum + (isTeamA ? match.finalScoreA ?? 0 : match.finalScoreB ?? 0);
            }, 0) / teamMatches.length;

            const goalDifferential = teamMatches.reduce((sum, match) => {
                const isTeamA = match.teamA.name === team.teamConfig.name;
                const ownScore = isTeamA ? match.finalScoreA ?? 0 : match.finalScoreB ?? 0;
                const opponentScore = isTeamA ? match.finalScoreB ?? 0 : match.finalScoreA ?? 0;
                return sum + (ownScore - opponentScore);
            }, 0) / teamMatches.length;
            
            const cleanSheets = 0; // This data is not tracked yet

            radarData = {
                labels: ['Goals Scored', 'Goal Diff.', 'Clean Sheets', 'Win %'],
                datasets: [
                    {
                        label: team.teamConfig.name,
                        data: [goalsScored, goalDifferential, cleanSheets, (team.wins / team.totalGames) * 100],
                        color: team.teamConfig.color,
                        fillColor: `${team.teamConfig.color}40`,
                    },
                ],
            };
        }


        return { winRateOverTime: winRateData, pointsPerGame: ppgData, radarChartData: radarData };
    }, [team, teamMatches]);

    return (
        <>
            <div
                className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-modal-scale-in"
                onClick={onClose}
                role="dialog"
                aria-modal="true"
                aria-labelledby="team-details-title"
            >
                <div
                    className="bg-light-background dark:bg-dark-background rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col p-6 md:p-8 shadow-2xl relative"
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

                    <div className="flex-grow overflow-y-auto mt-4 pr-2 -mr-2">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                                <h3 className="font-bold mb-4 text-lg">Charts</h3>
                                <div className="space-y-4">
                                    {winRateOverTime.length > 1 && <LineChart data={winRateOverTime} title="Win Rate Over Time (Rolling 5 Games)" color={team.teamConfig.color} yAxisLabel="Win Rate (%)" xAxisLabel="Games" onClick={() => setEnlargedChart({ title: 'Win Rate Over Time (Rolling 5 Games)', chart: <LineChart data={winRateOverTime} title="" color={team.teamConfig.color} yAxisLabel="Win Rate (%)" xAxisLabel="Games" /> })} />}
                                    {pointsPerGame.length > 1 && <LineChart data={pointsPerGame} title="Points Per Game" color={team.teamConfig.color} yAxisLabel="Points" xAxisLabel="Games" onClick={() => setEnlargedChart({ title: 'Points Per Game', chart: <LineChart data={pointsPerGame} title="" color={team.teamConfig.color} yAxisLabel="Points" xAxisLabel="Games" /> })} />}
                                    {radarChartData.labels.length > 0 && <RadarChart data={radarChartData} title="Team Performance" onClick={() => setEnlargedChart({ title: 'Team Performance', chart: <RadarChart data={radarChartData} title="" /> })} />}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold mb-4 text-lg">Match History</h3>
                                <ul className="space-y-3">
                                    {teamMatches.map(match => {
                                        const isTeamA = match.teamA.name === team.teamConfig.name;
                                        const ownScore = isTeamA ? match.finalScoreA : match.finalScoreB;
                                        const opponent = isTeamA ? match.teamB : match.teamA;
                                        const opponentScore = isTeamA ? match.finalScoreB : match.finalScoreA;
                                        const didWin = (ownScore ?? 0) > (opponentScore ?? 0);

                                        return (
                                            <li key={match.id} className="flex justify-between items-center p-3 rounded-lg bg-light-card-secondary dark:bg-dark-card-secondary cursor-pointer hover:bg-light-border dark:hover:bg-dark-border" onClick={() => setSelectedMatch(match)}>
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
                </div>
            </div>
            {enlargedChart && (
                <ChartModal title={enlargedChart.title} onClose={() => setEnlargedChart(null)}>
                    {enlargedChart.chart}
                </ChartModal>
            )}
            {selectedMatch && (
                <MatchDetailModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />
            )}
        </>
    );
};

export default TeamDetailModal;
