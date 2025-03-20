/**
 * Convert data array to CSV string
 * @param {Array} data - Array of objects to convert
 * @returns {String} - CSV formatted string
 */
exports.convertToCSV = (data) => {
  return new Promise((resolve, reject) => {
    try {
      if (!data || !Array.isArray(data) || data.length === 0) {
        return resolve('No data');
      }

      // Special handling for nested data structures
      const flattenedData = data.map(item => {
        const flattened = {};
        
        // Handle top-level properties
        Object.keys(item).forEach(key => {
          if (typeof item[key] === 'object' && item[key] !== null && !Array.isArray(item[key])) {
            // For nested objects, flatten with dot notation
            Object.keys(item[key]).forEach(nestedKey => {
              flattened[`${key}.${nestedKey}`] = item[key][nestedKey];
            });
          } else if (Array.isArray(item[key])) {
            // For arrays, concatenate with semicolons
            flattened[key] = item[key].join('; ');
          } else {
            // For primitive values
            flattened[key] = item[key];
          }
        });
        
        return flattened;
      });

      // Get all unique headers
      const headers = Array.from(
        new Set(
          flattenedData.flatMap(item => Object.keys(item))
        )
      );

      // Create CSV header row
      const headerRow = headers.join(',');

      // Create data rows
      const rows = flattenedData.map(item => {
        return headers.map(header => {
          const value = item[header] === undefined ? '' : item[header];
          
          // Handle strings that need quotes (contain commas, quotes, or newlines)
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          
          return value;
        }).join(',');
      });

      // Combine header and rows
      const csv = [headerRow, ...rows].join('\n');
      resolve(csv);
      
    } catch (error) {
      console.error('Error converting to CSV:', error);
      reject(error);
    }
  });
};