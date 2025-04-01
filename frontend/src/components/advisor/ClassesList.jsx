import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, School, Calendar } from 'lucide-react';

const ClassesList = ({ classes, initialYearFilter = "all", availableYears = [], handleBackToDashboard }) => {
  const navigate = useNavigate();
  const [yearFilter, setYearFilter] = useState(initialYearFilter);
  const [filteredClasses, setFilteredClasses] = useState(classes);

  useEffect(() => {
    if (classes.length > 0) {
      if (yearFilter === "all") {
        setFilteredClasses(classes);
      } else {
        const year = parseInt(yearFilter);
        setFilteredClasses(classes.filter(classItem => classItem.year === year));
      }
    }
  }, [classes, yearFilter]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">All Classes</h1>
        
        <div className="mt-3 sm:mt-0">
          <select
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setYearFilter(e.target.value)}
            value={yearFilter}
          >
            <option value="all">All Years</option>
            {availableYears.map(year => (
              <option key={year} value={year}>Year {year}</option>
            ))}
          </select>
        </div>
      </div>
      
      {filteredClasses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((classItem) => (
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
          <p className="text-gray-500 text-lg">No classes found with the current filter.</p>
          <p className="text-gray-400 mt-2">
            Try selecting a different year filter.
          </p>
        </div>
      )}
    </div>
  );
};

export default ClassesList;