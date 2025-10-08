import React from 'react';
import type { GameState, MatchConfig } from '../types';
import CheckIcon from './icons/CheckIcon';
import PictureInPictureIcon from './icons/PictureInPictureIcon';
import FullScreenIcon from './icons/FullScreenIcon';
import DashboardIcon from './icons/DashboardIcon';
import ResetIcon from './icons/ResetIcon';

// This is a local, self-contained definition to avoid creating another new file.
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


interface MatchActionsProps {
    matchConfig: MatchConfig;
    gameState: GameState;
    isFinished: boolean;
    actions: {
        finishMatchManually: () => void;
    };
    onToggleMiniAudience: () => void;
    onToggleFullScreen: () => void;
    onLeaveMatch: () => void;
    onShowResetConfirm: () => void;
}

const MatchActions: React.FC<MatchActionsProps> = ({
    matchConfig,
    gameState,
    isFinished,
    actions,
    onToggleMiniAudience,
    onToggleFullScreen,
    onLeaveMatch,
    onShowResetConfirm,
}) => {
    return (
        <div className="mt-6 flex justify-center space-x-4">
            {matchConfig.gameMode !== 'score' && gameState.currentPeriod === matchConfig.periods && !isFinished && (
                <ControlButton onClick={actions.finishMatchManually} className="bg-green-600 hover:bg-green-500 text-white flex gap-2 px-6 py-3 text-lg" title="Finish Match">
                    <CheckIcon />
                    Finish Match
                </ControlButton>
            )}
            <ControlButton onClick={onToggleMiniAudience} className="bg-indigo-500 hover:bg-indigo-400 text-white flex gap-2 px-6 py-3 text-lg" title="Project Mini-View">
                <PictureInPictureIcon />
                Project
            </ControlButton>
            <ControlButton onClick={onToggleFullScreen} className="bg-brand-blue hover:bg-opacity-90 text-white flex gap-2 px-6 py-3 text-lg" title="Toggle Fullscreen View">
                <FullScreenIcon />
                Audience View
            </ControlButton>
            {isFinished ? (
                <ControlButton onClick={onLeaveMatch} className="bg-brand-blue hover:bg-opacity-90 text-white flex gap-2 px-6 py-3 text-lg" title="Back to Dashboard">
                    <DashboardIcon />
                    Dashboard
                </ControlButton>
            ) : (
                <ControlButton onClick={onShowResetConfirm} className="bg-brand-red hover:bg-opacity-90 text-white flex gap-2 px-6 py-3 text-lg" title="Reset match and start over">
                    <ResetIcon />
                    Reset Match
                </ControlButton>
            )}
        </div>
    );
};

export default MatchActions;
