import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../utils/api';

interface PieSlice {
  name: string;
  value: number;
  percentage: number;
}

interface ChartProps {
  title: string;
  dimension: string;
  year: string;
}

const TotalMHPieChart: React.FC<ChartProps> = ({ title, dimension, year }) => {
  const [data, setData] = useState<PieSlice[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchData();
  }, [dimension, year]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ dimension, year });
      const result = await apiFetch<{ data: PieSlice[] }>(`/api/total-mh-pie?${params}`);
      
      // Show all items
      setData(result.data);
      // Select all items by default on first load
      setSelectedIndices(new Set(result.data.map((_, i) => i)));
    } catch (error) {
      console.error(`Error fetching ${dimension} pie data:`, error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

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

  // Chart dimensions
  const size = 280;
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = Math.min(size, size) / 2 - 30;

  // Color palette
  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#06B6D4', '#84CC16'
  ];

  // Filter data based on selection - if items are selected, show only those
  const filteredData = selectedIndices.size > 0 
    ? data.filter((_, index) => selectedIndices.has(index))
    : []; // Show nothing when no selection

  // Calculate pie slices based on filtered data
  const total = filteredData.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = -Math.PI / 2; // Start at top

  const slices = filteredData.map((item) => {
    // Find original index for color consistency
    const originalIndex = data.findIndex(d => d.name === item.name);
    
    const percentage = total > 0 ? (item.value / total) * 100 : 0;
    const angle = (percentage / 100) * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    
    // Calculate path
    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);
    
    const largeArcFlag = angle > Math.PI ? 1 : 0;
    
    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');

    currentAngle = endAngle;

    return {
      ...item,
      pathData,
      color: colors[originalIndex % colors.length],
      percentage,
      midAngle: startAngle + angle / 2,
      originalIndex
    };
  });

  // Create all legend items with original data for display
  const allSlicesForLegend = data.map((item, index) => {
    const isInFiltered = filteredData.some(d => d.name === item.name);
    const percentage = isInFiltered 
      ? (total > 0 ? (item.value / total) * 100 : 0)
      : (data.reduce((sum, d) => sum + d.value, 0) > 0 ? (item.value / data.reduce((sum, d) => sum + d.value, 0)) * 100 : 0);
    
    return {
      ...item,
      color: colors[index % colors.length],
      percentage,
      originalIndex: index
    };
  });

  const formatValue = (value: number) => {
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toFixed(0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]" style={{ height: '400px' }}>
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]" style={{ height: '400px' }}>
        <div className="text-gray-500 dark:text-gray-400">No data available</div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
      <h3 className="mb-4 text-sm font-semibold text-gray-800 dark:text-white/90">{title}</h3>
      
      <div className="flex flex-col items-center">
        {filteredData.length === 0 ? (
          // Empty state when nothing is selected
          <div className="flex flex-col items-center justify-center" style={{ height: size }}>
            <svg width={size} height={size}>
              <circle
                cx={centerX}
                cy={centerY}
                r={radius}
                fill="#F3F4F6"
                className="dark:fill-gray-800"
              />
              <text
                x={centerX}
                y={centerY}
                textAnchor="middle"
                className="text-sm fill-gray-500 dark:fill-gray-400"
              >
                No selection
              </text>
            </svg>
          </div>
        ) : (
        <svg width={size} height={size} className="mb-4">
          {slices.map((slice) => {
            const isHovered = hoveredIndex === slice.originalIndex;
            const opacity = isHovered ? 0.8 : 1;
            
            return (
              <g key={slice.name}>
                <path
                  d={slice.pathData}
                  fill={slice.color}
                  className="cursor-pointer transition-opacity duration-200"
                  style={{ opacity }}
                  onMouseEnter={() => setHoveredIndex(slice.originalIndex)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => toggleSelection(slice.originalIndex)}
                />
              </g>
            );
          })}

          {/* Center label */}
          <text
            x={centerX}
            y={centerY - 10}
            textAnchor="middle"
            className="text-xs fill-gray-600 dark:fill-gray-300"
          >
            Total MH
          </text>
          <text
            x={centerX}
            y={centerY + 10}
            textAnchor="middle"
            className="text-lg font-bold fill-gray-800 dark:fill-white"
          >
            {formatValue(total)}
          </text>

          {/* Tooltip */}
          {hoveredIndex !== null && (() => {
            const hoveredSlice = slices.find(s => s.originalIndex === hoveredIndex);
            if (!hoveredSlice) return null;
            
            return (
              <foreignObject
                x={centerX - 75}
                y={10}
                width="150"
                height="50"
              >
                <div className="rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                  <div className="text-xs font-medium text-gray-900 dark:text-white">
                    {hoveredSlice.name}
                  </div>
                  <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {formatValue(hoveredSlice.value)} MH
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {hoveredSlice.percentage.toFixed(1)}%
                  </div>
                </div>
              </foreignObject>
            );
          })()}
        </svg>
        )}

        {/* Selection Control Buttons */}
        <div className="mb-3 flex w-full gap-2">
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

        {/* Legend */}
        <div className="grid w-full grid-cols-2 gap-2">
          {allSlicesForLegend.map((slice) => {
            const isSelected = selectedIndices.has(slice.originalIndex);
            const hasSelection = selectedIndices.size > 0;
            const opacity = hasSelection && !isSelected ? 0.4 : 1;
            
            return (
              <div
                key={slice.name}
                className="flex items-center gap-2 cursor-pointer rounded-md px-2 py-1 transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
                style={{ opacity }}
                onMouseEnter={() => setHoveredIndex(slice.originalIndex)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => toggleSelection(slice.originalIndex)}
              >
                <div
                  className="h-3 w-3 rounded-sm transition-transform"
                  style={{ 
                    backgroundColor: slice.color,
                    transform: isSelected ? 'scale(1.2)' : 'scale(1)',
                    boxShadow: isSelected ? '0 0 0 2px rgba(59, 130, 246, 0.5)' : 'none'
                  }}
                />
                <div className="flex-1 overflow-hidden">
                  <div className={`truncate text-xs ${isSelected ? 'font-semibold' : ''} text-gray-700 dark:text-gray-300`}>
                    {slice.name}
                  </div>
                  <div className={`text-xs font-medium ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                    {slice.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default function TotalMHPieCharts() {
  const [selectedYear, setSelectedYear] = useState<string>('2025');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          ⏱️ Total MH Distribution
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
        <TotalMHPieChart title="By Projects/Groups" dimension="projects/group" year={selectedYear} />
        <TotalMHPieChart title="By Company" dimension="company" year={selectedYear} />
        <TotalMHPieChart title="By Discipline" dimension="discipline" year={selectedYear} />
        <TotalMHPieChart title="By North/South" dimension="northSouth" year={selectedYear} />
        <TotalMHPieChart title="By LS/Unit Rate" dimension="lsUnitRate" year={selectedYear} />
        <TotalMHPieChart title="By AP-CB/Subcon" dimension="apcbSubcon" year={selectedYear} />
      </div>
    </div>
  );
}
