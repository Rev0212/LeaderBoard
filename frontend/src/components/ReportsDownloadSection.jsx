import React from 'react';
import { Download } from 'lucide-react';
import axios from 'axios';

const ReportsDownloadSection = ({ baseURL }) => {
  const downloadOptions = [
    { id: 'top-students', label: 'Top Students Report' },
    { id: 'class-performance', label: 'Class Performance Report' },
    { id: 'category-performance', label: 'Category Performance by Class Report' },
    { id: 'popular-categories', label: 'Popular Categories Report' },
    { id: 'approval-rates', label: 'Approval Rates Report' }
  ];

  const handleDownload = async (reportType) => {
    try {
      const response = await axios.get(`${baseURL}/reports/download/${reportType}`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}-report.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Error downloading report');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">Download Reports</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {downloadOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => handleDownload(option.id)}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download size={20} />
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ReportsDownloadSection; 