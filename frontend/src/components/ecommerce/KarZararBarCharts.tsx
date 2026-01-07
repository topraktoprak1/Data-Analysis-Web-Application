import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../utils/api';

interface BarData {
  name: string;
  value: number;
}

interface ChartProps {
  title: string;
  dimension: string;
  year: string;
}

const KarZararBarChart: React.FC<ChartProps> = ({ title, dimension, year }) => {
  const [data, setData] = useState<BarData[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, [dimension, year]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ dimension, year });
      const result = await apiFetch<{ data: any[] }>(`/api/kar-zarar-trends?${params}`);
      
      // Aggregate total KAR-ZARAR for each dimension value
      const aggregated = result.data.map(series => ({
        name: series.name,
        value: series.data.reduce((sum: number, d: any) => sum + d.value, 0)
      }));
      
      // Sort by value descending and take top 15
      aggregated.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
      setData(aggregated.slice(0, 15));
    } catch (error) {
      console.error(`Error fetching ${dimension} bar data:`, error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Chart dimensions
  const chartWidth = 400;
  const chartHeight = 300;
  const padding = { top: 20, right: 20, bottom: 80, left: 80 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  // Calculate scales
  const maxValue = Math.max(...data.map(d => Math.abs(d.value)), 0);
  const minValue = Math.min(...data.map(d => d.value), 0);
  const yMax = maxValue * 1.1;
  const yMin = minValue < 0 ? minValue * 1.1 : 0;
  const yRange = yMax - yMin;

  const barWidth = plotWidth / Math.max(data.length, 1) * 0.8;
  const barSpacing = plotWidth / Math.max(data.length, 1);

  const yScale = (value: number) => plotHeight - ((value - yMin) / yRange) * plotHeight;

  const formatValue = (value: number) => {
    if (Math.abs(value) >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toFixed(0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]" style={{ height: '400px' }}>
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
      <h3 className="mb-4 text-sm font-semibold text-gray-800 dark:text-white/90">{title}</h3>
      
      <div className="relative">
        <svg width={chartWidth} height={chartHeight}>
          {/* Y-axis grid lines and labels */}
          {[0, 1, 2, 3, 4].map(i => {
          const y = (i / 4) * plotHeight;
          const value = yMax - (i / 4) * yRange;
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={padding.top + y}
                x2={padding.left + plotWidth}
                y2={padding.top + y}
                stroke="currentColor"
                strokeOpacity="0.2"
                strokeDasharray="2,2"
                className="text-gray-400 dark:text-gray-600"
              />
              <text
                x={padding.left - 10}
                y={padding.top + y}
                textAnchor="end"
                alignmentBaseline="middle"
                className="text-xs fill-gray-600 dark:fill-gray-300"
              >
                {formatValue(value)}
              </text>
            </g>
          );
        })}

        {/* Zero line if needed */}
        {minValue < 0 && (
          <line
            x1={padding.left}
            y1={padding.top + yScale(0)}
            x2={padding.left + plotWidth}
            y2={padding.top + yScale(0)}
            stroke="currentColor"
            strokeWidth="2"
            className="text-gray-700 dark:text-gray-400"
          />
        )}

        {/* Bars */}
        {data.map((item, i) => {
          const barHeight = Math.abs(yScale(item.value) - yScale(0));
          const barY = item.value >= 0 ? yScale(item.value) : yScale(0);
          const barX = padding.left + i * barSpacing + (barSpacing - barWidth) / 2;
          
          return (
            <g key={item.name}>
              <rect
                x={barX}
                y={padding.top + barY}
                width={barWidth}
                height={barHeight}
                fill={item.value >= 0 ? '#10B981' : '#EF4444'}
                className="cursor-pointer transition-opacity hover:opacity-80"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
              {/* X-axis labels */}
              <text
                x={barX + barWidth / 2}
                y={padding.top + plotHeight + 15}
                textAnchor="end"
                transform={`rotate(-45 ${barX + barWidth / 2} ${padding.top + plotHeight + 15})`}
                className="text-xs fill-gray-600 dark:fill-gray-300"
              >
                {item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name}
              </text>
            </g>
          );
        })}

        </svg>

        {/* Tooltip - positioned outside SVG to prevent clipping */}
        {hoveredIndex !== null && (
          <div
            className="pointer-events-none absolute rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800"
            style={{
              left: `${padding.left + hoveredIndex * barSpacing + barWidth / 2}px`,
              top: `${Math.max(10, padding.top + yScale(data[hoveredIndex].value) - 50)}px`,
              transform: 'translateX(-50%)',
              zIndex: 50,
            }}
          >
            <div className="text-xs font-medium text-gray-900 dark:text-white whitespace-nowrap">
              {data[hoveredIndex].name}
            </div>
            <div className={`text-sm font-bold ${data[hoveredIndex].value >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {formatValue(data[hoveredIndex].value)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function KarZararBarCharts() {
  const [selectedYear, setSelectedYear] = useState<string>('2025');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          📊 Kar-Zarar by Category
        </h2>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
          <option value="">All Years</option>
          <option value="2023">2023</option>
          <option value="2024">2024</option>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <KarZararBarChart title="By Projects" dimension="projects" year={selectedYear} />
        <KarZararBarChart title="By Company" dimension="company" year={selectedYear} />
        <KarZararBarChart title="By Discipline" dimension="discipline" year={selectedYear} />
        <KarZararBarChart title="By North/South" dimension="northSouth" year={selectedYear} />
        <KarZararBarChart title="By LS/Unit Rate" dimension="lsUnitRate" year={selectedYear} />
      </div>
    </div>
  );
}
