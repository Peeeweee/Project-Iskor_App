import React from 'react';

interface BarChartProps {
    data: Array<{
        label: string;
        color: string;
        totalGames: number;
        values: Array<{ value: number; color: string; label: string; }>;
    }>;
    title: string;
}

const BarChart: React.FC<BarChartProps> = ({ data, title }) => {

    const legendItems = data.length > 0
        ? data[0].values.map(v => ({ label: v.label, color: v.color }))
        : [];

    return (
        <div className="bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-sm">
            <h2 className="text-xl font-bold mb-4">{title}</h2>
            <div className="space-y-4">
                {data.map((d, index) => {
                    return (
                        <div 
                            key={d.label}
                            className="animate-slide-in-bottom bar-row-hover"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="flex justify-between items-center mb-1 text-sm">
                                <span className="font-bold" style={{ color: d.color }}>{d.label}</span>
                                <span className="font-mono font-semibold">{d.totalGames} GP</span>
                            </div>
                            <div className="w-full bg-light-card-secondary dark:bg-dark-card-secondary rounded-full h-6 flex overflow-hidden">
                                {d.values.map(v => {
                                    const barWidth = d.totalGames > 0 ? (v.value / d.totalGames) * 100 : 0;
                                    return (
                                        <div
                                            key={v.label}
                                            className="h-full animate-chart-bar"
                                            style={{
                                                width: `${barWidth}%`,
                                                backgroundColor: v.color,
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="flex justify-end items-center gap-4 mt-4 text-xs">
                {legendItems.map(item => (
                    <div key={item.label} className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                        <span>{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BarChart;