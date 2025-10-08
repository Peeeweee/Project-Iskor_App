import React from 'react';

const SlidersIcon: React.FC<{ className?: string }> = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 16v-2m8-10V4m0 16v-2M4 14V4m0 16v-2m8-4v-2m0 6v2M4 8h16M4 16h16" />
    </svg>
);

export default SlidersIcon;
