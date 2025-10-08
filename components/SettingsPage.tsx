import React, { useState } from 'react';
import type { Settings } from '../types';
import GeneralSettings from './settings/GeneralSettings';
import ThemeSettings from './settings/ThemeSettings';
import PreferencesSettings from './settings/PreferencesSettings';
import DataSettings from './settings/DataSettings';
import SettingsIcon from './icons/SettingsIcon';
import PaletteIcon from './icons/PaletteIcon';
import ClipboardListIcon from './icons/ClipboardListIcon';
import DatabaseIcon from './icons/DatabaseIcon';

interface SettingsPageProps {
    settings: Settings;
    updateSettings: (newSettings: Partial<Settings>) => void;
    onExportData: () => void;
    onImportData: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onClearData: () => void;
    onExportPdf: () => void;
    isExportingPdf: boolean;
}

type SettingsTab = 'general' | 'defaults' | 'layout' | 'data';

const settingsTabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'general', label: 'General', icon: <SettingsIcon className="h-5 w-5" /> },
    { id: 'defaults', label: 'Match Defaults', icon: <ClipboardListIcon /> },
    { id: 'layout', label: 'Layout & Style', icon: <PaletteIcon /> },
    { id: 'data', label: 'Data Management', icon: <DatabaseIcon /> },
];

const SettingsPage: React.FC<SettingsPageProps> = (props) => {
    const [activeTab, setActiveTab] = useState<SettingsTab>('general');

    const renderContent = () => {
        switch (activeTab) {
            case 'general':
                return <GeneralSettings settings={props.settings} updateSettings={props.updateSettings} />;
            case 'defaults':
                return <PreferencesSettings settings={props.settings} updateSettings={props.updateSettings} />;
            case 'layout':
                return <ThemeSettings settings={props.settings} updateSettings={props.updateSettings} />;
            case 'data':
                return <DataSettings onExport={props.onExportData} onImport={props.onImportData} onClear={props.onClearData} onExportPdf={props.onExportPdf} isExportingPdf={props.isExportingPdf} />;
            default:
                return null;
        }
    };

    return (
        <div className="p-4 sm:p-6 md:p-8">
            <h1 className="text-4xl md:text-5xl font-bold font-display mb-8">Settings</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
                {/* Sidebar */}
                <aside className="md:sticky md:top-24 h-full">
                    <nav className="flex flex-row md:flex-col gap-2">
                        {settingsTabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 w-full p-3 text-left font-semibold rounded-lg transition-colors duration-200 ${
                                    activeTab === tab.id
                                        ? 'bg-brand-blue/10 text-brand-blue'
                                        : 'text-light-text-muted hover:bg-light-card-secondary dark:text-dark-text-muted dark:hover:bg-dark-card-secondary'
                                }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </aside>
                
                {/* Content */}
                <div className="min-w-0">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;