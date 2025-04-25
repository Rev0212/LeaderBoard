import React, { useState } from 'react';
import { X } from 'lucide-react';

const EventDetailsModal = ({ event, onClose, onApprove, onReject }) => {
  const [isLoading, setIsLoading] = useState(false);

  if (!event) return null;

  const handleStatusUpdate = (newStatus) => {
    setIsLoading(true);

    // Simulate a delay for loading state
    setTimeout(() => {
      // Call the appropriate callback based on the status
      if (newStatus === 'Approved') {
        onApprove();
      } else {
        onReject();
      }
      setIsLoading(false);
    }, 1000); // 1 second delay to mimic processing
  };

  // Format field name for display (convert camelCase to Title Case with spaces)
  const formatFieldName = (key) => {
    // Remove customAnswer_ prefix if present
    key = key.replace(/^customAnswer_/, '');
    
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/^./, str => str.toUpperCase());
  };

  // Properties to exclude from display
  const excludedProps = ['_id', '__v', 'createdAt', 'updatedAt', 'proofUrl', 'pdfDocument', 'customAnswers', 'dynamicFields'];

  // Function to render appropriate value based on type
  const renderValue = (key, value) => {
    if (value === null || value === undefined) return 'N/A';

    if (key === 'date') {
      return new Date(value).toLocaleDateString();
    } else if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    } else if (typeof value === 'object') {
      if (key === 'submittedBy' && value.name) {
        return value.name;
      } else if (key === 'approvedBy' && value.name) {
        return value.name;
      }
      return "[Object]"; // Fallback for any other objects
    }
    return value.toString();
  };

  // Check if a key is a customAnswer field
  const isCustomAnswerField = (key) => key.startsWith('customAnswer_');

  // Get all custom answer fields from the event object
  const getCustomAnswerFields = () => {
    return Object.entries(event)
      .filter(([key]) => isCustomAnswerField(key))
      .map(([key, value]) => ({
        key: formatFieldName(key),
        value: value
      }));
  };

  // Get all custom answers from the customAnswers object
  const getNestedCustomAnswers = () => {
    if (!event.customAnswers || Object.keys(event.customAnswers).length === 0) {
      return [];
    }
    
    return Object.entries(event.customAnswers)
      .map(([key, value]) => ({
        key: formatFieldName(key),
        value: value
      }));
  };

  // Combined array of all custom answers from both sources
  const getAllCustomAnswers = () => {
    return [...getCustomAnswerFields(), ...getNestedCustomAnswers()];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
          disabled={isLoading}
        >
          <X className="h-6 w-6" />
        </button>

        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Event Details</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Basic Information Section */}
          <div className="space-y-3">
            <h4 className="font-semibold text-lg mb-3 text-blue-700">Basic Information</h4>
            
            {/* Render the student name and event name first if available */}
            {event.submittedBy && (
              <div className="mb-2 break-words">
                <span className="font-medium">Student:</span> {event.submittedBy.name}
              </div>
            )}
            
            <div className="mb-2 break-words">
              <span className="font-medium">Event Name:</span> {event.eventName}
            </div>
            
            <div className="mb-2 break-words">
              <span className="font-medium">Date:</span> {new Date(event.date).toLocaleDateString()}
            </div>
            
            <div className="mb-2 break-words">
              <span className="font-medium">Category:</span> {event.category}
            </div>
            
            {/* Display all custom answers here */}
            {getAllCustomAnswers().map(({ key, value }) => (
              <div key={key} className="mb-2 break-words">
                <span className="font-medium">{key}:</span> {value.toString()}
              </div>
            ))}
            
            {/* Dynamically render all other fields that should appear in basic info */}
            {Object.entries(event).filter(([key]) => 
              !excludedProps.includes(key) && 
              !isCustomAnswerField(key) &&
              !['submittedBy', 'eventName', 'date', 'category', 'description', 'status', 'pointsEarned'].includes(key)
            ).map(([key, value]) => (
              <div key={key} className="mb-2 break-words">
                <span className="font-medium">{formatFieldName(key)}:</span> {renderValue(key, value)}
              </div>
            ))}
          </div>
          
          {/* Status and Description Section */}
          <div className="space-y-3">
            <h4 className="font-semibold text-lg mb-3 text-blue-700">Additional Details</h4>
            
            <div className="mb-2 break-words">
              <span className="font-medium">Status:</span>{' '}
              <span
                className={`px-2 py-1 rounded-full text-sm ${
                  event.status === 'Pending' 
                    ? 'bg-yellow-100 text-yellow-800'
                    : event.status === 'Approved'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {event.status}
              </span>
            </div>
            
            {event.pointsEarned !== undefined && (
              <div className="mb-2 break-words">
                <span className="font-medium">Points Earned:</span> {event.pointsEarned || 'Not yet calculated'}
              </div>
            )}
            
            <div className="mb-2">
              <span className="font-medium">Description:</span>
              <div className="mt-1 p-3 bg-gray-50 rounded-md text-gray-700 break-words">
                {event.description || 'No description provided'}
              </div>
            </div>
          </div>
        </div>

        {/* Certificate Preview Section */}
        {event.proofUrl && event.proofUrl.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-lg mb-3 text-blue-700">Certificate</h4>
            <div className="p-4 bg-gray-50 rounded-md">
              <img 
                src={event.proofUrl[0].startsWith('/uploads') 
                  ? `${import.meta.env.VITE_BASE_URL}${event.proofUrl[0]}` 
                  : `${import.meta.env.VITE_BASE_URL}/uploads/certificates/${event.proofUrl[0]}`
                }
                alt="Certificate"
                className="max-h-[200px] max-w-full object-contain mx-auto"
              />
              {event.proofUrl.length > 1 && (
                <div className="text-center mt-2 text-sm text-blue-600">
                  +{event.proofUrl.length - 1} more certificate(s)
                </div>
              )}
            </div>
          </div>
        )}

        {/* PDF Document Link */}
        {event.pdfDocument && (
          <div className="mb-6">
            <h4 className="font-semibold text-lg mb-3 text-blue-700">PDF Document</h4>
            <a 
              href={event.pdfDocument.startsWith('/uploads') 
                ? `${import.meta.env.VITE_BASE_URL}${event.pdfDocument}` 
                : `${import.meta.env.VITE_BASE_URL}/uploads/pdf/${event.pdfDocument}`
              } 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center p-4 bg-gray-50 rounded-md text-blue-600 hover:text-blue-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              View PDF Document
            </a>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
          >
            Close
          </button>
          {event.status === 'Pending' && (
            <>
              <button
                onClick={() => handleStatusUpdate('Approved')}
                disabled={isLoading}
                className={`px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Processing...' : 'Approve'}
              </button>
              <button
                onClick={() => handleStatusUpdate('Rejected')}
                disabled={isLoading}
                className={`px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Processing...' : 'Reject'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetailsModal;
