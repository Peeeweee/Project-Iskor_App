import React, { useMemo, useState, useEffect, useRef } from 'react';
import type { Match, TeamConfig, TeamStat } from '../types';
import { Sport } from '../types';
import ListIcon from './icons/ListIcon';
import FireIcon from './icons/FireIcon';
import TrendingUpIcon from './icons/TrendingUpIcon';
import ChartBarIcon from './icons/ChartBarIcon';
import TeamDetailModal from './TeamDetailModal';
import DonutChart from './charts/DonutChart';
import BarChart from './charts/BarChart';
import TotalMatchesModal from './TotalMatchesModal';
import MostPlayedSportModal from './MostPlayedSportModal';
import HighestScoringGamesModal from './HighestScoringGamesModal';
import SportIcon from './SportIcon';
import MostDecisiveVictoryModal from './MostDecisiveVictoryModal';


interface AnalyticsPageProps {
  matches: Match[];
}

const easeOutQuad = (t: number) => t * (2 - t);

const useCountUp = (end: number = 0, duration = 1500) => {
    const [count, setCount] = useState(0);
    // FIX: Initialize useRef with null for better type safety.
    const animationFrameRef = useRef<number | null>(null);

    useEffect(() => {
        let startTime: number | null = null;
        
        const animate = (timestamp: number) => {
            if (!startTime) {
                startTime = timestamp;
            }
            
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);
            const easedPercentage = easeOutQuad(percentage);
            
            const currentCount = Math.round(end * easedPercentage);
            setCount(currentCount);
            
            if (progress < duration) {
                animationFrameRef.current = requestAnimationFrame(animate);
            } else {
                setCount(end); // Ensure it ends on the exact value
            }
        };

        // Reset count to 0 to start animation from the beginning when 'end' value changes
        setCount(0);
        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [end, duration]);
    
    return count;
};

interface KpiCardProps {
    icon: React.ReactNode;
    title: string;
    value?: string | number;
    children?: React.ReactNode;
    description: React.ReactNode;
    isCounting?: boolean;
    prefix?: string;
    suffix?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ icon, title, value, children, description, isCounting = false, prefix = '', suffix = '' }) => {
    const endValueForCountUp = parseFloat(String(value)) || 0;
    const animatedValue = useCountUp(endValueForCountUp, 1500);
    const displayValue = isCounting ? `${prefix}${animatedValue}${suffix}` : value;

    const valueIsString = typeof displayValue === 'string';
    // Adjust font size based on string length to prevent overflow and keep it looking good.
    const valueSizeClass = valueIsString && displayValue.length > 20 
        ? 'text-lg' 
        : valueIsString && displayValue.length > 12 
        ? 'text-xl' 
        : 'text-2xl';

    return (
        <div className="bg-light-card dark:bg-dark-card techy-bg p-6 rounded-xl shadow-sm flex items-start gap-4 card-glow-on-hover h-full">
            <div className="bg-brand-blue/10 text-brand-blue p-3 rounded-lg">
                {icon}
            </div>
            <div className="flex-1">
                <p className="text-sm font-semibold text-light-text-muted dark:text-dark-text-muted">{title}</p>
                {children ? (
                    <div className="mt-1">{children}</div>
                ) : (
                    <p className={`${valueSizeClass} font-bold font-display break-words`}>{displayValue}</p>
                )}
                <p className="text-xs text-light-text-muted dark:text-dark-text-muted">{description}</p>
            </div>
        </div>
    );
};

const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ matches }) => {
    const [selectedSport, setSelectedSport] = useState<Sport | 'All'>('All');
    const [selectedTeam, setSelectedTeam] = useState<TeamStat | null>(null);
    const [isTotalMatchesModalOpen, setIsTotalMatchesModalOpen] = useState(false);
    const [isMostPlayedSportModalOpen, setIsMostPlayedSportModalOpen] = useState(false);
    const [isHighestScoringGamesModalOpen, setIsHighestScoringGamesModalOpen] = useState(false);
    const [isMostDecisiveVictoryModalOpen, setIsMostDecisiveVictoryModalOpen] = useState(false);

    
    const allFinishedMatches = useMemo<(Match & { finalScoreA: number; finalScoreB: number; })[]>(() => 
        matches.filter((m): m is Match & { finalScoreA: number; finalScoreB: number } =>
            m.status === 'Finished' && typeof m.finalScoreA === 'number' && typeof m.finalScoreB === 'number'
        )
    , [matches]);

    const finishedMatches = useMemo<(Match & { finalScoreA: number; finalScoreB: number; })[]>(() => {
        if (selectedSport === 'All') {
            return allFinishedMatches;
        }
        return allFinishedMatches.filter(m => m.sport === selectedSport);
    }, [allFinishedMatches, selectedSport]);


    const stats = useMemo(() => {
        if (allFinishedMatches.length === 0) return null;

        const sportCounts = allFinishedMatches
            .reduce((acc: Record<Sport, number>, match) => {
                acc[match.sport] = (acc[match.sport] || 0) + 1;
                return acc;
            }, {} as Record<Sport, number>);

        const mostPlayedSportNames = (() => {
            if (Object.keys(sportCounts).length === 0) return ['N/A'];
            // Coerce to number[] to ensure type safety with Math.max in strict mode.
            const maxCount = Math.max(0, ...Object.values(sportCounts) as number[]);
            return Object.entries(sportCounts)
                .filter(([, count]) => count === maxCount)
                .map(([sport]) => sport);
        })();

        const mostPlayedSportName = mostPlayedSportNames.join(', ');
        
        const highestScoringGame = finishedMatches.reduce((max: { match: (Match & { finalScoreA: number; finalScoreB: number; }) | null; total: number }, match: (Match & { finalScoreA: number; finalScoreB: number; })) => {
            const totalScore = (match.finalScoreA ?? 0) + (match.finalScoreB ?? 0);
            return totalScore > max.total ? { match, total: totalScore } : max;
        }, { match: null, total: 0 });

        const mostDecisiveVictory = finishedMatches.reduce((max: { match: (Match & { finalScoreA: number; finalScoreB: number; }) | null; diff: number }, match: (Match & { finalScoreA: number; finalScoreB: number; })) => {
            const diff = Math.abs((match.finalScoreA ?? 0) - (match.finalScoreB ?? 0));
            return diff > max.diff ? { match, diff } : max;
        }, { match: null, diff: 0 });

        const matchesBySport = allFinishedMatches.reduce((acc: Record<Sport, number>, match) => {
            acc[match.sport] = (acc[match.sport] || 0) + 1;
            return acc;
        }, {} as Record<Sport, number>);

        const createLeaderboard = (matchesForLeaderboard: (Match & { finalScoreA: number; finalScoreB: number; })[]) => {
            const teamStats = matchesForLeaderboard.reduce((acc: Record<string, TeamStat>, match: (Match & { finalScoreA: number; finalScoreB: number; })) => {
                const { teamA, teamB, finalScoreA, finalScoreB } = match;
                const teams = [teamA, teamB];
                const scores = [finalScoreA ?? 0, finalScoreB ?? 0];

                for (let i = 0; i < teams.length; i++) {
                    const team = teams[i];
                    if (!acc[team.name]) {
                        acc[team.name] = { wins: 0, losses: 0, ties: 0, totalGames: 0, teamConfig: team };
                    }
                    acc[team.name].totalGames++;
                    if (scores[i] > scores[1 - i]) {
                        acc[team.name].wins++;
                    } else if (scores[i] < scores[1 - i]) {
                        acc[team.name].losses++;
                    } else {
                        acc[team.name].ties++;
                    }
                }
                return acc;
            }, {} as Record<string, TeamStat>);

            // FIX: In a strict TypeScript environment, `Object.values` on a record can return `unknown[]`.
            // Added `as TeamStat[]` to assert the correct type.
            return (Object.values(teamStats) as TeamStat[])
                .map((team: TeamStat) => ({
                    ...team,
                    winRate: team.totalGames > 0 ? (team.wins / team.totalGames * 100) : 0,
                }))
                .sort((a, b) => b.wins - a.wins || b.winRate - a.winRate);
        };

        const leaderboard = createLeaderboard(finishedMatches);

        const calculateHighestScores = (filteredMatches: typeof allFinishedMatches) => {
            return (Object.values(Sport) as Sport[]).reduce((acc: Record<Sport, { match: (Match & { finalScoreA: number; finalScoreB: number; }) | null; total: number }>, sport: Sport) => {
                const sportMatches = filteredMatches.filter(m => m.sport === sport);
                if (sportMatches.length > 0) {
                    acc[sport] = sportMatches.reduce((max, match) => {
                        const totalScore = (match.finalScoreA ?? 0) + (match.finalScoreB ?? 0);
                        return totalScore > max.total ? { match, total: totalScore } : max;
                    }, { match: sportMatches[0], total: (sportMatches[0].finalScoreA ?? 0) + (sportMatches[0].finalScoreB ?? 0) });
                } else {
                    acc[sport] = { match: null, total: 0 };
                }
                return acc;
            }, {} as Record<Sport, { match: (Match & { finalScoreA: number; finalScoreB: number; }) | null; total: number }>);
        };
        
        const calculateMostDecisive = (filteredMatches: typeof allFinishedMatches) => {
            return (Object.values(Sport) as Sport[]).reduce((acc: Record<Sport, { match: (Match & { finalScoreA: number; finalScoreB: number; }) | null; diff: number }>, sport: Sport) => {
                const sportMatches = filteredMatches.filter(m => m.sport === sport);
                if (sportMatches.length > 0) {
                    acc[sport] = sportMatches.reduce((max, match) => {
                        const diff = Math.abs((match.finalScoreA ?? 0) - (match.finalScoreB ?? 0));
                        return diff > max.diff ? { match, diff } : max;
                    }, { match: sportMatches[0], diff: Math.abs((sportMatches[0].finalScoreA ?? 0) - (sportMatches[0].finalScoreB ?? 0)) });
                } else {
                    acc[sport] = { match: null, diff: 0 };
                }
                return acc;
            }, {} as Record<Sport, { match: (Match & { finalScoreA: number; finalScoreB: number; }) | null; diff: number }>);
        };
        
        const timeBasedMatches = allFinishedMatches.filter(m => (m.gameMode || 'time') === 'time');
        const scoreBasedMatches = allFinishedMatches.filter(m => m.gameMode === 'score');

        const timeBasedLeaderboard = createLeaderboard(
            selectedSport === 'All' ? timeBasedMatches : timeBasedMatches.filter(m => m.sport === selectedSport)
        );
        const scoreBasedLeaderboard = createLeaderboard(
            selectedSport === 'All' ? scoreBasedMatches : scoreBasedMatches.filter(m => m.sport === selectedSport)
        );


        return { 
            kpis: {mostPlayedSportName, highestScoringGame, mostDecisiveVictory}, 
            matchesBySport, 
            leaderboard, 
            highestGamesBySport: calculateHighestScores(allFinishedMatches), 
            mostDecisiveVictoriesBySport: calculateMostDecisive(allFinishedMatches),
            highestGamesBySportTime: calculateHighestScores(timeBasedMatches),
            highestGamesBySportScore: calculateHighestScores(scoreBasedMatches),
            mostDecisiveVictoriesBySportTime: calculateMostDecisive(timeBasedMatches),
            mostDecisiveVictoriesBySportScore: calculateMostDecisive(scoreBasedMatches),
            timeBasedLeaderboard,
            scoreBasedLeaderboard,
        };

    }, [allFinishedMatches, finishedMatches, selectedSport]);
    

    const renderContent = () => {
        if (!stats) {
            return (
                <div className="bg-light-card dark:bg-dark-card rounded-lg p-8 text-center shadow-sm mt-8">
                    <h2 className="text-2xl font-bold mb-4">No Data Yet!</h2>
                    <p className="text-light-text-muted dark:text-dark-text-muted">
                        No finished matches found for {selectedSport}. Play some games to see your analytics here.
                    </p>
                </div>
            );
        }

        const sportColorMap: Record<Sport, string> = {
            [Sport.Basketball]: '#F97316', // orange-500
            [Sport.Soccer]: '#10B981', // emerald-500
            [Sport.Volleyball]: '#0EA5E9', // sky-500
        };
        
        const sportColorTextClasses: Record<Sport, string> = {
            [Sport.Basketball]: 'text-orange-500',
            [Sport.Soccer]: 'text-green-500',
            [Sport.Volleyball]: 'text-sky-500',
        };

        // FIX: Cast the result of Object.entries to a specific tuple type [Sport, number][]
        // to ensure type safety for 'sport' and 'count' in strict mode.
        const donutChartData = (Object.entries(stats.matchesBySport) as [Sport, number][])
          .map(([sport, count]) => ({
            label: sport,
            value: count,
            color: sportColorMap[sport] || '#6B7280',
          }))
          .sort((a, b) => b.value - a.value);
        
        const topTeams = stats.leaderboard.slice(0, 5);
        const barChartData = topTeams.map(team => ({
            label: team.teamConfig.name,
            color: team.teamConfig.color,
            totalGames: team.totalGames,
            values: [
                { value: team.wins, color: '#22C55E', label: 'Wins' },
                { value: team.losses, color: '#EF4444', label: 'Losses' },
                { value: team.ties, color: '#6B7280', label: 'Ties' },
            ]
        }));

        return (
            <div key={selectedSport} className="animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 my-8">
                   <button
                        onClick={() => setIsTotalMatchesModalOpen(true)}
                        disabled={!stats}
                        className="text-left animate-slide-in-bottom focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-light-background dark:focus:ring-offset-dark-background focus:ring-brand-blue rounded-xl disabled:cursor-not-allowed"
                        style={{animationDelay: '100ms'}}
                        aria-label="View details for all played matches"
                    >
                        <KpiCard icon={<ListIcon />} title="Total Matches Played" value={allFinishedMatches.length} description="Click to view all games" isCounting />
                    </button>
                    <button
                        onClick={() => setIsMostPlayedSportModalOpen(true)}
                        disabled={!stats}
                        className="text-left animate-slide-in-bottom focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-light-background dark:focus:ring-offset-dark-background focus:ring-brand-blue rounded-xl disabled:cursor-not-allowed"
                        style={{ animationDelay: '200ms' }}
                        aria-label="View sport popularity breakdown"
                    >
                        <KpiCard icon={<ChartBarIcon />} title="Most Played Sport" value={stats.kpis.mostPlayedSportName} description="Click to see breakdown" />
                    </button>
                   <button
                        onClick={() => setIsHighestScoringGamesModalOpen(true)}
                        disabled={!stats}
                        className="text-left animate-slide-in-bottom focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-light-background dark:focus:ring-offset-dark-background focus:ring-brand-blue rounded-xl disabled:cursor-not-allowed"
                        style={{ animationDelay: '300ms' }}
                        aria-label="View highest scoring games by sport"
                    >
                     <KpiCard 
                        icon={<FireIcon />} 
                        title="Highest Scoring Game" 
                        description="Click to see breakdown"
                    >
                        <div className="flex items-end justify-around gap-2 mt-2 w-full text-center">
                            {(Object.values(Sport) as Sport[]).map(sport => (
                                <div key={sport} className="flex flex-col items-center flex-1">
                                    <SportIcon sport={sport} className={`h-5 w-5 mb-1 ${sportColorTextClasses[sport]}`} />
                                    <span className="text-xl font-bold font-mono">
                                        {stats.highestGamesBySport[sport]?.total ?? '-'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </KpiCard>
                   </button>
                   <button
                        onClick={() => setIsMostDecisiveVictoryModalOpen(true)}
                        disabled={!stats}
                        className="text-left animate-slide-in-bottom focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-light-background dark:focus:ring-offset-dark-background focus:ring-brand-blue rounded-xl disabled:cursor-not-allowed"
                        style={{animationDelay: '400ms'}}
                        aria-label="View most decisive victories by sport"
                    >
                        <KpiCard
                            icon={<TrendingUpIcon />}
                            title="Most Decisive Victory"
                            description="Click to see breakdown"
                        >
                            <div className="flex items-end justify-around gap-2 mt-2 w-full text-center">
                                {(Object.values(Sport) as Sport[]).map(sport => (
                                    <div key={sport} className="flex flex-col items-center flex-1">
                                        <SportIcon sport={sport} className={`h-5 w-5 mb-1 ${sportColorTextClasses[sport]}`} />
                                        <span className="text-xl font-bold font-mono">
                                            {`+${stats.mostDecisiveVictoriesBySport[sport]?.diff ?? 0}`}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </KpiCard>
                   </button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
                    <div className="xl:col-span-3 bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-sm animate-slide-in-bottom" style={{animationDelay: '500ms'}}>
                         <h2 className="text-xl font-bold mb-4">Team Leaderboard</h2>
                         <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-light-border dark:border-dark-border text-sm text-light-text-muted dark:text-dark-text-muted">
                                        <th className="p-2">#</th>
                                        <th className="p-2">Team</th>
                                        <th className="p-2 text-center">W</th>
                                        <th className="p-2 text-center">L</th>
                                        <th className="p-2 text-center">GP</th>
                                        <th className="p-2 text-right">Win %</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.leaderboard.map((team: TeamStat & { winRate: number }, index) => {
                                        const animationDelay = `${500 + index * 50}ms`;
                                        return (
                                        <tr 
                                            key={team.teamConfig.name} 
                                            onClick={() => setSelectedTeam(team)}
                                            className="border-b border-light-border dark:border-dark-border last:border-b-0 hover:bg-light-card-secondary dark:hover:bg-dark-card-secondary cursor-pointer leaderboard-row-hover animate-slide-in-bottom"
                                            style={{
                                                '--team-glow-color': `${team.teamConfig.color}50`,
                                                animationDelay
                                            } as React.CSSProperties}
                                        >
                                            <td className="p-2 font-semibold text-light-text dark:text-dark-text">{index + 1}</td>
                                            <td className="p-2 font-bold" style={{ color: team.teamConfig.color }}>{team.teamConfig.name}</td>
                                            <td className="p-2 text-center font-mono text-green-500">{team.wins}</td>
                                            <td className="p-2 text-center font-mono text-brand-red">{team.losses}</td>
                                            <td className="p-2 text-center font-mono text-light-text dark:text-dark-text">{team.totalGames}</td>
                                            <td className="p-2 text-right font-mono font-semibold text-light-text dark:text-dark-text">{team.winRate.toFixed(1)}%</td>
                                        </tr>
                                    );
                                    })}
                                </tbody>
                            </table>
                         </div>
                    </div>
                    <div className="xl:col-span-2 space-y-8 animate-slide-in-bottom" style={{animationDelay: '600ms'}}>
                        {selectedSport === 'All' && <DonutChart data={donutChartData} title="Sport Popularity" />}
                        <BarChart data={barChartData} title={`Top 5 Teams (by Wins)${selectedSport !== 'All' ? ` in ${selectedSport}` : ''}`} />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-4 sm:p-6 md:p-8">
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-8">Analytics</h1>

            <div className="mb-6 flex flex-wrap items-center gap-2 p-1.5 bg-light-card-secondary dark:bg-dark-card-secondary rounded-lg">
                {(['All', ...Object.values(Sport)] as const).map(sport => (
                    <button
                        key={sport}
                        onClick={() => setSelectedSport(sport)}
                        className={`flex-1 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                            selectedSport === sport
                                ? 'bg-light-card dark:bg-dark-card shadow-sm text-brand-blue'
                                : 'text-light-text-muted dark:text-dark-text-muted hover:text-light-text dark:hover:text-dark-text'
                        }`}
                    >
                        {sport}
                    </button>
                ))}
            </div>
            
            {renderContent()}
            
            {selectedTeam && (
                <TeamDetailModal
                    team={selectedTeam}
                    matches={finishedMatches}
                    onClose={() => setSelectedTeam(null)}
                />
            )}

            {isTotalMatchesModalOpen && stats && (
                <TotalMatchesModal
                    matches={allFinishedMatches}
                    onClose={() => setIsTotalMatchesModalOpen(false)}
                />
            )}

            {isMostPlayedSportModalOpen && stats && (
                <MostPlayedSportModal
                    matchesBySport={stats.matchesBySport}
                    onClose={() => setIsMostPlayedSportModalOpen(false)}
                />
            )}

            {isHighestScoringGamesModalOpen && stats && (
                <HighestScoringGamesModal
                    highestGamesBySportTime={stats.highestGamesBySportTime}
                    highestGamesBySportScore={stats.highestGamesBySportScore}
                    onClose={() => setIsHighestScoringGamesModalOpen(false)}
                />
            )}

            {isMostDecisiveVictoryModalOpen && stats && (
                <MostDecisiveVictoryModal
                    mostDecisiveVictoriesBySportTime={stats.mostDecisiveVictoriesBySportTime}
                    mostDecisiveVictoriesBySportScore={stats.mostDecisiveVictoriesBySportScore}
                    onClose={() => setIsMostDecisiveVictoryModalOpen(false)}
                />
            )}
        </div>
    );
};

export default AnalyticsPage;