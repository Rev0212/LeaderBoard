import React from "react";
import { ArrowLeft } from "lucide-react";
import ReportsPage from "../ReportsPage";

const ReportSection = ({ handleBackToDashboard }) => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <button
        onClick={handleBackToDashboard}
        className="flex items-center gap-2 text-blue-500 hover:underline mb-6"
      >
        <ArrowLeft size={20} />
        Back to Dashboard
      </button>

      <div className="bg-white rounded-lg shadow-md">
        <ReportsPage isEmbedded={true} />
      </div>
    </div>
  );
};

export default ReportSection;