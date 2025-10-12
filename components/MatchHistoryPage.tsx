import React, { useState, useMemo } from 'react';
import type { Match } from '../types';
import { Sport } from '../types';
import SportIcon from './SportIcon';
import CalendarIcon from './icons/CalendarIcon';
import TrophyIcon from './icons/TrophyIcon';
import MatchDetailModal from './MatchDetailModal';
import { getDateFromId } from '../utils';

const sportFilters = ['All', Sport.Basketball, Sport.Soccer, Sport.Volleyball];

const MatchHistoryCard: React.FC<{ match: Match; onClick: () => void; }> = ({ match, onClick }) => {
    const isTie = match.finalScoreA === match.finalScoreB;
    const isAWinner = (match.finalScoreA ?? 0) > (match.finalScoreB ?? 0);
    const isBWinner = (match.finalScoreB ?? 0) > (match.finalScoreA ?? 0);
    const scoreDifference = Math.abs((match.finalScoreA ?? 0) - (match.finalScoreB ?? 0));

    return (
        <button 
            onClick={onClick} 
            className="bg-light-card dark:bg-dark-card rounded-xl shadow-lg p-5 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 w-full text-left focus:outline-none focus:ring-2 focus:ring-brand-blue"
            aria-label={`View details for match ${match.teamA.name} vs ${match.teamB.name}`}
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-4 text-sm text-light-text-muted dark:text-dark-text-muted">
                <div className="flex items-center gap-2 font-semibold">
                    <SportIcon sport={match.sport} className="h-5 w-5" />
                    <span>{match.sport}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-mono text-xs px-2 py-1 bg-light-card-secondary dark:bg-dark-card-secondary rounded-full">{match.gameMode === 'score' ? `Target: ${match.targetScore}` : `${match.durationMinutes} min`}</span>
                    <span>{getDateFromId(match.id)}</span>
                </div>
            </div>

            {/* Scores */}
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-center">
                {/* Team A */}
                <div className="flex flex-col items-center">
                    <span className="text-lg font-bold truncate max-w-full" style={{ color: match.teamA.color }}>
                        {match.teamA.name}
                    </span>
                    <span className={`text-5xl font-display ${isAWinner ? 'font-bold' : 'font-normal'}`}>
                        {match.finalScoreA}
                    </span>
                </div>

                <span className="text-2xl font-semibold text-light-text-muted dark:text-dark-text-muted">VS</span>

                {/* Team B */}
                <div className="flex flex-col items-center">
                    <span className="text-lg font-bold truncate max-w-full" style={{ color: match.teamB.color }}>
                        {match.teamB.name}
                    </span>
                    <span className={`text-5xl font-display ${isBWinner ? 'font-bold' : 'font-normal'}`}>
                        {match.finalScoreB}
                    </span>
                </div>
            </div>

            {/* Footer / Winner Info */}
            <div className="mt-4 pt-4 border-t border-light-border dark:border-dark-border flex items-center justify-center text-center font-semibold">
                {isTie ? (
                    <span>It's a Tie!</span>
                ) : (
                    <div className="flex items-center gap-2 text-yellow-500">
                        <TrophyIcon className="h-5 w-5" />
                        <span>Winner: {isAWinner ? match.teamA.name : match.teamB.name} by {scoreDifference}</span>
                    </div>
                )}
            </div>
        </button>
    );
};

const MatchHistoryPage: React.FC<{ matches: Match[] }> = ({ matches }) => {
    const [activeSportFilter, setActiveSportFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);


    const finishedMatches = useMemo(() =>
        matches
            .filter(m => m.status === 'Finished')
            .sort((a, b) => parseInt(b.id.split('-')[1]) - parseInt(a.id.split('-')[1])),
        [matches]
    );

    const filteredMatches = useMemo(() => {
        return finishedMatches.filter(match => {
            if (activeSportFilter !== 'All' && match.sport !== activeSportFilter) {
                return false;
            }

            if (searchQuery &&
                !match.teamA.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                !match.teamB.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }

            const matchTimestamp = parseInt(match.id.split('-')[1], 10);
            if (isNaN(matchTimestamp)) return true;

            if (dateRange.start) {
                const startDate = new Date(dateRange.start).setHours(0, 0, 0, 0);
                if (matchTimestamp < startDate) return false;
            }
            if (dateRange.end) {
                const endDate = new Date(dateRange.end).setHours(23, 59, 59, 999);
                if (matchTimestamp > endDate) return false;
            }

            return true;
        });
    }, [finishedMatches, activeSportFilter, searchQuery, dateRange]);
    
    const inputClasses = "bg-light-card-secondary dark:bg-dark-card-secondary border border-light-border dark:border-dark-border rounded-lg p-2 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none";
    const sportButtonClasses = (filter: string) => `px-4 py-2 text-sm font-semibold rounded-full ${activeSportFilter === filter ? 'bg-brand-blue text-white' : 'bg-light-card-secondary hover:bg-light-border dark:bg-dark-card-secondary dark:hover:bg-dark-border'}`;

    return (
        <div className="p-4 sm:p-6 md:p-8 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-8">Match History</h1>

            <div className="bg-light-card dark:bg-dark-card p-4 rounded-xl shadow-sm mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between gap-4">
                <div className="flex-1 min-w-0 md:min-w-[200px]">
                    <input
                        type="text"
                        placeholder="Search by team name..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className={`w-full ${inputClasses}`}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <input type="date" value={dateRange.start} onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))} className={`${inputClasses} pr-8`} />
                        <CalendarIcon className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 text-light-text-muted dark:text-dark-text-muted pointer-events-none" />
                    </div>
                    <span>-</span>
                     <div className="relative">
                        <input type="date" value={dateRange.end} onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))} className={`${inputClasses} pr-8`} />
                        <CalendarIcon className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 text-light-text-muted dark:text-dark-text-muted pointer-events-none" />
                    </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-2 justify-center">
                    {sportFilters.map(filter => (
                        <button key={filter} onClick={() => setActiveSportFilter(filter)} className={sportButtonClasses(filter)}>
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {filteredMatches.length > 0 ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMatches.map(match => (
                        <MatchHistoryCard key={match.id} match={match} onClick={() => setSelectedMatch(match)} />
                    ))}
                </div>
            ) : (
                <div className="bg-light-card dark:bg-dark-card rounded-lg p-8 text-center shadow-sm">
                    <h2 className="text-2xl font-bold mb-4">No Matches Found</h2>
                    <p className="text-light-text-muted dark:text-dark-text-muted">
                        No completed matches match your criteria. Try adjusting your filters or play a new game!
                    </p>
                </div>
            )}
            
            {selectedMatch && (
                <MatchDetailModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />
            )}
        </div>
    );
};

export default MatchHistoryPage;