
import { useState, useEffect, useMemo } from 'react';
import 'react-pivottable/pivottable.css';
import './PivotTable.css';
import PivotTable from 'react-pivottable/PivotTable';
import TableRenderers from 'react-pivottable/TableRenderers';
import PlotlyRenderers from 'react-pivottable/PlotlyRenderers';

interface PivotTableSelectorProps {
    selectedRows: string[];
    selectedCols: string[];
    selectedValues: string[];
    selectedAggregation: string;
    // optional whitelists to restrict choices shown in the selectors
    allowedRows?: string[];
    allowedCols?: string[];
    allowedVals?: string[];
}

function ValuesMultiSelect({ options, value, onChange }: { options: string[]; value: string[]; onChange: (v: string[]) => void }) {
    const [open, setOpen] = useState(false);
    const [filter, setFilter] = useState("");

    const toggleOption = (opt: string) => {
        if (value.includes(opt)) onChange(value.filter(v => v !== opt));
        else onChange([...value, opt]);
    };

    return (
        <div className="values-multiselect">
            <div className="vm-header" onClick={() => setOpen(o => !o)} role="button" tabIndex={0}>
                <div className="vm-chips">
                    {value && value.length > 0 ? (
                        value.map(v => (
                            <span key={v} className="vm-chip">
                                <span className="vm-chip-label">{v}</span>
                                <button
                                    type="button"
                                    className="vm-chip-remove"
                                    onClick={(e) => { e.stopPropagation(); onChange(value.filter(x => x !== v)); }}
                                    aria-label={`Remove ${v}`}
                                >
                                    ✕
                                </button>
                            </span>
                        ))
                    ) : (
                        <span className="vm-placeholder">Choose options</span>
                    )}
                </div>
                <div className="vm-caret">▾</div>
            </div>
            {open && (
                <div className="vm-dropdown" onClick={(e) => e.stopPropagation()}>
                    <div className="vm-search-wrapper p-2">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="vm-search-input w-full px-2 py-1 rounded border"
                        />
                    </div>
                    <ul>
                        {options
                            .filter(opt => opt.toLowerCase().includes(filter.trim().toLowerCase()))
                            .map(opt => (
                                <li key={opt} className={value.includes(opt) ? 'selected' : ''} onClick={() => toggleOption(opt)}>
                                    <span className="opt-label">{opt}</span>
                                    {value.includes(opt) && <span className="opt-check">✓</span>}
                                </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

function SingleSelect({ options, value, onChange, placeholder = 'Choose options' }: { options: string[]; value: string | undefined; onChange: (v: string) => void; placeholder?: string }) {
    const [open, setOpen] = useState(false);
    const [filter, setFilter] = useState("");
    return (
        <div className="values-multiselect single-select">
            <div className="vm-header" onClick={() => setOpen(o => !o)} role="button" tabIndex={0}>
                <div className="vm-chips">
                    {value ? <span className="vm-selected-single">{value}</span> : <span className="vm-placeholder">{placeholder}</span>}
                </div>
                <div className="vm-caret">▾</div>
            </div>
            {open && (
                <div className="vm-dropdown" onClick={(e) => e.stopPropagation()}>
                    <div className="vm-search-wrapper p-2">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="vm-search-input w-full px-2 py-1 rounded border"
                        />
                    </div>
                    <ul>
                        {options
                            .filter(opt => opt.toLowerCase().includes(filter.trim().toLowerCase()))
                            .map(opt => (
                                <li key={opt} className={value === opt ? 'selected' : ''} onClick={() => { onChange(opt); setOpen(false); }}>
                                    <span className="opt-label">{opt}</span>
                                    {value === opt && <span className="opt-check">✓</span>}
                                </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}




const PivotTableSelector: React.FC<PivotTableSelectorProps> = ({
    selectedRows,
    selectedCols,
    selectedValues,
    selectedAggregation,
    allowedRows,
    allowedCols,
    allowedVals,
}) => {
    // default allowed rows to include common grouping fields
    const defaultAllowedRows = [
        "AP-CB/Subcon", "Company", "Control 1", "Currency", "Discipline", "ID", "Kntrol-2", "Kontrol-1", "LS/Unit Rate", "NO-1","NO-2","NO-3","NO-10",
        "Name Surname","Nationality","Office Location", "PP","Projects","Projects/Group","Scope","Status,","TM-Kod","TM-List", "North/ South","\u0130\u015fveren - Currency",
        "\u0130\u015fveren- Hakedi\u015f D\u00f6nemi", "\u0130\u015fveren- Hakedi\u015f Kapsam", "\u0130\u015fveren- Hakedi\u015f No", "\u0130\u015fveren- S\u00f6zle\u015fme No"

    ];
    const effectiveAllowedRows = (allowedRows && allowedRows.length) ? allowedRows : defaultAllowedRows;
    
    const defaultAllowedCols = ["(Week / Month)",
        "AP-CB/Subcon", "Company", "Control 1", "Currency", "Discipline", "ID", "Kntrol-2", "Kontrol-1", "LS/Unit Rate", "NO-1","NO-2","NO-3","NO-10",
        "Name Surname","Nationality","Office Location", "PP","Projects","Projects/Group","Scope","Status,","TM-Kod","TM-List", "North/ South","\u0130\u015fveren - Currency",
        "\u0130\u015fveren- Hakedi\u015f D\u00f6nemi", "\u0130\u015fveren- Hakedi\u015f Kapsam", "\u0130\u015fveren- Hakedi\u015f No", "\u0130\u015fveren- S\u00f6zle\u015fme No"

    ];
    const effectiveAllowedCols = (allowedCols && allowedCols.length) ? allowedCols : defaultAllowedCols;
    

    const defaultAllowedVals = [
        "Actual Value", "Cost", "General Total Cost (USD)", "Hourly Unit Rate (USD)", "\u0130\u015fveren- Hakedi\u015f","\u0130\u015fveren- Hakedi\u015f (USD)", "\u0130\u015fveren-Hakedi\u015f Birim Fiyat (USD)",
        "KAR/ZARAR", "BF KAR/ZARAR", "TOTAL MH", "Kuzey MH" , "Kuzey MH Person", "Hourly Additional Rates", "Hourly Base Rate","Hourly Rate","Hourly Unit Rate (USD)",
    ]

    const effectiveAllowedVals = (allowedVals && allowedVals.length) ? allowedVals : defaultAllowedVals;


    const [data, setData] = useState<(string | number)[][]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    interface PivotState {
        data: (string | number)[][];
        rows?: string[];
        cols?: string[];
        vals?: string[];
        aggregatorName?: string;
        rendererName?: string;
        [key: string]: unknown;
    }
    const [pivotState, setPivotState] = useState<PivotState>({ data: [] });

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch('http://localhost:5000/api/data');
                const result = await response.json();
                if (result.success && Array.isArray(result.records)) {
                    if (result.records.length > 0) {
                        // compute calculated fields and ensure required columns exist
                        const enriched = result.records.map((r: Record<string, string | number>) => {
                            const karZarar = (Number(r['İşveren- Hakediş (USD)'] ?? 0) - Number(r['General Total Cost (USD)'] ?? 0)).toFixed(2);
                            const bfKarZarar = (Number(r['\u0130\u015fveren-Hakedi\u015f Birim Fiyat (USD)'] ?? 0) - Number(r['Hourly Unit Rate (USD)'] ?? 0)).toFixed(2);
                            return { ...r, 'KAR/ZARAR': karZarar, 'BF KAR/ZARAR': bfKarZarar };
                        });

                        const baseColumns = Object.keys(enriched[0]);
                        const required = ['KAR/ZARAR', 'BF KAR/ZARAR'];
                        const allColumns = Array.from(new Set([...baseColumns, ...required]));
                        const stringColumns = allColumns.map(String);
                        const rows = enriched.map(r => allColumns.map(col => String(r[col] ?? '')));

                        setData([stringColumns, ...rows]);
                        setPivotState((prev) => ({
                            ...prev,
                            data: [stringColumns, ...rows],
                            vals: (prev.vals && prev.vals.length > 0) ? prev.vals : required.filter(c => stringColumns.includes(c)),
                        }));
                    } else {
                        setData([]);
                        setPivotState((prev) => ({ ...prev, data: [] }));
                    }
                } else {
                    setError('No records found or error in response');
                    console.log('No records found or error in response');
                }
            } catch (err) {
                console.log(err);
                setError('Failed to fetch data');
            }
            setLoading(false);
        }
        fetchData();
    }, []);

    // Update pivot state when props change
    useEffect(() => {
        setPivotState((prev) => ({
            ...prev,
            rows: selectedRows,
            cols: selectedCols,
            vals: selectedValues,
            aggregatorName: selectedAggregation,
        }));
    }, [selectedRows, selectedCols, selectedValues, selectedAggregation]);

    // Get column names for controls
    const columnOptions = useMemo(() => (data.length > 0 ? (data[0] as string[]) : []), [data]);

    // Filtered options per control (use allowed lists if provided, and only include columns that actually exist)
    const rowOptions = useMemo(() => {
        const base = columnOptions;
        if (effectiveAllowedRows && effectiveAllowedRows.length) return effectiveAllowedRows.filter(a => base.includes(a));
        return base;
    }, [effectiveAllowedRows, columnOptions]);

    const colOptions = useMemo(() => {
        const base = columnOptions;
        if (effectiveAllowedCols && effectiveAllowedCols.length) return effectiveAllowedCols.filter(a => base.includes(a));
        return base;
    }, [effectiveAllowedCols, columnOptions]);

    const valOptions = useMemo(() => {
        const base = columnOptions;
        if (effectiveAllowedVals && effectiveAllowedVals.length) return effectiveAllowedVals.filter(a => base.includes(a));
        return base;
    }, [effectiveAllowedVals, columnOptions]);

    // Ensure pivotState selections stay within the allowed options
    useEffect(() => {
        setPivotState(prev => {
            const rows = (prev.rows || []).filter((r: string) => rowOptions.includes(r));
            const cols = (prev.cols || []).filter((c: string) => colOptions.includes(c));
            const vals = (prev.vals || []).filter((v: string) => valOptions.includes(v));
            if (rows.length === (prev.rows || []).length && cols.length === (prev.cols || []).length && vals.length === (prev.vals || []).length) return prev;
            return { ...prev, rows, cols, vals };
        });
    }, [rowOptions, colOptions, valOptions]);

    // raw data rows (exclude header row)
    const dataRows = useMemo(() => {
        return data.length > 1 ? (data.slice(1) as string[][]) : [];
    }, [data]);

    // data to render in pivot: header + all raw rows (filters removed)
    const pivotRenderData = useMemo(() => {
        const hdr = columnOptions;
        return hdr.length > 0 ? [hdr, ...dataRows] : [] as string[][];
    }, [columnOptions, dataRows]);

    // If user selected exactly one row field and multiple value fields, build a simple aggregated table
    const customAggregated = useMemo(() => {
        const rowsField = (pivotState.rows && pivotState.rows.length === 1) ? pivotState.rows[0] : null;
        const vals = pivotState.vals || [];
        if (!rowsField || !vals || vals.length <= 1) return null;
        const hdr = pivotRenderData[0] as string[];
        const idxMap: Record<string, number> = {};
        hdr.forEach((h, i) => idxMap[h] = i);
        if (idxMap[rowsField] === undefined) return null;
        for (const v of vals) if (idxMap[v] === undefined) return null;

        const groups: Record<string, Record<string, number>> = {};
        for (const r of pivotRenderData.slice(1) as string[][]) {
            const key = String(r[idxMap[rowsField]] ?? '');
            if (!groups[key]) groups[key] = {};
            for (const v of vals) {
                const colIdx = idxMap[v];
                const raw = r[colIdx];
                const num = Number(String(raw).replace(/,/g, '')) || 0;
                groups[key][v] = (groups[key][v] || 0) + num;
            }
        }

        // Convert to array of rows
        const out = Object.keys(groups).map(k => ({ key: k, values: groups[k] }));
        // compute totals per value
        const totals: Record<string, number> = {};
        for (const v of vals) totals[v] = out.reduce((s, row) => s + (row.values[v] || 0), 0);

        return { rows: out, vals, totals } as { rows: Array<{ key: string; values: Record<string, number> }>; vals: string[]; totals: Record<string, number> };
    }, [pivotRenderData, pivotState.rows, pivotState.vals]);

    return (
        <div>
            {loading && <div>Loading data...</div>}
            {error && <div style={{ color: 'red' }}>{error}</div>}
            {/* Debug: Show first few rows of data */}
            
            {!loading && !error && columnOptions.length > 0 && (
                <div className="pivot-table-controls-modern">
                    <div className="pivot-table-card">
                        <div className="pivot-table-row">
                            <label className="pivot-label">Row Choice</label>
                            <ValuesMultiSelect
                                options={rowOptions}
                                value={pivotState.rows || []}
                                onChange={(opts) => setPivotState(prev => ({ ...prev, rows: opts }))}
                            />
                        </div>
                        <div className="pivot-table-row">
                            <label className="pivot-label">Column Choice</label>
                            <ValuesMultiSelect
                                options={colOptions}
                                value={pivotState.cols || []}
                                onChange={(opts) => setPivotState(prev => ({ ...prev, cols: opts }))}
                            />
                        </div>
                        <div className="pivot-table-row">
                            <label className="pivot-label">Values</label>
                            <div>
                                <ValuesMultiSelect
                                    options={valOptions}
                                    value={pivotState.vals || []}
                                    onChange={(opts) => setPivotState(prev => ({ ...prev, vals: opts }))}
                                />
                            </div>
                        </div>
                        <div className="pivot-table-row">
                            <label className="pivot-label">Aggregation Type</label>
                            <SingleSelect
                                options={["Sum", "Count", "Average"]}
                                value={(pivotState.aggregatorName as string) || "Sum"}
                                onChange={(v) => setPivotState(prev => ({ ...prev, aggregatorName: v }))}
                                placeholder="Choose aggregation"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Filters removed as requested */}
                {/* Visible Button */}
                

                {/* Pivot Table Placeholder */}
                
            <div id="pivot-table-output">
                {(!loading && !error && (!pivotState.data || pivotState.data.length === 0)) && (
                    <div style={{ color: 'orange', margin: '10px 0' }}>No data available for the pivot table.</div>
                )}

                {/* If customAggregated exists, render our simple table showing each selected value as a separate column */}
                {customAggregated ? (
                    <div className="custom-pivot-table-wrap">
                        <table className="custom-pivot-table">
                            <thead>
                                <tr>
                                    <th>{pivotState.rows![0]}</th>
                                    {customAggregated.vals.map(v => <th key={v}>{v}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {customAggregated.rows.map(r => (
                                    <tr key={r.key}>
                                        <td className="cp-key">{r.key}</td>
                                        {customAggregated.vals.map(v => <td key={v} className="cp-val">{Number(r.values[v] || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>)}
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td className="cp-total">Totals</td>
                                    {customAggregated.vals.map(v => <td key={v} className="cp-val cp-total-val">{Number(customAggregated.totals[v] || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>)}
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                ) : (
                    <PivotTable
                        data={(pivotRenderData || []).map(row => row.map(cell => String(cell)))}
                        rows={pivotState.rows || []}
                        cols={pivotState.cols || []}
                        vals={pivotState.vals || []}
                        aggregatorName={pivotState.aggregatorName || "Sum"}
                        renderers={Object.assign({}, TableRenderers, PlotlyRenderers)}
                        rendererName="Table"
                    />
                )}
            </div>
            
        </div>
    );
};

export default PivotTableSelector;
