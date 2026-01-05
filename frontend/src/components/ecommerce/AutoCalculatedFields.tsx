import { useState, useEffect } from 'react';
import { apiFetch, downloadFile } from '../../utils/api';

interface AutoField {
  name: string;
  description: string;
  formula: string;
  icon: string;
}

interface AutoFieldsData {
  fields: AutoField[];
  total_auto_fields: number;
  manual_fields: string[];
  info: string;
}

export default function AutoCalculatedFields() {
  const [data, setData] = useState<AutoFieldsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchAutoFields();
  }, []);

  const fetchAutoFields = async () => {
    try {
      const result = await apiFetch<AutoFieldsData>('/api/auto-calculated-fields');
      setData(result);
    } catch (error) {
      console.error('Error fetching auto-calculated fields:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadCalculatedData = async () => {
    try {
      setDownloading(true);
      await downloadFile('/api/download-calculated-data', 'calculated_data.xlsx');
    } catch (error) {
      console.error('Download error:', error);
      if ((error as Error).message !== 'Session expired') {
        alert('Error downloading file: ' + (error as Error).message);
      }
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const getIconClass = (iconName: string) => {
    return `fas fa-${iconName}`;
  };

  return (
    <div className="mt-6 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            🤖 Auto-Calculated Fields
          </h3>
          <div className="flex gap-2">
            <button
              onClick={downloadCalculatedData}
              disabled={downloading}
              className="rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {downloading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Generating...
                </>
              ) : (
                <>
                  <i className="fas fa-download mr-2"></i>
                  Download Excel
                </>
              )}
            </button>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="rounded-md bg-primary px-4 py-2 text-sm text-white hover:bg-opacity-90"
            >
              <i className="fas fa-info-circle mr-2"></i>
              {showDetails ? 'Hide' : 'Show'} Details
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Info Alert */}
        <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-900/10">
          <div className="flex items-start">
            <i className="fas fa-magic mt-1 text-blue-600 dark:text-blue-400"></i>
            <div className="ml-3">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Note:</strong> {data.info}
              </p>
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                <i className="fas fa-lightbulb mr-1"></i>
                Click "Download Excel" to verify formulas. Manual input fields are highlighted in{' '}
                <span className="rounded bg-blue-500 px-2 py-0.5 text-white">blue</span> and
                auto-calculated fields in{' '}
                <span className="rounded bg-green-500 px-2 py-0.5 text-white">green</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
                <i className="fas fa-robot text-xl text-green-600 dark:text-green-400"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Auto-Calculated Fields</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white/90">
                  {data.total_auto_fields}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
                <i className="fas fa-keyboard text-xl text-blue-600 dark:text-blue-400"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Manual Input Fields</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white/90">
                  {data.manual_fields.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Manual Fields */}
        <div className="mb-6">
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-800/50">
              <h4 className="font-semibold text-gray-800 dark:text-white/90">
                <i className="fas fa-keyboard mr-2"></i>
                Manual Input Fields
              </h4>
            </div>
            <div className="p-4">
              <div className="flex flex-wrap gap-2">
                {data.manual_fields.map((field, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center rounded-full bg-blue-500 px-3 py-1 text-xs font-medium text-white dark:bg-blue-600"
                  >
                    <i className="fas fa-edit mr-1"></i>
                    {field}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Auto-Calculated Fields Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.fields.map((field, index) => (
            <div
              key={index}
              className="rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-white/[0.03]"
            >
              <div className="p-4">
                <h5 className="mb-2 flex items-center text-base font-semibold text-green-700 dark:text-green-400">
                  <i className={`${getIconClass(field.icon)} mr-2`}></i>
                  {field.name}
                </h5>
                <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">{field.description}</p>
                
                {showDetails && (
                  <div className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-700">
                    <p className="mb-1 text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Formula:
                    </p>
                    <code className="block rounded bg-gray-100 p-2 text-xs text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                      {field.formula}
                    </code>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
