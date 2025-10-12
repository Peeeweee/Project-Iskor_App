import React, { useMemo } from 'react';

interface LineChartProps {
  data: { x: number | string; y: number }[];
  title: string;
  color?: string;
  yAxisLabel?: string;
  xAxisLabel?: string;
  onClick?: () => void;
}

const LineChart: React.FC<LineChartProps> = ({
  data,
  title,
  color = '#8884d8',
  yAxisLabel,
  xAxisLabel,
  onClick,
}) => {
  const width = 500;
  const height = 300;
  const margin = { top: 20, right: 30, bottom: 40, left: 40 };

  const { path, xTicks, yTicks, yMin, yMax } = useMemo(() => {
    if (data.length === 0) {
      return { path: '', xTicks: [], yTicks: [], yMin: 0, yMax: 0 };
    }

    const yMin = Math.min(...data.map(d => d.y));
    const yMax = Math.max(...data.map(d => d.y));
    
    const xScale = (index: number) => 
      margin.left + (index / (data.length > 1 ? data.length - 1 : 1)) * (width - margin.left - margin.right);

    const yScale = (y: number) => 
      height - margin.bottom - ((y - yMin) / (yMax - yMin || 1)) * (height - margin.top - margin.bottom);

    const path = data
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${yScale(d.y)}`)
      .join(' ');

    const xTicks = data.map((d, i) => ({
      x: xScale(i),
      label: d.x,
    }));

    const yTickCount = 5;
    const yTicks = Array.from({ length: yTickCount }, (_, i) => {
      const value = yMin + (i / (yTickCount - 1)) * (yMax - yMin);
      return {
        y: yScale(value),
        label: value.toFixed(yMax > 10 ? 0 : 2),
      };
    });

    return { path, xTicks, yTicks, yMin, yMax };
  }, [data, height, width, margin]);

  return (
    <div 
        className={`bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-sm relative group ${onClick ? 'cursor-pointer' : ''}`}
        onClick={onClick}
    >
        <div className="flex justify-between items-start">
            <h2 className="text-xl font-bold mb-4">{title}</h2>
        </div>
      <div className="relative">
        <svg width="100%" viewBox={`0 0 ${width} ${height}`}>
          {/* Axes */}
          <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} className="stroke-light-border dark:stroke-dark-border" />
          <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} className="stroke-light-border dark:stroke-dark-border" />

          {/* Y-axis ticks and labels */}
          {yTicks.map((tick, i) => (
            <g key={i} transform={`translate(0, ${tick.y})`}>
              <line x1={margin.left - 5} y1="0" x2={margin.left} y2="0" className="stroke-light-border dark:stroke-dark-border" />
              <text x={margin.left - 10} y="0" dy="0.32em" textAnchor="end" className="text-xs fill-current text-light-text-muted dark:text-dark-text-muted">
                {tick.label}
              </text>
            </g>
          ))}
          {yAxisLabel && (
            <text transform={`rotate(-90)`} y={0} x={-(height/2)} dy="1em" textAnchor="middle" className="text-sm fill-current text-light-text-muted dark:text-dark-text-muted">
              {yAxisLabel}
            </text>
          )}

          {/* X-axis ticks and labels */}
          {xTicks.map((tick, i) => (
            <g key={i} transform={`translate(${tick.x}, 0)`}>
              <line x1="0" y1={height - margin.bottom} x2="0" y2={height - margin.bottom + 5} className="stroke-light-border dark:stroke-dark-border" />
              <text x="0" y={height - margin.bottom + 15} textAnchor="middle" className="text-xs fill-current text-light-text-muted dark:text-dark-text-muted">
                {tick.label}
              </text>
            </g>
          ))}
          {xAxisLabel && (
             <text x={width/2} y={height} textAnchor="middle" className="text-sm fill-current text-light-text-muted dark:text-dark-text-muted">
              {xAxisLabel}
            </text>
          )}

          {/* Line */}
          <path d={path} fill="none" stroke={color} strokeWidth="2" className="animate-chart-bar" />

          {/* Points */}
          {data.map((d, i) => (
            <circle
              key={i}
              cx={margin.left + (i / (data.length > 1 ? data.length - 1 : 1)) * (width - margin.left - margin.right)}
              cy={height - margin.bottom - ((d.y - yMin) / (yMax - yMin || 1)) * (height - margin.top - margin.bottom)}
              r="4"
              fill={color}
              className="animate-chart-bar"
              style={{ animationDelay: `${i * 50}ms` }}
            />
          ))}
        </svg>
      </div>
    </div>
  );
};

export default LineChart;
