import React, { useState } from 'react';

interface HistogramChartProps {
    data: Array<{
        label: string;
        value: number;
    }>;
    title: string;
    color?: string;
    onClick?: (label: string) => void;
}

const HistogramChart: React.FC<HistogramChartProps> = ({ data, title, color = 'var(--color-brand-blue)', onClick }) => {
    const [hoveredBar, setHoveredBar] = useState<string | null>(null);
    const maxValue = data.length > 0 ? Math.max(...data.map(d => d.value)) : 0;
    const noData = !data || data.every(d => d.value === 0);

    // The container height is 200px, so we calculate pixel height against that.
    const containerHeight = 200;

    const handleBarClick = (label: string) => {
        if (onClick) {
            onClick(label);
        }
    };

    return (
        <div 
            className={`bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-sm relative group`}
        >
            <div className="flex justify-between items-start">
                <h2 className="text-xl font-bold mb-4">{title}</h2>
            </div>
            {noData ? (
                <div className="flex items-center justify-center h-[200px] text-light-text-muted dark:text-dark-text-muted">
                    No data available
                </div>
            ) : (
                <div style={{ height: `${containerHeight}px`, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', gap: '0.5rem' }}>
                    {data.map((d, index) => {
                        const barHeightInPixels = maxValue > 0 ? (d.value / maxValue) * containerHeight : 0;
                        const isHovered = hoveredBar === d.label;

                        return (
                            <div 
                                key={d.label} 
                                onMouseEnter={() => setHoveredBar(d.label)}
                                onMouseLeave={() => setHoveredBar(null)}
                                onClick={() => handleBarClick(d.label)}
                                style={{ flex: '1 1 0%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem', position: 'relative', cursor: onClick ? 'pointer' : 'default' }}
                            >
                                {isHovered && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '-2rem',
                                        background: 'rgba(0, 0, 0, 0.7)',
                                        color: 'white',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '4px',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold',
                                        zIndex: 10,
                                    }}>
                                        {d.value}
                                    </div>
                                )}
                                <div
                                    style={{
                                        width: '100%',
                                        height: `${barHeightInPixels}px`,
                                        backgroundColor: color,
                                        borderRadius: '4px 4px 0 0',
                                        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                                        opacity: hoveredBar === null || isHovered ? 1 : 0.7,
                                        transformOrigin: 'bottom',
                                        transition: 'transform 0.2s ease, opacity 0.2s ease, height 0.4s ease-out',
                                        transitionDelay: `${index * 25}ms`,
                                    }}
                                />
                                <span className="text-xs text-light-text-muted dark:text-dark-text-muted">{d.label}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default HistogramChart;
