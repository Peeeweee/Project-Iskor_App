import React, { useState } from 'react';
import type { Settings, SportDefaultSettings } from '../../types';
import { Sport } from '../../types';
import ColorPicker from '../form/ColorPicker';

interface PreferencesSettingsProps {
    settings: Settings;
    updateSettings: (newSettings: Partial<Settings>) => void;
}

const Section: React.FC<{ title: string; children: React.ReactNode; }> = ({ title, children }) => (
    <div className="bg-light-card dark:bg-dark-card rounded-lg shadow-sm">
        <div className="p-6">
            <h2 className="text-xl font-bold mb-4">{title}</h2>
            {children}
        </div>
    </div>
);

const PreferencesSettings: React.FC<PreferencesSettingsProps> = ({ settings, updateSettings }) => {
    
    const [activeSportTab, setActiveSportTab] = useState<Sport>(Sport.Basketball);

    const handleSportDefaultChange = (sport: Sport, field: keyof SportDefaultSettings, value: string) => {
        const numericValue = parseInt(value) || 0;
        updateSettings({
            sportDefaults: {
                ...settings.sportDefaults,
                [sport]: {
                    ...settings.sportDefaults[sport],
                    [field]: numericValue,
                },
            },
        });
    };
    
    const labelClasses = 'block text-sm font-medium mb-2';
    const inputClasses = "w-full bg-light-card-secondary border-light-border dark:bg-dark-card-secondary dark:border-dark-border p-2 rounded-md border focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none";

    const sportTabButtonClasses = (s: Sport) => `px-4 py-2 text-sm font-semibold rounded-md flex-1 ${activeSportTab === s ? 'bg-light-card dark:bg-dark-card shadow-sm text-brand-blue' : 'text-light-text-muted dark:text-dark-text-muted hover:text-light-text dark:hover:text-dark-text'}`;

    const renderSportSettings = (sport: Sport) => {
        const defaults = settings.sportDefaults[sport];
        if (sport === Sport.Volleyball) {
            return (
                 <div className="space-y-4 animate-fade-in">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label htmlFor={`${sport}-periods`} className={labelClasses}>Default 'Best of Sets'</label>
                             <input
                                id={`${sport}-periods`}
                                type="number"
                                min="1"
                                step="2" // Best of is usually odd
                                value={defaults.periods}
                                onChange={e => handleSportDefaultChange(sport, 'periods', e.target.value)}
                                className={inputClasses}
                            />
                        </div>
                        <div>
                             <label htmlFor={`${sport}-targetScore`} className={labelClasses}>Default Points per Set</label>
                            <input
                                id={`${sport}-targetScore`}
                                type="number"
                                value={defaults.targetScore}
                                onChange={e => handleSportDefaultChange(sport, 'targetScore', e.target.value)}
                                className={inputClasses}
                            />
                        </div>
                     </div>
                     <p className="text-xs text-light-text-muted dark:text-dark-text-muted">These settings apply to both time-based and score-based volleyball matches.</p>
                 </div>
            );
        }
        
        // For Basketball and Soccer
        return (
            <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor={`${sport}-targetScore`} className={labelClasses}>Default Target Score</label>
                        <input
                            id={`${sport}-targetScore`}
                            type="number"
                            value={defaults.targetScore}
                            onChange={e => handleSportDefaultChange(sport, 'targetScore', e.target.value)}
                            className={inputClasses}
                        />
                         <p className="text-xs text-light-text-muted dark:text-dark-text-muted mt-1">For score-based games.</p>
                    </div>
                    <div>
                        <label htmlFor={`${sport}-periods`} className={labelClasses}>Default Periods</label>
                        <input
                            id={`${sport}-periods`}
                            type="number"
                            value={defaults.periods}
                            onChange={e => handleSportDefaultChange(sport, 'periods', e.target.value)}
                            className={inputClasses}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label htmlFor={`${sport}-durationMinutes`} className={labelClasses}>Default Minutes</label>
                        <input
                            id={`${sport}-durationMinutes`}
                            type="number"
                            value={defaults.durationMinutes}
                            onChange={e => handleSportDefaultChange(sport, 'durationMinutes', e.target.value)}
                            className={inputClasses}
                        />
                    </div>
                    <div>
                        <label htmlFor={`${sport}-durationSeconds`} className={labelClasses}>Default Seconds</label>
                        <input
                            id={`${sport}-durationSeconds`}
                            type="number"
                            max="59"
                            value={defaults.durationSeconds}
                            onChange={e => handleSportDefaultChange(sport, 'durationSeconds', e.target.value)}
                            className={inputClasses}
                        />
                    </div>
                </div>
                <p className="text-xs text-light-text-muted dark:text-dark-text-muted">Duration settings apply to time-based games.</p>
            </div>
        );
    };

    return (
        <div className="space-y-8 max-w-3xl">
            <Section title="Game Rule Defaults">
                 <div className="mb-6 flex flex-wrap items-center gap-2 p-1.5 bg-light-card-secondary dark:bg-dark-card-secondary rounded-lg">
                    {Object.values(Sport).map(sport => (
                        <button key={sport} onClick={() => setActiveSportTab(sport)} className={sportTabButtonClasses(sport)}>
                            {sport}
                        </button>
                    ))}
                </div>
                {renderSportSettings(activeSportTab)}
            </Section>

            <Section title="Match Creation Defaults">
                <div className="space-y-6">
                    <div>
                        <label htmlFor="defaultSport" className={labelClasses}>Default Sport on Setup Screen</label>
                        <select
                            id="defaultSport"
                            value={settings.defaultSport}
                            onChange={e => updateSettings({ defaultSport: e.target.value as Sport })}
                            className={inputClasses}
                        >
                            {Object.values(Sport).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className={labelClasses}>Default Team A Color</label>
                            <ColorPicker
                                selectedColor={settings.defaultTeamAColor}
                                onSelect={color => updateSettings({ defaultTeamAColor: color })}
                            />
                        </div>
                         <div>
                            <label className={labelClasses}>Default Team B Color</label>
                            <ColorPicker
                                selectedColor={settings.defaultTeamBColor}
                                onSelect={color => updateSettings({ defaultTeamBColor: color })}
                            />
                        </div>
                    </div>
                </div>
            </Section>
        </div>
    );
};

export default PreferencesSettings;