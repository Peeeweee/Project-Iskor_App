import React, { useState, useMemo } from 'react';
import { Sport, type Match, type MatchStatus } from '../types';
import SportIcon from './SportIcon';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';
import ArchiveIcon from './icons/ArchiveIcon';
import UnarchiveIcon from './icons/UnarchiveIcon';
import ListIcon from './icons/ListIcon';
import CheckIcon from './icons/CheckIcon';
import DeleteConfirmationModal from './DeleteConfirmationModal';

interface DashboardProps {
  matches: Match[];
  onManageMatch: (match: Match) => void;
  onGoToAudienceView: (match: Match) => void;
  onCreateMatch: () => void;
  onDeleteMatch: (matchId: string) => void;
  onArchiveMatch: (matchId: string) => void;
  onUnarchiveMatch: (matchId: string) => void;
  onGoToHistory: () => void;
  onToggleCompleteMatch: (matchId: string, isCompleted: boolean) => void;
  searchQuery: string;
}

const StatusBadge: React.FC<{ status: MatchStatus }> = ({ status }) => {
    const baseClasses = 'px-3 py-1 text-sm font-bold rounded-full';
    const statusClasses: Record<MatchStatus, string> = {
        'In Progress': 'bg-green-500/20 text-green-400',
        'Finished': 'bg-gray-500/20 text-gray-400',
        'Upcoming': 'bg-indigo-500/20 text-indigo-400',
    };
    return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
};

const dashboardFilters = ['All', Sport.Basketball, Sport.Soccer, Sport.Volleyball, 'Finished'];

const ConfirmationModal: React.FC<{
  title: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmText: string;
  confirmClass: string;
}> = ({ title, description, onCancel, onConfirm, confirmText, confirmClass }) => (
   <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="rounded-xl p-8 w-full max-w-md mx-4 bg-light-card text-light-text dark:bg-dark-card dark:text-dark-text shadow-2xl">
            <h3 className="text-2xl font-bold font-display mb-4">{title}</h3>
            <p className="text-light-text-muted dark:text-dark-text-muted mb-8">
                {description}
            </p>
            <div className="flex justify-end gap-4">
                <button
                    onClick={onCancel}
                    className="font-bold py-2 px-6 rounded-lg bg-light-card-secondary hover:bg-light-border dark:bg-dark-card-secondary dark:hover:bg-dark-border"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    className={`${confirmClass} text-white font-bold py-2 px-6 rounded-lg`}
                >
                    {confirmText}
                </button>
            </div>
        </div>
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ matches, onManageMatch, onGoToAudienceView, onCreateMatch, onDeleteMatch, onArchiveMatch, onUnarchiveMatch, onGoToHistory, onToggleCompleteMatch, searchQuery }) => {
    const [activeFilter, setActiveFilter] = useState<typeof dashboardFilters[number]>('All');
    const [viewMode, setViewMode] = useState<'active' | 'archived' | 'completed'>('active');
    const [archivingId, setArchivingId] = useState<string | null>(null);
    const [unarchivingId, setUnarchivingId] = useState<string | null>(null);
    const [completingId, setCompletingId] = useState<string | null>(null);
    const [bringingBackId, setBringingBackId] = useState<string | null>(null);
    const [confirmationState, setConfirmationState] = useState<{ match: Match; intent: 'archive' } | null>(null);
    const [completeConfirmationState, setCompleteConfirmationState] = useState<Match | null>(null);
    const [bringBackConfirmationState, setBringBackConfirmationState] = useState<Match | null>(null);
    const [matchToDelete, setMatchToDelete] = useState<Match | null>(null);

    const sportColorClasses: Record<Sport, { icon: string; filter: string }> = {
        [Sport.Basketball]: { icon: 'text-orange-500', filter: 'bg-orange-500 text-white' },
        [Sport.Soccer]: { icon: 'text-green-500', filter: 'bg-green-500 text-white' },
        [Sport.Volleyball]: { icon: 'text-sky-500', filter: 'bg-sky-500 text-white' },
    };

    const getFilterButtonClass = (filter: typeof dashboardFilters[number]) => {
        const baseClass = 'px-4 py-2 text-sm font-semibold rounded-full';
        const inactiveClass = 'bg-light-card-secondary hover:bg-light-border dark:bg-dark-card-secondary dark:hover:bg-dark-border';
        
        if (activeFilter !== filter) {
            return `${baseClass} ${inactiveClass}`;
        }

        if (filter === 'All') return `${baseClass} bg-brand-blue text-white`;
        if (filter === 'Finished') return `${baseClass} bg-gray-500 text-white`;
        return `${baseClass} ${sportColorClasses[filter as Sport].filter}`;
    };

    const handleArchiveClick = (matchId: string) => {
        setArchivingId(matchId);
        setTimeout(() => {
            onArchiveMatch(matchId);
            setArchivingId(null);
            setConfirmationState(null); // Close modal after action
        }, 500); // Match animation duration
    };
    
    const handleMarkCompleteClick = (matchId: string) => {
        setCompletingId(matchId);
        setTimeout(() => {
            onToggleCompleteMatch(matchId, true);
            setCompletingId(null);
        }, 500); // Match animation duration
    };

    const handleUnarchiveClick = (matchId: string) => {
        setUnarchivingId(matchId);
        setTimeout(() => {
            onUnarchiveMatch(matchId);
            setUnarchivingId(null);
        }, 500); // Match animation duration
    };
    
    const handleBringBackClick = (matchId: string) => {
        setBringingBackId(matchId);
        setTimeout(() => {
            onToggleCompleteMatch(matchId, false);
            setBringingBackId(null);
            setBringBackConfirmationState(null);
        }, 500);
    };
    
    const getButtonText = (status: MatchStatus) => {
        switch (status) {
            case 'In Progress': return 'Resume Match';
            case 'Upcoming': return 'Start Match';
            case 'Finished': return 'View Results';
        }
    };

    const filteredMatches = useMemo(() => {
        const active: Match[] = [];
        const archived: Match[] = [];
        const completed: Match[] = [];

        for (const match of matches) {
            if (match.isArchived) {
                archived.push(match);
            } else if (match.isCompleted) {
                completed.push(match);
            } else {
                active.push(match);
            }
        }
        
        let sourceMatches: Match[];
        switch(viewMode) {
            case 'archived':
                sourceMatches = archived;
                break;
            case 'completed':
                sourceMatches = completed;
                break;
            default:
                sourceMatches = active;
                break;
        }
        
        return sourceMatches.filter(match => {
            // Category Filter (only for 'active' view)
            if (viewMode === 'active') {
                let passesCategoryFilter = true;
                if (activeFilter === 'Finished') {
                    passesCategoryFilter = match.status === 'Finished';
                } else if (activeFilter !== 'All' && Object.values(Sport).includes(activeFilter as Sport)) {
                    passesCategoryFilter = match.sport === activeFilter;
                }

                if (!passesCategoryFilter) return false;
            }


            // Global Search Filter
            if (searchQuery) {
                const lowerQuery = searchQuery.toLowerCase();
                const passesSearch =
                    match.teamA.name.toLowerCase().includes(lowerQuery) ||
                    match.teamB.name.toLowerCase().includes(lowerQuery) ||
                    match.sport.toLowerCase().includes(lowerQuery);
                if (!passesSearch) return false;
            }

            return true;
        });

    }, [matches, activeFilter, viewMode, searchQuery]);

    const dashboardTitle = useMemo(() => {
        switch (viewMode) {
            case 'archived': return 'Archived Matches';
            case 'completed': return 'Completed Matches';
            default: return 'Dashboard';
        }
    }, [viewMode]);

    return (
        <div className="p-4 sm:p-6 md:p-8">
            {matchToDelete && (
                <DeleteConfirmationModal
                    itemName={`${matchToDelete.teamA.name} vs ${matchToDelete.teamB.name}`}
                    itemType="match"
                    onCancel={() => setMatchToDelete(null)}
                    onConfirm={() => {
                        onDeleteMatch(matchToDelete.id);
                        setMatchToDelete(null);
                    }}
                />
            )}
            {confirmationState && (
                <ConfirmationModal
                    title="Archive Match?"
                    description="This will move the match to your archive. You can view or restore it from the 'Archived' screen."
                    onCancel={() => setConfirmationState(null)}
                    onConfirm={() => handleArchiveClick(confirmationState.match.id)}
                    confirmText="Archive"
                    confirmClass="bg-brand-blue hover:bg-opacity-90"
                />
            )}
             {completeConfirmationState && (
                <ConfirmationModal
                    title="Mark Match as Complete?"
                    description="This will move the match to your 'Completed' section. You can always move it back to the dashboard later."
                    onCancel={() => setCompleteConfirmationState(null)}
                    onConfirm={() => {
                        if (completeConfirmationState) {
                            handleMarkCompleteClick(completeConfirmationState.id);
                        }
                        setCompleteConfirmationState(null);
                    }}
                    confirmText="Mark Complete"
                    confirmClass="bg-purple-600 hover:bg-opacity-90"
                />
            )}
            {bringBackConfirmationState && (
                <ConfirmationModal
                    title="Bring Match Back?"
                    description="This will move the match back to your main dashboard in the 'Finished' state."
                    onCancel={() => setBringBackConfirmationState(null)}
                    onConfirm={() => handleBringBackClick(bringBackConfirmationState.id)}
                    confirmText="Bring Back"
                    confirmClass="bg-green-600 hover:bg-opacity-90"
                />
            )}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
                <h1 className="text-4xl md:text-5xl font-bold font-display">
                    {dashboardTitle}
                </h1>
                <div className="flex items-center gap-4">
                     {viewMode !== 'active' ? (
                        <button
                            onClick={() => setViewMode('active')}
                            className="flex items-center gap-2 font-semibold py-3 px-5 rounded-lg text-base sm:text-lg bg-light-card-secondary hover:bg-light-border dark:bg-dark-card-secondary dark:hover:bg-dark-border"
                        >
                            &larr; Back to Dashboard
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => setViewMode('archived')}
                                className="hidden sm:flex items-center gap-2 font-semibold py-3 px-5 rounded-lg text-base sm:text-lg bg-light-card-secondary hover:bg-light-border dark:bg-dark-card-secondary dark:hover:bg-dark-border"
                            >
                                <ArchiveIcon />
                                View Archived
                            </button>
                             <button
                                onClick={() => setViewMode('completed')}
                                className="hidden sm:flex items-center gap-2 font-semibold py-3 px-5 rounded-lg text-base sm:text-lg bg-light-card-secondary hover:bg-light-border dark:bg-dark-card-secondary dark:hover:bg-dark-border"
                            >
                                <CheckIcon className="h-6 w-6" />
                                Completed
                            </button>
                            <button
                                onClick={onGoToHistory}
                                className="hidden sm:flex items-center gap-2 font-semibold py-3 px-5 rounded-lg text-base sm:text-lg bg-light-card-secondary hover:bg-light-border dark:bg-dark-card-secondary dark:hover:bg-dark-border"
                            >
                                <ListIcon />
                                History
                            </button>
                            <button
                                onClick={onCreateMatch}
                                className="flex items-center justify-center gap-2 bg-brand-blue hover:bg-opacity-90 text-white font-bold py-3 px-5 rounded-lg text-base sm:text-lg transition-transform duration-200 transform hover:scale-105 whitespace-nowrap"
                            >
                                <PlusIcon />
                                Create New Match
                            </button>
                        </>
                    )}
                </div>
            </div>

            {viewMode === 'active' && (
                 <div className="mb-6 flex flex-wrap items-center gap-2">
                    {dashboardFilters.map(filter => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={getFilterButtonClass(filter)}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            )}

            <main key={viewMode} className="animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMatches.map(match => {
                        const colorClass = sportColorClasses[match.sport].icon;
                        return (
                        <div
                            key={match.id}
                            className={`bg-light-card dark:bg-dark-card rounded-xl shadow-lg p-6 flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 ${
                                completingId === match.id ? 'animate-complete-fly-out' : ''
                            } ${
                                archivingId === match.id ? 'animate-archive-fly-out' : ''
                            } ${
                                unarchivingId === match.id ? 'animate-unarchive-fly-out' : ''
                            } ${
                                bringingBackId === match.id ? 'animate-unarchive-fly-out' : ''
                            } ${
                                viewMode !== 'active' ? 'grayscale opacity-75 hover:grayscale-0 hover:opacity-100' : ''
                            }`}
                        >
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <div className={`flex items-center gap-3 font-semibold text-lg ${colorClass}`}>
                                        <SportIcon sport={match.sport} />
                                        <span>{match.sport}</span>
                                    </div>
                                    <StatusBadge status={match.status} />
                                </div>
                                <div className="text-center my-6">
                                    <p className="text-2xl font-bold truncate" style={{ color: match.teamA.color }}>{match.teamA.name}</p>
                                    <p className="text-xl font-mono text-light-text-muted dark:text-dark-text-muted my-1">vs</p>
                                    <p className="text-2xl font-bold truncate" style={{ color: match.teamB.color }}>{match.teamB.name}</p>
                                </div>
                            </div>
                             <div className="mt-4 space-y-2">
                                {viewMode === 'completed' ? (
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => onManageMatch(match)}
                                            className="w-full flex items-center justify-center gap-2 bg-brand-blue hover:bg-opacity-90 text-white font-bold py-2.5 px-3 rounded-lg text-sm"
                                        >
                                            <ListIcon /> View Match
                                        </button>
                                        <div className="grid grid-cols-3 gap-2">
                                            <button 
                                                onClick={() => onGoToAudienceView(match)}
                                                className="bg-light-card-secondary hover:bg-light-border dark:bg-dark-card-secondary dark:hover:bg-dark-border font-semibold py-2 px-3 rounded-lg text-sm truncate">
                                                Audience
                                            </button>
                                            <button 
                                                onClick={() => setBringBackConfirmationState(match)}
                                                aria-label="Bring match back to dashboard"
                                                className="bg-green-600/20 hover:bg-green-600/30 text-green-400 font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1 text-sm">
                                                <UnarchiveIcon /> Bring Back?
                                            </button>
                                            <button 
                                                onClick={() => setMatchToDelete(match)}
                                                aria-label="Delete match"
                                                className="border border-brand-red/50 text-brand-red hover:bg-brand-red hover:text-white font-semibold py-2 px-3 rounded-lg flex items-center justify-center transition-colors"
                                            >
                                                <TrashIcon />
                                            </button>
                                        </div>
                                    </div>
                                ) : viewMode === 'archived' ? (
                                    <div className="grid grid-cols-2 gap-2">
                                        <button 
                                            onClick={() => handleUnarchiveClick(match.id)}
                                            className="flex items-center justify-center gap-2 bg-brand-blue hover:bg-opacity-90 text-white font-bold py-2.5 px-3 rounded-lg text-sm">
                                            <UnarchiveIcon /> Unarchive
                                        </button>
                                        <button 
                                            onClick={() => setMatchToDelete(match)}
                                            aria-label="Delete match"
                                            className="flex items-center justify-center gap-2 border border-brand-red/50 text-brand-red hover:bg-brand-red hover:text-white font-semibold py-2.5 px-3 rounded-lg transition-colors"
                                        >
                                            <TrashIcon /> Delete
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {match.status === 'Finished' ? (
                                            <div className="space-y-2">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button
                                                        onClick={() => onManageMatch(match)}
                                                        className="w-full flex items-center justify-center gap-2 bg-brand-blue hover:bg-opacity-90 text-white font-bold py-2.5 px-3 rounded-lg text-sm"
                                                    >
                                                        <CheckIcon /> View Results
                                                    </button>
                                                    <button 
                                                        onClick={() => setCompleteConfirmationState(match)}
                                                        className="w-full bg-purple-600/20 hover:bg-purple-600/30 text-purple-500 font-semibold py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 text-sm"
                                                    >
                                                        <CheckIcon /> Mark as Complete
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-3 gap-2">
                                                    <button 
                                                        onClick={() => onGoToAudienceView(match)}
                                                        className="bg-light-card-secondary hover:bg-light-border dark:bg-dark-card-secondary dark:hover:bg-dark-border font-semibold py-2 px-3 rounded-lg text-sm truncate">
                                                        Audience
                                                    </button>
                                                    <button 
                                                        onClick={() => setConfirmationState({ match, intent: 'archive' })}
                                                        aria-label="Archive match"
                                                        className="bg-light-card-secondary hover:bg-light-border dark:bg-dark-card-secondary dark:hover:bg-dark-border font-semibold py-2 px-3 rounded-lg flex items-center justify-center">
                                                        <ArchiveIcon />
                                                    </button>
                                                    <button 
                                                        onClick={() => setMatchToDelete(match)}
                                                        aria-label="Delete match"
                                                        className="border border-brand-red/50 text-brand-red hover:bg-brand-red hover:text-white font-semibold py-2 px-3 rounded-lg flex items-center justify-center transition-colors"
                                                    >
                                                        <TrashIcon />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <button 
                                                    onClick={() => onManageMatch(match)}
                                                    className={`w-full text-white font-bold py-2.5 px-3 rounded-lg text-sm ${
                                                        match.status === 'In Progress' ? 'bg-green-600 hover:bg-green-500' : 'bg-brand-blue hover:bg-opacity-90'
                                                    }`}>
                                                    {getButtonText(match.status)}
                                                </button>
                                                <div className="grid grid-cols-3 gap-2">
                                                    <button 
                                                        onClick={() => onGoToAudienceView(match)}
                                                        className="bg-light-card-secondary hover:bg-light-border dark:bg-dark-card-secondary dark:hover:bg-dark-border font-semibold py-2 px-3 rounded-lg text-sm truncate">
                                                        Audience
                                                    </button>
                                                    <button 
                                                        onClick={() => setConfirmationState({ match, intent: 'archive' })}
                                                        aria-label="Archive match"
                                                        className="bg-light-card-secondary hover:bg-light-border dark:bg-dark-card-secondary dark:hover:bg-dark-border font-semibold py-2 px-3 rounded-lg flex items-center justify-center">
                                                        <ArchiveIcon />
                                                    </button>
                                                    <button 
                                                        onClick={() => setMatchToDelete(match)}
                                                        aria-label="Delete match"
                                                        className="border border-brand-red/50 text-brand-red hover:bg-brand-red hover:text-white font-semibold py-2 px-3 rounded-lg flex items-center justify-center transition-colors"
                                                    >
                                                        <TrashIcon />
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    )})}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;