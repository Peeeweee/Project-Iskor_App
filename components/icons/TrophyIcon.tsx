import React from 'react';

interface TrophyIconProps {
    className?: string;
}

const TrophyIcon: React.FC<TrophyIconProps> = ({ className = "h-20 w-20 md:h-24 md:w-24 text-yellow-400" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a9.75 9.75 0 011.05-4.293l.25-1.002a2.25 2.25 0 011.968-1.63H12a2.25 2.25 0 011.968 1.63l.25 1.002A9.75 9.75 0 0116.5 18.75z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 9.75h.008v.008h-.008v-.008zm-13.5 0h.008v.008h-.008v-.008z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 11.25V21M8.25 6h7.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c2.485 0 4.5 2.015 4.5 4.5v.75H7.5V6.75c0-2.485 2.015-4.5 4.5-4.5z" />
    </svg>
);

export default TrophyIcon;
