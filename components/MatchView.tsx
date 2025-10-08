import React, { useState, useEffect, useRef } from 'react';
import type { Match, MatchConfig, GameState, PauseReason } from '../types';
import { GameStatus, Sport } from '../types';
import Scoreboard from './Scoreboard';
import ControlPanel from './ControlPanel';
import BoxScore from './BoxScore';
import TrophyIcon from './icons/TrophyIcon';
import WarningIcon from './icons/WarningIcon';
import MiniAudienceWindow from './MiniAudienceWindow';
import MatchActions from './MatchActions';
import MatchResult from './MatchResult';
import PictureInPictureIcon from './icons/PictureInPictureIcon';
import FullScreenIcon from './icons/FullScreenIcon';
import DashboardIcon from './icons/DashboardIcon';

interface MatchViewProps {
    match: Match;
    matchConfig: MatchConfig;
    gameState: GameState;
    clock: {
        time: number;
        isRunning: boolean;
    };
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
    };
    onLeaveMatch: () => void;
    activeMatchId: string;
    onUpdateMatchConfig: (newConfig: Partial<MatchConfig>) => void;
    canUndo: boolean;
    canRedo: boolean;
}

const useCountUp = (end: number, duration = 1000) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (end === 0) {
            setCount(0);
            return;
        }
        let startTime: number | null = null;
        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);
            const current = Math.floor(percentage * end);
            setCount(current);
            if (progress < duration) {
                requestAnimationFrame(animate);
            } else {
                setCount(end);
            }
        };
        requestAnimationFrame(animate);
    }, [end, duration]);
    return count;
};

const ConfettiContainer: React.FC<{ color: string }> = ({ color }) => {
    const numConfetti = 50;
    return (
        <div className="confetti-container">
            {Array.from({ length: numConfetti }).map((_, i) => (
                <div
                    key={i}
                    className="confetti"
                    style={{
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 5}s`,
                        transform: `scale(${Math.random() * 0.5 + 0.5})`,
                        '--winner-glow': color,
                    } as React.CSSProperties}
                />
            ))}
        </div>
    );
};

const MatchView: React.FC<MatchViewProps> = (props) => {
    const { match, matchConfig, gameState, clock, actions, onLeaveMatch, onUpdateMatchConfig, activeMatchId, canUndo, canRedo } = props;
    
    const [isFullScreen, setIsFullScreen] = useState(false);
    const fullscreenRef = useRef<HTMLDivElement>(null);
    const [isWinnerOverlayVisible, setWinnerOverlayVisible] = useState(gameState.status === GameStatus.Finished);
    const [isMiniAudienceOpen, setIsMiniAudienceOpen] = useState(false);
    const [layout, setLayout] = useState<'center' | 'side-by-side'>('center');
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    const isVolleyball = matchConfig.sport === Sport.Volleyball;
    const finalScoreA = isVolleyball ? (gameState.setScores?.a ?? 0) : gameState.teamA.score;
    const finalScoreB = isVolleyball ? (gameState.setScores?.b ?? 0) : gameState.teamB.score;
    
    const animatedScoreA = useCountUp(finalScoreA, 1200);
    const animatedScoreB = useCountUp(finalScoreB, 1200);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const card = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - card.left;
        const y = e.clientY - card.top;
        const rotateX = -1 * ((card.height / 2 - y) / (card.height / 2)) * 8;
        const rotateY = ((card.width / 2 - x) / (card.width / 2)) * 8;
        setTilt({ x: rotateX, y: rotateY });
    };

    const handleMouseLeave = () => {
        setTilt({ x: 0, y: 0 });
    };


    const toggleLayout = () => {
        setLayout(prev => prev === 'center' ? 'side-by-side' : 'center');
    };


    const toggleFullScreen = () => {
        if (!fullscreenRef.current) return;
        if (!isFullScreen) {
            fullscreenRef.current.requestFullscreen().then(() => setIsFullScreen(true));
        } else {
            document.exitFullscreen().then(() => setIsFullScreen(false));
        }
    };

    useEffect(() => {
        const handleFullScreenChange = () => {
            setIsFullScreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullScreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
    }, []);

    useEffect(() => {
        if (gameState.status === GameStatus.Finished) {
            setWinnerOverlayVisible(true);
        }
    }, [gameState.status]);
    
    const ConfirmationModal: React.FC<{
      title: string;
      description: string;
      onCancel: () => void;
      onConfirm: () => void;
      confirmText: string;
      confirmClass: string;
    }> = ({ title, description, onCancel, onConfirm, confirmText, confirmClass }) => (
       <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div className="rounded-xl p-8 w-full max-w-md mx-4 bg-light-card text-light-text dark:bg-dark-card dark:text-dark-text shadow-2xl">
                <h3 className="text-2xl font-bold font-display mb-4">{title}</h3>
                <p className="text-light-text-muted dark:text-dark-text-muted mb-8">
                    {description}
                </p>
                <div className="flex justify-end gap-4">
                    <button
                        onClick={onCancel}
                        className="font-bold py-2 px-6 rounded-lg bg-light-card-secondary hover:bg-light-border dark:bg-dark-card-secondary dark:hover:bg-dark-border"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`${confirmClass} text-white font-bold py-2 px-6 rounded-lg`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );


    const renderOverlay = () => {
        if (gameState.status === GameStatus.PeriodBreak) {
            return (
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20 text-white p-8 text-center">
                    <h1 className="text-5xl md:text-7xl font-bold font-display mb-6">{gameState.message}</h1>
                    <button onClick={actions.startNextPeriod} className="bg-brand-blue hover:bg-opacity-90 text-white font-bold py-4 px-8 rounded-lg text-2xl transition-transform duration-200 transform hover:scale-105">
                        Start Next {matchConfig.sport === 'Volleyball' ? 'Set' : 'Period'}
                    </button>
                </div>
            )
        }

        if (gameState.status === GameStatus.Finished && isWinnerOverlayVisible) {
            const isTie = gameState.winner === 'TIE';
            const winnerData = gameState.winner === 'A' ? gameState.teamA : (gameState.winner === 'B' ? gameState.teamB : null);

            let totalPointsA = 0;
            let totalPointsB = 0;
            if (isVolleyball && gameState.periodScores) {
                gameState.periodScores.forEach(score => {
                    totalPointsA += score.a;
                    totalPointsB += score.b;
                });
            }

            let bestPeriodStat: string | null = null;
            let consistencyStat: string | null = null;
            const periodLabel = matchConfig.sport === 'Volleyball' ? 'Set' : (matchConfig.sport === 'Soccer' ? 'Half' : 'Period');

            if (winnerData && gameState.periodScores && gameState.periodScores.length > 0) {
                let maxDiff = -1;
                let bestPeriodIndex = -1;
            
                gameState.periodScores.forEach((score, index) => {
                    const diff = gameState.winner === 'A' ? score.a - score.b : score.b - score.a;
                    if (diff > maxDiff) {
                        maxDiff = diff;
                        bestPeriodIndex = index;
                    }
                });
            
                if (bestPeriodIndex !== -1) {
                    bestPeriodStat = `Best Performance: +${maxDiff} in ${periodLabel} ${bestPeriodIndex + 1}`;
                }
            
                const allPeriodsWon = gameState.periodScores.every(score => 
                    gameState.winner === 'A' ? score.a > score.b : score.b > score.a
                );
                if (allPeriodsWon) {
                    consistencyStat = "Dominant victory: Won every period!";
                }
            }


            return (
                 <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-30 p-4 animate-fade-in"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                 >
                    <div
                        className="relative w-full max-w-md rounded-2xl p-8 flex flex-col items-center shadow-2xl bg-light-card text-light-text dark:bg-dark-card dark:text-dark-text transition-transform duration-200"
                        style={{
                            '--winner-glow': winnerData?.color ?? '#A855F7',
                            transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.02)`
                        } as React.CSSProperties}
                    >
                         <div className="absolute -inset-2 rounded-full bg-[--winner-glow] opacity-20 blur-3xl animate-glow"></div>
                         <div className="absolute inset-0 sunburst-bg rounded-2xl overflow-hidden"></div>
                         <ConfettiContainer color={winnerData?.color ?? '#A855F7'} />

                        <div className="relative animate-trophy-bounce-enhanced z-10">
                            <TrophyIcon className="h-28 w-28 text-yellow-400" />
                        </div>
                        
                        <div className="relative animate-fade-in-delay-1 z-10 text-center">
                            {!isTie && winnerData ? (
                                <>
                                    <h1 className="text-4xl md:text-5xl font-bold font-display uppercase mt-4">Winner</h1>
                                    <h2 className="text-3xl md:text-4xl font-bold font-display mt-2 truncate max-w-full" style={{ color: winnerData.color }}>
                                        {winnerData.name}
                                    </h2>
                                </>
                            ) : (
                                <h1 className="text-5xl md:text-6xl font-bold font-display uppercase">It's a Tie!</h1>
                            )}
                        </div>

                        <p className="relative text-4xl md:text-5xl font-mono font-bold my-6 animate-fade-in-delay-2 z-10">
                            {animatedScoreA} - {animatedScoreB}
                        </p>

                        {isVolleyball && (
                            <p className="relative text-base text-light-text-muted dark:text-dark-text-muted -mt-4 mb-6 animate-fade-in-delay-2 z-10">
                                Total Points: {totalPointsA} - {totalPointsB}
                            </p>
                        )}

                        {(bestPeriodStat || consistencyStat) && (
                            <div className="relative text-center my-4 space-y-2 p-4 bg-light-card-secondary/80 dark:bg-dark-card-secondary/80 rounded-lg animate-fade-in-delay-3 w-full z-10">
                                {bestPeriodStat && <p className="text-sm font-semibold">{bestPeriodStat}</p>}
                                {consistencyStat && <p className="text-sm font-semibold text-green-500">{consistencyStat}</p>}
                            </div>
                        )}
                        
                        <div className={`relative flex flex-col sm:flex-row items-center gap-4 mt-6 w-full z-10 ${(bestPeriodStat || consistencyStat) ? 'animate-fade-in-delay-4' : 'animate-fade-in-delay-3'}`}>
                            <button 
                                onClick={() => setWinnerOverlayVisible(false)} 
                                className="w-full font-bold py-3 px-6 rounded-lg text-lg transform hover:scale-105 bg-light-card-secondary hover:bg-light-border dark:bg-dark-card-secondary dark:hover:bg-dark-border"
                            >
                                View Box Score
                            </button>
                            <button 
                                onClick={onLeaveMatch} 
                                className="w-full bg-brand-blue hover:bg-opacity-90 text-white font-bold py-3 px-6 rounded-lg text-lg transform hover:scale-105"
                            >
                                Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            );
        }
        
        return null;
    }

    const TieBreakIndicator = (
        <div className="w-full max-w-7xl mx-auto mb-4 p-6 rounded-lg shadow-md bg-light-card text-light-text dark:bg-dark-card dark:text-dark-text border-2 border-dashed border-yellow-500 text-center animate-fade-in">
            <h2 className="text-4xl font-display font-bold text-yellow-500 mb-2">
                Set Tie-Break
            </h2>
            <p className="text-lg text-light-text-muted dark:text-dark-text-muted">
                A 2-point lead is required to win this set.
            </p>
            <p className="font-semibold mt-2">
                Continue using the score controls to determine the winner.
            </p>
        </div>
    );

    const ScoreOrTieBreak = gameState.status === GameStatus.TieBreak
        ? TieBreakIndicator
        : (matchConfig.gameMode !== 'score' && <BoxScore gameState={gameState} matchConfig={matchConfig} />);

    if (gameState.status === GameStatus.Finished && !isWinnerOverlayVisible) {
        return (
            <div className="p-4 md:p-6 w-full animate-fade-in">
                {isMiniAudienceOpen && (
                    <MiniAudienceWindow
                        config={matchConfig}
                        matchId={activeMatchId}
                        onClose={() => setIsMiniAudienceOpen(false)}
                    />
                )}
                 <div className="w-full max-w-7xl mx-auto relative">
                     <button onClick={onLeaveMatch} className="absolute top-0 -left-2 md:-left-4 text-light-text-muted hover:text-light-text dark:text-dark-text-muted dark:hover:text-dark-text flex items-center gap-2 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Back to Dashboard
                    </button>
                    <div className="w-full relative pt-12 text-center">
                        <h2 className="text-2xl font-bold font-display uppercase text-light-text-muted dark:text-dark-text-muted mb-2">Final</h2>
                        <div className="mb-6">
                            <MatchResult match={match} />
                        </div>
                        <BoxScore gameState={gameState} matchConfig={matchConfig} />
                        <div className="mt-8 flex justify-center items-center gap-4">
                             <button onClick={() => setIsMiniAudienceOpen(true)} className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-3 px-6 rounded-lg text-lg transition-transform hover:scale-105">
                                <PictureInPictureIcon /> Project
                            </button>
                             <button onClick={toggleFullScreen} className="flex items-center gap-2 bg-brand-blue hover:bg-opacity-90 text-white font-bold py-3 px-6 rounded-lg text-lg transition-transform hover:scale-105">
                                <FullScreenIcon /> Audience View
                            </button>
                            <button onClick={onLeaveMatch} className="flex items-center gap-2 bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg text-lg transition-transform hover:scale-105">
                                <DashboardIcon /> Dashboard
                            </button>
                        </div>
                     </div>
                 </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 w-full">
            {showResetConfirm && (
                <ConfirmationModal 
                  title="Reset Match?"
                  description="This will reset all scores and the clock, allowing you to start the match over from Period 1. This action cannot be undone."
                  onCancel={() => setShowResetConfirm(false)}
                  onConfirm={() => {
                      actions.reset();
                      setShowResetConfirm(false);
                  }}
                  confirmText="Confirm Reset"
                  confirmClass="bg-brand-red hover:bg-opacity-90"
                />
            )}
            <div className="w-full max-w-7xl mx-auto relative">
                {isMiniAudienceOpen && (
                    <MiniAudienceWindow
                        config={matchConfig}
                        matchId={activeMatchId}
                        onClose={() => setIsMiniAudienceOpen(false)}
                    />
                )}
                {gameState.notification && (
                    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 animate-slide-in-bottom">
                        <div className="bg-brand-red text-white font-semibold px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
                            <WarningIcon className="h-6 w-6" />
                            <span>{gameState.notification.message}</span>
                        </div>
                    </div>
                )}
                <button onClick={onLeaveMatch} className="absolute top-0 -left-2 md:-left-4 text-light-text-muted hover:text-light-text dark:text-dark-text-muted dark:hover:text-dark-text flex items-center gap-2 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Back to Dashboard
                </button>
                <div className="w-full relative pt-12">
                     {renderOverlay()}
                     {layout === 'center' ? (
                        <>
                             <div ref={fullscreenRef} className="bg-light-card dark:bg-dark-card rounded-lg shadow-lg">
                                <div className={`transition-all duration-300 ease-in-out relative ${isFullScreen ? 'h-screen w-screen flex items-center justify-center fixed inset-0 z-50' : 'p-2'}`}>
                                    <Scoreboard
                                        config={matchConfig}
                                        state={gameState}
                                        time={clock.time}
                                        isFullScreen={isFullScreen}
                                    />
                                </div>
                            </div>
                            
                            <div className={`transition-opacity duration-300 mt-4 ${isFullScreen ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
                                {ScoreOrTieBreak}
                                <ControlPanel {...props} onToggleFullScreen={toggleFullScreen} onToggleMiniAudience={() => setIsMiniAudienceOpen(true)} onToggleLayout={toggleLayout} currentLayout={layout} canUndo={canUndo} canRedo={canRedo} onShowResetConfirm={() => setShowResetConfirm(true)} />
                            </div>
                        </>
                     ) : (
                         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="space-y-6 lg:col-span-2">
                                <div ref={fullscreenRef} className="bg-light-card dark:bg-dark-card rounded-lg shadow-lg">
                                    <div className="p-2">
                                         <Scoreboard
                                            config={matchConfig}
                                            state={gameState}
                                            time={clock.time}
                                            isFullScreen={false} 
                                        />
                                    </div>
                                </div>
                                {ScoreOrTieBreak}
                                <MatchActions 
                                    matchConfig={matchConfig}
                                    gameState={gameState}
                                    isFinished={gameState.status === GameStatus.Finished}
                                    actions={actions}
                                    onToggleMiniAudience={() => setIsMiniAudienceOpen(true)}
                                    onToggleFullScreen={toggleFullScreen}
                                    onLeaveMatch={onLeaveMatch}
                                    onShowResetConfirm={() => setShowResetConfirm(true)}
                                />
                            </div>
                            <div className="bg-light-card dark:bg-dark-card rounded-lg shadow-lg">
                                 <ControlPanel 
                                    {...props} 
                                    onToggleFullScreen={toggleFullScreen} 
                                    onToggleMiniAudience={() => setIsMiniAudienceOpen(true)} 
                                    onToggleLayout={toggleLayout} 
                                    currentLayout={layout} 
                                    canUndo={canUndo} 
                                    canRedo={canRedo} 
                                    showGlobalActions={false} 
                                    onShowResetConfirm={() => setShowResetConfirm(true)} 
                                />
                            </div>
                         </div>
                     )}
                </div>
            </div>
        </div>
    );
};

export default MatchView;