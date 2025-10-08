import React, { useState, useEffect, useRef, useCallback } from 'react';
// FIX: Import the 'Match' type to resolve the 'Cannot find name 'Match'' error.
import type { MatchConfig, GameState, Theme, Match, Font } from '../types';
import { Sport, Layout, GameStatus } from '../types';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';
import ExitIcon from './icons/ExitIcon';

interface AudienceViewProps {
    config: MatchConfig;
    matchId: string;
    onExit: () => void;
    theme: Theme;
    isPreview?: boolean;
    font?: Font;
    layout?: Layout;
}

const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

type LiveData = { gameState: GameState, time: number };

interface AnimatedTeamScoreProps {
    name: string;
    score: number;
    color: string;
    font: Font;
    styles: {
        name: React.CSSProperties;
        score: React.CSSProperties;
        pointsContainer?: React.CSSProperties;
        pointsLabel?: React.CSSProperties;
        pointsScore?: React.CSSProperties;
    };
    isVolleyball?: boolean;
    pointScore?: number;
}

const AnimatedTeamScore: React.FC<AnimatedTeamScoreProps> = ({ name, score, color, font, styles, isVolleyball, pointScore }) => {
    const scoreToAnimate = isVolleyball ? pointScore : score;
    const prevScoreRef = useRef(scoreToAnimate);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (scoreToAnimate !== prevScoreRef.current) {
            setIsAnimating(true);
            const timer = setTimeout(() => setIsAnimating(false), 400); // Match animation duration
            prevScoreRef.current = scoreToAnimate;
            return () => clearTimeout(timer);
        }
    }, [scoreToAnimate]);
    
    const fontClass = `font-${font}`;

    return (
        <div className={`flex flex-col items-center text-center p-4 rounded-lg h-full ${isVolleyball ? 'justify-between' : 'justify-center'}`} style={{ backgroundColor: color }}>
            <h2 
              className={`font-bold uppercase text-white ${fontClass} text-shadow-heavy tracking-wider truncate w-full`}
              style={styles.name}
            >
              {name}
            </h2>
            <p 
              className={`font-bold text-white ${fontClass} text-shadow-heavy leading-none ${!isVolleyball && isAnimating ? 'animate-score-update' : ''}`}
              style={styles.score}
            >
              {score}
            </p>
            {isVolleyball && (
                <div className="bg-black/30 backdrop-blur-sm rounded-md" style={styles.pointsContainer}>
                    <h3 className={`font-sans font-semibold uppercase text-white/80 tracking-wider`} style={styles.pointsLabel}>Points</h3>
                    <p 
                        className={`font-bold text-white ${fontClass} text-shadow-heavy leading-none ${isAnimating ? 'animate-score-update' : ''}`}
                        style={styles.pointsScore}
                    >
                        {pointScore}
                    </p>
                </div>
            )}
        </div>
    );
};

const AudienceView: React.FC<AudienceViewProps> = ({ config, matchId, onExit, theme, isPreview = false, font = 'display', layout = Layout.Wide }) => {
    const [controlsVisible, setControlsVisible] = useState(!isPreview);
    const controlsTimeoutRef = useRef<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const element = containerRef.current;
        if (!element) return;

        const resizeObserver = new ResizeObserver(entries => {
            if (entries[0]) {
                const { width, height } = entries[0].contentRect;
                setDimensions({ width, height });
            }
        });

        resizeObserver.observe(element);
        return () => resizeObserver.unobserve(element);
    }, []);

    const getInitialState = (): LiveData => {
        const rawData = localStorage.getItem(`match-state-${matchId}`);
        if (rawData && !isPreview) {
            try {
                const historyData = JSON.parse(rawData);
                if (historyData.states && historyData.states.length > 0 && typeof historyData.index === 'number') {
                    return historyData.states[historyData.index];
                }
            } catch (e) {
                console.error("Failed to parse initial match data from localStorage", e);
            }
        }
        
        const finishedMatchRaw = localStorage.getItem('matches');
        if (finishedMatchRaw) {
            try {
                const allMatches = JSON.parse(finishedMatchRaw) as Match[];
                const thisMatch = allMatches.find(m => m.id === matchId);
                if (thisMatch && thisMatch.status === 'Finished') {
                    return {
                        gameState: {
                            teamA: { ...thisMatch.teamA, score: thisMatch.finalScoreA ?? 0 },
                            teamB: { ...thisMatch.teamB, score: thisMatch.finalScoreB ?? 0 },
                            currentPeriod: thisMatch.periods,
                            pauseReason: null,
                            status: GameStatus.Finished,
                            periodScores: thisMatch.periodScores ?? [],
                            setScores: thisMatch.sport === Sport.Volleyball ? (thisMatch.periodScores || []).reduce((acc, score) => {
                                if (score && score.a > score.b) acc.a++;
                                if (score && score.b > score.a) acc.b++;
                                return acc;
                            }, { a: 0, b: 0 }) : undefined,
                        },
                        time: 0,
                    }
                }
            } catch (e) {
                console.error("Failed to parse finished match data", e);
            }
        }
        
        return {
            gameState: {
                teamA: { ...config.teamA, score: 0 },
                teamB: { ...config.teamB, score: 0 },
                currentPeriod: 1,
                pauseReason: null,
                status: GameStatus.NotStarted,
                periodScores: [],
                ...(config.sport === Sport.Volleyball && { setScores: { a: 0, b: 0 } }),
            },
            time: config.sport === Sport.Volleyball ? 0 : config.durationMinutes * 60 + config.durationSeconds,
        };
    };

    const [liveData, setLiveData] = useState<LiveData>(getInitialState);
    const isVolleyball = config.sport === Sport.Volleyball;

    const getResponsiveStyles = useCallback((isVolleyball: boolean) => {
        const containerWidth = dimensions.width;
        if (!containerWidth) {
            const hidden = { fontSize: '0px' };
            return { name: hidden, score: hidden, time: hidden, period: hidden, setScore: hidden, pauseReason: hidden, sportName: hidden, pointsContainer: {}, pointsLabel: hidden, pointsScore: hidden };
        }

        const width = containerWidth;
        
        const nameRatio = isVolleyball ? 0.06 : 0.07;
        const scoreRatio = isVolleyball ? 0.18 : 0.25;
        const timeRatio = 0.15;
        const periodRatio = 0.06;
        const setScoreRatio = 0.05;
        const pauseReasonRatio = 0.2;
        const sportNameRatio = 0.04;
        const pointsContainerPaddingXRatio = 0.02;
        const pointsContainerPaddingYRatio = 0.01;
        const pointsLabelRatio = 0.02;
        const pointsScoreRatio = 0.08;

        const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(val, max));

        return {
            name: { fontSize: `${clamp(width * nameRatio, 8, 80)}px` },
            score: { fontSize: `${clamp(width * scoreRatio, 12, 250)}px` },
            time: { fontSize: `${clamp(width * timeRatio, 10, 100)}px` },
            period: { fontSize: `${clamp(width * periodRatio, 6, 50)}px` },
            setScore: { fontSize: `${clamp(width * setScoreRatio, 5, 30)}px` },
            pauseReason: { fontSize: `${clamp(width * pauseReasonRatio, 24, 150)}px` },
            sportName: { fontSize: `${clamp(width * sportNameRatio, 5, 35)}px` },
            pointsContainer: { padding: `${clamp(width * pointsContainerPaddingYRatio, 2, 8)}px ${clamp(width * pointsContainerPaddingXRatio, 4, 16)}px` },
            pointsLabel: { fontSize: `${clamp(width * pointsLabelRatio, 6, 20)}px` },
            pointsScore: { fontSize: `${clamp(width * pointsScoreRatio, 10, 80)}px` },
        };
    }, [dimensions.width]);
    
    const responsiveStyles = getResponsiveStyles(isVolleyball);

    useEffect(() => {
        const channel = new BroadcastChannel('scoreboard-pro-updates');
        const handleUpdateFromStorage = () => {
            const rawData = localStorage.getItem(`match-state-${matchId}`);
            if (rawData) {
                try {
                    const historyData = JSON.parse(rawData);
                     if (historyData.states && historyData.states.length > 0 && typeof historyData.index === 'number') {
                        setLiveData(historyData.states[historyData.index]);
                    }
                } catch (e) {
                    console.error("Failed to parse match update from localStorage", e);
                }
            }
        };
        
        const messageHandler = (event: MessageEvent) => {
            if (event.data?.matchId === matchId && event.data?.data) {
                setLiveData(event.data.data);
            }
        };

        channel.addEventListener('message', messageHandler);
        window.addEventListener('focus', handleUpdateFromStorage);

        return () => {
            channel.removeEventListener('message', messageHandler);
            window.removeEventListener('focus', handleUpdateFromStorage);
            channel.close();
        };
    }, [matchId]);

    useEffect(() => {
        if (isPreview) {
            setControlsVisible(false);
            if(controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
            return;
        }

        const hideControls = () => {
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
            controlsTimeoutRef.current = window.setTimeout(() => setControlsVisible(false), 3000);
        };
        hideControls();
        const handleMouseMove = () => {
            setControlsVisible(true);
            hideControls();
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [isPreview]);
    
    const isDarkTheme = ['dark', 'viola', 'coder'].includes(theme);
    const themeClasses = isDarkTheme ? 'dark bg-dark-background text-dark-text' : 'bg-light-background text-light-text';
    const clockBgClass = isDarkTheme ? 'bg-black' : 'bg-light-text';
    
    const periodLabel = config.sport === Sport.Volleyball ? 'SET' : 'PERIOD';
    const { gameState, time: liveTime } = liveData;

    const scoreA = gameState.teamA.score;
    const scoreB = gameState.teamB.score;

    const effectiveLayout = dimensions.width < 450 ? Layout.Compact : layout;

    const layoutClasses = {
        [Layout.Wide]: 'grid-cols-1 grid-rows-[1fr_auto_1fr] md:grid-rows-1 md:grid-cols-[1fr_auto_1fr]',
        [Layout.Compact]: 'grid-cols-1 grid-rows-3',
    };
    
    const containerClasses = `w-full h-full flex items-center justify-center relative overflow-hidden rounded-lg ${themeClasses}`;
    
    const timeToDisplay = gameState.status === GameStatus.Finished ? 0 : liveTime;

    return (
        <div ref={containerRef} className={containerClasses}>
            
            {!isPreview && (
                <div className={`absolute top-4 right-4 flex gap-3 transition-opacity duration-300 ${controlsVisible ? 'opacity-100' : 'opacity-0'}`}>
                    <button onClick={onExit} className="p-3 rounded-full bg-dark-card/50 hover:bg-dark-card/80 text-white" title="Exit Audience View">
                        <ExitIcon />
                    </button>
                </div>
            )}

            <div className={`w-full h-full p-2 sm:p-4 grid gap-2 sm:gap-4 ${layoutClasses[effectiveLayout]}`}>
                 {gameState.status === GameStatus.Finished && <div className="final-badge">FINAL</div>}
                {gameState.pauseReason && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
                        <h1 
                            className={`font-display text-yellow-400 uppercase tracking-widest animate-pulse font-${font}`}
                            style={responsiveStyles.pauseReason}
                        >
                            {gameState.pauseReason}
                        </h1>
                    </div>
                )}

                <AnimatedTeamScore 
                    name={gameState.teamA.name} 
                    score={isVolleyball ? (gameState.setScores?.a ?? 0) : scoreA} 
                    color={config.teamA.color} 
                    font={font} 
                    styles={{ name: responsiveStyles.name, score: responsiveStyles.score, pointsContainer: responsiveStyles.pointsContainer, pointsLabel: responsiveStyles.pointsLabel, pointsScore: responsiveStyles.pointsScore }}
                    isVolleyball={isVolleyball}
                    pointScore={isVolleyball ? gameState.teamA.score : undefined}
                />

                <div className={`flex flex-col items-center justify-center ${clockBgClass} p-4 rounded-lg text-white`}>
                    <div 
                      className={`font-bold leading-none font-${font}`}
                      style={responsiveStyles.time}
                    >
                      {formatTime(timeToDisplay)}
                    </div>
                    <div 
                      className={`font-semibold uppercase tracking-widest mt-2 font-${font}`}
                      style={responsiveStyles.period}
                    >
                        {periodLabel} {gameState.currentPeriod}
                    </div>
                    <div
                        className={`font-semibold uppercase tracking-wider mt-1 opacity-70 font-${font}`}
                        style={responsiveStyles.sportName}
                    >
                        {config.sport}
                    </div>
                </div>

                <AnimatedTeamScore 
                    name={gameState.teamB.name} 
                    score={isVolleyball ? (gameState.setScores?.b ?? 0) : scoreB} 
                    color={config.teamB.color} 
                    font={font} 
                    styles={{ name: responsiveStyles.name, score: responsiveStyles.score, pointsContainer: responsiveStyles.pointsContainer, pointsLabel: responsiveStyles.pointsLabel, pointsScore: responsiveStyles.pointsScore }}
                    isVolleyball={isVolleyball}
                    pointScore={isVolleyball ? gameState.teamB.score : undefined}
                />
            </div>
        </div>
    );
};

export default AudienceView;