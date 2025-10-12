
import React from 'react';
import CheckIcon from './icons/CheckIcon';
import TrophyIcon from './icons/TrophyIcon';

interface OvertimeModalProps {
  onAddOvertime: () => void;
  onFinishAsDraw: () => void;
}

const OvertimeModal: React.FC<OvertimeModalProps> = ({ onAddOvertime, onFinishAsDraw }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="rounded-xl p-8 w-full max-w-md mx-4 bg-light-card text-light-text dark:bg-dark-card dark:text-dark-text shadow-2xl">
        <h3 className="text-2xl font-bold font-display mb-4 text-center">Game Tied!</h3>
        <p className="text-light-text-muted dark:text-dark-text-muted mb-8 text-center">
          The match has ended in a draw. What would you like to do?
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onFinishAsDraw}
            className="font-bold py-3 px-6 rounded-lg bg-light-card-secondary hover:bg-light-border dark:bg-dark-card-secondary dark:hover:bg-dark-border flex items-center gap-2 transition-transform transform hover:scale-105"
          >
            <TrophyIcon className="h-5 w-5" />
            Finish as Draw
          </button>
          <button
            onClick={onAddOvertime}
            className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-transform transform hover:scale-105"
          >
            <CheckIcon className="h-5 w-5" />
            Add Overtime
          </button>
        </div>
      </div>
    </div>
  );
};

export default OvertimeModal;
