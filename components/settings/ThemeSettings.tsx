import React from 'react';
import { Sport, type Settings, Font, Layout } from '../../types';
import AudienceView from '../AudienceView';
import ColorPicker from '../form/ColorPicker';

interface ThemeSettingsProps {
    settings: Settings;
    updateSettings: (newSettings: Partial<Settings>) => void;
}

const mockConfig = {
    sport: Sport.Soccer,
    teamA: { name: 'REAL MADRID', color: '#FEBE10' },
    teamB: { name: 'BARCELONA', color: '#A50044' },
    durationMinutes: 45,
    durationSeconds: 0,
    periods: 2,
};

const ThemeSettings: React.FC<ThemeSettingsProps> = ({ settings, updateSettings }) => {
    
    const labelClasses = 'block text-sm font-medium mb-2';
    const inputClasses = "w-full bg-light-card-secondary border-light-border dark:bg-dark-card-secondary dark:border-dark-border p-2 rounded-md border focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none";

    const segmentedButtonClasses = (isActive: boolean) => 
      `w-full px-4 py-2 text-sm font-semibold rounded-md focus:outline-none ${
        isActive ? 'bg-brand-blue text-white' : 'bg-light-card-secondary hover:bg-light-border dark:bg-dark-card-secondary dark:hover:bg-dark-border'
      }`;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Controls */}
            <div className="lg:col-span-1 space-y-6">
                 <div className="bg-light-card dark:bg-dark-card p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-bold mb-4">Audience View Customization</h3>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="font" className={labelClasses}>Font Style</label>
                            <select id="font" value={settings.font} onChange={e => updateSettings({ font: e.target.value as Font })} className={inputClasses}>
                                <option value={Font.Display}>Display (Teko)</option>
                                <option value={Font.Mono}>Mono (Roboto Mono)</option>
                                <option value={Font.Sans}>Sans (Inter)</option>
                            </select>
                        </div>
                        <div>
                            <label className={labelClasses}>Layout Style</label>
                             <div className="p-1 rounded-lg flex space-x-1 bg-light-card-secondary dark:bg-dark-card-secondary">
                                <button onClick={() => updateSettings({ layout: Layout.Wide })} className={segmentedButtonClasses(settings.layout === Layout.Wide)}>Wide</button>
                                <button onClick={() => updateSettings({ layout: Layout.Compact })} className={segmentedButtonClasses(settings.layout === Layout.Compact)}>Compact</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview */}
            <div className="lg:col-span-2">
                 <div className="sticky top-24">
                    <p className="text-center font-semibold mb-2 text-light-text-muted dark:text-dark-text-muted">Live Preview</p>
                    <div className="aspect-[16/9] w-full rounded-lg overflow-hidden shadow-lg bg-light-card-secondary dark:bg-dark-card-secondary">
                        <AudienceView
                            config={mockConfig}
                            matchId="preview"
                            onExit={() => {}}
                            theme={settings.theme}
                            font={settings.font}
                            layout={settings.layout}
                            isPreview={true}
                         />
                    </div>
                 </div>
            </div>
        </div>
    );
};

export default ThemeSettings;