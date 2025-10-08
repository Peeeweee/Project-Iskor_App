import React from 'react';
import type { Settings, Theme } from '../../types';

interface GeneralSettingsProps {
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

const GeneralSettings: React.FC<GeneralSettingsProps> = ({ settings, updateSettings }) => {
    
    const themes: { id: Theme, name: string }[] = [
        { id: 'light', name: 'Light' },
        { id: 'dark', name: 'Dark' },
        { id: 'coder', name: 'Coder' },
        { id: 'viola', name: 'Viola' },
    ];
    
    const segmentedButtonClasses = (isActive: boolean) => 
      `w-full px-4 py-3 text-sm font-semibold rounded-md focus:outline-none ${
        isActive ? 'bg-brand-blue text-white ring-2 ring-offset-2 ring-offset-light-card dark:ring-offset-dark-card ring-brand-blue' : 'bg-light-card-secondary hover:bg-light-border dark:bg-dark-card-secondary dark:hover:bg-dark-border'
      }`;
    
    return (
        <div className="space-y-8 max-w-2xl">
            <Section title="Appearance">
                 <div>
                    <label className="block text-sm font-medium mb-2">Theme</label>
                    <div className="grid grid-cols-2 gap-3">
                        {themes.map(theme => (
                            <button key={theme.id} onClick={() => updateSettings({ theme: theme.id })} className={segmentedButtonClasses(settings.theme === theme.id)}>
                                {theme.name}
                            </button>
                        ))}
                    </div>
                </div>
            </Section>
        </div>
    );
};

export default GeneralSettings;