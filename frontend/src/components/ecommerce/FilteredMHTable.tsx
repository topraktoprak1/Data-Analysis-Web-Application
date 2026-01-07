import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { apiFetch } from '../../utils/api';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterState {
  nameSurname: string[];
  discipline: string[];
  company: string[];
  projectsGroup: string[];
  scope: string[];
  projects: string[];
  nationality: string[];
  status: string[];
  northSouth: string[];
  control1: string[];
  no1: string[];
  no2: string[];
  no3: string[];
  no10: string[];
  kontrol1: string[];
  kontrol2: string[];
  lsUnitRate: string[];
}

interface TableData {
  nameSurname: string;
  discipline: string;
  company: string;
  projectsGroup: string;
  scope: string;
  projects: string;
  nationality: string;
  status: string;
  monthlyMH: { [key: string]: number };
  totalMH: number;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const YEARS = ['2023', '2024', '2025', '2026'];

const FILTER_LABELS: { [key: string]: string } = {
  nameSurname: 'Name',
  discipline: 'Discipline',
  company: 'Company',
  projectsGroup: 'Projects/Group',
  scope: 'Scope',
  projects: 'Projects',
  nationality: 'Nationality',
  status: 'Status',
  northSouth: 'North/ South',
  control1: 'Control-1',
  no1: 'NO-1',
  no2: 'NO-2',
  no3: 'NO-3',
  no10: 'NO-10',
  kontrol1: 'Konrol-1',
  kontrol2: 'Knrtol-2',
  lsUnitRate: 'LS/Unit Rate',
};

export default function FilteredMHTable() {
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>(''); // Empty = All Years
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState<TableData[]>([]);
  const [filterOptions, setFilterOptions] = useState<{ [key: string]: FilterOption[] }>({});
  const [filters, setFilters] = useState<FilterState>({
    nameSurname: [],
    discipline: [],
    company: [],
    projectsGroup: [],
    scope: [],
    projects: [],
    nationality: [],
    status: [],
    northSouth: [],
    control1: [],
    no1: [],
    no2: [],
    no3: [],
    no10: [],
    kontrol1: [],
    kontrol2: [],
    lsUnitRate: [],
  });
  const filterDebounceTimer = useRef<number | null>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    fetchFilterOptions();
    fetchTableData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchTableData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, selectedMonth]);

  // Debounced refetch for filters (both options and table data)
  useEffect(() => {
    // Skip debounce on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    if (filterDebounceTimer.current) {
      clearTimeout(filterDebounceTimer.current);
    }
    
    filterDebounceTimer.current = setTimeout(() => {
      fetchFilterOptions();
      fetchTableData();
    }, 300); // 300ms debounce
    
    return () => {
      if (filterDebounceTimer.current) {
        clearTimeout(filterDebounceTimer.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchFilterOptions = async () => {
    try {
      const params = new URLSearchParams({
        filters: JSON.stringify(filters),
      });
      const result = await apiFetch<{ [key: string]: FilterOption[] }>(`/api/filter-options?${params}`);
      setFilterOptions(result);
    } catch (error) {
      console.error('[FilteredMHTable] Error fetching filter options:', error);
      setFilterOptions({});
    }
  };

  const fetchTableData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        year: selectedYear,
        month: selectedMonth,
        filters: JSON.stringify(filters),
      });
      const result = await apiFetch<{ data: TableData[] }>(`/api/mh-table-data?${params}`);
      setTableData(result.data || []);
    } catch (error) {
      console.error('[FilteredMHTable] Error fetching table data:', error);
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterKey: keyof FilterState, value: string) => {
    React.startTransition(() => {
      setFilters(prev => {
        const currentValues = prev[filterKey];
        const newValues = currentValues.includes(value)
          ? currentValues.filter(v => v !== value)
          : [...currentValues, value];
        return { ...prev, [filterKey]: newValues };
      });
    });
  };

  const clearAllFilters = () => {
    setFilters({
      nameSurname: [],
      discipline: [],
      company: [],
      projectsGroup: [],
      scope: [],
      projects: [],
      nationality: [],
      status: [],
      northSouth: [],
      control1: [],
      no1: [],
      no2: [],
      no3: [],
      no10: [],
      kontrol1: [],
      kontrol2: [],
      lsUnitRate: [],
    });
  };

  const FilterSection = React.memo(({ 
    title, 
    filterKey, 
    options 
  }: { 
    title: string; 
    filterKey: keyof FilterState; 
    options: FilterOption[] 
  }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const selectedValues = filters[filterKey];
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Use Set for faster lookup
    const selectedSet = useMemo(() => new Set(selectedValues), [selectedValues]);

    // Filter options based on search term with useMemo
    const filteredOptions = useMemo(() => {
      if (!searchTerm) return options;
      const lowerSearch = searchTerm.toLowerCase();
      return options.filter(option => option.label.toLowerCase().includes(lowerSearch));
    }, [options, searchTerm]);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsExpanded(false);
        }
      };

      if (isExpanded) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isExpanded]);

    return (
      <div className="mb-3" ref={dropdownRef}>
        <div className="relative">
          {/* Trigger Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-left text-sm text-gray-700 hover:border-primary dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{title}</span>
              <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} text-xs`}></i>
            </div>
          </button>

          {/* Dropdown Panel */}
          {isExpanded && (
            <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-300 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-800">
              {/* Selected Pills */}
              {selectedValues.length > 0 && (
                <div className="border-b border-gray-200 p-2 dark:border-gray-700">
                  <div className="flex flex-wrap gap-1">
                    {selectedValues.map(value => {
                      const option = options.find(opt => opt.value === value);
                      return (
                        <span
                          key={value}
                          className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-xs text-white"
                        >
                          {option?.label || value}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              handleFilterChange(filterKey, value);
                            }}
                            className="hover:text-gray-200"
                            type="button"
                          >
                            <i className="fas fa-times text-xs"></i>
                          </button>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Search Input */}
              <div className="border-b border-gray-200 p-2 dark:border-gray-700">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className="w-full rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 placeholder-gray-400 focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-500"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              
              {/* Options List */}
              <div className="max-h-60 overflow-y-auto">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map(option => {
                    const isSelected = selectedSet.has(option.value);
                    return (
                      <div
                        key={option.value}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFilterChange(filterKey, option.value);
                        }}
                        className="flex w-full cursor-pointer items-center justify-between px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                      >
                        <span>{option.label}</span>
                        {isSelected && (
                          <i className="fas fa-check text-primary"></i>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    {options.length === 0 ? 'No options available' : 'No matches found'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  });

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            📊 Man-Hour Analysis by Filters
          </h3>
          <div className="flex gap-3">
            {/* Year Selector */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">All Years</option>
              {YEARS.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            
            {/* Month Selector */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">All Months</option>
              {MONTHS.map((month, idx) => (
                <option key={month} value={(idx + 1).toString().padStart(2, '0')}>
                  {month}
                </option>
              ))}
            </select>

            <button
              onClick={clearAllFilters}
              className="rounded-lg bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600"
            >
              <i className="fas fa-eraser mr-2"></i>
              Clear All
            </button>
          </div>
        </div>

        {/* Active Filters Display */}
        {Object.entries(filters).some(([, values]) => values.length > 0) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(filters).map(([filterKey, values]) => {
              if (values.length === 0) return null;
              
              return values.map((value: string) => (
                <span
                  key={`${filterKey}-${value}`}
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1.5 text-sm font-medium text-white"
                >
                  <span className="text-xs opacity-75">{FILTER_LABELS[filterKey]}:</span>
                  <span>{value}</span>
                  <button
                    onClick={() => handleFilterChange(filterKey as keyof FilterState, value)}
                    className="hover:text-gray-200"
                    title="Remove filter"
                  >
                    <i className="fas fa-times text-xs"></i>
                  </button>
                </span>
              ));
            })}
          </div>
        )}
      </div>

      <div className="flex">
        {/* Filters Sidebar */}
        <div
          className={`transition-all duration-300 ${
            filtersExpanded ? 'w-64' : 'w-12'
          } border-r border-gray-200 dark:border-gray-800`}
        >
          <div className="sticky top-0">
            <button
              onClick={() => setFiltersExpanded(!filtersExpanded)}
              className="w-full border-b border-gray-200 p-3 text-center hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
              title={filtersExpanded ? 'Collapse filters' : 'Expand filters'}
            >
              <i className={`fas fa-${filtersExpanded ? 'angle-left' : 'angle-right'}`}></i>
            </button>

            {filtersExpanded && (
              <div className="max-h-[600px] overflow-y-auto p-4">
                <h4 className="mb-4 text-sm font-bold text-gray-700 dark:text-gray-300">
                  Filters
                </h4>

                <FilterSection 
                  title="Name Surname" 
                  filterKey="nameSurname" 
                  options={filterOptions.nameSurname || []} 
                />
                <FilterSection 
                  title="Discipline" 
                  filterKey="discipline" 
                  options={filterOptions.discipline || []} 
                />
                <FilterSection 
                  title="Company" 
                  filterKey="company" 
                  options={filterOptions.company || []} 
                />
                <FilterSection 
                  title="Projects/Group" 
                  filterKey="projectsGroup" 
                  options={filterOptions.projectsGroup || []} 
                />
                <FilterSection 
                  title="Scope" 
                  filterKey="scope" 
                  options={filterOptions.scope || []} 
                />
                <FilterSection 
                  title="Projects" 
                  filterKey="projects" 
                  options={filterOptions.projects || []} 
                />
                <FilterSection 
                  title="Nationality" 
                  filterKey="nationality" 
                  options={filterOptions.nationality || []} 
                />
                <FilterSection 
                  title="Status" 
                  filterKey="status" 
                  options={filterOptions.status || []} 
                />
                <FilterSection 
                  title="North/South" 
                  filterKey="northSouth" 
                  options={filterOptions.northSouth || []} 
                />
                <FilterSection 
                  title="Control-1" 
                  filterKey="control1" 
                  options={filterOptions.control1 || []} 
                />
                <FilterSection 
                  title="NO-1" 
                  filterKey="no1" 
                  options={filterOptions.no1 || []} 
                />
                <FilterSection 
                  title="NO-2" 
                  filterKey="no2" 
                  options={filterOptions.no2 || []} 
                />
                <FilterSection 
                  title="NO-3" 
                  filterKey="no3" 
                  options={filterOptions.no3 || []} 
                />
                <FilterSection 
                  title="NO-10" 
                  filterKey="no10" 
                  options={filterOptions.no10 || []} 
                />
                <FilterSection 
                  title="Kontrol-1" 
                  filterKey="kontrol1" 
                  options={filterOptions.kontrol1 || []} 
                />
                <FilterSection 
                  title="Kontrol-2" 
                  filterKey="kontrol2" 
                  options={filterOptions.kontrol2 || []} 
                />
                <FilterSection 
                  title="LS/Unit Rate" 
                  filterKey="lsUnitRate" 
                  options={filterOptions.lsUnitRate || []} 
                />
              </div>
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : (
            <div className="p-6">
              {tableData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Discipline
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Company
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Projects/Group
                        </th>
                        {selectedMonth ? (
                          <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">
                            {MONTHS[parseInt(selectedMonth) - 1]} {selectedYear} MH
                          </th>
                        ) : (
                          MONTHS.map((month) => (
                            <th 
                              key={month}
                              className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300"
                            >
                              {month.slice(0, 3)}
                            </th>
                          ))
                        )}
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Total MH
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.map((row, idx) => (
                        <tr 
                          key={idx}
                          className="border-b border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/30"
                        >
                          <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-300">
                            {row.nameSurname}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {row.discipline}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {row.company}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {row.projectsGroup}
                          </td>
                          {selectedMonth ? (
                            <td className="px-4 py-3 text-right text-sm font-semibold text-gray-800 dark:text-gray-300">
                              {row.monthlyMH[selectedMonth]?.toFixed(2) || '0.00'}
                            </td>
                          ) : (
                            MONTHS.map((_, monthIdx) => {
                              const monthKey = (monthIdx + 1).toString().padStart(2, '0');
                              return (
                                <td 
                                  key={monthKey}
                                  className="px-4 py-3 text-right text-sm text-gray-800 dark:text-gray-300"
                                >
                                  {row.monthlyMH[monthKey]?.toFixed(2) || '-'}
                                </td>
                              );
                            })
                          )}
                          <td className="px-4 py-3 text-right text-sm font-bold text-primary">
                            {row.totalMH.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="border-t-2 border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                      <tr>
                        <td 
                          colSpan={4} 
                          className="px-4 py-3 text-sm font-bold text-gray-800 dark:text-gray-300"
                        >
                          Total
                        </td>
                        {selectedMonth ? (
                          <td className="px-4 py-3 text-right text-sm font-bold text-gray-800 dark:text-gray-300">
                            {tableData.reduce((sum, row) => sum + (row.monthlyMH[selectedMonth] || 0), 0).toFixed(2)}
                          </td>
                        ) : (
                          MONTHS.map((_, monthIdx) => {
                            const monthKey = (monthIdx + 1).toString().padStart(2, '0');
                            const total = tableData.reduce((sum, row) => sum + (row.monthlyMH[monthKey] || 0), 0);
                            return (
                              <td 
                                key={monthKey}
                                className="px-4 py-3 text-right text-sm font-bold text-gray-800 dark:text-gray-300"
                              >
                                {total.toFixed(2)}
                              </td>
                            );
                          })
                        )}
                        <td className="px-4 py-3 text-right text-sm font-bold text-primary">
                          {tableData.reduce((sum, row) => sum + row.totalMH, 0).toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                  <i className="fas fa-table mb-3 text-4xl"></i>
                  <p>No data available for the selected filters</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
