import React, { useState, useEffect } from 'react';

interface DonutChartProps {
    data: Array<{ label: string; value: number; color: string }>;
    title: string;
    onClick?: () => void;
}

const DonutChart: React.FC<DonutChartProps> = ({ data, title, onClick }) => {
    const [isMounted, setIsMounted] = useState(false);
    const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => setIsMounted(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const size = 180;
    const strokeWidth = 22;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const total = data.reduce((sum, item) => sum + item.value, 0);

    const sortedData = [...data].sort((a, b) => b.value - a.value);

    let cumulativePct = 0;

    return (
        <div 
            className={`bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-sm ${onClick ? 'cursor-pointer' : ''}`}
            onClick={onClick}
        >
            <h2 className="text-xl font-bold mb-4">{title}</h2>
            <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
                    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
                         <defs>
                            {data.map(item => (
                                <filter key={`glow-${item.label}`} id={`glow-${item.label}`}>
                                    <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor={item.color} floodOpacity="0.7" />
                                </filter>
                            ))}
                        </defs>
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            strokeWidth={strokeWidth}
                            className="stroke-light-card-secondary dark:stroke-dark-card-secondary"
                        />
                        {sortedData.map((item, index) => {
                            const pct = total > 0 ? item.value / total : 0;
                            const dashOffset = circumference * (1 - pct);
                            const rotation = cumulativePct * 360;
                            cumulativePct += pct;
                            
                            const isHovered = hoveredLabel === item.label;
                            const isDimmed = hoveredLabel !== null && !isHovered;

                            return (
                                <g 
                                    key={item.label}
                                    transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
                                    onMouseEnter={() => setHoveredLabel(item.label)}
                                    onMouseLeave={() => setHoveredLabel(null)}
                                >
                                    <circle
                                        cx={size / 2}
                                        cy={size / 2}
                                        r={radius}
                                        fill="none"
                                        stroke={item.color}
                                        strokeWidth={strokeWidth}
                                        strokeDasharray={circumference}
                                        strokeDashoffset={isMounted ? dashOffset : circumference}
                                        filter={isHovered ? `url(#glow-${item.label})` : undefined}
                                        style={{
                                            transition: 'stroke-dashoffset 1s cubic-bezier(0.5, 0, 0.5, 1), transform 0.3s, opacity 0.3s, filter 0.3s',
                                            transitionDelay: `${index * 150}ms`,
                                            strokeLinecap: 'round',
                                            transformOrigin: '50% 50%',
                                            transform: `scale(${isHovered ? 1.05 : 1})`,
                                            opacity: isDimmed ? 0.3 : 1
                                        }}
                                    />
                                </g>
                            );
                        })}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold font-display">{total}</span>
                        <span className="text-sm text-light-text-muted dark:text-dark-text-muted">Matches</span>
                    </div>
                </div>
                <ul className="space-y-2 text-sm w-full">
                    {data.map(item => {
                        const isHovered = hoveredLabel === item.label;
                        const isDimmed = hoveredLabel !== null && !isHovered;
                        return (
                            <li 
                                key={item.label} 
                                className={`flex items-center gap-2 cursor-pointer transition-all duration-200 ${isHovered ? 'scale-110 font-bold -translate-y-px' : ''} ${isDimmed ? 'opacity-50' : ''}`}
                                onMouseEnter={() => setHoveredLabel(item.label)}
                                onMouseLeave={() => setHoveredLabel(null)}
                            >
                                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                                <span className="font-semibold truncate">{item.label}:</span>
                                <span className="text-light-text-muted dark:text-dark-text-muted whitespace-nowrap">{item.value} ({total > 0 ? ((item.value / total) * 100).toFixed(0) : 0}%)</span>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};

export default DonutChart;
