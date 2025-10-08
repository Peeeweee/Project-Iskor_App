import React, { useState, useEffect } from 'react';
import type { GameState, MatchConfig, PauseReason } from '../types';
import { Sport, GameStatus } from '../types';
import PlayIcon from './icons/PlayIcon';
import PauseIcon from './icons/PauseIcon';
import ResetIcon from './icons/ResetIcon';
import FullScreenIcon from './icons/FullScreenIcon';
import MinusIcon from './icons/MinusIcon';
import CheckIcon from './icons/CheckIcon';
import DashboardIcon from './icons/DashboardIcon';
import SettingsIcon from './icons/SettingsIcon';
import PictureInPictureIcon from './icons/PictureInPictureIcon';
import LayoutCenterIcon from './icons/LayoutCenterIcon';
import LayoutSplitIcon from './icons/LayoutSplitIcon';
import UndoIcon from './icons/UndoIcon';
import RedoIcon from './icons/RedoIcon';
import MatchActions from './MatchActions';

interface ControlPanelProps {
    actions: {
        start: () => void;
        pause: () => void;
        reset: () => void;
        updateScore: (team: 'A' | 'B', delta: number) => void;
        setPauseReason: (reason: PauseReason) => void;
        startNextPeriod: () => void;
        goToNextPeriod: () => void;
        goToPreviousPeriod: () => void;
        finishMatchManually: () => void;
        undo: () => void;
        redo: () => void;
    },
    onToggleFullScreen: () => void;
    onToggleMiniAudience: () => void;
    onLeaveMatch: () => void;
    onUpdateMatchConfig: (newConfig: Partial<MatchConfig>) => void;
    clock: {
        isRunning: boolean;
    };
    gameState: GameState;
    matchConfig: MatchConfig;
    currentLayout: 'center' | 'side-by-side';
    onToggleLayout: () => void;
    canUndo: boolean;
    canRedo: boolean;
    onShowResetConfirm: () => void;
    showGlobalActions?: boolean;
}

const ControlButton: React.FC<{ onClick?: () => void; children: React.ReactNode; className?: string, title?: string, disabled?: boolean }> = ({ onClick, children, className = '', title, disabled = false }) => (
    <button
        onClick={onClick}
        title={title}
        disabled={disabled}
        className={`flex items-center justify-center p-3 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-card disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
        {children}
    </button>
);

const ControlPanel: React.FC<ControlPanelProps> = ({
    actions,
    onToggleFullScreen,
    onToggleMiniAudience,
    onLeaveMatch,
    onUpdateMatchConfig,
    clock,
    gameState,
    matchConfig,
    currentLayout,
    onToggleLayout,
    canUndo,
    canRedo,
    onShowResetConfirm,
    showGlobalActions = true,
}) => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    
    const isFinished = gameState.status === GameStatus.Finished;
    const isRunning = clock.isRunning;

    const scoreIncrements: Record<Sport, number[]> = {
        [Sport.Basketball]: [1, 2, 3],
        [Sport.Soccer]: [1],
        [Sport.Volleyball]: [1],
    };

    const pauseReasons: PauseReason[] = matchConfig.sport === Sport.Volleyball
        ? ['Timeout', 'Violation', 'Challenge']
        : ['Timeout', 'Foul', 'Violation', 'Challenge'];
    
    const pauseReasonGridClass = pauseReasons.length === 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3';
        
    const periodLabel = matchConfig.sport === Sport.Volleyball ? 'Set' : 'Period';
    
    const mainGridContainerClasses = currentLayout === 'center'
        ? "grid grid-cols-1 lg:grid-cols-3 gap-6"
        : "grid grid-cols-1 gap-6";

    const mainControlsOrderClass = currentLayout === 'center'
        ? "order-first lg:order-none"
        : "";

    const renderMainActionButton = () => {
        switch (gameState.status) {
            case GameStatus.NotStarted:
            case GameStatus.Paused:
                return (
                    <ControlButton onClick={actions.start} className="bg-green-600 hover:bg-green-500 text-white w-20 h-20 rounded-full" title="Start Clock">
                        <PlayIcon />
                    </ControlButton>
                );
            case GameStatus.InProgress:
                 return (
                    <ControlButton onClick={actions.pause} className="bg-yellow-500 hover:bg-yellow-400 text-black w-20 h-20 rounded-full" title="Pause Clock">
                        <PauseIcon />
                    </ControlButton>
                );
            case GameStatus.PeriodBreak:
                 return (
                    <ControlButton onClick={actions.startNextPeriod} className="bg-blue-500 hover:bg-blue-400 text-white px-6 h-20 rounded-lg text-lg" title="Start Next Period">
                        Start Next {periodLabel}
                    </ControlButton>
                );
            case GameStatus.TieBreak:
                return (
                    <ControlButton disabled className="bg-gray-600 text-white w-20 h-20 rounded-full flex flex-col items-center" title="Tie-Break in Progress">
                        <PauseIcon />
                        <span className="text-xs mt-1 font-bold">TIE-BREAK</span>
                    </ControlButton>
                );
            case GameStatus.Finished:
                 return (
                     <ControlButton disabled className="bg-gray-600 text-white w-20 h-20 rounded-full" title="Match Finished">
                        <PlayIcon />
                    </ControlButton>
                 )
        }
    }

    const SettingsModal = () => {
        const [localConfig, setLocalConfig] = useState(matchConfig);

        useEffect(() => {
            setLocalConfig(matchConfig);
        }, [isSettingsOpen]);

        const handleSave = () => {
            // FIX: Ensure targetScore has a value when saving in score mode.
            const configToSave = {...localConfig};
            if (configToSave.gameMode === 'score' && !configToSave.targetScore) {
                configToSave.targetScore = 21; // Default if somehow not set
            }
            onUpdateMatchConfig(configToSave);
            setIsSettingsOpen(false);
        };
        
        const inputClasses = "w-full bg-light-card-secondary border-light-border dark:bg-dark-card-secondary dark:border-dark-border p-2 rounded-md border focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none";
        const segmentedButtonClasses = (isActive: boolean) => 
          `w-full px-4 py-2 text-sm font-semibold rounded-md focus:outline-none ${
            isActive ? 'bg-brand-blue text-white' : 'bg-light-card hover:bg-light-border dark:bg-dark-card dark:hover:bg-dark-border'
          }`;

        return (
             <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                <div className="rounded-xl p-8 w-full max-w-md mx-4 bg-light-card text-light-text dark:bg-dark-card dark:text-dark-text shadow-2xl">
                    <h3 className="text-2xl font-bold font-display mb-6">Game Settings</h3>
                     
                    <div className="space-y-6">
                        <div>
                           <label className="block text-sm font-medium mb-2">Game Mode</label>
                           <div className="p-1 rounded-lg flex space-x-1 bg-light-card-secondary dark:bg-dark-card-secondary">
                                <button type="button" onClick={() => setLocalConfig(c => ({...c, gameMode: 'time'}))} className={segmentedButtonClasses(localConfig.gameMode === 'time')}>Time Based</button>
                                <button type="button" onClick={() => setLocalConfig(c => ({...c, gameMode: 'score', targetScore: c.targetScore || 21}))} className={segmentedButtonClasses(localConfig.gameMode === 'score')}>Score Based</button>
                            </div>
                        </div>

                        {localConfig.gameMode === 'time' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className={matchConfig.sport === Sport.Volleyball ? 'sm:col-span-3' : ''}>
                                    <label htmlFor="periods" className="block text-sm font-medium mb-1">{matchConfig.sport === Sport.Volleyball ? 'Best of Sets' : 'Periods'}</label>
                                    <input id="periods" type="number" min="1" value={localConfig.periods} onChange={e => setLocalConfig(c=>({...c, periods: parseInt(e.target.value)}))} className={inputClasses} />
                                </div>
                                {matchConfig.sport !== Sport.Volleyball && (
                                    <>
                                        <div>
                                            <label htmlFor="durationMinutes" className="block text-sm font-medium mb-1">Minutes</label>
                                            <input id="durationMinutes" type="number" min="0" value={localConfig.durationMinutes} onChange={e => setLocalConfig(c=>({...c, durationMinutes: parseInt(e.target.value)}))} className={inputClasses} />
                                        </div>
                                         <div>
                                            <label htmlFor="durationSeconds" className="block text-sm font-medium mb-1">Seconds</label>
                                            <input id="durationSeconds" type="number" min="0" max="59" value={localConfig.durationSeconds} onChange={e => setLocalConfig(c=>({...c, durationSeconds: parseInt(e.target.value)}))} className={inputClasses} />
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                             <div>
                                <label htmlFor="targetScore" className="block text-sm font-medium mb-1">Target Score</label>
                                <input id="targetScore" type="number" min="1" value={localConfig.targetScore || 21} onChange={e => setLocalConfig(c=>({...c, targetScore: parseInt(e.target.value)}))} className={inputClasses} />
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-4 mt-8">
                        <button
                            onClick={() => setIsSettingsOpen(false)}
                            className="font-bold py-2 px-6 rounded-lg bg-light-card-secondary hover:bg-light-border dark:bg-dark-card-secondary dark:hover:bg-dark-border"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="bg-brand-blue hover:bg-opacity-90 text-white font-bold py-2 px-6 rounded-lg"
                        >
                            Save Settings
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full h-full p-4 md:p-6 rounded-lg">
            {isSettingsOpen && <SettingsModal />}
            <div className={mainGridContainerClasses}>

                {/* Team A Controls */}
                <div className="flex flex-col items-center justify-between p-4 bg-light-card-secondary dark:bg-dark-card-secondary rounded-lg space-y-4">
                    <h3 className="text-3xl font-display font-bold uppercase truncate" style={{color: gameState.teamA.color}}>{gameState.teamA.name}</h3>
                    <p className="text-7xl font-mono font-bold">{gameState.teamA.score}</p>
                    <div className="flex items-center space-x-2">
                        <ControlButton onClick={() => actions.updateScore('A', -1)} className="bg-brand-red hover:bg-opacity-80 text-white w-14 h-14" title="Decrement score" disabled={isFinished}><MinusIcon /></ControlButton>
                        {scoreIncrements[matchConfig.sport].map(inc => (
                             <ControlButton key={inc} onClick={() => actions.updateScore('A', inc)} className="bg-green-600 hover:bg-green-500 text-white w-14 h-14 text-2xl font-bold" title={`Increment score by ${inc}`} disabled={isFinished}>{`+${inc}`}</ControlButton>
                        ))}
                    </div>
                </div>

                {/* Main Controls */}
                <div className={`flex flex-col items-center p-4 bg-light-card-secondary dark:bg-dark-card-secondary rounded-lg space-y-4 ${mainControlsOrderClass}`}>
                     <div className="w-full flex justify-between items-center">
                        <button onClick={onToggleLayout} className="p-2 rounded-full hover:bg-light-border dark:hover:bg-dark-border" title="Toggle Layout">
                            {currentLayout === 'center' ? <LayoutSplitIcon /> : <LayoutCenterIcon />}
                        </button>
                        <h3 className="text-2xl font-bold font-display uppercase">Game Controls</h3>
                        <button onClick={() => setIsSettingsOpen(true)} className="p-2 rounded-full hover:bg-light-border dark:hover:bg-dark-border" title="Game Settings" disabled={isFinished}>
                            <SettingsIcon className="h-6 w-6" />
                        </button>
                     </div>
                     <div className="flex items-center space-x-4 h-20">
                        {renderMainActionButton()}
                        {matchConfig.gameMode === 'time' && (
                            <ControlButton onClick={onShowResetConfirm} className="bg-gray-500 hover:bg-gray-400 text-white w-20 h-20 rounded-full" title="Reset Clock" disabled={isFinished}><ResetIcon /></ControlButton>
                        )}
                     </div>
                     <div className="w-full flex justify-center items-center gap-4 pt-2">
                        <ControlButton onClick={actions.undo} disabled={!canUndo || isFinished} className="bg-gray-500 hover:bg-gray-400 text-white w-20 h-12" title="Undo">
                            <UndoIcon />
                        </ControlButton>
                        <ControlButton onClick={actions.redo} disabled={!canRedo || isFinished} className="bg-gray-500 hover:bg-gray-400 text-white w-20 h-12" title="Redo">
                            <RedoIcon />
                        </ControlButton>
                    </div>
                     
                    {gameState.status === GameStatus.Paused && (
                        <div className="w-full p-3 mt-2 rounded-lg border-2 border-dashed border-yellow-500 bg-yellow-500/10 animate-fade-in">
                            <h4 className="text-sm font-bold text-center text-yellow-500 uppercase mb-3 animate-pulse">GAME PAUSED - SET REASON</h4>
                            <div className={`grid ${pauseReasonGridClass} gap-2`}>
                                {pauseReasons.map(reason => (
                                    <button 
                                        key={reason}
                                        onClick={() => actions.setPauseReason(reason)}
                                        className="bg-yellow-500/20 text-yellow-200 hover:bg-yellow-500/40 font-semibold py-2 px-2 rounded-md text-sm transition-colors">
                                        {reason}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {matchConfig.gameMode !== 'score' && (
                        <div className="flex items-center space-x-2">
                            <ControlButton onClick={actions.goToPreviousPeriod} disabled={isRunning || isFinished || gameState.currentPeriod <= 1} className="bg-light-border text-light-text dark:bg-dark-border dark:text-dark-text px-4 h-10">{`< ${periodLabel}`}</ControlButton>
                            <span className="font-bold text-lg w-24 text-center">{`${periodLabel} ${gameState.currentPeriod}`}</span>
                            <ControlButton onClick={actions.goToNextPeriod} disabled={isRunning || isFinished || gameState.currentPeriod >= matchConfig.periods} className="bg-light-border text-light-text dark:bg-dark-border dark:text-dark-text px-4 h-10">{`${periodLabel} >`}</ControlButton>
                        </div>
                    )}
                </div>

                {/* Team B Controls */}
                <div className="flex flex-col items-center justify-between p-4 bg-light-card-secondary dark:bg-dark-card-secondary rounded-lg space-y-4">
                    <h3 className="text-3xl font-display font-bold uppercase truncate" style={{color: gameState.teamB.color}}>{gameState.teamB.name}</h3>
                    <p className="text-7xl font-mono font-bold">{gameState.teamB.score}</p>
                    <div className="flex items-center space-x-2">
                        <ControlButton onClick={() => actions.updateScore('B', -1)} className="bg-brand-red hover:bg-opacity-90 text-white w-14 h-14" title="Decrement score" disabled={isFinished}><MinusIcon /></ControlButton>
                        {scoreIncrements[matchConfig.sport].map(inc => (
                             <ControlButton key={inc} onClick={() => actions.updateScore('B', inc)} className="bg-green-600 hover:bg-green-500 text-white w-14 h-14 text-2xl font-bold" title={`Increment score by ${inc}`} disabled={isFinished}>{`+${inc}`}</ControlButton>
                        ))}
                    </div>
                </div>
            </div>
            {showGlobalActions && 
                <MatchActions 
                    matchConfig={matchConfig}
                    gameState={gameState}
                    isFinished={isFinished}
                    actions={actions}
                    onToggleFullScreen={onToggleFullScreen}
                    onToggleMiniAudience={onToggleMiniAudience}
                    onLeaveMatch={onLeaveMatch}
                    onShowResetConfirm={onShowResetConfirm}
                />
            }
        </div>
    );
};

export default ControlPanel;
