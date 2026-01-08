import React, { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '../../utils/api';

interface BarData {
  name: string;
  value: number;
}

interface ChartProps {
  title: string;
  dimension: string;
  year: string;
  metric: 'karZarar' | 'totalMH';
}

const KarZararBarChart: React.FC<ChartProps> = ({ title, dimension, year, metric }) => {
  const [data, setData] = useState<BarData[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ dimension, year, metric });
      const result = await apiFetch<{ data: any[] }>(`/api/kar-zarar-trends?${params}`);
      
      // Aggregate total for each dimension value
      const aggregated = result.data.map(series => ({
        name: series.name,
        value: series.data.reduce((sum: number, d: any) => sum + d.value, 0)
      }));
      
      // Sort by value descending and take top 15
      aggregated.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
      setData(aggregated.slice(0, 15));
      // Select all items by default on first load
      setSelectedIndices(new Set(aggregated.slice(0, 15).map((_, i) => i)));
    } catch (error) {
      console.error(`Error fetching ${dimension} bar data:`, error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [dimension, year, metric]);

  const toggleSelection = (index: number) => {
    setSelectedIndices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter data based on selection - if items are selected, show only those
  const displayData = selectedIndices.size > 0
    ? data.filter((_, index) => selectedIndices.has(index))
    : []; // Show nothing when no selection

  // Chart dimensions
  const chartWidth = 400;
  const chartHeight = 300;
  const padding = { top: 20, right: 20, bottom: 80, left: 80 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  // Calculate scales based on displayData
  const maxValue = Math.max(...displayData.map(d => Math.abs(d.value)), 0);
  const minValue = Math.min(...displayData.map(d => d.value), 0);
  const yMax = maxValue * 1.1;
  const yMin = minValue < 0 ? minValue * 1.1 : 0;
  const yRange = yMax - yMin;

  const barWidth = plotWidth / Math.max(displayData.length, 1) * 0.8;
  const barSpacing = plotWidth / Math.max(displayData.length, 1);

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
        {displayData.length === 0 ? (
          // Empty state when nothing is selected
          <div className="flex items-center justify-center" style={{ width: chartWidth, height: chartHeight }}>
            <div className="text-center text-gray-500 dark:text-gray-400">
              <i className="fas fa-mouse-pointer mb-2 text-2xl"></i>
              <p className="text-sm">Select items to view</p>
            </div>
          </div>
        ) : (
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
        {displayData.map((item, i) => {
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
                fill={metric === 'totalMH' ? '#3B82F6' : (item.value >= 0 ? '#10B981' : '#EF4444')}
                className="cursor-pointer transition-opacity hover:opacity-80"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => {
                  const originalIndex = data.findIndex(d => d.name === item.name);
                  toggleSelection(originalIndex);
                }}
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
        )}

        {/* Tooltip - positioned outside SVG to prevent clipping */}
        {hoveredIndex !== null && hoveredIndex < displayData.length && displayData.length > 0 && (
          <div
            className="pointer-events-none absolute rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800"
            style={{
              left: `${padding.left + hoveredIndex * barSpacing + barWidth / 2}px`,
              top: `${Math.max(10, padding.top + yScale(displayData[hoveredIndex].value) - 50)}px`,
              transform: 'translateX(-50%)',
              zIndex: 50,
            }}
          >
            <div className="text-xs font-medium text-gray-900 dark:text-white whitespace-nowrap">
              {displayData[hoveredIndex].name}
            </div>
            <div className={`text-sm font-bold ${
              metric === 'totalMH' 
                ? 'text-blue-600 dark:text-blue-400' 
                : (displayData[hoveredIndex].value >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')
            }`}>
              {formatValue(displayData[hoveredIndex].value)}{metric === 'totalMH' ? ' MH' : ''}
            </div>
          </div>
        )}

        {/* Selection Control Buttons */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setSelectedIndices(new Set(data.map((_, i) => i)))}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <i className="fas fa-check-double mr-1"></i>
            Select All
          </button>
          <button
            onClick={() => setSelectedIndices(new Set())}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <i className="fas fa-times-circle mr-1"></i>
            Deselect All
          </button>
        </div>

        {/* Legend for selection */}
        <div className="mt-4 max-h-40 overflow-y-auto">
          <div className="grid grid-cols-2 gap-1">
            {data.map((item, index) => {
              const isSelected = selectedIndices.has(index);
              const hasSelection = selectedIndices.size > 0;
              const opacity = hasSelection && !isSelected ? 0.4 : 1;
              const color = metric === 'totalMH' ? '#3B82F6' : (item.value >= 0 ? '#10B981' : '#EF4444');
              
              return (
                <div
                  key={item.name}
                  className="flex items-center gap-1 cursor-pointer rounded px-2 py-1 transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
                  style={{ opacity }}
                  onClick={() => toggleSelection(index)}
                >
                  <div
                    className="h-3 w-3 rounded-sm transition-transform"
                    style={{
                      backgroundColor: color,
                      transform: isSelected ? 'scale(1.2)' : 'scale(1)',
                      boxShadow: isSelected ? '0 0 0 2px rgba(59, 130, 246, 0.5)' : 'none'
                    }}
                  />
                  <div className="flex-1 overflow-hidden">
                    <div className={`truncate text-xs ${isSelected ? 'font-semibold' : ''} text-gray-700 dark:text-gray-300`} title={item.name}>
                      {item.name.length > 12 ? item.name.substring(0, 12) + '...' : item.name}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function KarZararBarCharts() {
  const [selectedYear, setSelectedYear] = useState<string>('2025');
  const [metric, setMetric] = useState<'karZarar' | 'totalMH'>('karZarar');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          📊 {metric === 'karZarar' ? 'Kar-Zarar by Category' : 'Total MH by Category'}
        </h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">Metric:</span>
            <button
              onClick={() => setMetric(metric === 'karZarar' ? 'totalMH' : 'karZarar')}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
            >
              <span>{metric === 'karZarar' ? '💰 KAR-ZARAR' : '⏱️ TOTAL MH'}</span>
              <i className="fas fa-sync-alt text-xs"></i>
            </button>
          </div>
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
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <KarZararBarChart title="By Projects" dimension="projects" year={selectedYear} metric={metric} />
        <KarZararBarChart title="By Company" dimension="company" year={selectedYear} metric={metric} />
        <KarZararBarChart title="By Discipline" dimension="discipline" year={selectedYear} metric={metric} />
        <KarZararBarChart title="By North/South" dimension="northSouth" year={selectedYear} metric={metric} />
        <KarZararBarChart title="By LS/Unit Rate" dimension="lsUnitRate" year={selectedYear} metric={metric} />
      </div>
    </div>
  );
}
