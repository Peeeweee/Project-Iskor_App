import React from 'react';
import type { MatchConfig, GameState } from '../types';
import { Sport, GameStatus } from '../types';

interface ScoreboardProps {
    config: MatchConfig;
    state: GameState;
    time: number;
    isFullScreen: boolean;
}

const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const TeamScore: React.FC<{ name: string; score: number; color: string; isFinished: boolean }> = ({ name, score, color, isFinished }) => {
    return (
        <div className={`flex flex-col items-center justify-center text-center p-4 rounded-lg relative transition-all duration-300`} style={{ backgroundColor: color }}>
            <h2 
              className="font-display font-bold uppercase text-shadow-heavy text-white tracking-wider truncate w-full"
              style={{ fontSize: 'clamp(1.25rem, 2.5vw, 3.5rem)' }}
            >
              {name}
            </h2>
            <p 
              className="font-display font-bold text-shadow-heavy text-white leading-none"
              style={{ fontSize: 'clamp(4rem, 10vw, 15rem)' }}
            >
              {score}
            </p>
        </div>
    );
};

const VolleyballTeamScore: React.FC<{ name: string; setScore: number; pointScore: number; color: string; }> = ({ name, setScore, pointScore, color }) => (
    <div className={`flex flex-col items-center justify-between text-center p-4 rounded-lg relative transition-all duration-300 h-full`} style={{ backgroundColor: color }}>
        <h2 className="font-display font-bold uppercase text-shadow-heavy text-white tracking-wider truncate w-full" style={{ fontSize: 'clamp(1.25rem, 2.5vw, 3.5rem)' }}>
            {name}
        </h2>
        <p className="font-display font-bold text-shadow-heavy text-white leading-none" style={{ fontSize: 'clamp(4rem, 10vw, 15rem)' }}>
            {setScore}
        </p>
        <div className="bg-black/30 backdrop-blur-sm rounded-md px-4 py-1">
            <h3 className="text-sm font-semibold text-white/80 uppercase">Points</h3>
            <p className="font-mono font-bold text-white text-4xl">{pointScore}</p>
        </div>
    </div>
);


const Scoreboard: React.FC<ScoreboardProps> = ({ config, state, time, isFullScreen }) => {
    const periodLabel = config.sport === Sport.Volleyball ? 'SET' : 'PERIOD';
    const gridClasses = isFullScreen
        ? 'grid grid-cols-1 grid-rows-3 md:grid-rows-1 md:grid-cols-[1fr_auto_1fr] gap-4 w-full h-full'
        : 'grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 w-full';

    const isFinished = state.status === GameStatus.Finished;

    return (
        <div className={`${gridClasses} relative`}>
             {isFinished && <div className="final-badge">FINAL</div>}
             {state.pauseReason && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
                    <h1 className="text-7xl md:text-9xl font-display text-yellow-400 uppercase tracking-widest animate-pulse">
                        {state.pauseReason}
                    </h1>
                </div>
            )}

            {config.sport === Sport.Volleyball ? (
                <VolleyballTeamScore name={state.teamA.name} setScore={state.setScores?.a ?? 0} pointScore={state.teamA.score} color={state.teamA.color} />
            ) : (
                <TeamScore name={state.teamA.name} score={state.teamA.score} color={state.teamA.color} isFinished={isFinished} />
            )}


            <div className="flex flex-col items-center justify-center bg-light-text dark:bg-black p-4 rounded-lg text-white">
                {config.gameMode === 'score' ? (
                    <>
                        <div className="font-mono font-bold leading-none" style={{ fontSize: 'clamp(2.5rem, 5vw, 6rem)' }}>{config.targetScore}</div>
                        <div className="font-display font-semibold uppercase tracking-widest" style={{ fontSize: 'clamp(1rem, 1.5vw, 2.5rem)' }}>
                            Target Score
                        </div>
                        <div className="mt-2 px-4 py-1 rounded-md bg-blue-600/75 backdrop-blur-sm border border-white/20">
                            <p className="font-sans font-semibold uppercase tracking-widest text-sm text-white">
                                {config.sport}
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="font-mono font-bold leading-none" style={{ fontSize: 'clamp(2.5rem, 5vw, 6rem)' }}>{formatTime(time)}</div>
                        <div className={`font-display font-semibold uppercase tracking-widest ${isFinished ? 'opacity-70' : ''}`} style={{ fontSize: 'clamp(1rem, 2vw, 2.5rem)' }}>
                            {periodLabel} {state.currentPeriod}
                        </div>
                        <div className="mt-2 px-4 py-1 rounded-md bg-blue-600/75 backdrop-blur-sm border border-white/20">
                            <p className="font-sans font-semibold uppercase tracking-widest text-sm text-white">
                                {config.sport}
                            </p>
                        </div>
                    </>
                )}
            </div>

            {config.sport === Sport.Volleyball ? (
                <VolleyballTeamScore name={state.teamB.name} setScore={state.setScores?.b ?? 0} pointScore={state.teamB.score} color={state.teamB.color} />
            ) : (
                <TeamScore name={state.teamB.name} score={state.teamB.score} color={state.teamB.color} isFinished={isFinished} />
            )}
        </div>
    );
};

export default Scoreboard;