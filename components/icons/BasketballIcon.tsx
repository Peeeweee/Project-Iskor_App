import React from 'react';

interface IconProps {
    className?: string;
}

const BasketballIcon: React.FC<IconProps> = ({ className = "h-7 w-7" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M12 2a10 10 0 0 0-10 10c0 9 5 10 5 10"></path>
        <path d="M12 22a10 10 0 0 0 10-10c0-9-5-10-5-10"></path>
        <path d="M2 12h20"></path>
    </svg>
);

export default BasketballIcon;