import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import PieChart from "./PieChart";

import ChartTab from "../common/ChartTab";
import { useState, useEffect, useMemo } from "react";

type TabType = "optionOne" | "optionTwo" | "optionThree";

// Map tab to aggregation key and label
const tabConfig = {
  optionOne: { key: "Person", label: "Kişiye Göre Kar-Zarar", groupBy: ["Name Surname", "Person", "Staff", "Staff Name", "Personel", "Kişi", "PERSONEL"] },
  optionTwo: { key: "Discipline", label: "Disipline Göre Kar-Zarar", groupBy: ["Discipline", "Disiplin"] },
  optionThree: { key: "Company", label: "Şirkete Göre Kar-Zarar", groupBy: ["Company", "Firma", "Şirket"] },
};

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];


export default function StatisticsChart() {
  const [tab, setTab] = useState<TabType>("optionOne");
  const [series, setSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [year, setYear] = useState<number | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [rowField, setRowField] = useState<string | null>(null);
  const [colField, setColField] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [chartType, setChartType] = useState<"line" | "bar" | "pie" | "boxPlot">("line");

  // Extract years from records
  function extractYears(records: any[]): number[] {
    const yearsSet = new Set<number>();
    for (const r of records) {
      const dateStr = r['(Week / \nMonth)'] || r['(Week / Month)'] || r['Tarih'] || r['Date'];
      if (!dateStr || typeof dateStr !== "string" || dateStr.trim() === "") continue;
      let dt = null;
      for (const fmt of ["%Y-%m-%d", "%d.%m.%Y", "%Y/%m/%d", "%d/%m/%Y", "%d/%b/%Y"]) {
        try {
          if (fmt === "%Y-%m-%d" && dateStr.match(/^\d{4}-\d{2}-\d{2}/)) {
            dt = new Date(dateStr);
            break;
          } else if (fmt === "%d.%m.%Y" && dateStr.match(/^\d{2}\.\d{2}\.\d{4}/)) {
            const [d, m, y] = dateStr.split(".");
            dt = new Date(+y, +m - 1, +d);
            break;
          } else if (fmt === "%Y/%m/%d" && dateStr.match(/^\d{4}\/\d{2}\/\d{2}/)) {
            const [y, m, d] = dateStr.split("/");
            dt = new Date(+y, +m - 1, +d);
            break;
          } else if (fmt === "%d/%m/%Y" && dateStr.match(/^\d{2}\/\d{2}\/\d{4}/)) {
            const [d, m, y] = dateStr.split("/");
            dt = new Date(+y, +m - 1, +d);
            break;
          } else if (fmt === "%d/%b/%Y" && dateStr.match(/^\d{2}\/([A-Za-z]{3})\/\d{4}/)) {
            const [d, mon, y] = dateStr.split("/");
            const monthMap = { Jan:0, Feb:1, Mar:2, Apr:3, May:4, Jun:5, Jul:6, Aug:7, Sep:8, Oct:9, Nov:10, Dec:11 };
            const m = monthMap[mon];
            if (m !== undefined) {
              dt = new Date(+y, m, +d);
              break;
            }
          }
        } catch (e) {}
      }
      if (!dt || isNaN(dt.getTime())) continue;
      yearsSet.add(dt.getFullYear());
    }
    return Array.from(yearsSet).sort((a, b) => a - b);
  }

  // Fetch and process data
  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:5000/api/data")
      .then(res => res.json())
      .then(result => {
        if (!result.success || !Array.isArray(result.records)) {
          setSeries([]);
          setAvailableYears([]);
          setLoading(false);
          return;
        }
        const years = extractYears(result.records);
        setAvailableYears(years);

        // Group by selected key (Person, Company, Discipline)
        const groupByFields = tabConfig[tab].groupBy;
        const agg: Record<string, number[]> = {};
        function getMonthYearIdx(r: any) {
          const dateStr = r['(Week / \nMonth)'] || r['(Week / Month)'] || r['Tarih'] || r['Date'];
          if (!dateStr || typeof dateStr !== "string" || dateStr.trim() === "") return { month: null, year: null };
          let dt = null;
          for (const fmt of ["%Y-%m-%d", "%d.%m.%Y", "%Y/%m/%d", "%d/%m/%Y", "%d/%b/%Y"]) {
            try {
              if (fmt === "%Y-%m-%d" && dateStr.match(/^\d{4}-\d{2}-\d{2}/)) {
                dt = new Date(dateStr);
                break;
              } else if (fmt === "%d.%m.%Y" && dateStr.match(/^\d{2}\.\d{2}\.\d{4}/)) {
                const [d, m, y] = dateStr.split(".");
                dt = new Date(+y, +m - 1, +d);
                break;
              } else if (fmt === "%Y/%m/%d" && dateStr.match(/^\d{4}\/\d{2}\/\d{2}/)) {
                const [y, m, d] = dateStr.split("/");
                dt = new Date(+y, +m - 1, +d);
                break;
              } else if (fmt === "%d/%m/%Y" && dateStr.match(/^\d{2}\/\d{2}\/\d{4}/)) {
                const [d, m, y] = dateStr.split("/");
                dt = new Date(+y, +m - 1, +d);
                break;
              } else if (fmt === "%d/%b/%Y" && dateStr.match(/^\d{2}\/([A-Za-z]{3})\/\d{4}/)) {
                const [d, mon, y] = dateStr.split("/");
                const monthMap = { Jan:0, Feb:1, Mar:2, Apr:3, May:4, Jun:5, Jul:6, Aug:7, Sep:8, Oct:9, Nov:10, Dec:11 };
                const m = monthMap[mon];
                if (m !== undefined) {
                  dt = new Date(+y, m, +d);
                  break;
                }
              }
            } catch (e) {}
          }
          if (!dt || isNaN(dt.getTime())) return { month: null, year: null };
          return { month: dt.getMonth(), year: dt.getFullYear() };
        }
        for (const r of result.records) {
          const { month: monthIdx, year: recYear } = getMonthYearIdx(r);
          if (monthIdx === null || recYear === null) continue;
          if (year !== null && recYear !== year) continue;
          // Try all possible fields for grouping
          let groupVal = "Unknown";
          for (const field of groupByFields) {
            if (r[field] && String(r[field]).trim() !== "") {
              groupVal = String(r[field]);
              break;
            }
          }
          let value = 0;
          if (
            r["İşveren- Hakediş (USD)"] !== undefined &&
            r["General Total Cost (USD)"] !== undefined
          ) {
            value = Number(r["İşveren- Hakediş (USD)"]) - Number(r["General Total Cost (USD)"]);
          } else if (
            r["İşveren- Hakediş"] !== undefined &&
            r["General Total Cost (USD)"] !== undefined
          ) {
            value = Number(r["İşveren- Hakediş"]) - Number(r["General Total Cost (USD)"]);
          } else {
            continue;
          }
          if (!agg[groupVal]) agg[groupVal] = Array(12).fill(0);
          agg[groupVal][monthIdx] += value;
        }
        const newSeries = Object.entries(agg).map(([name, data]) => ({ name, data }));
        setSeries(newSeries);
        setLoading(false);
      })
      .catch(() => { setSeries([]); setAvailableYears([]); setLoading(false); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, year]);

  // When availableYears changes, update year if needed
  useEffect(() => {
    if (availableYears.length === 0) return;
    if (year === null || !availableYears.includes(year)) {
      setYear(availableYears[availableYears.length - 1]);
    }
  }, [availableYears]);

  const options: ApexOptions = useMemo(() => ({
    legend: {
      show: false,
    },
    colors: [
      "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
      "#EC4899", "#14B8A6", "#F97316", "#6366F1", "#84CC16",
      "#06B6D4", "#A855F7", "#FBBF24", "#F43F5E", "#22D3EE"
    ],
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "line",
      toolbar: { show: true },
      zoom: { enabled: true },
    },
    stroke: { curve: "smooth", width: 3 },
    fill: { type: "solid", opacity: 1 },
    markers: {
      size: 5,
      strokeColors: "#fff",
      strokeWidth: 2,
      hover: { size: 7 },
      discrete: [],
    },
    grid: {
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      borderColor: "#e5e7eb",
    },
    dataLabels: { enabled: false },
    tooltip: {
      enabled: true,
      shared: true,
      intersect: false,
      y: {
        formatter: function (val: number) {
          return "$" + val.toLocaleString();
        },
      },
    },
    xaxis: {
      type: "category",
      categories: monthNames,
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
      labels: {
        style: { fontSize: "12px", colors: ["#6B7280"] },
      },
    },
    yaxis: {
      labels: {
        style: { fontSize: "12px", colors: ["#6B7280"] },
        formatter: function (val: number) {
          if (Math.abs(val) >= 1e9) return "$" + (val / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
          if (Math.abs(val) >= 1e6) return "$" + (val / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
          if (Math.abs(val) >= 1e3) return "$" + (val / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
          return "$" + val.toLocaleString();
        },
      },
      title: { text: "Kar-Zarar (USD)", style: { fontSize: "14px", color: "#6B7280" } },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
      }
    },
  }), []);

  // list of colors for UI selection (same order as options.colors)
  const colorPalette = options.colors as string[];

  // derive chart options with color override when single series selected
  // (moved below `displayedSeries` definition to avoid TDZ ReferenceError)

  // Filtered series for search
  const filteredSeries = search.trim()
    ? series.filter((s) => s.name.toLowerCase().includes(search.trim().toLowerCase()))
    : series;

  // Keep selectedNames in sync with filteredSeries
  useEffect(() => {
    // If no selection, select all filtered names by default
    if (filteredSeries.length > 0 && selectedNames.length === 0) {
      setSelectedNames(filteredSeries.map(s => s.name));
    } else {
      // Remove names that are no longer in filteredSeries
      setSelectedNames(prev => prev.filter(n => filteredSeries.some(s => s.name === n)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, series, tab, year]);

  // Only show selected names in the chart
  const displayedSeries = filteredSeries.filter(s => selectedNames.includes(s.name));

  // derive chart options with color override when single series selected
  const chartOptions: ApexOptions = useMemo(() => ({
    ...options,
    chart: {
      ...options.chart,
      type: chartType === "boxPlot" ? "boxPlot" : chartType === "pie" ? "pie" : chartType,
    },
    stroke: {
      ...options.stroke,
      width: chartType === "line" ? 3 : 0,
    },
    markers: {
      ...options.markers,
      size: chartType === "line" ? 5 : 0,
    },
    dataLabels: {
      enabled: chartType === "pie",
    },
    tooltip: {
      ...options.tooltip,
      shared: chartType !== "pie",
    },
    plotOptions: chartType === "bar" ? {
      bar: {
        horizontal: false,
        columnWidth: "55%",
      }
    } : options.plotOptions,
    colors: (displayedSeries.length === 1 && selectedColor)
      ? [selectedColor, ...colorPalette.filter(c => c !== selectedColor)]
      : options.colors,
  }), [options, chartType, displayedSeries.length, selectedColor, colorPalette]);

  // Prepare pie chart data (sum all months for each series)
  const pieChartData = chartType === "pie" 
    ? displayedSeries.map(s => ({
        name: s.name,
        value: s.data.reduce((acc: number, val: number) => acc + val, 0)
      }))
    : [];

  // Prepare box plot data (convert line data to box plot format)
  const boxPlotSeries = chartType === "boxPlot"
    ? displayedSeries.map(s => ({
        name: s.name,
        type: 'boxPlot' as const,
        data: monthNames.map((_, idx) => {
          const values = displayedSeries.map(series => series.data[idx]).filter(v => v !== 0);
          if (values.length === 0) return { x: monthNames[idx], y: [0, 0, 0, 0, 0] };
          values.sort((a, b) => a - b);
          const min = Math.min(...values);
          const max = Math.max(...values);
          const q1 = values[Math.floor(values.length * 0.25)];
          const median = values[Math.floor(values.length * 0.5)];
          const q3 = values[Math.floor(values.length * 0.75)];
          return { x: monthNames[idx], y: [min, q1, median, q3, max] };
        })
      }))
    : [];

  return (
    <div
      className={
        fullscreen
          ? "fixed inset-0 z-50 bg-white dark:bg-gray-900 flex flex-col p-4"
          : "relative bg-white dark:bg-gray-900 flex flex-col p-4 rounded-lg shadow"
      }
      style={fullscreen ? { height: "100vh", width: "100vw" } : { minHeight: 500, height: 600 }}
    >
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between relative">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Statistics</h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Target you’ve set for each month
          </p>
        </div>
        <div className="flex items-start w-full gap-3 sm:justify-end">
            {/* Chart Type Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">Chart:</span>
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value as "line" | "bar" | "pie" | "boxPlot")}
                className="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200"
              >
                <option value="line">Line</option>
                <option value="bar">Bar</option>
                <option value="pie">Pie</option>
                <option value="boxPlot">Box Plot</option>
              </select>
            </div>
            <ChartTab selected={tab} setSelected={setTab} />
            {/* Single-chart controls: Row / Col / Color selection */}
            {displayedSeries.length === 1 && (
              <div className="ml-4 flex items-center gap-3">
                <div className="text-sm text-gray-700 dark:text-gray-300 mr-2">Row:</div>
                <select
                  value={rowField ?? tabConfig[tab].groupBy?.[0] ?? ""}
                  onChange={(e) => setRowField(e.target.value || null)}
                  className="px-2 py-1 rounded border bg-white dark:bg-gray-800 text-sm"
                >
                  {(tabConfig[tab].groupBy || []).map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>

                <div className="text-sm text-gray-700 dark:text-gray-300 ml-2 mr-2">Col:</div>
                <select
                  value={colField ?? monthNames[0]}
                  onChange={(e) => setColField(e.target.value || null)}
                  className="px-2 py-1 rounded border bg-white dark:bg-gray-800 text-sm"
                >
                  {monthNames.map(m => <option key={m} value={m}>{m}</option>)}
                </select>

                <div className="text-sm text-gray-700 dark:text-gray-300 ml-2 mr-2">Color:</div>
                <select
                  value={selectedColor ?? colorPalette[0]}
                  onChange={(e) => setSelectedColor(e.target.value || null)}
                  className="px-2 py-1 rounded border bg-white dark:bg-gray-800 text-sm"
                >
                  {colorPalette.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}
        </div>
      </div>
      {availableYears.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-sm font-semibold text-gray-800 dark:text-white mr-2">Yıl Seç:</span>
          <div className="inline-flex rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 shadow p-1">
            {availableYears.map((y, idx) => (
              <button
                key={y}
                onClick={() => setYear(y)}
                className={`px-4 py-1 font-medium rounded ${
                  year === y
                    ? "bg-blue-600 text-white shadow"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-700"
                } ${idx === 0 ? "ml-0" : "ml-1"}`}
                style={{ minWidth: 56, cursor: 'pointer' }}
                tabIndex={0}
              >
                {y}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="flex justify-end mb-2">
        <button
          onClick={() => setFullscreen((f) => !f)}
          className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 shadow"
          title={fullscreen ? "Exit Fullscreen" : "Fullscreen"}
          style={{ zIndex: 10 }}
        >
          {fullscreen ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9V5.25A2.25 2.25 0 016 3h3.75m10.5 6V5.25A2.25 2.25 0 0018 3h-3.75m0 18H18a2.25 2.25 0 002.25-2.25V15m-16.5 0v3.75A2.25 2.25 0 006 21h3.75" />
            </svg>
          )}
        </button>
      </div>
      <div className="flex-1 flex min-h-0 gap-4">
        <div
          className={
            fullscreen
              ? "flex-1 flex items-center justify-center min-h-0 w-full"
              : "flex-1 flex items-center justify-center min-h-0"
          }
          style={fullscreen ? { width: "100vw", marginLeft: "-2rem", marginRight: "-2rem" } : {}}
        >
          {loading ? (
            <div className="text-base font-semibold text-gray-500 dark:text-gray-300">Loading...</div>
          ) : chartType === "pie" ? (
            <div style={{ width: "100%", height: fullscreen ? "90vh" : 500 }}>
              <PieChart
                series={pieChartData.map(d => d.value)}
                labels={pieChartData.map(d => d.name)}
              />
            </div>
          ) : (
            <div style={{ width: "100%", height: fullscreen ? "90vh" : 500 }}>
              {(!displayedSeries || displayedSeries.length === 0) ? (
                <div className="text-base font-semibold text-gray-500 dark:text-gray-300">No data to display</div>
              ) : (
                <Chart
                  options={chartOptions}
                  series={chartType === "boxPlot" ? boxPlotSeries : displayedSeries}
                  type={chartType === "boxPlot" ? "boxPlot" : chartType}
                  height={fullscreen ? "100%" : 500}
                  width={"100%"}
                />
              )}
            </div>
          )}
        </div>
        {/* Summary list showing total profit/loss for each staff */}
        {!loading && filteredSeries.length > 0 && (
          <div className="hidden lg:block w-72 overflow-y-auto bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">Total {tabConfig[tab].label}</h4>
            {/* Search bar */}
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name..."
              className="mb-3 w-full px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring focus:border-blue-400"
            />
            <div className="space-y-2">
              {filteredSeries
                .map((s) => ({
                  name: s.name,
                  total: s.data.reduce((acc: number, val: number) => acc + val, 0),
                }))
                .sort((a, b) => b.total - a.total)
                .map((item, idx) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between p-2 bg-white dark:bg-gray-700 rounded shadow-sm"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={selectedNames.includes(item.name)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedNames(prev => [...prev, item.name]);
                          } else {
                            setSelectedNames(prev => prev.filter(n => n !== item.name));
                          }
                        }}
                        className="accent-blue-600 mr-2"
                        style={{ minWidth: 16, minHeight: 16 }}
                      />
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: options.colors?.[idx % (options.colors?.length || 1)] || "#3B82F6",
                        }}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-200 truncate" title={item.name}>
                        {item.name}
                      </span>
                    </div>
                    <span
                      className={`text-sm font-semibold ml-2 flex-shrink-0 ${
                        item.total >= 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {item.total >= 0 ? "+" : ""}${(item.total / 1000).toFixed(1)}K
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

