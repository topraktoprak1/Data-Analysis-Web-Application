import { useEffect, useState } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  GroupIcon,
} from "../../icons";
import Badge from "../ui/badge/Badge";
import { GiProfit } from "react-icons/gi";
import DropzoneComponent from "../form/form-elements/DropZone";
import PieChart from "./PieChart";

export default function EcommerceMetrics() {
  const [data, setData] = useState<{
    totalEklenen: number;
    yeniEklenen: number;
    toplamKar: number;
  } | null>(null);

  const fetchMetrics = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/data");
      const result = await response.json();
      if (result.success) {
        setData({
          totalEklenen: result.totalEklenen,
          yeniEklenen: result.yeniEklenen,
          toplamKar: result.toplamKar,
        });
      }
    } catch (error) {
      console.error("Error fetching ecommerce metrics:", error);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <div>
      <div className="top-2">
        <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          Veri Setini Ekleyin
        </h2>
        <DropzoneComponent onUploadSuccess={fetchMetrics} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
        {/* <!-- Metric Item Start --> */}
        
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Girilmiş Kayıt Sayısı
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {data !== null ? data.totalEklenen : "Yükleniyor..."}
              </h4>
            </div>
            <Badge color="success">
              <ArrowUpIcon />
              {data !== null && data.totalEklenen > 0
                ? `${((data.yeniEklenen / data.totalEklenen) * 100).toFixed(2)}%`
                : ""}
            </Badge>
          </div>
        </div>
        {/* <!-- Metric Item Start --> */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <GiProfit className="text-gray-800 size-6 dark:text-white/90" />
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Bu aykı Kar-Zarar
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                {data !== null ? data.toplamKar.toFixed(2) : "Yükleniyor..."}
              </h4>
            </div>
            <Badge color="warning">
              <ArrowDownIcon />
              {data !== null && data.totalEklenen > 0
                ? `${((data.yeniEklenen / data.totalEklenen) * 100).toFixed(2)}%`
                : ""}
            </Badge>
          </div>
        </div>
        
      </div>
    </div>
  );
}
