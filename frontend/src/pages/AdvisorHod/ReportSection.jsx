import React from "react";
import { ArrowLeft } from "lucide-react";
import ReportsPage from "../ReportsPage";

const ReportSection = ({ handleBackToDashboard }) => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-md">
        <ReportsPage isEmbedded={true} />
      </div>
    </div>
  );
};

export default ReportSection;