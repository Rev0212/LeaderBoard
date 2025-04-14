import React, { useState, useEffect } from 'react';
import { ArrowLeft, Pencil, FileText, Award, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import EventDetailsModal from '../../components/EventEditModel';

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;

const TeacherEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'approved', 'rejected', 'pending'
  const [certificateGallery, setCertificateGallery] = useState([]);
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { studentId, studentName } = location.state || {};

  const fetchAllEvents = async () => {
    try {
      const token = localStorage.getItem('teacher-token');
      
      const response = await axios.get(
        `${VITE_BASE_URL}/event/student-events/${studentId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      const transformedEvents = response.data.map(event => ({
        ...event,
        status: event.status || 'Pending'
      }));
      
      setEvents(transformedEvents);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch events. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      fetchAllEvents();
    }
  }, [studentId]);

  const updateEventStatus = async (eventId, newStatus) => {
    try {
      const token = localStorage.getItem('teacher-token');
      
      await axios.patch(
        `${VITE_BASE_URL}/event/edit/${eventId}`,
        {
          newStatus: newStatus
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      fetchAllEvents();
    } catch (err) {
      setError('Failed to update event status. Please try again.');
    }
  };

  const handleApprove = () => {
    if (selectedEvent && selectedEvent._id) {
      updateEventStatus(selectedEvent._id, 'Approved');
      setSelectedEvent(null);
    } else {
      alert('No event selected');
    }
  };

  const handleReject = () => {
    if (selectedEvent && selectedEvent._id) {
      updateEventStatus(selectedEvent._id, 'Rejected');
      setSelectedEvent(null);
    } else {
      alert('No event selected');
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleViewCertificates = (certificates) => {
    setCertificateGallery(certificates);
    setShowCertificateModal(true);
  };

  if (loading) {
    return (
      <div className="w-full h-48 flex items-center justify-center">
        <div className="text-gray-500">Loading events...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-48 flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-gray-100 min-h-screen">
      <div className="p-6 flex-1">
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-blue-500 hover:underline"
          >
            <ArrowLeft size={20} />
            Back to Class List
          </button>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            Events for {studentName}
          </h1>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-4">
            <label className="text-gray-700">Filter by Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-md px-3 py-1.5 text-gray-700 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Events</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        <div className="mb-6 flex gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm flex-1">
            <div className="text-sm text-gray-500">Total Events</div>
            <div className="text-2xl font-semibold">{events.length}</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm flex-1">
            <div className="text-sm text-gray-500">Approved</div>
            <div className="text-2xl font-semibold text-green-600">
              {events.filter(e => e.status === 'Approved').length}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm flex-1">
            <div className="text-sm text-gray-500">Rejected</div>
            <div className="text-2xl font-semibold text-red-600">
              {events.filter(e => e.status === 'Rejected').length}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm flex-1">
            <div className="text-sm text-gray-500">Pending</div>
            <div className="text-2xl font-semibold text-yellow-600">
              {events.filter(e => e.status === 'Pending').length}
            </div>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            No events found for this student
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200">
            <table className="w-full table-fixed divide-y divide-gray-200 bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                    Event Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/10">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/10">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/10">
                    Points
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/10">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                    PDF
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                    Certificate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                    Edit
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {events
                  .filter(event => statusFilter === 'all' || event.status === statusFilter)
                  .map((event) => (
                    <tr key={event._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 break-words">
                        {event.eventName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {event.date ? new Date(event.date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 break-words">
                        {event.category || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {event.pointsEarned || 'Yet to be Reviewed'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {event.pdfDocument && (
                          <a 
                            href={event.pdfDocument.startsWith('/uploads') 
                              ? `http://localhost:4000${event.pdfDocument}` 
                              : `http://localhost:4000/uploads/pdf/${event.pdfDocument}`
                            } 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <FileText className="text-blue-500 hover:text-blue-700" size={20} />
                          </a>
                        )}
                      </td>
                      <td className="px-6 py-4 group">
                        {event.proofUrl && event.proofUrl.length > 0 && (
                          <div className="relative">
                            <a 
                              href={event.proofUrl[0].startsWith('/uploads') 
                                ? `http://localhost:4000${event.proofUrl[0]}` 
                                : `http://localhost:4000/uploads/certificates/${event.proofUrl[0]}`
                              } 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              <Award className="text-amber-500 hover:text-amber-700" size={20} />
                            </a>
                            
                            {/* Badge only shows when more than 1 certificate, positioned closer to icon */}
                            {event.proofUrl.length > 1 && (
                              <button
                                onClick={() => handleViewCertificates(event.proofUrl)}
                                className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center hover:bg-blue-600"
                                title="View all certificates"
                              >
                                {event.proofUrl.length}
                              </button>
                            )}
                            
                            {/* Improved dropdown menu */}
                            {event.proofUrl.length > 1 && (
                              <div 
                                className="absolute top-6 -right-1 bg-white shadow-xl rounded-md p-2 hidden group-hover:block z-[100]"
                                style={{
                                  minWidth: "12rem", 
                                  maxHeight: "unset", 
                                  overflow: "visible", 
                                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
                                }}
                              >
                                <p className="text-xs font-medium text-gray-500 mb-2">All Certificates:</p>
                                <div className="space-y-1">
                                  {event.proofUrl.map((url, index) => (
                                    <a 
                                      key={index}
                                      href={url.startsWith('/uploads') 
                                        ? `http://localhost:4000${url}` 
                                        : `http://localhost:4000/uploads/certificates/${url}`
                                      }
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="block text-xs py-1.5 px-1 hover:bg-blue-50 hover:text-blue-600 rounded transition-colors"
                                    >
                                      Certificate {index + 1}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => setSelectedEvent(event)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="View Details"
                          >
                            <Pencil className="h-5 w-5" />
                          </button>
                        </div>
                      </td>                 
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {showCertificateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">All Certificates</h3>
              <button 
                onClick={() => setShowCertificateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certificateGallery.map((url, index) => (
                <div key={index} className="border rounded-lg overflow-hidden flex flex-col h-full">
                  <div className="p-2 bg-gray-50 border-b">
                    <p className="font-medium">Certificate {index + 1}</p>
                  </div>
                  <div className="flex-grow flex items-center justify-center p-2 bg-gray-50 h-[300px]">
                    <img 
                      src={url.startsWith('/uploads') 
                        ? `http://localhost:4000${url}` 
                        : `http://localhost:4000/uploads/certificates/${url}`
                      }
                      alt={`Certificate ${index + 1}`}
                      className="max-h-[280px] max-w-full object-contain"
                    />
                  </div>
                  <div className="p-2 flex justify-end">
                    <a 
                      href={url.startsWith('/uploads') 
                        ? `http://localhost:4000${url}` 
                        : `http://localhost:4000/uploads/certificates/${url}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700 text-sm"
                    >
                      Open in new tab
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
};

export default TeacherEventsPage;
