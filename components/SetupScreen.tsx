import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { MatchConfig, SavedTeam, Settings } from '../types';
import { Sport } from '../types';
import { TEAM_COLORS } from '../constants';
import TeamSelector from './TeamSelector';
import CreateEditTeamModal from './CreateEditTeamModal';

interface SetupScreenProps {
  onStartMatch: (config: MatchConfig) => void;
  onBack: () => void;
  savedTeams: SavedTeam[];
  onSaveTeam: (team: Omit<SavedTeam, 'id'> & { id?: string }) => SavedTeam | void;
  settings: Settings;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onStartMatch, onBack, savedTeams, onSaveTeam, settings }) => {
    const [sport, setSport] = useState<Sport>(settings.defaultSport);
    
    const [teamA, setTeamA] = useState<SavedTeam | {name: string, color: string}>({ name: 'HOME', color: settings.defaultTeamAColor });
    const [teamB, setTeamB] = useState<SavedTeam | {name: string, color: string}>({ name: 'AWAY', color: settings.defaultTeamBColor });
    
    const [durationMinutes, setDurationMinutes] = useState(0);
    const [durationSeconds, setDurationSeconds] = useState(0);
    const [periods, setPeriods] = useState(0);
    const [gameMode, setGameMode] = useState<'time' | 'score'>('time');
    const [targetScore, setTargetScore] = useState(0);

    const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
    const [creatingFor, setCreatingFor] = useState<'A' | 'B' | null>(null);
    
    useEffect(() => {
        const defaults = settings.sportDefaults[sport];
        setDurationMinutes(defaults.durationMinutes);
        setDurationSeconds(defaults.durationSeconds);
        setPeriods(defaults.periods);
        setTargetScore(defaults.targetScore);
    }, [sport, settings.sportDefaults]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onStartMatch({
            sport,
            teamA: { name: teamA.name, color: teamA.color },
            teamB: { name: teamB.name, color: teamB.color },
            durationMinutes,
            durationSeconds,
            periods,
            gameMode,
            targetScore: gameMode === 'score' ? targetScore : undefined,
        });
    };

    const handleOpenCreateModal = (teamIdentifier: 'A' | 'B') => {
        setCreatingFor(teamIdentifier);
        setIsCreateTeamModalOpen(true);
    };

    const handleSaveFromModal = (team: Omit<SavedTeam, 'id'> & { id?: string }) => {
        const newTeam = onSaveTeam(team);
        setIsCreateTeamModalOpen(false);

        if (newTeam && creatingFor) {
            if (creatingFor === 'A') {
                setTeamA(newTeam);
            } else {
                setTeamB(newTeam);
            }
            setCreatingFor(null);
        }
    };
    
    const inputClasses = "w-full bg-light-card-secondary border-light-border dark:bg-dark-card-secondary dark:border-dark-border p-2 rounded-md border focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none";
    const sportButtonClasses = (s: Sport) => `p-4 rounded-lg text-center font-bold ${sport === s ? 'bg-brand-blue text-white ring-2 ring-brand-blue' : 'bg-light-card-secondary hover:bg-light-border dark:bg-dark-card-secondary dark:hover:bg-dark-border'}`;
    const segmentedButtonClasses = (isActive: boolean) => 
      `w-full px-4 py-2 text-sm font-semibold rounded-md focus:outline-none ${
        isActive ? 'bg-brand-blue text-white' : 'bg-light-card-secondary hover:bg-light-border dark:bg-dark-card-secondary dark:hover:bg-dark-border'
      }`;

    return (
        <div className="p-4 md:p-6 w-full">
            {isCreateTeamModalOpen && (
                <CreateEditTeamModal
                    onClose={() => setIsCreateTeamModalOpen(false)}
                    onSave={handleSaveFromModal}
                />
            )}
            <div className="w-full max-w-4xl mx-auto relative">
                <button onClick={onBack} className="absolute top-0 -left-2 md:-left-4 text-light-text-muted hover:text-light-text dark:text-dark-text-muted dark:hover:text-dark-text flex items-center gap-2 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Back to Dashboard
                </button>
                <h1 className="text-4xl md:text-5xl font-bold text-center mb-2 font-display pt-12">Project: Iskor-App</h1>
                <p className="text-center text-light-text-muted dark:text-dark-text-muted mb-8">Create a new match</p>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Sport Selection */}
                    <div>
                        <label className="block text-lg font-semibold mb-3">Sport</label>
                        <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-light-card dark:bg-dark-card shadow-sm">
                            {Object.values(Sport).map(s => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => setSport(s)}
                                    className={sportButtonClasses(s)}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Team Configuration */}
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Team A */}
                        <div className="space-y-4 bg-light-card dark:bg-dark-card p-6 rounded-lg shadow-sm">
                             <h2 className="text-2xl font-bold text-center">Team A</h2>
                             <TeamSelector
                                label="Select Team A"
                                teams={savedTeams.filter(t => 'id' in teamB ? t.id !== teamB.id : true)}
                                selectedTeam={teamA}
                                onSelectTeam={setTeamA}
                                defaultColor={settings.defaultTeamAColor}
                                onCreateNewTeamRequest={() => handleOpenCreateModal('A')}
                                matchSport={sport}
                             />
                        </div>

                        {/* Team B */}
                         <div className="space-y-4 bg-light-card dark:bg-dark-card p-6 rounded-lg shadow-sm">
                             <h2 className="text-2xl font-bold text-center">Team B</h2>
                             <TeamSelector
                                label="Select Team B"
                                teams={savedTeams.filter(t => 'id' in teamA ? t.id !== teamA.id : true)}
                                selectedTeam={teamB}
                                onSelectTeam={setTeamB}
                                defaultColor={settings.defaultTeamBColor}
                                onCreateNewTeamRequest={() => handleOpenCreateModal('B')}
                                matchSport={sport}
                             />
                        </div>
                    </div>
                    
                     {/* Game Settings */}
                    <div className="bg-light-card dark:bg-dark-card p-6 rounded-lg shadow-sm">
                        <h2 className="text-2xl font-bold text-center mb-6">Game Settings</h2>
                        
                        <div className="max-w-md mx-auto mb-6">
                           <label className="block text-sm font-medium mb-2 text-center">Game Mode</label>
                           <div className="p-1 rounded-lg flex space-x-1 bg-light-card-secondary dark:bg-dark-card-secondary">
                                <button type="button" onClick={() => setGameMode('time')} className={segmentedButtonClasses(gameMode === 'time')}>Time Based</button>
                                <button type="button" onClick={() => setGameMode('score')} className={segmentedButtonClasses(gameMode === 'score')}>Score Based</button>
                            </div>
                        </div>

                        {gameMode === 'time' ? (
                            <div className={`grid grid-cols-1 ${sport === Sport.Volleyball ? 'md:grid-cols-1' : 'md:grid-cols-3'} gap-4`}>
                                <div className={sport === Sport.Volleyball ? 'w-1/2 mx-auto' : ''}>
                                    <label htmlFor="periods" className="block text-sm font-medium mb-1">{sport === Sport.Volleyball ? 'Best of Sets' : 'Periods'}</label>
                                    <input id="periods" type="number" min="1" value={periods} onChange={e => setPeriods(parseInt(e.target.value))} className={inputClasses} />
                                </div>
                                {sport !== Sport.Volleyball && (
                                    <>
                                        <div>
                                            <label htmlFor="durationMinutes" className="block text-sm font-medium mb-1">Minutes</label>
                                            <input id="durationMinutes" type="number" min="0" value={durationMinutes} onChange={e => setDurationMinutes(parseInt(e.target.value))} className={inputClasses} />
                                        </div>
                                         <div>
                                            <label htmlFor="durationSeconds" className="block text-sm font-medium mb-1">Seconds</label>
                                            <input id="durationSeconds" type="number" min="0" max="59" value={durationSeconds} onChange={e => setDurationSeconds(parseInt(e.target.value))} className={inputClasses} />
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                             <div className="w-1/2 mx-auto">
                                <label htmlFor="targetScore" className="block text-sm font-medium mb-1">Target Score</label>
                                <input id="targetScore" type="number" min="1" value={targetScore} onChange={e => setTargetScore(parseInt(e.target.value))} className={inputClasses} />
                            </div>
                        )}
                    </div>


                    {/* Start Button */}
                    <button type="submit" className="w-full bg-brand-blue hover:bg-opacity-90 text-white font-bold py-4 px-4 rounded-lg text-xl transition-transform duration-200 transform hover:scale-105">
                        Start Match
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SetupScreen;