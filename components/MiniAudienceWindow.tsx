import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { MatchConfig, Theme } from '../types';
import AudienceView from './AudienceView';
import PictureInPictureIcon from './icons/PictureInPictureIcon';
import MinimizeIcon from './icons/MinimizeIcon';
import RestoreIcon from './icons/RestoreIcon';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';

interface MiniAudienceWindowProps {
    config: MatchConfig;
    matchId: string;
    onClose: () => void;
    theme: Theme;
    toggleTheme: (e: React.MouseEvent) => void;
}

const useDraggable = (ref: React.RefObject<HTMLDivElement>) => {
    const [position, setPosition] = useState({ x: 50, y: 50 });
    const isDraggingRef = useRef(false);
    const offsetRef = useRef({ x: 0, y: 0 });

    const onMouseDown = useCallback((e: React.MouseEvent) => {
        if (ref.current && !(e.target as HTMLElement).closest('button')) {
            isDraggingRef.current = true;
            const rect = ref.current.getBoundingClientRect();
            offsetRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            };
            document.body.style.cursor = 'grabbing';
            document.body.style.userSelect = 'none';
        }
    }, [ref]);

    const onMouseUp = useCallback(() => {
        isDraggingRef.current = false;
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
    }, []);

    const onMouseMove = useCallback((e: MouseEvent) => {
        if (isDraggingRef.current) {
            setPosition({
                x: e.clientX - offsetRef.current.x,
                y: e.clientY - offsetRef.current.y,
            });
        }
    }, []);

    useEffect(() => {
        const mouseMoveHandler = (e: MouseEvent) => onMouseMove(e);
        const mouseUpHandler = () => onMouseUp();
        
        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
        
        return () => {
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
        };
    }, [onMouseMove, onMouseUp]);

    return { position, onMouseDown };
};


const MiniAudienceWindow: React.FC<MiniAudienceWindowProps> = ({ config, matchId, onClose, theme, toggleTheme }) => {
    const windowRef = useRef<HTMLDivElement>(null);
    const { position, onMouseDown } = useDraggable(windowRef);
    const [isMinimized, setIsMinimized] = useState(false);
    const lastSizeRef = useRef({ width: 480, height: 270 });
    
    const isDarkTheme = ['dark', 'viola', 'coder'].includes(theme);

    const toggleMinimize = () => {
        const element = windowRef.current;
        if (!element) return;

        if (isMinimized) {
            // Restore: apply the last known size before restoring state
            element.style.width = `${lastSizeRef.current.width}px`;
            element.style.height = `${lastSizeRef.current.height}px`;
        } else {
             const rect = element.getBoundingClientRect();
             lastSizeRef.current = { width: rect.width, height: rect.height };
        }
        setIsMinimized(p => !p);
    };

    return (
        <div
            ref={windowRef}
            className={`fixed z-50 bg-dark-card shadow-2xl rounded-lg border border-dark-border overflow-hidden transition-all duration-300 w-[480px]`}
            style={{ 
                left: `${position.x}px`, 
                top: `${position.y}px`, 
                aspectRatio: isMinimized ? 'auto' : '16 / 9',
                resize: isMinimized ? 'none' : 'both',
                ...(isMinimized && { width: '240px', height: 'auto' })
            }}
        >
            <div 
                className="h-8 bg-dark-card-secondary flex items-center justify-between px-2 cursor-grab"
                onMouseDown={onMouseDown}
            >
                <div className="flex items-center gap-2 text-xs text-dark-text-muted">
                    <PictureInPictureIcon />
                    <span>Audience Projector</span>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={toggleTheme} className="p-1 rounded-full hover:bg-dark-border text-dark-text-muted hover:text-dark-text" title="Toggle Theme">
                        {isDarkTheme ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
                    </button>
                    <button onClick={toggleMinimize} className="p-1 rounded-full hover:bg-dark-border text-dark-text-muted hover:text-dark-text" title={isMinimized ? 'Restore' : 'Minimize'}>
                        {isMinimized ? <RestoreIcon /> : <MinimizeIcon />}
                    </button>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-dark-border text-dark-text-muted hover:text-dark-text" title="Close">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
            {!isMinimized && (
                <div className="w-full h-[calc(100%-2rem)]">
                     <AudienceView
                        config={config}
                        matchId={matchId}
                        onExit={onClose} 
                        theme={theme}
                        isPreview={true} // Set to true to hide internal controls
                    />
                </div>
            )}
        </div>
    );
};

export default MiniAudienceWindow;