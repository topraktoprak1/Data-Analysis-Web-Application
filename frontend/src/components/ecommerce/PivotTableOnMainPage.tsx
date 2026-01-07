import { useEffect, useState } from 'react';
import PieChart from '../ecommerce/PieChart';

interface CompanyRow {
    Company: string;
    KAR_ZARAR: number;
    TOTAL_MH: number;
}

export default function CompanyTable() {
    const [rows, setRows] = useState<CompanyRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchCompanies() {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch('http://localhost:5000/api/data');
                const result = await response.json();
                if (result.success && Array.isArray(result.records)) {
                    // Map backend data to required columns
                    // Aggregate by company
                    const aggregation: { [company: string]: { Company: string; KAR_ZARAR: number; TOTAL_MH: number } } = {};
                    result.records.forEach((r: any) => {
                        const company = r.Company || r.company || '-';
                        // Calculate KAR-ZARAR as (İşveren- Hakediş (USD) or İşveren- Hakediş) - General Total Cost (USD)
                        let karZarar = 0;
                        if (r["İşveren- Hakediş (USD)"] !== undefined && r["General Total Cost (USD)"] !== undefined) {
                            karZarar = Number(r["İşveren- Hakediş (USD)"]) - Number(r["General Total Cost (USD)"]);
                        } else if (r["İşveren- Hakediş"] !== undefined && r["General Total Cost (USD)"] !== undefined) {
                            karZarar = Number(r["İşveren- Hakediş"]) - Number(r["General Total Cost (USD)"]);
                        }
                        const totalMH = Number(r['TOTAL MH'] ?? r.total_mh ?? 0);
                        if (!aggregation[company]) {
                            aggregation[company] = { Company: company, KAR_ZARAR: 0, TOTAL_MH: 0 };
                        }
                        aggregation[company].KAR_ZARAR += karZarar;
                        aggregation[company].TOTAL_MH += totalMH;
                    });
                    setRows(Object.values(aggregation));
                } else {
                    setError('No records found or error in response');
                }
            } catch (err) {
                console.log(err)
                setError('Failed to fetch data');
            }
            setLoading(false);
        }
        fetchCompanies();
    }, []);

    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-2">Company Table</h3>
            <div className="mt-4 flex flex-col lg:flex-row gap-6">
                {/* Table Section */}
                <div className="flex-1">
                    {loading && <div className="text-base font-semibold text-gray-500 dark:text-gray-300">Loading...</div>}
                    {error && <div className="text-base font-semibold text-red-500 dark:text-red-400">{error}</div>}
                    {!loading && !error && (
                        <div style={{ maxHeight: 500, overflowY: 'auto' }}>
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-white">Company</th>
                                        <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-white">KAR-ZARAR</th>
                                        <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-white">TOTAL MH</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-white/[0.03]">
                                    {rows.map((row, idx) => (
                                        <tr key={idx} className="border-b border-gray-200 dark:border-gray-700">
                                            <td className="px-4 py-2 text-gray-800 dark:text-white">{row.Company}</td>
                                            <td className="px-4 py-2 text-gray-800 dark:text-white">{row.KAR_ZARAR}</td>
                                            <td className="px-4 py-2 text-gray-800 dark:text-white">{row.TOTAL_MH}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Pie Chart Section */}
                <div className="lg:w-80 flex-shrink-0">
                    <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-3">Şirkete Göre Çalışan Dağılımı</h4>
                    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-white/[0.03] p-3">
                        <PieChart />
                    </div>
                </div>
            </div>
        </div>
    );
}