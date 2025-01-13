import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Document, Page } from 'react-pdf';

const EventForm = () => {
  const [formData, setFormData] = useState({
    eventName: '',
    description: '',
    date: '',
    proofImage: null,
    pdfDocument: null, // New field for PDF document
    category: '',
    positionSecured: '',
    priceMoney: ''
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [pdfPreview, setPdfPreview] = useState(null); // State for PDF preview
  const [uploadStatus, setUploadStatus] = useState('');
  const [showPdfModal, setShowPdfModal] = useState(false); // State to show PDF modal
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const formFields = [
    { name: 'eventName', label: 'Event Name', type: 'text', placeholder: 'Enter Event Name' },
    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Enter Description' },
    { name: 'date', label: 'Date', type: 'date' },
    { name: 'proofImage', label: 'Proof Image', type: 'file', accept: 'image/*' },
    { name: 'pdfDocument', label: 'PDF Document', type: 'file', accept: 'application/pdf' }, // New field for PDF document
    { name: 'category', label: 'Category', type: 'select', options: ['Select a category', 'Hackathon', 'Ideathon', 'Coding', 'Global-Certificates', 'Workshop', 'Conference', 'Others'] },
    { name: 'priceMoney', label: 'Price Money', type: 'text', placeholder: 'Enter Price Money' },
    { name: 'positionSecured', label: 'Position Secured', type: 'select', options: ['Select position', 'First', 'Second', 'Third', 'Participant', 'None'] }
  ];

  const validateImage = (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      return 'Please upload a valid image file (JPEG, PNG, or GIF)';
    }
    if (file.size > maxSize) {
      return 'Image size should be less than 5MB';
    }
    return null;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'proofImage' && files[0]) {
      const file = files[0];
      const error = validateImage(file);
      
      if (error) {
        setErrors(prev => ({ ...prev, proofImage: error }));
        return;
      }

      // Clear any previous errors
      setErrors(prev => ({ ...prev, proofImage: null }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      setFormData(prev => ({
        ...prev,
        proofImage: file
      }));
    } else if (name === 'pdfDocument' && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPdfPreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      setFormData(prev => ({
        ...prev,
        pdfDocument: file
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    formFields.forEach(field => {
      if (field.name === 'proofImage' && !formData.proofImage) {
        newErrors[field.name] = 'Proof image is required';
      } else if (field.name === 'pdfDocument' && !formData.pdfDocument) {
        newErrors[field.name] = 'PDF document is required';
      } else if (field.type !== 'file' && !formData[field.name].trim()) {
        newErrors[field.name] = `${field.label} is required`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      setUploadStatus('Uploading files...');
  
      try {
        // Upload image to Cloudinary
        const formDataImage = new FormData();
        formDataImage.append('file', formData.proofImage);
        formDataImage.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
  
        const cloudinaryResponse = await fetch(
          `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: 'POST',
            body: formDataImage
          }
        );
  
        if (!cloudinaryResponse.ok) {
          throw new Error('Failed to upload image');
        }
  
        const cloudinaryData = await cloudinaryResponse.json();
  
        // Upload PDF to the backend (/pdf-upload)
        const formDataPdf = new FormData();
        formDataPdf.append('pdfDocument', formData.pdfDocument);
        console.log(formDataPdf);
  
        const pdfResponse = await fetch(`${import.meta.env.VITE_BASE_URL}/event/upload-pdf`, {
          method: 'POST',
          body: formDataPdf
        });
  
        if (!pdfResponse.ok) {
          throw new Error('Failed to upload PDF');
        }
  
        const pdfData = await pdfResponse.json(); // Assuming PDF upload response contains the file name or URL
        console.log(pdfData);
  
        setUploadStatus('Files uploaded successfully! Submitting form...');
  
        const formDataToSend = {
          eventName: formData.eventName,
          description: formData.description,
          date: formData.date,
          category: formData.category,
          positionSecured: formData.positionSecured,
          priceMoney: formData.priceMoney,
          proofUrl: cloudinaryData.url, // Image URL from Cloudinary
          pdfDocument: pdfData.fileName, // URL or filename of the uploaded PDF
        };
  
        console.log(formDataToSend);
  
        // Submit form data to backend
        const token = localStorage.getItem('student-token');
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/event/submit`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formDataToSend)
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error response:', errorData);
          throw new Error('Failed to submit form');
        }
  
        setUploadStatus('Form submitted successfully!');
        setTimeout(() => navigate("/student-dashboard"), 1500);
  
      } catch (error) {
        console.error('Submission error:', error);
        setApiError(error.message || 'An error occurred');
        setUploadStatus('');
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const handleViewPdf = () => {
    setShowPdfModal(true);
  };

  const handleClosePdfModal = () => {
    setShowPdfModal(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Event Details Form</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {formFields.map((field, index) => (
            <div key={index}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
              </label>
              
              {field.type === 'textarea' ? (
                <textarea
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  rows="3"
                  placeholder={field.placeholder}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
              ) : field.type === 'select' ? (
                <select
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  {field.options.map((option, i) => (
                    <option key={i} value={option}>{option}</option>
                  ))}
                </select>
              ) : (
                <div>
                  <input
                    type={field.type}
                    name={field.name}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    accept={field.accept}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                  {field.name === 'proofImage' && imagePreview && (
                    <div className="mt-3">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-md"
                      />
                    </div>
                  )}
                  {field.name === 'pdfDocument' && pdfPreview && (
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={handleViewPdf}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md"
                      >
                        View PDF
                      </button>
                    </div>
                  )}
                  {errors[field.name] && (
                    <div className="text-red-500 text-sm mt-2">{errors[field.name]}</div>
                  )}
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="text-center">Uploading...</div>
          )}
          
          {apiError && (
            <div className="text-red-500 text-center mt-4">{apiError}</div>
          )}

          <div className="flex justify-between items-center mt-6">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
              disabled={isLoading}
            >
              Submit
            </button>
            <p className="text-sm text-gray-500">{uploadStatus}</p>
          </div>
        </form>
      </div>

      {showPdfModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full">
            <button
              onClick={handleClosePdfModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
            <div className="pdf-container">
              <Document file={pdfPreview}>
                <Page pageNumber={1} />
              </Document>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventForm;
