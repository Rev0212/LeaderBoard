/**
 * Converts an array of objects to CSV format
 * @param {Array} data - Array of objects to convert
 * @returns {String} CSV formatted string
 */
const convertToCSV = async (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    return 'No data available';
  }
  
  try {
    // Get headers from the first object
    const headers = Object.keys(data[0]);
    
    // Create CSV header row
    const headerRow = headers.join(',');
    
    // Create data rows
    const rows = data.map(obj => {
      return headers.map(header => {
        // Handle special cases
        let value = obj[header];
        
        // Convert arrays to string
        if (Array.isArray(value)) {
          value = `"${value.join('; ')}"`;
        }
        // Convert objects to string
        else if (typeof value === 'object' && value !== null) {
          value = `"${JSON.stringify(value)}"`;
        }
        // Escape quotes in strings
        else if (typeof value === 'string') {
          value = `"${value.replace(/"/g, '""')}"`;
        }
        // Convert undefined/null to empty string
        else if (value === undefined || value === null) {
          value = '';
        }
        
        return value;
      }).join(',');
    });
    
    // Combine header and rows
    return [headerRow, ...rows].join('\n');
  } catch (error) {
    console.error('Error converting to CSV:', error);
    return 'Error generating CSV';
  }
};

module.exports = { convertToCSV };