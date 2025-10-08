import { useState, useEffect, useRef, useCallback } from 'react';

export const useGameClock = (initialTime: number, onEnd?: () => void, mode: 'countdown' | 'stopwatch' = 'countdown') => {
    const [time, setTime] = useState(initialTime);
    const timeRef = useRef(initialTime);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef<number | null>(null);
    const onEndRef = useRef(onEnd);

    useEffect(() => {
        timeRef.current = time;
    }, [time]);

    useEffect(() => {
        onEndRef.current = onEnd;
    }, [onEnd]);

    const cleanup = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = window.setInterval(() => {
                if (mode === 'countdown') {
                    setTime(prevTime => {
                        if (prevTime <= 1) {
                            cleanup();
                            setIsRunning(false);
                            if (onEndRef.current) {
                               onEndRef.current();
                            }
                            return 0;
                        }
                        return prevTime - 1;
                    });
                } else { // stopwatch mode
                    setTime(prevTime => prevTime + 1);
                }
            }, 1000);
        } else {
            cleanup();
        }

        return cleanup;
    }, [isRunning, mode]);

    const start = useCallback(() => {
        // For countdown, don't start if time is 0
        if (mode === 'countdown' && time <= 0) {
            return;
        }
        setIsRunning(true);
    }, [time, mode]);

    const pause = useCallback(() => {
        setIsRunning(false);
    }, []);
    
    const reset = useCallback((newTime: number) => {
        setIsRunning(false);
        setTime(newTime);
    }, []);

    return { time, timeRef, isRunning, start, pause, reset, setTime };
};