import React from "react";
import { ArrowLeft } from "lucide-react";

const EventsList = ({ studentData, handleBackToDashboard }) => {
  console.log(studentData)
  return (
    <div className="p-6 w-full h-full space-y-6">
      {/* Back Button */}
      <button
        onClick={handleBackToDashboard}
        className="flex items-center gap-2 text-blue-500 hover:underline"
      >
        <ArrowLeft size={20} />
        Back to Dashboard
      </button>

      {/* Events List */}
      <div className="border p-6 rounded-lg shadow-lg bg-white w-full h-full">
        <h2 className="text-2xl font-bold mb-6">Events Participated</h2>
        {studentData?.eventsParticipated?.length > 0 ? (
          <ul className="space-y-4">
            {studentData.eventsParticipated.map((event) => (
              <li
                key={event._id}
                className="p-6 border rounded-lg shadow-md flex flex-col gap-4 bg-gray-50"
              >
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-xl">{event.eventName}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(event.date).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-md text-gray-700">{event.description}</p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span>Category: {event.category}</span>
                  <span>Position: {event.positionSecured}</span>
                  <span>Points Earned: {event.pointsEarned}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No events participated yet.</p>
        )}
      </div>
    </div>
  );
};

export default EventsList;
