import React, { useEffect, useState, ComponentType } from 'react';
import { Pie } from 'react-chartjs-2';




export default function PieChart() {
  const [data, setData] = useState<number[]>([0, 0]);
  const [PieComp, setPieComp] = useState<ComponentType<unknown> | null>(null);
  
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        // dynamic import chart libraries to avoid build-time type errors
       
        const ChartJSModule = await import('chart.js');
      
        const R = await import('react-chartjs-2');
        // register required components
        if (ChartJSModule && ChartJSModule.Chart) {
          ChartJSModule.Chart.register(ChartJSModule.ArcElement, ChartJSModule.Tooltip, ChartJSModule.Legend);
        }
             if (mounted) setPieComp(() => R.Pie as ComponentType<unknown>);


        const response = await fetch("http://localhost:5000/api/stats");
        const result = await response.json();
        const apcbCount = result.apcb || 0;
        const subconCount = result.subcon || 0;
        if (mounted) setData([apcbCount, subconCount]);
      } catch (error) {
        console.error("Error initializing pie chart or fetching data:", error);
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, []);
  return (
    <div className="h-[300px] w-full">
      {PieComp ? (
        React.createElement(PieComp as ComponentType<Record<string, unknown>>, {
          data: {
            labels: ['AP-CB', 'Subcon'],
            datasets: [
              {
                label: 'Çalışan Dağılımı',
                data: data,
                backgroundColor: [
                  'rgba(54, 162, 235, 0.6)',
                  'rgba(255, 206, 86, 0.6)',
                ],
                borderColor: [
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)',
                ],
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'top' as const,
              },
              title: {
                display: true,
                text: 'Şirkete Göre Çalışan Dağılımı',
              },
            },
          },
        })
      ) : (
        <div className="flex items-center justify-center h-full">Loading chart...</div>
      )}
      
    </div>
    
  );
}

