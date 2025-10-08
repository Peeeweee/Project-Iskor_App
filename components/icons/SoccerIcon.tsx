import React from 'react';

interface IconProps {
    className?: string;
}

const SoccerIcon: React.FC<IconProps> = ({ className = "h-7 w-7" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M12 2l-2.8 4.8-4.8 2.8 2.8 4.8 4.8-2.8z"></path>
        <path d="M12 22l2.8-4.8 4.8-2.8-2.8-4.8-4.8 2.8z"></path>
        <path d="M2 12l4.8 2.8 2.8-4.8-4.8-2.8z"></path>
        <path d="M22 12l-4.8-2.8-2.8 4.8 4.8 2.8z"></path>
    </svg>
);

export default SoccerIcon;