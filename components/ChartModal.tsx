// components/ChartModal.tsx
import React from 'react';

interface ChartModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const ChartModal: React.FC<ChartModalProps> = ({ title, onClose, children }) => {
  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-modal-scale-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="chart-modal-title"
    >
      <div
        className="bg-light-background dark:bg-dark-background rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col p-6 md:p-8 shadow-2xl relative"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-light-card-secondary/80 hover:bg-light-border dark:bg-dark-card-secondary/80 dark:hover:bg-dark-border z-10"
          aria-label="Close chart view"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h2 id="chart-modal-title" className="text-2xl font-bold mb-4">{title}</h2>
        <div className="flex-grow overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ChartModal;
