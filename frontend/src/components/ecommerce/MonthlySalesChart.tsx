import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useState, useEffect} from "react";


export default function MonthlySalesChart() {
  const [data, setData] = useState<number[]>([]);
  const [year, setYear] = useState<number>(2025);

  useEffect(() => {
    async function fetchSalesData() {
      try {
        const response = await fetch('http://localhost:5000/api/data');
        const result = await response.json();
        if (result.success && Array.isArray(result.records)) {
          // Aggregate monthly KAR-ZARAR for the selected year
          const monthly = Array(12).fill(0);
          result.records.forEach((r: any) => {
            // Parse date and get year/month
            const dateStr = r['(Week / \nMonth)'] || r['(Week / Month)'] || r['Tarih'] || r['Date'];
            if (!dateStr || typeof dateStr !== "string" || dateStr.trim() === "") return;
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
            if (!dt || isNaN(dt.getTime())) return;
            if (dt.getFullYear() !== year) return;
            const monthIdx = dt.getMonth();
            // Calculate KAR-ZARAR
            let karZarar = 0;
            if (r["İşveren- Hakediş (USD)"] !== undefined && r["General Total Cost (USD)"] !== undefined) {
              karZarar = Number(r["İşveren- Hakediş (USD)"]) - Number(r["General Total Cost (USD)"]);
            } else if (r["İşveren- Hakediş"] !== undefined && r["General Total Cost (USD)"] !== undefined) {
              karZarar = Number(r["İşveren- Hakediş"]) - Number(r["General Total Cost (USD)"]);
            }
            monthly[monthIdx] += karZarar;
          });
          setData(monthly);
        }
      } catch (error) {
        console.error("Error fetching monthly sales data:", error);
      }
    }
    fetchSalesData();
  }, [year]);
  const options: ApexOptions = {
    colors: ["#465fff"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 350,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "39%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
      colors: ["transparent"],
    },
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    yaxis: {
      title: {
        text: undefined,
      },
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      opacity: 1,
    },

    tooltip: {
      x: {
        show: false,
      },
      y: {
        formatter: (val: number) => `${val}`,
      },
    },
  };
  const series = [
    {
      name: "Kar-Zarar",
      data: data.length > 0 ? data : [168, 385, 201, 298, 187, 195, 291, 110, 215, 390, 280, 112],
    },
  ];
 
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Ay Bazlı Kar-Zarar Grafiği ({year})
        </h3>
        <div className="flex items-center gap-2">
          <label htmlFor="year-select" className="text-sm text-gray-600 dark:text-gray-300">Yıl:</label>
          <select
            id="year-select"
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            className="border rounded px-2 py-1 text-sm bg-white dark:bg-gray-800 dark:text-white"
          >
            {[2023, 2024, 2025, 2026].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2" style={{ height: 370 }}>
          <Chart options={options} series={series} type="bar" height={350} />
        </div>
      </div>
    </div>
  );
}
