import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, School, Calendar } from 'lucide-react';

const ClassesList = ({ classes, handleBackToDashboard }) => {
  const navigate = useNavigate();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <button
        onClick={handleBackToDashboard}
        className="flex items-center gap-2 text-blue-500 hover:underline mb-6"
      >
        <ArrowLeft size={20} />
        Back to Dashboard
      </button>
      
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">All Classes</h1>
      
      {classes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem) => (
            <div
              key={classItem._id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
              onClick={() => navigate(`/advisor-hod/class/${classItem._id}`)}
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {classItem.className || `${classItem.year}-${classItem.section}`}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <School className="h-5 w-5 mr-2" />
                    <span>{classItem.department}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span>{classItem.academicYear}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="h-5 w-5 mr-2" />
                    <span>{classItem.students?.length || 0} Students</span>
                  </div>
                </div>
              </div>
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-end">
                <span className="text-blue-600 text-sm hover:underline">View Details</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500 text-lg">No classes found.</p>
          <p className="text-gray-400 mt-2">
            Classes will appear here when they are assigned to you.
          </p>
        </div>
      )}
    </div>
  );
};

export default ClassesList;