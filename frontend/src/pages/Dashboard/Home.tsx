import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import MonthlyTarget from "../../components/ecommerce/PivotTableOnMainPage";
import FilteredMHTable from "../../components/ecommerce/FilteredMHTable";
import KarZararTrendsCharts from "../../components/ecommerce/KarZararTrendsCharts";
import KarZararBarCharts from "../../components/ecommerce/KarZararBarCharts";
import TotalMHPieCharts from "../../components/ecommerce/TotalMHPieCharts";
import PageMeta from "../../components/common/PageMeta";

export default function Home() {
  return (
    <>
      <PageMeta
        title="React.js Ecommerce Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Ecommerce Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* Filtered MH Table - Full Width at Top */}
        <div className="col-span-12">
          <FilteredMHTable />
        </div>

        {/* Kar-Zarar Trends Charts - Full Width */}
        <div className="col-span-12">
          <KarZararTrendsCharts />
        </div>

        {/* Kar-Zarar Bar Charts - Full Width */}
        <div className="col-span-12">
          <KarZararBarCharts />
        </div>

        {/* Total MH Pie Charts - Full Width */}
        <div className="col-span-12">
          <TotalMHPieCharts />
        </div>

        <div className="col-span-12 space-y-6 xl:col-span-7">
          <MonthlySalesChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <MonthlyTarget />
        </div>

        <div className="col-span-12">
          <StatisticsChart />
        </div>

        {/* DemographicCard removed */}

       
      </div>
    </>
  );
}
