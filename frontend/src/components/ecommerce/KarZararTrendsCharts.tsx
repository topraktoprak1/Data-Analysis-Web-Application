import React, { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '../../utils/api';

interface DataPoint {
  month: string;
  value: number;
}

interface SeriesData {
  name: string;
  data: DataPoint[];
}

interface ChartProps {
  title: string;
  dimension: string;
  year: string;
  metric: 'karZarar' | 'totalMH';
}

const KarZararChart: React.FC<ChartProps> = ({ title, dimension, year, metric }) => {
  const [data, setData] = useState<SeriesData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeries, setSelectedSeries] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredPoint, setHoveredPoint] = useState<{
    name: string;
    month: string;
    value: number;
    x: number;
    y: number;
  } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ dimension, year, metric });
      const result = await apiFetch<{ data: SeriesData[] }>(`/api/kar-zarar-trends?${params}`);
      setData(result.data || []);
      // Select all series by default on first load
      setSelectedSeries(new Set(result.data.map(s => s.name)));
    } catch (error) {
      console.error(`Error fetching ${dimension} trends:`, error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [dimension, year, metric]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleSeries = (name: string) => {
    setSelectedSeries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(name)) {
        newSet.delete(name);
      } else {
        newSet.add(name);
      }
      return newSet;
    });
  };

  // Filter data based on search term
  const filteredData = data.filter(series =>
    series.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get display data - show only selected series if any are selected
  const displayData = selectedSeries.size > 0
    ? filteredData.filter(s => selectedSeries.has(s.name))
    : []; // Show nothing when no selection

  // Get all unique months across all series
  const allMonths = Array.from(
    new Set(displayData.flatMap(series => series.data.map(d => d.month)))
  ).sort();

  // Calculate min/max for Y-axis based on display data
  const allValues = displayData.flatMap(s => s.data.map(d => d.value));
  const minValue = allValues.length > 0 ? Math.min(...allValues, 0) : 0;
  const maxValue = allValues.length > 0 ? Math.max(...allValues, 0) : 0;
  const valueRange = maxValue - minValue;
  const yMin = minValue - valueRange * 0.1;
  const yMax = maxValue + valueRange * 0.1;

  // Chart dimensions
  const chartWidth = 450;
  const chartHeight = 200;
  const padding = { top: 20, right: 20, bottom: 40, left: 60 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  // Color palette
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#EC4899', '#14B8A6', '#F97316', '#6366F1'
  ];

  const getColor = (index: number) => colors[index % colors.length];

  // Scale functions
  const xScale = (index: number) => (index / Math.max(allMonths.length - 1, 1)) * plotWidth;
  const yScale = (value: number) => plotHeight - ((value - yMin) / (yMax - yMin)) * plotHeight;

  // Format month for display
  const formatMonth = (month: string) => {
    const [, m] = month.split('-');
    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][parseInt(m) - 1] || month;
  };

  // Format value for display
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
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-white/90">{title}</h3>
      </div>
      
      <div className="flex gap-4">
        {/* Chart */}
        <div className="relative flex-1">
          {displayData.length === 0 ? (
            // Empty state when nothing is selected
            <div className="flex items-center justify-center" style={{ width: chartWidth, height: chartHeight }}>
              <div className="text-center text-gray-500 dark:text-gray-400">
                <i className="fas fa-chart-line mb-2 text-2xl"></i>
                <p className="text-sm">Select series to view trends</p>
              </div>
            </div>
          ) : (
          <svg width={chartWidth} height={chartHeight} className="overflow-visible">
            {/* Y-axis grid lines */}
            {[0, 1, 2, 3, 4].map(i => {
              const y = (i / 4) * plotHeight;
              const value = yMax - (i / 4) * (yMax - yMin);
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

            {/* X-axis labels */}
            {allMonths.map((month, i) => {
              if (i % Math.ceil(allMonths.length / 6) !== 0) return null;
              const x = xScale(i);
              return (
                <text
                  key={month}
                  x={padding.left + x}
                  y={padding.top + plotHeight + 20}
                  textAnchor="middle"
                  className="text-xs fill-gray-600 dark:fill-gray-300"
                >
                  {formatMonth(month)}
                </text>
              );
            })}

            {/* Plot lines */}
            {displayData.map((series) => {
              // Find original index for consistent coloring
              const originalIndex = data.findIndex(s => s.name === series.name);

              const points = allMonths.map((month, i) => {
                const dataPoint = series.data.find(d => d.month === month);
                const value = dataPoint ? dataPoint.value : null;
                return {
                  x: padding.left + xScale(i),
                  y: value !== null ? padding.top + yScale(value) : null,
                  value: value,
                  month: month
                };
              }).filter(p => p.y !== null);

              if (points.length === 0) return null;

              const pathData = points
                .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
                .join(' ');

              return (
                <g key={series.name}>
                  <path
                    d={pathData}
                    stroke={getColor(originalIndex)}
                    strokeWidth="2"
                    fill="none"
                  />
                  {points.map((point, i) => (
                    <circle
                      key={i}
                      cx={point.x}
                      cy={point.y!}
                      r="4"
                      fill={getColor(originalIndex)}
                      className="cursor-pointer transition-all hover:r-6"
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredPoint({
                          name: series.name,
                          month: point.month,
                          value: point.value!,
                          x: rect.left + rect.width / 2,
                          y: rect.top
                        });
                      }}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  ))}
                </g>
              );
            })}
          </svg>
          )
          }

          {/* Tooltip */}
          {hoveredPoint && displayData.length > 0 && (
            <div
              className="pointer-events-none fixed z-50 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-lg dark:border-gray-600 dark:bg-gray-800"
              style={{
                left: `${hoveredPoint.x}px`,
                top: `${hoveredPoint.y - 60}px`,
                transform: 'translateX(-50%)'
              }}
            >
              <div className="font-semibold text-gray-800 dark:text-white">{hoveredPoint.name}</div>
              <div className="text-gray-600 dark:text-gray-400">{formatMonth(hoveredPoint.month)}</div>
              <div className="font-bold text-primary">{formatValue(hoveredPoint.value)}</div>
            </div>
          )}
        </div>

        {/* Legend with enhanced selection UI */}
        <div className="w-48">
          {/* Search box */}
          <div className="mb-2">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Selection Control Buttons */}
          <div className="mb-2 flex gap-1">
            <button
              onClick={() => setSelectedSeries(new Set(filteredData.map(s => s.name)))}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <i className="fas fa-check-double mr-1"></i>
              All
            </button>
            <button
              onClick={() => setSelectedSeries(new Set())}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <i className="fas fa-times-circle mr-1"></i>
              None
            </button>
          </div>

          {/* Legend items */}
          <div className="overflow-y-auto" style={{ maxHeight: '240px' }}>
          <div className="space-y-1">
            {filteredData.map((series) => {
              const originalIndex = data.findIndex(s => s.name === series.name);
              const total = series.data.reduce((sum, d) => sum + d.value, 0);
              const isSelected = selectedSeries.has(series.name);
              const hasSelection = selectedSeries.size > 0;
              const opacity = hasSelection && !isSelected ? 0.4 : 1;
              
              return (
                <div
                  key={series.name}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-xs transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
                  style={{ opacity }}
                  onClick={() => toggleSeries(series.name)}
                >
                  <div
                    className="h-3 w-3 rounded-full transition-transform"
                    style={{
                      backgroundColor: getColor(originalIndex),
                      transform: isSelected ? 'scale(1.2)' : 'scale(1)',
                      boxShadow: isSelected ? '0 0 0 2px rgba(59, 130, 246, 0.5)' : 'none'
                    }}
                  />
                  <div className="flex-1 truncate">
                    <div className={`truncate ${isSelected ? 'font-semibold' : ''} text-gray-700 dark:text-gray-300`} title={series.name}>
                      {series.name}
                    </div>
                    <div className={`font-semibold text-xs ${isSelected ? 'text-blue-600 dark:text-blue-400' : ''}`} style={{ color: isSelected ? undefined : getColor(originalIndex) }}>
                      {formatValue(total)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function KarZararTrendsCharts() {
  const [selectedYear, setSelectedYear] = useState<string>('2025');
  const [metric, setMetric] = useState<'karZarar' | 'totalMH'>('karZarar');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          📈 {metric === 'karZarar' ? 'Kar-Zarar Trend Analysis' : 'Total MH Trend Analysis'}
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-2">
        <KarZararChart title="By Name/Surname" dimension="nameSurname" year={selectedYear} metric={metric} />
        <KarZararChart title="By Discipline" dimension="discipline" year={selectedYear} metric={metric} />
        <KarZararChart title="By Projects/Group" dimension="projectsGroup" year={selectedYear} metric={metric} />
        <KarZararChart title="By Scope" dimension="scope" year={selectedYear} metric={metric} />
        <KarZararChart title="By Projects" dimension="projects" year={selectedYear} metric={metric} />
      </div>
    </div>
  );
}
