import React, { useState, useEffect, useMemo } from 'react';
import type { SavedTeam } from '../types';
import { Sport } from '../types';
import ColorPicker from './form/ColorPicker';
import PlusIcon from './icons/PlusIcon';

interface TeamSelectorProps {
    label: string;
    teams: SavedTeam[];
    selectedTeam: SavedTeam | { name: string, color: string };
    onSelectTeam: (team: SavedTeam | { name: string, color: string }) => void;
    defaultColor: string;
    onCreateNewTeamRequest: () => void;
    matchSport: Sport;
}

const TeamSelector: React.FC<TeamSelectorProps> = ({ label, teams, selectedTeam, onSelectTeam, defaultColor, onCreateNewTeamRequest, matchSport }) => {
    const isCustom = !('id' in selectedTeam);

    const filteredTeams = useMemo(() => {
        return teams.filter(team => !team.sport || team.sport === 'Universal' || team.sport === matchSport);
    }, [teams, matchSport]);

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === 'custom') {
            onSelectTeam({ name: '', color: selectedTeam.color || defaultColor });
        } else {
            const team = teams.find(t => t.id === value);
            if (team) {
                onSelectTeam(team);
            }
        }
    };
    
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSelectTeam({ ...selectedTeam, name: e.target.value });
    };

    const handleColorChange = (color: string) => {
        onSelectTeam({ ...selectedTeam, color: color });
    };

    const inputClasses = "w-full bg-light-card-secondary border-light-border dark:bg-dark-card-secondary dark:border-dark-border p-2 rounded-md border focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none";

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-1">{label}</label>
                <select 
                    value={'id' in selectedTeam ? selectedTeam.id : 'custom'} 
                    onChange={handleSelectChange} 
                    className={inputClasses}
                >
                    <option value="custom">-- Custom Team --</option>
                    {filteredTeams.map(team => (
                        <option key={team.id} value={team.id}>
                            {team.name}
                        </option>
                    ))}
                </select>
            </div>

            <button
                type="button"
                onClick={onCreateNewTeamRequest}
                className="w-full text-sm font-semibold py-2 px-4 rounded-md bg-light-card-secondary hover:bg-light-border dark:bg-dark-card-secondary dark:hover:bg-dark-border flex items-center justify-center gap-2 text-brand-blue"
            >
                <PlusIcon className="h-5 w-5" />
                Make your Team and save it
            </button>
            
            {isCustom && (
                <>
                    <div>
                        <label htmlFor="customTeamName" className="block text-sm font-medium mb-1">Custom Name</label>
                        <input
                            id="customTeamName"
                            type="text"
                            value={selectedTeam.name}
                            onChange={handleNameChange}
                            className={inputClasses}
                            required
                            placeholder="Enter team name"
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium mb-2">Color</label>
                        <ColorPicker selectedColor={selectedTeam.color} onSelect={handleColorChange} />
                    </div>
                </>
            )}

            {!isCustom && (
                 <div className="flex items-center gap-4 p-3 rounded-lg bg-light-card-secondary dark:bg-dark-card-secondary">
                    <div className="w-8 h-8 rounded-full" style={{backgroundColor: selectedTeam.color}}></div>
                    <span className="font-bold text-lg">{selectedTeam.name}</span>
                </div>
            )}
        </div>
    );
};

export default TeamSelector;