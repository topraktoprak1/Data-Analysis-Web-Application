import React, { useState, useEffect, useRef, useMemo } from 'react';
import { apiFetch } from '../../utils/api';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import '../../styles/ag-grid-custom.css';
import type { ColDef, GridReadyEvent } from 'ag-grid-community';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

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

const FILTER_STORAGE_KEY = 'filteredMHTable_filters';
const YEAR_STORAGE_KEY = 'filteredMHTable_year';
const MONTH_STORAGE_KEY = 'filteredMHTable_month';

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
  
  // Load initial state from localStorage
  const loadStoredFilters = (): FilterState => {
    try {
      const stored = localStorage.getItem(FILTER_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('[FilteredMHTable] Error loading stored filters:', error);
    }
    return {
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
    };
  };
  
  const loadStoredYear = (): string => {
    try {
      return localStorage.getItem(YEAR_STORAGE_KEY) || '';
    } catch (error) {
      console.error('[FilteredMHTable] Error loading stored year:', error);
      return '';
    }
  };
  
  const loadStoredMonth = (): string => {
    try {
      return localStorage.getItem(MONTH_STORAGE_KEY) || '';
    } catch (error) {
      console.error('[FilteredMHTable] Error loading stored month:', error);
      return '';
    }
  };
  
  const [selectedYear, setSelectedYear] = useState<string>(loadStoredYear());
  const [selectedMonth, setSelectedMonth] = useState<string>(loadStoredMonth());
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState<TableData[]>([]);
  const [filterOptions, setFilterOptions] = useState<{ [key: string]: FilterOption[] }>({});
  const [validFilterOptions, setValidFilterOptions] = useState<{ [key: string]: string[] }>({});
  const [filters, setFilters] = useState<FilterState>(loadStoredFilters());
  const itemsPerPage = 50; // AG Grid will handle pagination
  const filterDebounceTimer = useRef<number | null>(null);
  const isInitialMount = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [isFiltering, setIsFiltering] = useState(false);
  const [activeLozengeFilter, setActiveLozengeFilter] = useState<keyof FilterState | null>(null);
  const lozengeDropdownRef = useRef<HTMLDivElement>(null);
  const filterSectionRefs = useRef<{ [key: string]: { scrollTo: () => void; expand: () => void } }>({});

  // Save filters to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
      console.log('[FilteredMHTable] Saved filters to localStorage');
    } catch (error) {
      console.error('[FilteredMHTable] Error saving filters:', error);
    }
  }, [filters]);

  // Save year to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(YEAR_STORAGE_KEY, selectedYear);
    } catch (error) {
      console.error('[FilteredMHTable] Error saving year:', error);
    }
  }, [selectedYear]);

  // Save month to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(MONTH_STORAGE_KEY, selectedMonth);
    } catch (error) {
      console.error('[FilteredMHTable] Error saving month:', error);
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchFilterOptions();
    fetchValidFilterOptions();
    fetchTableData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchTableData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, selectedMonth]);

  // Close lozenge dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (lozengeDropdownRef.current && !lozengeDropdownRef.current.contains(event.target as Node)) {
        setActiveLozengeFilter(null);
      }
    };

    if (activeLozengeFilter) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeLozengeFilter]);

  // Live filtering with request cancellation
  useEffect(() => {
    // Skip debounce on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    console.log('[FilteredMHTable] Filters changed, scheduling live refetch...');
    
    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Clear existing timer
    if (filterDebounceTimer.current) {
      clearTimeout(filterDebounceTimer.current);
    }
    
    // Show filtering indicator immediately
    setIsFiltering(true);
    
    // Reduced debounce for live filtering (150ms for better UX)
    filterDebounceTimer.current = setTimeout(() => {
      console.log('[FilteredMHTable] Executing live refetch');
      // Refetch valid options for strikethrough visualization and table data
      fetchValidFilterOptions();
      fetchTableData();
    }, 150);
    
    return () => {
      if (filterDebounceTimer.current) {
        clearTimeout(filterDebounceTimer.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchFilterOptions = async () => {
    try {
      // Fetch all filter options without cascading (no filters parameter)
      const result = await apiFetch<{ [key: string]: FilterOption[] }>(
        `/api/filter-options`
      );
      setFilterOptions(result);
      setIsFiltering(false);
    } catch (error: unknown) {
      console.error('[FilteredMHTable] Error fetching filter options:', error);
      setFilterOptions({});
      setIsFiltering(false);
    }
  };

  const fetchValidFilterOptions = async () => {
    try {
      // Fetch valid options based on current filters (for strikethrough visualization)
      const params = new URLSearchParams({
        filters: JSON.stringify(filters),
      });
      const result = await apiFetch<{ [key: string]: FilterOption[] }>(
        `/api/filter-options?${params}`
      );
      // Convert to Set of valid values for each filter key
      const validSets: { [key: string]: string[] } = {};
      Object.entries(result).forEach(([key, options]) => {
        validSets[key] = options.map(opt => opt.value);
      });
      setValidFilterOptions(validSets);
    } catch (error: unknown) {
      console.error('[FilteredMHTable] Error fetching valid filter options:', error);
      setValidFilterOptions({});
    }
  };

  const fetchTableData = async () => {
    try {
      setLoading(true);
      
      // Create new AbortController for this request
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      
      const params = new URLSearchParams({
        year: selectedYear,
        month: selectedMonth,
        filters: JSON.stringify(filters),
      });
      const result = await apiFetch<{ data: TableData[] }>(
        `/api/mh-table-data?${params}`,
        { signal: abortController.signal }
      );
      console.log('[FilteredMHTable] Table data sample:', result.data?.[0]);
      setTableData(result.data || []);
      setIsFiltering(false);
    } catch (error: unknown) {
      // Don't log abort errors as they're expected
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('[FilteredMHTable] Table data request cancelled');
        return;
      }
      console.error('[FilteredMHTable] Error fetching table data:', error);
      setTableData([]);
      setIsFiltering(false);
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
    const emptyFilters: FilterState = {
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
    };
    setFilters(emptyFilters);
    
    // Also clear from localStorage
    try {
      localStorage.removeItem(FILTER_STORAGE_KEY);
      console.log('[FilteredMHTable] Cleared filters from localStorage');
    } catch (error) {
      console.error('[FilteredMHTable] Error clearing filters:', error);
    }
  };

  // Pagination calculations - not needed for AG Grid
  // const totalPages = Math.ceil(tableData.length / itemsPerPage);
  // const startIndex = (currentPage - 1) * itemsPerPage;
  // const endIndex = startIndex + itemsPerPage;
  // const paginatedData = tableData.slice(startIndex, endIndex);

  // Determine available years from the data - not needed for AG Grid
  // const availableYears = useMemo(() => { ... }, [tableData]);

  // When "All Years" is selected, show year-grouped columns - not needed for AG Grid
  // const shouldShowYearGrouping = !selectedYear && !selectedMonth;

  // Extract available years from table data
  const availableYears = useMemo(() => {
    if (!tableData || tableData.length === 0) return [];
    
    const yearsSet = new Set<string>();
    tableData.forEach(row => {
      if (row.monthlyMH) {
        Object.keys(row.monthlyMH).forEach(key => {
          // Extract year from keys like "2026-01", "2025-12"
          if (key.includes('-')) {
            const year = key.split('-')[0];
            if (year && year.length === 4) {
              yearsSet.add(year);
            }
          }
        });
      }
    });
    
    return Array.from(yearsSet).sort();
  }, [tableData]);

  // AG Grid column definitions
  const columnDefs = useMemo<ColDef[]>(() => {
    const baseCols: ColDef[] = [
      {
        field: 'nameSurname',
        headerName: 'Name',
        pinned: 'left',
        width: 180,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
        cellClass: 'font-semibold text-gray-800 dark:text-white',
      },
      {
        field: 'discipline',
        headerName: 'Discipline',
        width: 150,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
      },
      {
        field: 'company',
        headerName: 'Company',
        width: 130,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
      },
      {
        field: 'projectsGroup',
        headerName: 'Projects/Group',
        width: 150,
        filter: 'agTextColumnFilter',
        floatingFilter: true,
      },
    ];

    const monthCols: ColDef[] = [];
    
    if (selectedMonth) {
      // Single month view
      monthCols.push({
        field: `month_${selectedMonth}`,
        headerName: `${MONTHS[parseInt(selectedMonth) - 1]} ${selectedYear} MH`,
        width: 130,
        type: 'numericColumn',
        valueGetter: (params) => {
          const value = params.data?.monthlyMH?.[selectedMonth];
          return value !== undefined && value !== null ? value : 0;
        },
        valueFormatter: (params) => {
          const val = params.value;
          return val !== undefined && val !== null && val !== 0 ? val.toFixed(2) : '0.00';
        },
        cellClass: 'text-right font-semibold',
        filter: 'agNumberColumnFilter',
      });
    } else if (selectedYear) {
      // Specific year, all months view
      MONTHS.forEach((month, idx) => {
        const monthKey = (idx + 1).toString().padStart(2, '0');
        monthCols.push({
          field: `month_${monthKey}`,
          headerName: month.slice(0, 3),
          width: 90,
          type: 'numericColumn',
          valueGetter: (params) => {
            const monthlyMH = params.data?.monthlyMH;
            if (!monthlyMH) return null;
            const value = monthlyMH[monthKey];
            return value !== undefined && value !== null ? value : null;
          },
          valueFormatter: (params) => {
            const val = params.value;
            return val !== undefined && val !== null && val !== 0 ? val.toFixed(2) : '-';
          },
          cellClass: 'text-right',
          filter: 'agNumberColumnFilter',
        });
      });
    } else {
      // All years view - create grouped columns by year
      availableYears.forEach(year => {
        const yearChildren: ColDef[] = [];
        
        MONTHS.forEach((month, idx) => {
          const monthKey = (idx + 1).toString().padStart(2, '0');
          const yearMonthKey = `${year}-${monthKey}`;
          
          yearChildren.push({
            field: `year_${year}_month_${monthKey}`,
            headerName: month.slice(0, 3),
            width: 90,
            type: 'numericColumn',
            valueGetter: (params) => {
              const monthlyMH = params.data?.monthlyMH;
              if (!monthlyMH) return null;
              const value = monthlyMH[yearMonthKey];
              return value !== undefined && value !== null ? value : null;
            },
            valueFormatter: (params) => {
              const val = params.value;
              return val !== undefined && val !== null && val !== 0 ? val.toFixed(2) : '-';
            },
            cellClass: 'text-right',
            filter: 'agNumberColumnFilter',
          });
        });
        
        // Add year group column
        monthCols.push({
          headerName: year,
          children: yearChildren,
          marryChildren: true,
        });
      });
    }

    const totalCol: ColDef = {
      field: 'totalMH',
      headerName: 'Total MH',
      pinned: 'right',
      width: 120,
      type: 'numericColumn',
      valueFormatter: (params) => params.value ? params.value.toFixed(2) : '0.00',
      cellClass: 'text-right font-bold text-primary dark:text-white',
      filter: 'agNumberColumnFilter',
    };

    return [...baseCols, ...monthCols, totalCol];
  }, [selectedMonth, selectedYear, availableYears]);

  // AG Grid default column definition
  const defaultColDef = useMemo<ColDef>(() => ({
    sortable: true,
    resizable: true,
    filter: true,
    cellClass: 'text-sm',
  }), []);

  // AG Grid ready event
  const onGridReady = (params: GridReadyEvent) => {
    // Auto-size columns to fit content on first load
    params.api.autoSizeAllColumns(false);
  };

  const FilterSection = React.memo(React.forwardRef<any, { 
    title: string; 
    filterKey: keyof FilterState; 
    options: FilterOption[] 
  }>(({ 
    title, 
    filterKey, 
    options 
  }, ref) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const selectedValues = filters[filterKey];
    const dropdownRef = useRef<HTMLDivElement>(null);
    const sectionRef = useRef<HTMLDivElement>(null);

    // Expose methods to parent via ref
    React.useImperativeHandle(ref, () => ({
      scrollTo: () => {
        sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      },
      expand: () => {
        setIsExpanded(true);
      }
    }));

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
      <div className="mb-3" ref={sectionRef}>
        <div className="relative" ref={dropdownRef}>
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
                    const isValid = !validFilterOptions[filterKey] || validFilterOptions[filterKey].includes(option.value) || isSelected;
                    return (
                      <div
                        key={option.value}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFilterChange(filterKey, option.value);
                        }}
                        className={`flex w-full cursor-pointer items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                          isValid 
                            ? 'text-gray-700 dark:text-gray-200' 
                            : 'text-gray-400 dark:text-gray-500'
                        }`}
                        title={!isValid ? 'No data available with current filters' : ''}
                      >
                        <span className={!isValid ? 'line-through' : ''}>{option.label}</span>
                        <div className="flex items-center gap-2">
                          {!isValid && (
                            <i className="fas fa-ban text-xs text-gray-400"></i>
                          )}
                          {isSelected && (
                            <i className="fas fa-check text-primary"></i>
                          )}
                        </div>
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
  }));

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 flex items-center gap-3">
            📊 Man-Hour Analysis by Filters
            {isFiltering && (
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                <i className="fas fa-sync fa-spin"></i>
                Updating...
              </span>
            )}
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

        {/* Active Filters Display with Additive Lozenges */}
        {Object.entries(filters).some(([, values]) => values.length > 0) && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {Object.entries(filters).map(([filterKey, values]) => {
                if (values.length === 0) return null;
                const typedFilterKey = filterKey as keyof FilterState;
                
                return (
                  <div key={filterKey} className="relative inline-flex" ref={activeLozengeFilter === typedFilterKey ? lozengeDropdownRef : null}>
                    {/* Filter Category Lozenge */}
                    <button
                      onClick={() => {
                        if (activeLozengeFilter === typedFilterKey) {
                          setActiveLozengeFilter(null);
                        } else {
                          setActiveLozengeFilter(typedFilterKey);
                        }
                      }}
                      className="inline-flex items-center gap-2 rounded-l-full bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
                      title="Click to add more values"
                    >
                      <span className="text-xs opacity-90">{FILTER_LABELS[filterKey]}:</span>
                      <span className="font-semibold">{values.length}</span>
                      <i className={`fas fa-chevron-${activeLozengeFilter === typedFilterKey ? 'up' : 'down'} text-xs`}></i>
                    </button>
                    <button
                      onClick={() => {
                        // Clear all values for this filter
                        setFilters(prev => ({ ...prev, [filterKey]: [] }));
                        setActiveLozengeFilter(null);
                      }}
                      className="inline-flex items-center rounded-r-full bg-primary px-2 py-1.5 text-white hover:bg-red-600 transition-colors border-l border-white/20"
                      title="Remove all from this category"
                    >
                      <i className="fas fa-times text-xs"></i>
                    </button>

                    {/* Additive Dropdown */}
                    {activeLozengeFilter === typedFilterKey && (
                      <div className="absolute top-full left-0 mt-2 w-80 z-50 rounded-lg border border-gray-300 bg-white shadow-2xl dark:border-gray-600 dark:bg-gray-800">
                        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                              {FILTER_LABELS[filterKey]}
                            </span>
                            <button
                              onClick={() => setActiveLozengeFilter(null)}
                              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                          {/* Selected Values */}
                          <div className="flex flex-wrap gap-1">
                            {values.map((value: string) => (
                              <span
                                key={value}
                                className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-900/30 px-2 py-1 text-xs text-blue-700 dark:text-blue-400"
                              >
                                {value}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleFilterChange(typedFilterKey, value);
                                  }}
                                  className="hover:text-blue-900 dark:hover:text-blue-200"
                                >
                                  <i className="fas fa-times text-xs"></i>
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                        {/* Available Options */}
                        <div className="max-h-60 overflow-y-auto p-2">
                          {(filterOptions[typedFilterKey] || []).filter(opt => !values.includes(opt.value)).length > 0 ? (
                            <div className="space-y-1">
                              <div className="px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                                Add more:
                              </div>
                              {(filterOptions[typedFilterKey] || [])
                                .filter(opt => !values.includes(opt.value))
                                .map(option => {
                                  const isValid = !validFilterOptions[typedFilterKey] || validFilterOptions[typedFilterKey].includes(option.value);
                                  return (
                                    <button
                                      key={option.value}
                                      onClick={() => {
                                        handleFilterChange(typedFilterKey, option.value);
                                      }}
                                      disabled={!isValid}
                                      className={`w-full text-left px-3 py-2 text-sm rounded flex items-center justify-between group ${
                                        isValid
                                          ? 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'
                                          : 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                      }`}
                                      title={!isValid ? 'No data available with current filters' : 'Click to add'}
                                    >
                                      <span className={!isValid ? 'line-through' : ''}>{option.label}</span>
                                      {isValid ? (
                                        <i className="fas fa-plus text-xs text-gray-400 group-hover:text-primary"></i>
                                      ) : (
                                        <i className="fas fa-ban text-xs text-gray-400"></i>
                                      )}
                                    </button>
                                  );
                                })
                              }
                            </div>
                          ) : (
                            <div className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                              All options selected
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
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
              <p className = "text-white ">...</p>
            </button>

            {filtersExpanded && (
              <div className="max-h-[600px] overflow-y-auto p-4">
                <h4 className="mb-4 text-sm font-bold text-gray-700 dark:text-gray-300">
                  Filters
                </h4>

                <FilterSection 
                  ref={(el) => { if (el) filterSectionRefs.current['nameSurname'] = el; }}
                  title="Name Surname" 
                  filterKey="nameSurname" 
                  options={filterOptions.nameSurname || []} 
                />
                <FilterSection 
                  ref={(el) => { if (el) filterSectionRefs.current['discipline'] = el; }}
                  title="Discipline" 
                  filterKey="discipline" 
                  options={filterOptions.discipline || []} 
                />
                <FilterSection 
                  ref={(el) => { if (el) filterSectionRefs.current['company'] = el; }}
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

        {/* AG Grid Table Content */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : (
            <div className="h-full p-6">
              {tableData.length > 0 ? (
                <div className="ag-theme-alpine-dark h-[600px] w-full">
                  <AgGridReact
                    rowData={tableData}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    pagination={true}
                    paginationPageSize={itemsPerPage}
                    paginationPageSizeSelector={[10, 25, 50, 100]}
                    onGridReady={onGridReady}
                    domLayout='normal'
                    enableCellTextSelection={true}
                    ensureDomOrder={true}
                    animateRows={true}
                    rowSelection={{ mode: 'multiRow' }}
                    suppressMovableColumns={false}
                    suppressMenuHide={false}
                    tooltipShowDelay={500}
                    theme="legacy"
                  />
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
