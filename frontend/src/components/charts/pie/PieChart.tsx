import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useEffect, useState } from "react";

export default function PieChart() {
  const [series, setSeries] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);

  useEffect(() => {
    const dataCollect = async () => {
      try {
        const response = await fetch("/api/get-graph-data?type=pie");
        const result = await response.json();
        if (result.success && result.data) {
          setSeries(result.data.series);
          setLabels(result.data.labels);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    dataCollect();
  }, []);
  
  const options: ApexOptions = {
    chart: {
      type: "pie",
      height: 350,
    },
    labels: labels,
    legend: {
      position: "bottom",
      fontFamily: "Outfit",
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };
  
  return (
    <div className="max-w-full overflow-x-auto custom-scrollbar">
      <div className="mb-3">
        <h3 className="text-lg font-semibold">Pie Chart</h3>
      </div>
      <div id="chartOne">
        <Chart options={options} series={series} type="pie" height={350} />
      </div>
    </div>
  );
}
