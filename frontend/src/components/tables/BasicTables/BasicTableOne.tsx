import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";

const chartTypes = [
  { value: "line", label: "Line Chart" },
  { value: "bar", label: "Bar Chart" },
  { value: "pie", label: "Pie Chart" },
];

export default function BasicTableOne() {
  const [data, setData] = useState<{ labels: string[]; values: number[] }>({ labels: [], values: [] });
  const [chartType, setChartType] = useState("line");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/data");
        const result = await response.json();
        // Expecting result to be an array of objects with { ay, karZarar }
        const labels = result.map((item: { ay: string }) => item.ay);
        const values = result.map((item: { karZarar: number }) => item.karZarar);
        setData({ labels, values });
      } catch (err) {
        console.log(err)
        setError("Veri alınamadı.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  let plotData: any[] = [];
  let layout: any =  { xaxis: { title: "Ay" }, yaxis: { title: "Değer" } };

  if (chartType === "line") {
    plotData = [
      {
        x: data.labels,
        y: data.values,
        type: "scatter",
        mode: "lines+markers",
        marker: { color: "#465FFF" },
        name: "Kar Zarar",
      },
    ];
  } else if (chartType === "bar") {
    plotData = [
      {
        x: data.labels,
        y: data.values,
        type: "bar",
        marker: { color: "#465FFF" },
        name: "Kar Zarar",
      },
    ];
  } else if (chartType === "pie") {
    plotData = [
      {
        labels: data.labels,
        values: data.values,
        type: "pie",
        name: "Kar Zarar",
      },
    ];
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <div className="mb-4 flex gap-2 items-center">
        <label htmlFor="chartType" className="font-medium" style={{ color: "white" }}>Grafik Tipi:</label>
        <select
          id="chartType"
          value={chartType}
          onChange={e => setChartType(e.target.value)}
          className="border rounded px-2 py-1 bg-[#3641f5] text-white focus:outline-none focus:ring-2 focus:ring-[#3641f5]"
        >
          {chartTypes.map(type => (
            <option key={type.value} value={type.value} className="text-black">{type.label}</option>
          ))}
        </select>
      </div>
      {loading ? (
        <div>Yükleniyor...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <Plot
          data={plotData}
          layout={layout}
          style={{ width: "100%", height: "400px" }}
          config={{ responsive: true }}
        />
      )}
    </div>
  );
}