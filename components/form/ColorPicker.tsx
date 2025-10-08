import React, { useRef } from 'react';
import { TEAM_COLORS } from '../../constants';
import PaletteIcon from '../icons/PaletteIcon';

interface ColorPickerProps {
    selectedColor: string;
    onSelect: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ selectedColor, onSelect }) => {
    const colorInputRef = useRef<HTMLInputElement>(null);
    
    // Normalize for comparison to handle hex case differences.
    const isCustomColorSelected = !TEAM_COLORS.some(c => c.toLowerCase() === selectedColor.toLowerCase());

    const handleCustomColorClick = () => {
        if (colorInputRef.current) {
            colorInputRef.current.click();
        }
    };
    
    const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSelect(e.target.value);
    };

    return (
        <div className="flex flex-wrap items-center gap-2">
            {TEAM_COLORS.map(color => (
                <button
                    key={color}
                    type="button"
                    onClick={() => onSelect(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform duration-150 ${selectedColor.toLowerCase() === color.toLowerCase() ? 'border-light-text dark:border-dark-text scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                    aria-label={`Select color ${color}`}
                />
            ))}
            
            <div className="relative">
                <button
                    type="button"
                    onClick={handleCustomColorClick}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-transform duration-150
                    ${isCustomColorSelected ? 'border-light-text dark:border-dark-text scale-110' : 'border-transparent bg-light-card-secondary dark:bg-dark-card-secondary hover:border-light-text-muted dark:hover:border-dark-text-muted'}`}
                    style={{ 
                        backgroundColor: isCustomColorSelected ? selectedColor : undefined,
                    }}
                    aria-label="Select a custom color"
                >
                    {!isCustomColorSelected && <PaletteIcon className="w-5 h-5 text-light-text-muted dark:text-dark-text-muted" />}
                </button>
                <input
                    ref={colorInputRef}
                    type="color"
                    value={selectedColor}
                    onChange={handleCustomColorChange}
                    className="absolute opacity-0 w-0 h-0 pointer-events-none"
                    aria-hidden="true"
                    tabIndex={-1}
                />
            </div>
        </div>
    );
};

export default ColorPicker;
