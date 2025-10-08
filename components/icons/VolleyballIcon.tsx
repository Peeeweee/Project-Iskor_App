import React from 'react';

interface IconProps {
    className?: string;
}

const VolleyballIcon: React.FC<IconProps> = ({ className = "h-7 w-7" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M12 2c-3 3-3 8 0 10s3 7 0 10"></path>
        <path d="M12 2c3 3 3 8 0 10s-3 7 0 10"></path>
        <path d="M2 12c3-3 8-3 10 0s7 3 10 0"></path>
    </svg>
);

export default VolleyballIcon;