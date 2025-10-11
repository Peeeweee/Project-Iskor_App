import React from 'react';

interface RadarChartProps {
  data: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      color: string;
      fillColor: string;
    }[];
  };
  title: string;
  onClick?: () => void;
}

const RadarChart: React.FC<RadarChartProps> = ({ data, title, onClick }) => {
  const size = 300;
  const center = size / 2;
  const radius = center - 30;
  const numLevels = 5;

  const { points, levelLines, axisLines } = React.useMemo(() => {
    const angleSlice = (Math.PI * 2) / data.labels.length;
    const maxValues = data.datasets.map(dataset => Math.max(...dataset.data));
    const maxValue = Math.max(...maxValues);

    const levelLines = Array.from({ length: numLevels }, (_, i) => {
      const levelRadius = radius * ((i + 1) / numLevels);
      const points = data.labels.map((_, j) => {
        const x = center + levelRadius * Math.cos(angleSlice * j - Math.PI / 2);
        const y = center + levelRadius * Math.sin(angleSlice * j - Math.PI / 2);
        return `${x},${y}`;
      }).join(' ');
      return `M ${points} Z`;
    });

    const axisLines = data.labels.map((_, i) => {
      const x = center + radius * Math.cos(angleSlice * i - Math.PI / 2);
      const y = center + radius * Math.sin(angleSlice * i - Math.PI / 2);
      return { x1: center, y1: center, x2: x, y2: y };
    });

    const points = data.datasets.map(dataset => {
      const pointString = dataset.data.map((value, i) => {
        const r = (value / maxValue) * radius;
        const x = center + r * Math.cos(angleSlice * i - Math.PI / 2);
        const y = center + r * Math.sin(angleSlice * i - Math.PI / 2);
        return `${x},${y}`;
      }).join(' ');
      return pointString;
    });

    return { points, levelLines, axisLines };
  }, [data, radius, center]);

  return (
    <div 
        className={`bg-light-card dark:bg-dark-card p-6 rounded-xl shadow-sm relative group ${onClick ? 'cursor-pointer' : ''}`}
        onClick={onClick}
    >
        <div className="flex justify-between items-start">
            <h2 className="text-xl font-bold mb-4">{title}</h2>
        </div>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Level Lines */}
          {levelLines.map((d, i) => (
            <path key={i} d={d} fill="none" className="stroke-light-border dark:stroke-dark-border" />
          ))}

          {/* Axis Lines */}
          {axisLines.map((line, i) => (
            <line key={i} {...line} className="stroke-light-border dark:stroke-dark-border" />
          ))}
          
          {/* Axis Labels */}
          {data.labels.map((label, i) => {
            const angle = (Math.PI * 2 / data.labels.length) * i - Math.PI / 2;
            const x = center + (radius + 15) * Math.cos(angle);
            const y = center + (radius + 15) * Math.sin(angle);
            return (
              <text key={label} x={x} y={y} textAnchor="middle" dy="0.32em" className="text-xs fill-current text-light-text-muted dark:text-dark-text-muted">
                {label}
              </text>
            );
          })}

          {/* Data Polygons */}
          {points.map((pointString, i) => (
            <polygon
              key={i}
              points={pointString}
              stroke={data.datasets[i].color}
              fill={data.datasets[i].fillColor}
              strokeWidth="2"
              className="animate-chart-bar"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </svg>
      </div>
       <div className="flex justify-center items-center gap-4 mt-4 text-xs">
          {data.datasets.map(dataset => (
              <div key={dataset.label} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: dataset.color }}></span>
                  <span>{dataset.label}</span>
              </div>
          ))}
      </div>
    </div>
  );
};

export default RadarChart;
