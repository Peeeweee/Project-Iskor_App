import React, { useRef } from 'react';
import DownloadIcon from '../icons/DownloadIcon';
import UploadIcon from '../icons/UploadIcon';
import TrashIcon from '../icons/TrashIcon';
import DocumentTextIcon from '../icons/DocumentTextIcon';

interface DataSettingsProps {
    onExport: () => void;
    onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onClear: () => void;
    onExportPdf: () => void;
    isExportingPdf: boolean;
}

const Section: React.FC<{ title: string; children: React.ReactNode; }> = ({ title, children }) => (
    <div className="bg-light-card dark:bg-dark-card rounded-lg shadow-sm">
        <div className="p-6">
            <h2 className="text-xl font-bold mb-4">{title}</h2>
            {children}
        </div>
    </div>
);

const DataSettings: React.FC<DataSettingsProps> = ({ onExport, onImport, onClear, onExportPdf, isExportingPdf }) => {
    const importInputRef = useRef<HTMLInputElement>(null);

    const handleImportClick = () => {
        importInputRef.current?.click();
    };

    return (
        <div className="space-y-8 max-w-2xl">
            <Section title="Backup & Restore">
                <div className="space-y-4">
                    <p className="text-light-text-muted dark:text-dark-text-muted text-sm">
                        Export all your matches, teams, and settings into a single file for backup or migration. Choose your preferred format.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={onExport}
                            className="flex items-center justify-center gap-2 bg-brand-blue hover:bg-opacity-90 text-white font-bold py-2 px-4 rounded-lg"
                        >
                            <DownloadIcon />
                            Export as JSON
                        </button>
                        <button
                            onClick={onExportPdf}
                            disabled={isExportingPdf}
                            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 disabled:bg-green-400 disabled:cursor-wait text-white font-bold py-2 px-4 rounded-lg"
                        >
                            <DocumentTextIcon />
                            {isExportingPdf ? 'Generating PDF...' : 'Export as PDF'}
                        </button>
                    </div>
                </div>
                 <div className="mt-8 space-y-4">
                    <p className="text-light-text-muted dark:text-dark-text-muted text-sm">
                        Import data from a previously exported backup file (.json). This will overwrite your current data.
                    </p>
                    <button
                        onClick={handleImportClick}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 bg-light-card-secondary hover:bg-light-border dark:bg-dark-card-secondary dark:hover:bg-dark-border font-bold py-2 px-4 rounded-lg"
                    >
                        <UploadIcon />
                        Import Data
                    </button>
                    <input
                        type="file"
                        ref={importInputRef}
                        onChange={onImport}
                        className="hidden"
                        accept=".json"
                    />
                </div>
            </Section>

            <div className="bg-light-card dark:bg-dark-card rounded-lg shadow-sm border border-brand-red/50">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-brand-red">Danger Zone</h2>
                    <p className="text-light-text-muted dark:text-dark-text-muted text-sm mt-2 mb-4">
                        This action is irreversible. All your match history, saved teams, and settings will be permanently deleted.
                    </p>
                    <button
                        onClick={onClear}
                        className="flex items-center gap-2 bg-brand-red/20 hover:bg-brand-red/30 text-brand-red font-bold py-2 px-4 rounded-lg"
                    >
                        <TrashIcon />
                        Clear All Data
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DataSettings;