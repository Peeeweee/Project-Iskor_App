import React from 'react';
import type { Match } from '../types';
import { Sport } from '../types';
import SportIcon from './SportIcon';
import TrophyIcon from './icons/TrophyIcon';

interface MatchDetailModalProps {
  match: Match;
  onClose: () => void;
}

const MatchDetailModal: React.FC<MatchDetailModalProps> = ({ match, onClose }) => {
  const { teamA, teamB, sport, finalScoreA, finalScoreB, periodScores } = match;

  const isTie = finalScoreA === finalScoreB;
  const winner = (finalScoreA ?? 0) > (finalScoreB ?? 0) ? teamA : teamB;

  const renderBoxScore = () => {
    if (!periodScores) {
      return <p>No box score data available.</p>;
    }

    const periods = Array.from({ length: match.periods }, (_, i) => i + 1);

    return (
      <table className="w-full text-left mt-4">
        <thead>
          <tr className="border-b border-light-border dark:border-dark-border">
            <th className="p-2">Team</th>
            {periods.map(p => <th key={p} className="p-2 text-center">{sport === Sport.Basketball ? `Q${p}`: `P${p}`}</th>)}
            <th className="p-2 text-center font-bold">Final</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-light-border dark:border-dark-border">
            <td className="p-2 font-bold" style={{ color: teamA.color }}>{teamA.name}</td>
            {periods.map(p => <td key={p} className="p-2 text-center font-mono">{periodScores[p-1]?.a ?? '-'}</td>)}
            <td className="p-2 text-center font-mono font-bold">{finalScoreA}</td>
          </tr>
          <tr>
            <td className="p-2 font-bold" style={{ color: teamB.color }}>{teamB.name}</td>
            {periods.map(p => <td key={p} className="p-2 text-center font-mono">{periodScores[p-1]?.b ?? '-'}</td>)}
            <td className="p-2 text-center font-mono font-bold">{finalScoreB}</td>
          </tr>
        </tbody>
      </table>
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-modal-scale-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="match-details-title"
    >
      <div
        className="bg-light-background dark:bg-dark-background rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col p-6 md:p-8 shadow-2xl relative"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-light-card-secondary/80 hover:bg-light-border dark:bg-dark-card-secondary/80 dark:hover:bg-dark-border z-10"
          aria-label="Close match details"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="flex-shrink-0 pb-4 border-b border-light-border dark:border-dark-border">
            <div className="flex items-center gap-3">
                <SportIcon sport={sport} className="w-8 h-8" />
                <div>
                    <h2 id="match-details-title" className="text-3xl font-bold font-display">
                        Match Details
                    </h2>
                    <p className="text-sm text-light-text-muted dark:text-dark-text-muted">{sport}</p>
                </div>
            </div>
          <div className="flex items-center justify-between mt-4 text-light-text-muted dark:text-dark-text-muted">
            <span className="font-semibold text-lg" style={{ color: teamA.color }}>{teamA.name}</span>
            <span className="font-bold text-4xl font-display">{finalScoreA} - {finalScoreB}</span>
            <span className="font-semibold text-lg" style={{ color: teamB.color }}>{teamB.name}</span>
          </div>
            {!isTie && (
                <div className="mt-4 flex items-center justify-center text-center font-semibold text-yellow-500">
                    <TrophyIcon className="h-6 w-6 mr-2" />
                    <span className="text-lg">Winner: {winner.name}</span>
                </div>
            )}
        </div>

        <div className="flex-grow overflow-y-auto mt-4">
            <h3 className="font-bold mb-2 text-lg">Box Score</h3>
            {renderBoxScore()}
        </div>
      </div>
    </div>
  );
};

export default MatchDetailModal;
