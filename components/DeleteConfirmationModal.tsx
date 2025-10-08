import React, { useState, useEffect } from 'react';

interface DeleteConfirmationModalProps {
  itemName: string;
  onCancel: () => void;
  onConfirm: () => void;
  itemType: string; // e.g., 'match' or 'team'
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ itemName, onCancel, onConfirm, itemType }) => {
    const [inputValue, setInputValue] = useState('');
    const [isConfirmed, setIsConfirmed] = useState(false);

    useEffect(() => {
        // Trim whitespace and compare case-insensitively
        setIsConfirmed(inputValue.trim().toLowerCase() === itemName.trim().toLowerCase());
    }, [inputValue, itemName]);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="rounded-xl p-8 w-full max-w-md mx-4 bg-light-card text-light-text dark:bg-dark-card dark:text-dark-text shadow-2xl border border-brand-red/50 animate-modal-scale-in">
                <h3 className="text-2xl font-bold font-display mb-4 text-brand-red">Confirm Deletion</h3>
                <p className="text-light-text-muted dark:text-dark-text-muted mb-6">
                    This action is irreversible. The {itemType} will be permanently deleted.
                    To confirm, please type "<strong className="text-light-text dark:text-dark-text break-all">{itemName}</strong>" in the box below.
                </p>
                
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full bg-light-card-secondary border-light-border dark:bg-dark-card-secondary dark:border-dark-border p-2 rounded-md border focus:ring-2 focus:ring-brand-red focus:border-brand-red outline-none mb-6 font-mono"
                    aria-label={`Type ${itemName} to confirm deletion`}
                    autoFocus
                />

                <div className="flex justify-end gap-4">
                    <button
                        onClick={onCancel}
                        className="font-bold py-2 px-6 rounded-lg bg-light-card-secondary hover:bg-light-border dark:bg-dark-card-secondary dark:hover:bg-dark-border"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={!isConfirmed}
                        className="bg-brand-red hover:bg-opacity-90 disabled:bg-brand-red/40 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-lg"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmationModal;
