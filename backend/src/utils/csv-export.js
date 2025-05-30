const fs = require('fs');
const path = require('path');
const { Transform } = require('stream');

// Create directory if it doesn't exist
const ensureDirectoryExists = (directoryPath) => {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }
};

// Utility to convert objects to CSV rows
const objectToCsvRow = (data) => {
  const row = [];
  
  for (const key in data) {
    let value = data[key];
    
    // Handle different data types
    if (value === null || value === undefined) {
      value = '';
    } else if (typeof value === 'object') {
      if (value instanceof Date) {
        value = value.toISOString();
      } else {
        value = JSON.stringify(value);
      }
    }
    
    // Escape quotes and wrap in quotes if contains comma, newline, or quotes
    if (typeof value === 'string') {
      if (value.includes(',') || value.includes('\n') || value.includes('"')) {
        value = `"${value.replace(/"/g, '""')}"`;
      }
    }
    
    row.push(value);
  }
  
  return `${row.join(',')}\n`;
};

// Generate a CSV export stream from data
const generateCsvStream = (data, headers) => {
  // Create a transform stream to convert data to CSV
  const csvTransform = new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
      try {
        const row = objectToCsvRow(chunk);
        callback(null, row);
      } catch (error) {
        callback(error);
      }
    }
  });
  
  // Write headers
  csvTransform.push(objectToCsvRow(headers));
  
  // Write data
  data.forEach(item => csvTransform.push(item));
  
  // End the stream
  csvTransform.push(null);
  
  return csvTransform;
};

// Export data to CSV file
const exportToCsvFile = async (data, headers, filename) => {
  try {
    // Ensure the reports directory exists
    const reportsDir = path.join(__dirname, '../../reports');
    ensureDirectoryExists(reportsDir);
    
    // Create a writable stream to the file
    const filePath = path.join(reportsDir, filename);
    const fileStream = fs.createWriteStream(filePath);
    
    // Create CSV stream and pipe to file
    const csvStream = generateCsvStream(data, headers);
    csvStream.pipe(fileStream);
    
    // Return a promise that resolves when the file is written
    return new Promise((resolve, reject) => {
      fileStream.on('finish', () => resolve(filePath));
      fileStream.on('error', reject);
    });
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw error;
  }
};

module.exports = { exportToCsvFile }; 