import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useGameClock } from './useGameClock';
import type { MatchConfig, GameState, PauseReason } from '../types';
import { Sport, GameStatus } from '../types';

type HistoryEntry = { gameState: GameState, time: number };
type History = {
    states: HistoryEntry[];
    index: number;
};

const createInitialState = (config: MatchConfig): GameState => ({
  teamA: { ...config.teamA, score: 0 },
  teamB: { ...config.teamB, score: 0 },
  currentPeriod: 1,
  status: GameStatus.NotStarted,
  periodScores: [],
  ...(config.sport === Sport.Volleyball && { setScores: { a: 0, b: 0 } }),
});

const clearNotification = (state: GameState): GameState => {
    if (!state.notification) return state;
    const { notification, ...rest } = state;
    return rest;
};

export const useGameLogic = (config: MatchConfig | null, matchId: string | null) => {
    const [history, setHistory] = useState<History>({ states: [], index: -1 });
    const prevMatchIdRef = useRef<string | null>(null);
    const channel = useRef(new BroadcastChannel('scoreboard-pro-updates'));

    const currentHistoryEntry = useMemo(() => {
        if (history.index < 0 || history.index >= history.states.length) {
            return null;
        }
        return history.states[history.index];
    }, [history]);

    const gameState = currentHistoryEntry?.gameState ?? null;
    
    const isStopwatch = useMemo(() => config?.sport === Sport.Volleyball && config?.gameMode !== 'score', [config]);

    const handleEndOfPeriod = useCallback((currentState: GameState): GameState => {
        if (!config || config.gameMode === 'score') return currentState;

        const sumOfPreviousScoresA = (currentState.periodScores || []).reduce((sum, score) => sum + (score?.a || 0), 0);
        const sumOfPreviousScoresB = (currentState.periodScores || []).reduce((sum, score) => sum + (score?.b || 0), 0);

        const currentPeriodScoreA = currentState.teamA.score - sumOfPreviousScoresA;
        const currentPeriodScoreB = currentState.teamB.score - sumOfPreviousScoresB;

        if (config.sport === Sport.Volleyball && config.gameMode === 'time' && currentPeriodScoreA === currentPeriodScoreB) {
            return {
                ...currentState,
                status: GameStatus.TieBreak,
                message: null, // Set message to null to prevent the old overlay
            };
        }

        const updatedPeriodScores = [...(currentState.periodScores || []), { a: currentPeriodScoreA, b: currentPeriodScoreB }];

        let newSetScores = currentState.setScores;
        if (config.sport === Sport.Volleyball) {
            newSetScores = (updatedPeriodScores).reduce((acc, score) => {
                if (score.a > score.b) acc.a++;
                else if (score.b > score.a) acc.b++;
                return acc;
            }, { a: 0, b: 0 });
            
            const setsToWin = Math.ceil(config.periods / 2);
            const matchWinner = newSetScores.a === setsToWin ? 'A' : (newSetScores.b === setsToWin ? 'B' : null);

            if (matchWinner) {
                const winnerName = matchWinner === 'A' ? currentState.teamA.name : currentState.teamB.name;
                return {
                    ...currentState,
                    status: GameStatus.Finished,
                    winner: matchWinner,
                    message: `Match Over - ${winnerName} Wins!`,
                    periodScores: updatedPeriodScores,
                    setScores: newSetScores
                };
            }
        }

        if (currentState.currentPeriod >= config.periods) {
            // End of Match
            if (config.sport === Sport.Volleyball && newSetScores) {
                const winner: 'A' | 'B' | 'TIE' = newSetScores.a > newSetScores.b ? 'A' : (newSetScores.b > newSetScores.a ? 'B' : 'TIE');
                const winnerName = winner === 'A' ? currentState.teamA.name : (winner === 'B' ? currentState.teamB.name : null);
                return {
                     ...currentState,
                    status: GameStatus.Finished,
                    winner,
                    message: winner === 'TIE' ? "Match Over - It's a Tie!" : `Match Over - ${winnerName} Wins!`,
                    periodScores: updatedPeriodScores,
                    setScores: newSetScores
                };
            }
            
            const winner: 'A' | 'B' | 'TIE' = currentState.teamA.score > currentState.teamB.score ? 'A' : (currentState.teamB.score > currentState.teamA.score ? 'B' : 'TIE');
            const winnerName = winner === 'A' ? currentState.teamA.name : (winner === 'B' ? currentState.teamB.name : null);
            return {
                ...currentState,
                status: GameStatus.Finished,
                winner,
                message: winner === 'TIE' ? "Match Over - It's a Tie!" : `Match Over - ${winnerName} Wins!`,
                periodScores: updatedPeriodScores,
            };
        } else {
            // End of Period
            return {
                ...currentState,
                status: GameStatus.PeriodBreak,
                message: `End of ${config.sport === Sport.Volleyball ? 'Set' : (config.sport === Sport.Soccer ? 'Half' : 'Quarter')} ${currentState.currentPeriod}`,
                periodScores: updatedPeriodScores,
                ...(config.sport === Sport.Volleyball && { setScores: newSetScores }),
            };
        }
    }, [config]);

    const recordState = useCallback((stateProducer: (prevGameState: GameState) => GameState) => {
        setHistory(prevHistory => {
            const currentGameState = prevHistory.states[prevHistory.index]?.gameState;
            if (!currentGameState) return prevHistory;
            
            const newGameState = stateProducer(currentGameState);

            // This comparison is imperfect for complex objects but works for this state.
            if (JSON.stringify(currentGameState) === JSON.stringify(newGameState)) {
                return prevHistory;
            }

            const newEntry: HistoryEntry = {
                gameState: newGameState,
                time: 0, // Placeholder, will be replaced by timeRef below
            };

            const newStates = prevHistory.states.slice(0, prevHistory.index + 1);
            newStates.push(newEntry);
            
            return {
                states: newStates,
                index: newStates.length - 1
            };
        });
    }, []);

    const setGameState = useCallback((stateProducer: (prevGameState: GameState) => GameState) => {
        recordState(stateProducer);
    }, [recordState]);
    
    // Effect to auto-dismiss notifications
    useEffect(() => {
        if (gameState?.notification) {
            const timer = setTimeout(() => {
                setGameState(s => clearNotification(s));
            }, 3000); // Notification disappears after 3 seconds
            return () => clearTimeout(timer);
        }
    }, [gameState?.notification, setGameState]);


    const handleTimeUp = useCallback(() => {
        if (isStopwatch || config?.gameMode === 'score') return;
        setGameState(prev => handleEndOfPeriod(prev));
    }, [isStopwatch, handleEndOfPeriod, config, setGameState]);

    const initialTime = useMemo(() => {
        if (!config) return 0;
        return isStopwatch || config.gameMode === 'score' ? 0 : config.durationMinutes * 60 + config.durationSeconds;
    }, [config, isStopwatch]);

    const { time, timeRef, isRunning, start, pause, reset: resetClock, setTime: setClockTime } = useGameClock(
        initialTime, 
        handleTimeUp,
        isStopwatch ? 'stopwatch' : 'countdown'
    );
    
    useEffect(() => {
        // When state is recorded, it doesn't know the current time yet.
        // This effect runs after render and patches the latest history entry with the correct time.
        if (history.index > -1) {
            const currentEntry = history.states[history.index];
            if (currentEntry && timeRef.current !== currentEntry.time) {
                const newStates = [...history.states];
                newStates[history.index] = { ...currentEntry, time: timeRef.current };
                setHistory(h => ({ ...h, states: newStates }));
            }
        }
    }, [history, timeRef]);


    useEffect(() => {
        if (!config || !matchId) {
            setHistory({ states: [], index: -1 });
            prevMatchIdRef.current = null;
            return;
        }

        const isNewMatchId = prevMatchIdRef.current !== matchId;

        if (isNewMatchId) {
            prevMatchIdRef.current = matchId;

            const savedDataRaw = localStorage.getItem(`match-state-${matchId}`);
            if (savedDataRaw) {
                try {
                    const savedHistory = JSON.parse(savedDataRaw);
                    if (savedHistory.states && savedHistory.states.length > 0 && typeof savedHistory.index === 'number') {
                        setHistory(savedHistory);
                        setClockTime(savedHistory.states[savedHistory.index].time);
                        return; // Successfully loaded, stop here.
                    }
                } catch (e) {
                    console.error("Failed to parse saved match history", e);
                }
            }
            // If no valid saved data, create a fresh history.
            const initialGameState = createInitialState(config);
            setHistory({
                states: [{ gameState: initialGameState, time: initialTime }],
                index: 0
            });
            resetClock(initialTime);

        } else {
            // This case handles mid-game config changes. We reset the history.
            const newInitialGameState = createInitialState(config);
            setHistory({
                states: [{ gameState: newInitialGameState, time: initialTime }],
                index: 0
            });
            resetClock(initialTime);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [matchId, config]);

    useEffect(() => {
        if (matchId && history.index > -1) {
            localStorage.setItem(`match-state-${matchId}`, JSON.stringify(history));
            
            // Broadcast only the current state for other tabs
            const currentState = history.states[history.index];
            const dataToBroadcast = { gameState: currentState.gameState, time: time };
            channel.current.postMessage({ matchId, data: dataToBroadcast });
        }
    }, [history, matchId, time]);


    const checkVolleyballWin = useCallback((newGameState: GameState) => {
        if (config?.sport !== Sport.Volleyball || !newGameState.setScores || config?.gameMode !== 'score') return newGameState;

        const { teamA, teamB, setScores, periodScores } = newGameState;
        
        const pointsToWin = config.targetScore ?? 25;
        const aWins = teamA.score >= pointsToWin && teamA.score >= teamB.score + 2;
        const bWins = teamB.score >= pointsToWin && teamB.score >= teamA.score + 2;

        if (aWins || bWins) {
            const newSetScores = { a: setScores.a + (aWins ? 1 : 0), b: setScores.b + (bWins ? 1 : 0) };
            const updatedPeriodScores = [...periodScores, { a: teamA.score, b: teamB.score }];
            
            const setsToWin = Math.ceil(config.periods / 2);
            const matchWinner: 'A' | 'B' | null = newSetScores.a === setsToWin ? 'A' : (newSetScores.b === setsToWin ? 'B' : null);

            if (matchWinner) {
                const winnerName = matchWinner === 'A' ? teamA.name : teamB.name;
                return {
                    ...newGameState,
                    setScores: newSetScores,
                    periodScores: updatedPeriodScores,
                    status: GameStatus.Finished,
                    winner: matchWinner,
                    message: `Match Over - ${winnerName} Wins!`,
                };
            } else {
                 return {
                    ...newGameState,
                    teamA: { ...teamA, score: 0 },
                    teamB: { ...teamB, score: 0 },
                    setScores: newSetScores,
                    periodScores: updatedPeriodScores,
                    status: GameStatus.PeriodBreak,
                    message: `Set ${newGameState.currentPeriod} Winner: ${aWins ? teamA.name : teamB.name}`,
                };
            }
        }
        return newGameState;
    }, [config]);
    
    const updateScore = useCallback((team: 'A' | 'B', delta: number) => {
        setGameState(prev => {
            if (!prev || prev.status === GameStatus.Finished) return prev;
            const baseState = clearNotification(prev);
            
            if (baseState.status === GameStatus.TieBreak && config?.sport === Sport.Volleyball && config.gameMode === 'time') {
                const newScoreValue = team === 'A' ? baseState.teamA.score + delta : baseState.teamB.score + delta;
                const tempState: GameState = {
                    ...baseState,
                    teamA: { ...baseState.teamA, score: team === 'A' ? Math.max(0, newScoreValue) : baseState.teamA.score },
                    teamB: { ...baseState.teamB, score: team === 'B' ? Math.max(0, newScoreValue) : baseState.teamB.score },
                    message: null,
                };

                const sumOfPreviousScoresA = (tempState.periodScores || []).reduce((sum, score) => sum + (score?.a || 0), 0);
                const sumOfPreviousScoresB = (tempState.periodScores || []).reduce((sum, score) => sum + (score?.b || 0), 0);
                const currentPeriodScoreA = tempState.teamA.score - sumOfPreviousScoresA;
                const currentPeriodScoreB = tempState.teamB.score - sumOfPreviousScoresB;

                if (Math.abs(currentPeriodScoreA - currentPeriodScoreB) >= 2) {
                    // Tie broken, end the period
                    return handleEndOfPeriod(tempState);
                }
                return tempState; // Tie not broken yet
            }

            const newScore = team === 'A' ? baseState.teamA.score + delta : baseState.teamB.score + delta;
            const updatedState: GameState = {
                ...baseState,
                teamA: { ...baseState.teamA, score: team === 'A' ? Math.max(0, newScore) : baseState.teamA.score },
                teamB: { ...baseState.teamB, score: team === 'B' ? Math.max(0, newScore) : baseState.teamB.score },
            };

            if (config?.gameMode === 'score' && config.targetScore) {
                const newScoreA = updatedState.teamA.score;
                const newScoreB = updatedState.teamB.score;

                if (newScoreA >= config.targetScore || newScoreB >= config.targetScore) {
                    const winner: 'A' | 'B' = newScoreA >= config.targetScore ? 'A' : 'B';
                    const winnerName = winner === 'A' ? updatedState.teamA.name : updatedState.teamB.name;
                    const finalPeriodScore = { a: updatedState.teamA.score, b: updatedState.teamB.score };
                     return {
                         ...updatedState,
                         status: GameStatus.Finished,
                         winner,
                         message: `Match Over - ${winnerName} Wins!`,
                         periodScores: [...(updatedState.periodScores || []), finalPeriodScore],
                     };
                }
            }

            if (config?.sport === Sport.Volleyball) {
                return checkVolleyballWin(updatedState);
            }
            return updatedState;
        });
    }, [config, checkVolleyballWin, setGameState, handleEndOfPeriod]);

    const startClock = useCallback(() => {
        setGameState(prev => {
            if (!prev || prev.status === GameStatus.Finished) return prev;
            const baseState = clearNotification(prev);
            if (config?.gameMode !== 'score') {
                start();
            }
            return { ...baseState, status: GameStatus.InProgress, pauseReason: null };
        });
    }, [start, config, setGameState]);

    const pauseClock = useCallback(() => {
        setGameState(prev => {
            if (!prev || prev.status === GameStatus.Finished) return prev;
            const baseState = clearNotification(prev);
            if (config?.gameMode !== 'score') {
                pause();
            }
            return { ...baseState, status: GameStatus.Paused };
        });
    }, [pause, config, setGameState]);
    
    const setPauseReason = useCallback((reason: PauseReason) => {
        setGameState(prev => ({ ...clearNotification(prev), pauseReason: reason }));
        setTimeout(() => {
             setGameState(prev => ({ ...prev, pauseReason: null }));
        }, 3000);
    }, [setGameState]);

    const startNextPeriod = useCallback(() => {
        setGameState(prev => {
            if (!config || !prev || (prev.status !== GameStatus.PeriodBreak && prev.status !== GameStatus.NotStarted) || config.gameMode === 'score') {
                return prev;
            }
            
            const isFirstPeriodStart = prev.status === GameStatus.NotStarted;
            const newPeriod = isFirstPeriodStart ? prev.currentPeriod : prev.currentPeriod + 1;
            
            if (newPeriod > config.periods) {
                 return {...clearNotification(prev), status: GameStatus.Finished, message: "Match Over"};
            }
            
            if (config.sport === Sport.Volleyball) {
                resetClock(0);
            } else if (!isFirstPeriodStart) {
                resetClock(initialTime);
            }
            start();

            return {
                ...clearNotification(prev),
                currentPeriod: newPeriod,
                status: GameStatus.InProgress,
                message: null,
            };
        });
    }, [config, resetClock, initialTime, start, setGameState]);

    const reset = useCallback(() => {
       if(config) {
            const initialGameState = createInitialState(config);
            setHistory({
                states: [{ gameState: initialGameState, time: initialTime }],
                index: 0
            });
            resetClock(initialTime);
       }
    }, [config, resetClock, initialTime]);
    
    const getSetScoresFromPeriodScores = (periodScores: GameState['periodScores']) => {
        return (periodScores || []).reduce((acc, score) => {
            if (score && score.a > score.b) acc.a++;
            if (score && score.b > score.a) acc.b++;
            return acc;
        }, { a: 0, b: 0 });
    };

    const goToNextPeriod = useCallback(() => {
        setGameState(prev => {
            if (!config || !prev || isRunning || prev.status === GameStatus.Finished || prev.currentPeriod >= config.periods || config.gameMode === 'score') {
                return prev;
            }

            const currentPeriodScores = prev.periodScores || [];
            const sumOfScoresBeforeCurrentA = currentPeriodScores
                .slice(0, prev.currentPeriod - 1)
                .reduce((sum, score) => sum + (score?.a || 0), 0);
            
            const sumOfScoresBeforeCurrentB = currentPeriodScores
                .slice(0, prev.currentPeriod - 1)
                .reduce((sum, score) => sum + (score?.b || 0), 0);

            const scoreForCurrentPeriodA = prev.teamA.score - sumOfScoresBeforeCurrentA;
            const scoreForCurrentPeriodB = prev.teamB.score - sumOfScoresBeforeCurrentB;

            if (config.sport === Sport.Volleyball && config.gameMode === 'time' && scoreForCurrentPeriodA === scoreForCurrentPeriodB) {
                return {
                    ...prev,
                    notification: { message: 'A set must have a winner. Please add a point to break the tie.' }
                };
            }

            const newPeriodScores = [...currentPeriodScores];
            newPeriodScores[prev.currentPeriod - 1] = { a: scoreForCurrentPeriodA, b: scoreForCurrentPeriodB };
            
            let newSetScores = prev.setScores;
            if (config.sport === Sport.Volleyball) {
                resetClock(0);
                newSetScores = getSetScoresFromPeriodScores(newPeriodScores);
            } else {
                resetClock(initialTime);
            }

            return {
                ...clearNotification(prev),
                currentPeriod: prev.currentPeriod + 1,
                periodScores: newPeriodScores,
                ...(config.sport === Sport.Volleyball && { setScores: newSetScores }),
            };
        });
    }, [config, isRunning, initialTime, resetClock, setGameState]);

    const goToPreviousPeriod = useCallback(() => {
        setGameState(prev => {
            if (!config || !prev || isRunning || prev.status === GameStatus.Finished || prev.currentPeriod <= 1 || config.gameMode === 'score') {
                return prev;
            }
             
            let newSetScores = prev.setScores;
            if (config.sport === Sport.Volleyball) {
                resetClock(0);
                newSetScores = getSetScoresFromPeriodScores((prev.periodScores || []).slice(0, prev.currentPeriod - 2));
            } else {
                resetClock(initialTime);
            }

            return {
                ...clearNotification(prev),
                currentPeriod: prev.currentPeriod - 1,
                 ...(config.sport === Sport.Volleyball && { setScores: newSetScores }),
            };
        });
    }, [config, isRunning, initialTime, resetClock, setGameState]);
    
    const finishMatchManually = useCallback(() => {
        if (config?.gameMode === 'score') return;
        pause();
        setGameState(prev => {
            if (!prev) return prev;
            
            const isDecidingSet = prev.currentPeriod === config.periods && prev.setScores?.a === prev.setScores?.b;

            if (config?.sport === Sport.Volleyball && config?.gameMode === 'time' && isDecidingSet) {
                const sumOfPreviousScoresA = (prev.periodScores || []).reduce((sum, score) => sum + (score?.a || 0), 0);
                const sumOfPreviousScoresB = (prev.periodScores || []).reduce((sum, score) => sum + (score?.b || 0), 0);
                const currentSetScoreA = prev.teamA.score - sumOfPreviousScoresA;
                const currentSetScoreB = prev.teamB.score - sumOfPreviousScoresB;

                if (currentSetScoreA === currentSetScoreB) {
                    return {
                        ...prev,
                        notification: { message: 'Final set cannot end in a tie. A winner must be decided.' }
                    };
                }
            }
            return handleEndOfPeriod(clearNotification(prev));
        });
    }, [handleEndOfPeriod, pause, config, setGameState]);

    const startAction = () => {
        if (gameState?.status === GameStatus.PeriodBreak) {
            startNextPeriod();
        } else {
            startClock();
        }
    };
    
    const undo = useCallback(() => {
        setHistory(prev => {
            const newIndex = Math.max(0, prev.index - 1);
            if (prev.states[newIndex]) {
                setClockTime(prev.states[newIndex].time);
            }
            return { ...prev, index: newIndex };
        });
    }, [setClockTime]);

    const redo = useCallback(() => {
        setHistory(prev => {
            const newIndex = Math.min(prev.states.length - 1, prev.index + 1);
            if (prev.states[newIndex]) {
                setClockTime(prev.states[newIndex].time);
            }
            return { ...prev, index: newIndex };
        });
    }, [setClockTime]);


    const canUndo = history.index > 0;
    const canRedo = history.index < history.states.length - 1;


    const actions = useMemo(() => ({
        start: startAction,
        pause: pauseClock,
        reset,
        updateScore,
        setPauseReason,
        startNextPeriod,
        goToNextPeriod,
        goToPreviousPeriod,
        finishMatchManually,
        undo,
        redo,
    }), [startAction, pauseClock, reset, updateScore, setPauseReason, startNextPeriod, goToNextPeriod, goToPreviousPeriod, finishMatchManually, undo, redo]);

    return { gameState, time, isRunning, actions, canUndo, canRedo };
};
