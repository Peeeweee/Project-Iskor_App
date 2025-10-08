import React, { useState, useMemo } from 'react';
import type { SavedTeam } from '../types';
import { Sport } from '../types';
import PlusIcon from './icons/PlusIcon';
import CreateEditTeamModal from './CreateEditTeamModal';
import UsersIcon from './icons/UsersIcon';
import EditIcon from './icons/EditIcon';
import TrashIcon from './icons/TrashIcon';
import SportIcon from './SportIcon';
import SearchIcon from './icons/SearchIcon';
import DeleteConfirmationModal from './DeleteConfirmationModal';

interface TeamsPageProps {
    savedTeams: SavedTeam[];
    onSaveTeam: (team: Omit<SavedTeam, 'id'> & { id?: string }) => void;
    onDeleteTeam: (teamId: string) => void;
    searchQuery: string;
}

const TeamCard: React.FC<{ team: SavedTeam, onEdit: () => void, onDelete: () => void, index: number, isDeleting: boolean }> = ({ team, onEdit, onDelete, index, isDeleting }) => {
    return (
        <div
            className={`
                group relative bg-light-card dark:bg-dark-card rounded-xl shadow-lg
                overflow-hidden transition-all duration-300 ease-in-out
                hover:shadow-2xl hover:-translate-y-2
                min-h-[120px]
                ${isDeleting ? 'animate-shrink-and-fade' : 'animate-slide-in-bottom'}
            `}
            style={{ 
                '--team-color': team.color, 
                '--team-glow-color': `${team.color}55`,
                animationDelay: `${index * 75}ms`,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            } as React.CSSProperties}
        >
            <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                style={{ 
                    background: `radial-gradient(circle at 90% 10%, var(--team-glow-color), transparent 60%)`,
                    boxShadow: `0 8px 30px -5px var(--team-glow-color)`
                }}>
            </div>

            <div className="absolute top-0 left-0 h-full w-2.5" style={{ backgroundColor: 'var(--team-color)' }}></div>
            
            <div className="relative p-6 flex items-center justify-between h-full">
                <div className="pl-4">
                    <div className="flex items-center gap-3">
                        <h3 className="text-4xl font-bold font-display uppercase tracking-wider truncate" style={{ color: 'var(--team-color)' }}>
                            {team.name}
                        </h3>
                        {team.sport && team.sport !== 'Universal' && (
                            <SportIcon sport={team.sport as Sport} className="h-7 w-7 opacity-70" />
                        )}
                    </div>
                    <p className="text-sm font-mono text-light-text-muted dark:text-dark-text-muted">{team.sport || 'Universal'}</p>
                </div>
                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0 translate-x-4">
                    <button 
                        onClick={onEdit} 
                        className="p-3 bg-light-card-secondary/50 dark:bg-dark-card/50 hover:bg-light-border dark:hover:bg-dark-border rounded-lg text-light-text-muted dark:text-dark-text-muted hover:text-light-text dark:hover:text-dark-text"
                        title="Edit Team"
                    >
                        <EditIcon className="h-6 w-6"/>
                    </button>
                    <button 
                        onClick={onDelete} 
                        className="p-3 border border-brand-red/50 text-brand-red hover:bg-brand-red hover:text-white rounded-lg transition-colors"
                        title="Delete Team"
                    >
                        <TrashIcon />
                    </button>
                </div>
            </div>
        </div>
    );
};

const TeamsPage: React.FC<TeamsPageProps> = ({ savedTeams, onSaveTeam, onDeleteTeam, searchQuery }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [teamToEdit, setTeamToEdit] = useState<SavedTeam | null>(null);
    const [teamToDelete, setTeamToDelete] = useState<SavedTeam | null>(null);
    const [deletingTeamId, setDeletingTeamId] = useState<string | null>(null);

    const handleOpenCreateModal = () => {
        setTeamToEdit(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (team: SavedTeam) => {
        setTeamToEdit(team);
        setIsModalOpen(true);
    };

    const handleSave = (team: Omit<SavedTeam, 'id'> & { id?: string }) => {
        onSaveTeam(team);
        setIsModalOpen(false);
    };
    
    const handleConfirmDelete = () => {
        if (!teamToDelete) return;
        setDeletingTeamId(teamToDelete.id);
        setTeamToDelete(null); // Close modal

        setTimeout(() => {
            onDeleteTeam(teamToDelete.id);
            setDeletingTeamId(null);
        }, 500); // Animation duration
    };

    const filteredTeams = useMemo(() => {
        if (!searchQuery) {
            return savedTeams;
        }
        return savedTeams.filter(team =>
            team.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [savedTeams, searchQuery]);

    return (
        <div className="p-4 sm:p-6 md:p-8">
            {isModalOpen && (
                <CreateEditTeamModal
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    initialData={teamToEdit}
                />
            )}
            {teamToDelete && (
                <DeleteConfirmationModal
                    itemName={teamToDelete.name}
                    itemType="team"
                    onCancel={() => setTeamToDelete(null)}
                    onConfirm={handleConfirmDelete}
                />
            )}


            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
                <h1 className="text-4xl md:text-5xl font-bold font-display">Manage Teams</h1>
                <button
                    onClick={handleOpenCreateModal}
                    className="flex items-center justify-center gap-2 bg-brand-blue hover:bg-opacity-90 text-white font-bold py-3 px-5 rounded-lg text-lg transition-transform duration-200 transform hover:scale-105"
                >
                    <PlusIcon />
                    Create New Team
                </button>
            </div>
            
            {savedTeams.length > 0 ? (
                filteredTeams.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {filteredTeams.map((team, index) => (
                            <TeamCard 
                                key={team.id} 
                                team={team}
                                onEdit={() => handleOpenEditModal(team)}
                                onDelete={() => setTeamToDelete(team)}
                                index={index}
                                isDeleting={deletingTeamId === team.id}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center bg-light-card dark:bg-dark-card p-12 rounded-xl techy-bg border-2 border-dashed border-light-border dark:border-dark-border mt-8">
                         <h2 className="text-2xl font-bold">No Teams Found</h2>
                         <p className="text-light-text-muted dark:text-dark-text-muted mt-2">
                            No teams match your search for "{searchQuery}".
                         </p>
                    </div>
                )
            ) : (
                <div className="text-center bg-light-card dark:bg-dark-card p-12 rounded-xl techy-bg border-2 border-dashed border-light-border dark:border-dark-border mt-8">
                    <UsersIcon className="h-24 w-24 mx-auto text-brand-blue/50 mb-6" />
                    <h2 className="text-4xl font-bold font-display">Your Roster is Empty</h2>
                    <p className="text-light-text-muted dark:text-dark-text-muted mt-4 mb-8 max-w-md mx-auto">
                        Create your first team to start building your league. Saved teams make creating new matches faster and more consistent.
                    </p>
                     <button
                        onClick={handleOpenCreateModal}
                        className="flex items-center justify-center gap-2 bg-brand-blue hover:bg-opacity-90 text-white font-bold py-3 px-6 rounded-lg text-lg transition-transform duration-200 transform hover:scale-105 mx-auto"
                    >
                        <PlusIcon />
                        Create Your First Team
                    </button>
                </div>
            )}
        </div>
    );
};

export default TeamsPage;