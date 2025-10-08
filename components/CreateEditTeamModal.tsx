import React, { useState, useEffect } from 'react';
import type { SavedTeam } from '../types';
import { Sport } from '../types';
import ColorPicker from './form/ColorPicker';
import { TEAM_COLORS } from '../constants';

interface CreateEditTeamModalProps {
    onClose: () => void;
    onSave: (team: Omit<SavedTeam, 'id'> & { id?: string }) => void;
    initialData?: SavedTeam | null;
}

const CreateEditTeamModal: React.FC<CreateEditTeamModalProps> = ({ onClose, onSave, initialData }) => {
    const [name, setName] = useState('');
    const [color, setColor] = useState(TEAM_COLORS[0]);
    const [sport, setSport] = useState<Sport | 'Universal'>('Universal');

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setColor(initialData.color);
            setSport(initialData.sport || 'Universal');
        }
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ id: initialData?.id, name, color, sport });
    };

    const inputClasses = "w-full bg-light-card-secondary border-light-border dark:bg-dark-card-secondary dark:border-dark-border p-2 rounded-md border focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none";
    const sportButtonClasses = (s: string) => `p-3 rounded-md text-sm font-semibold text-center ${sport === s ? 'bg-brand-blue text-white ring-2 ring-brand-blue' : 'bg-light-card-secondary hover:bg-light-border dark:bg-dark-card-secondary dark:hover:bg-dark-border'}`;

    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in" 
            onClick={onClose}
        >
            <div 
                className="bg-light-background dark:bg-dark-card rounded-2xl w-full max-w-md p-6 md:p-8 shadow-2xl relative animate-modal-scale-in" 
                onClick={e => e.stopPropagation()}
            >
                <form onSubmit={handleSubmit}>
                    <h2 className="text-3xl font-bold font-display text-center mb-6">
                        {initialData ? 'Edit Team' : 'Create New Team'}
                    </h2>
                    
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="teamName" className="block text-sm font-medium mb-1">Team Name</label>
                            <input
                                id="teamName"
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className={inputClasses}
                                required
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Team Color</label>
                            <ColorPicker selectedColor={color} onSelect={setColor} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Team Sport Association</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['Universal', ...Object.values(Sport)].map(s => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setSport(s as Sport | 'Universal')}
                                        className={sportButtonClasses(s)}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-8">
                        <button
                            type="button"
                            onClick={onClose}
                            className="font-bold py-2 px-6 rounded-lg bg-light-card-secondary hover:bg-light-border dark:bg-dark-card-secondary dark:hover:bg-dark-border"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-brand-blue hover:bg-opacity-90 text-white font-bold py-2 px-6 rounded-lg"
                        >
                            {initialData ? 'Save Changes' : 'Create Team'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateEditTeamModal;