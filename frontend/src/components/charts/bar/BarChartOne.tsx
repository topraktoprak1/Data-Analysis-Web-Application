import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import PieChart from "../pie/PieChart";

import ChartTab from "../../common/ChartTab";
import { useState, useEffect } from "react";

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
  const [chartType, setChartType] = useState<"line" | "bar" | "box" | "pie">("line");
  const [fullscreen, setFullscreen] = useState(false);
  const [availableFields, setAvailableFields] = useState<string[]>([]);
  const [groupByField, setGroupByField] = useState<string | null>(null);
  const [numberOfCharts, setNumberOfCharts] = useState<number>(1);
  const [numericFields, setNumericFields] = useState<string[]>([]);
  const [xField, setXField] = useState<string | null>(null);
  const [yField, setYField] = useState<string | null>(null);
  const [categoriesState, setCategoriesState] = useState<string[]>(monthNames);
  const [year, setYear] = useState<number | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [rawRecords, setRawRecords] = useState<any[]>([]);
  const [panels, setPanels] = useState<any[]>([
    { chartType: 'line', xField: null, yField: null, groupByField: null, selectedYears: [] }
  ]);
  const [selectedYears, setSelectedYears] = useState<number[]>([]); // empty = all

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

  // Parse various date formats to a month-name category
  function parseDateToCategory(dateStr: any) {
    if (!dateStr || typeof dateStr !== 'string') return String(dateStr ?? '');
    let dt = null;
    for (const fmt of ["%Y-%m-%d", "%d.%m.%Y", "%Y/%m/%d", "%d/%m/%Y", "%d/%b/%Y"]) {
      try {
        if (fmt === "%Y-%m-%d" && dateStr.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}/)) { dt = new Date(dateStr); break; }
        if (fmt === "%d.%m.%Y" && dateStr.match(/^[0-9]{2}\.[0-9]{2}\.[0-9]{4}/)) { const [d,m,y]=dateStr.split('.'); dt=new Date(+y,+m-1,+d); break; }
        if (fmt === "%Y/%m/%d" && dateStr.match(/^[0-9]{4}\/[0-9]{2}\/[0-9]{2}/)) { const [y,m,d]=dateStr.split('/'); dt=new Date(+y,+m-1,+d); break; }
        if (fmt === "%d/%m/%Y" && dateStr.match(/^[0-9]{2}\/[0-9]{2}\/[0-9]{4}/)) { const [d,m,y]=dateStr.split('/'); dt=new Date(+y,+m-1,+d); break; }
        if (fmt === "%d/%b/%Y" && dateStr.match(/^[0-9]{2}\/([A-Za-z]{3})\/\d{4}/)) { const [d,mon,y]=dateStr.split('/'); const monthMap: any = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 }; const m = monthMap[mon]; if (m!==undefined){ dt=new Date(+y,m,+d); break; } }
      } catch(e){}
    }
    if (!dt || isNaN(dt.getTime())) return String(dateStr);
    return monthNames[dt.getMonth()];
  }

  function getMonthYearIdx(r: any) {
    const dateStr = r['(Week / \nMonth)'] || r['(Week / Month)'] || r['Tarih'] || r['Date'];
    if (!dateStr || typeof dateStr !== "string" || dateStr.trim() === "") return { month: null, year: null };
    let dt = null;
    for (const fmt of ["%Y-%m-%d", "%d.%m.%Y", "%Y/%m/%d", "%d/%m/%Y", "%d/%b/%Y"]) {
      try {
        if (fmt === "%Y-%m-%d" && dateStr.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}/)) {
          dt = new Date(dateStr);
          break;
        } else if (fmt === "%d.%m.%Y" && dateStr.match(/^[0-9]{2}\.[0-9]{2}\.[0-9]{4}/)) {
          const [d, m, y] = dateStr.split(".");
          dt = new Date(+y, +m - 1, +d);
          break;
        } else if (fmt === "%Y/%m/%d" && dateStr.match(/^[0-9]{4}\/[0-9]{2}\/[0-9]{2}/)) {
          const [y, m, d] = dateStr.split("/");
          dt = new Date(+y, +m - 1, +d);
          break;
        } else if (fmt === "%d/%m/%Y" && dateStr.match(/^[0-9]{2}\/[0-9]{2}\/[0-9]{4}/)) {
          const [d, m, y] = dateStr.split("/");
          dt = new Date(+y, +m - 1, +d);
          break;
        } else if (fmt === "%d/%b/%Y" && dateStr.match(/^[0-9]{2}\/([A-Za-z]{3})\/\d{4}/)) {
          const [d, mon, y] = dateStr.split("/");
          const monthMap: any = { Jan:0, Feb:1, Mar:2, Apr:3, May:4, Jun:5, Jul:6, Aug:7, Sep:8, Oct:9, Nov:10, Dec:11 };
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
        setRawRecords(result.records);
        const years = extractYears(result.records);
        setAvailableYears(years);

        // Extract available fields from records (first row)
        const first = Array.isArray(result.records) && result.records.length > 0 ? result.records[0] : {};
        const keys = Object.keys(first || {}).filter(k => typeof k === "string");
        setAvailableFields(keys);

        // Detect numeric fields by scanning some rows
        const numericSet = new Set<string>();
        for (const k of keys) {
          for (let i = 0; i < Math.min(result.records.length, 10); i++) {
            const v = result.records[i][k];
            if (v !== undefined && v !== null && v !== "" && !isNaN(Number(v))) {
              numericSet.add(k);
              break;
            }
          }
        }
        const numFields = Array.from(numericSet);
        setNumericFields(numFields);

        // keep previous defaults for x/y if not set
        const defaultX = xField || (keys.find(k => /(Week|Month|Tarih|Date)/i.test(k)) ?? keys[0] ?? null);
        const defaultY = yField || (numFields.includes("General Total Cost (USD)") || numFields.length === 0 ? "KAR/ZARAR" : numFields[0]);
        setXField(defaultX);
        setYField(defaultY);

        setLoading(false);
      })
      .catch(() => { setSeries([]); setAvailableYears([]); setLoading(false); });
  }, [tab]);

  // When availableYears changes, update year if needed
  useEffect(() => {
    if (availableYears.length === 0) return;
    // default to last year selected if none selected
    if (selectedYears.length === 0) {
      setSelectedYears([availableYears[availableYears.length - 1]]);
    }
  }, [availableYears]);

  // Recompute series whenever rawRecords or axis/group/years change
  useEffect(() => {
    if (!rawRecords || rawRecords.length === 0) {
      setSeries([]);
      return;
    }
    const cfg = { chartType, xField, yField, groupByField };
    const agg = aggregateForConfig(cfg);
    if (!agg || agg.length === 0) { setSeries([]); return; }
    // agg entries include categories attached; take categories from first
    if (agg[0].categories) setCategoriesState(agg[0].categories);
    const mapped = agg.map((a: any) => ({ name: a.name, data: a.data }));
    setSeries(mapped);
  }, [rawRecords, chartType, xField, yField, groupByField, tab, selectedYears]);

  const options: ApexOptions = {
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
      categories: categoriesState,
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
  };

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

  // Helper: compute quartiles for an array of numbers
  function medianOf(sorted: number[], start = 0, end = sorted.length - 1) {
    const len = end - start + 1;
    if (len <= 0) return 0;
    const mid = start + Math.floor((len - 1) / 2);
    if (len % 2 === 1) return sorted[mid];
    return (sorted[mid] + sorted[mid + 1]) / 2;
  }

  function computeQuartiles(values: number[]): [number, number, number, number, number] {
    const arr = values.filter(v => Number.isFinite(v)).slice().sort((a, b) => a - b);
    if (arr.length === 0) return [0, 0, 0, 0, 0];
    const min = arr[0];
    const max = arr[arr.length - 1];
    const med = medianOf(arr, 0, arr.length - 1);
    const mid = Math.floor(arr.length / 2);
    const q1 = medianOf(arr, 0, mid - 1);
    const q3 = medianOf(arr, arr.length % 2 === 0 ? mid : mid + 1, arr.length - 1);
    return [min, q1, med, q3, max];
  }

  // Build box-plot series: one data point per month with distribution across selected series
  function getBoxPlotSeries(displayed: any[]) {
    const data = categoriesState.map((m, idx) => {
      const vals = displayed.map(s => (Array.isArray(s.data) ? Number(s.data[idx]) : NaN)).filter(v => Number.isFinite(v));
      const y = computeQuartiles(vals);
      return { x: m, y };
    });
    return [{ name: "Distribution", data }];
  }

  // Aggregate rawRecords according to a panel config
  function aggregateForConfig(cfg: { chartType: string; xField: string | null; yField: string | null; groupByField: string | null; selectedYears?: number[] }) {
    const recs = rawRecords || [];
    if (!recs || recs.length === 0) return [];
    const keys = Object.keys(recs[0] || {});
    const useX = cfg.xField || xField || keys.find(k => /(Week|Month|Tarih|Date)/i.test(k)) || keys[0];
    const useY = cfg.yField || yField || 'KAR/ZARAR';
    const useGroup = cfg.groupByField || groupByField || tabConfig[tab]?.groupBy?.[0] || keys.find(k => typeof k === 'string') || null;
    const yearsToUse = cfg.selectedYears !== undefined ? cfg.selectedYears : selectedYears;

    // build categories
    const cats: string[] = [];
    const seen = new Set<string>();
    for (const r of recs) {
      const raw = r[useX as string];
      const val = (/(Tarih|Date|Week|Month)/i.test(useX as string)) ? parseDateToCategory(raw) : String(raw ?? '');
      if (!seen.has(val)) { seen.add(val); cats.push(val); }
    }
    const categories = cats.length ? cats : monthNames.slice();

    const agg: Record<string, number[]> = {};
    for (const r of recs) {
      const { year: recYear } = getMonthYearIdx(r);
      if (Array.isArray(yearsToUse) && yearsToUse.length > 0 && (recYear === null || !yearsToUse.includes(recYear))) continue;
      const raw = r[useX as string];
      const catVal = (/(Tarih|Date|Week|Month)/i.test(useX as string)) ? parseDateToCategory(raw) : String(raw ?? '');
      const catIdx = categories.indexOf(catVal);
      if (catIdx === -1) continue;

      let groupVal = 'Unknown';
      if (useGroup && r[useGroup] && String(r[useGroup]).trim() !== '') groupVal = String(r[useGroup]);
      else if (Array.isArray(tabConfig[tab]?.groupBy)) {
        for (const f of tabConfig[tab].groupBy) {
          if (r[f] && String(r[f]).trim() !== '') { groupVal = String(r[f]); break; }
        }
      }

      let value = 0;
      if (!useY || useY === 'KAR/ZARAR') {
        if (r['İşveren- Hakediş (USD)'] !== undefined && r['General Total Cost (USD)'] !== undefined) {
          value = Number(r['İşveren- Hakediş (USD)']) - Number(r['General Total Cost (USD)']);
        } else if (r['İşveren- Hakediş'] !== undefined && r['General Total Cost (USD)'] !== undefined) {
          value = Number(r['İşveren- Hakediş']) - Number(r['General Total Cost (USD)']);
        } else continue;
      } else if (numericFields.includes(useY)) {
        value = Number(r[useY]) || 0;
      } else {
        value = 1;
      }

      if (!agg[groupVal]) agg[groupVal] = Array(categories.length).fill(0);
      agg[groupVal][catIdx] += value;
    }

    return Object.entries(agg).map(([name, data]) => ({ name, data, categories }));
  }

  // Ensure panels array length matches numberOfCharts
  useEffect(() => {
    setPanels(prev => {
      const next = [...prev];
      if (next.length < numberOfCharts) {
        for (let i = next.length; i < numberOfCharts; i++) {
          next.push({ chartType: chartType, xField: xField, yField: yField, groupByField: groupByField, selectedYears: [] } as any);
        }
      } else if (next.length > numberOfCharts) {
        next.splice(numberOfCharts);
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numberOfCharts]);

  // Helper: produce box-plot series from aggregated entries and categories
  function getBoxPlotSeriesFromAgg(aggEntries: any[], cats: string[]) {
    const data = cats.map((m, idx) => {
      const vals = aggEntries.map(a => (Array.isArray(a.data) ? Number(a.data[idx]) : NaN)).filter(v => Number.isFinite(v));
      const y = computeQuartiles(vals);
      return { x: m, y };
    });
    return [{ name: "Distribution", data }];
  }

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
            <ChartTab selected={tab} setSelected={setTab} />
            <div className="ml-4 flex items-center gap-2">
              <label className="text-sm ml-4 mr-2 text-gray-800 dark:text-white"># Charts:</label>
              <input
                type="number"
                min={1}
                max={12}
                value={numberOfCharts}
                onChange={(e) => setNumberOfCharts(Math.max(1, Math.min(12, Number(e.target.value) || 1)))}
                className="w-16 px-2 py-1 rounded border  text-gray-800 dark:text-white"
              />
            </div>
        </div>
      </div>
      {availableYears.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-sm font-semibold text-gray-800 dark:text-white mr-2">Yıl Seç:</span>
            <div className="inline-flex rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 shadow p-1">
              <button
                onClick={() => setSelectedYears([])}
                className={`px-4 py-1 font-medium rounded ${
                  selectedYears.length === 0
                    ? "bg-blue-600 text-white shadow"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-700"
                } ml-0`}
                style={{ minWidth: 56, cursor: 'pointer' }}
                tabIndex={0}
              >
                All
              </button>
              {availableYears.map((y, idx) => (
                <button
                  key={y}
                  onClick={() => {
                    setSelectedYears(prev => prev.includes(y) ? prev.filter(x => x !== y) : [...prev, y]);
                  }}
                  className={`px-4 py-1 font-medium rounded ${
                    selectedYears.includes(y)
                      ? "bg-blue-600 text-white shadow"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-gray-700"
                  } ${idx === 0 ? "ml-1" : "ml-1"}`}
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
          ) : (
            <div style={{ width: "100%", height: fullscreen ? "90vh" : 500 }}>
                  {numberOfCharts > 1 ? (
                    // Render configured panels in a grid
                    (() => {
                      const cols = numberOfCharts <= 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
                      return (
                        <div className={`grid ${cols} gap-4`}>
                          {panels.map((p, idx) => {
                            const panelCfg = p as any;
                            const agg = aggregateForConfig(panelCfg);
                            const panelCats = (agg && agg[0] && agg[0].categories) ? agg[0].categories : categoriesState;
                            const multiType = panelCfg.chartType === 'box' ? 'boxPlot' : panelCfg.chartType === 'pie' ? 'pie' : panelCfg.chartType;
                            return (
                              <div key={idx} className="bg-white dark:bg-gray-800 rounded p-2">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="text-sm font-semibold truncate">Panel {idx + 1}</div>
                                  <div className="flex items-center gap-1">
                                    <select value={panelCfg.chartType} onChange={e => setPanels(prev => { const cp = [...prev]; cp[idx] = { ...cp[idx], chartType: e.target.value }; return cp; })} className="px-2 py-1 rounded border bg-white dark:bg-gray-700 text-sm">
                                      <option value="line">Line</option>
                                      <option value="bar">Bar</option>
                                      <option value="box">Box</option>
                                      <option value="pie">Pie</option>
                                    </select>
                                  </div>
                                </div>
                                <div className="text-xs mb-2">
                                  <div className="flex gap-1 flex-wrap">
                                    <select value={panelCfg.xField ?? ''} onChange={e => setPanels(prev => { const cp = [...prev]; cp[idx] = { ...cp[idx], xField: e.target.value || null }; return cp; })} className="px-2 py-1 rounded border bg-white dark:bg-gray-700 text-sm">
                                      {availableFields.map(f => <option key={f} value={f}>{f}</option>)}
                                    </select>
                                    <select value={panelCfg.yField ?? ''} onChange={e => setPanels(prev => { const cp = [...prev]; cp[idx] = { ...cp[idx], yField: e.target.value || null }; return cp; })} className="px-2 py-1 rounded border bg-white dark:bg-gray-700 text-sm">
                                      <option value="KAR/ZARAR">KAR/ZARAR</option>
                                      {numericFields.map(f => <option key={f} value={f}>{f}</option>)}
                                    </select>
                                    <select value={panelCfg.groupByField ?? ''} onChange={e => setPanels(prev => { const cp = [...prev]; cp[idx] = { ...cp[idx], groupByField: e.target.value || null }; return cp; })} className="px-2 py-1 rounded border bg-white dark:bg-gray-700 text-sm">
                                      <option value="">(tab default)</option>
                                      {availableFields.map(f => <option key={f} value={f}>{f}</option>)}
                                    </select>
                                  </div>
                                </div>
                                <div style={{ height: 200 }}>
                                  {(!agg || agg.length === 0) ? (
                                    <div className="text-sm text-gray-500">No data</div>
                                  ) : multiType === 'pie' ? (
                                    <Chart options={{ ...options, labels: agg.map((a:any)=>a.name), xaxis: { ...(options.xaxis||{}), categories: panelCats } }} series={agg.map((a:any)=>a.data.reduce((s:number,v:number)=>s+Number(v||0),0))} type="pie" height={200} width={"100%"} />
                                  ) : multiType === 'boxPlot' ? (
                                    <Chart options={{ ...options, chart: { ...(options.chart||{}), type: 'boxPlot' }, xaxis: { ...(options.xaxis||{}), categories: panelCats } }} series={getBoxPlotSeriesFromAgg(agg, panelCats)} type={'boxPlot'} height={200} width={"100%"} />
                                  ) : (
                                    <Chart options={{ ...options, chart: { ...(options.chart||{}), type: panelCfg.chartType }, xaxis: { ...(options.xaxis||{}), categories: panelCats } }} series={agg.map((a:any)=>({ name: a.name, data: a.data }))} type={panelCfg.chartType as any} height={200} width={"100%"} />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()
                  ) : chartType === "box" ? (
                    <Chart
                      options={{
                        ...options,
                        chart: { ...(options.chart || {}), type: "boxPlot" },
                        xaxis: { ...(options.xaxis || {}), type: "category" },
                      }}
                      series={getBoxPlotSeries(displayedSeries)}
                      type="boxPlot"
                      height={fullscreen ? "100%" : 500}
                      width={"100%"}
                    />
                  ) : (
                    // Single-panel rendering: use panels[0] if present to configure chart
                    (() => {
                      const p = panels && panels[0] ? panels[0] as any : { chartType, xField, yField, groupByField };
                      const agg = aggregateForConfig(p);
                      const panelCats = (agg && agg[0] && agg[0].categories) ? agg[0].categories : categoriesState;
                      if (!agg || agg.length === 0) return (<div className="text-sm text-gray-500">No data</div>);
                      if (p.chartType === 'pie') {
                        const labels = agg.map((a:any) => a.name);
                        const seriesTotals = agg.map((a:any) => a.data.reduce((s:number,v:number)=>s+Number(v||0),0));
                        return (
                          <Chart options={{ ...options, labels, xaxis: { ...(options.xaxis||{}), categories: panelCats } }} series={seriesTotals} type="pie" height={fullscreen ? "100%" : 500} width={"100%"} />
                        );
                      }
                      if (p.chartType === 'box') {
                        return (
                          <Chart options={{ ...options, chart: { ...(options.chart||{}), type: 'boxPlot' }, xaxis: { ...(options.xaxis||{}), categories: panelCats } }} series={getBoxPlotSeriesFromAgg(agg, panelCats)} type={'boxPlot'} height={fullscreen ? "100%" : 500} width={"100%"} />
                        );
                      }
                      return (
                        <Chart options={{ ...options, chart: { ...(options.chart || {}), type: p.chartType }, xaxis: { ...(options.xaxis||{}), categories: panelCats } }} series={agg.map((a:any)=>({ name: a.name, data: a.data }))} type={p.chartType as any} height={fullscreen ? "100%" : 500} width={"100%"} />
                      );
                    })()
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

