// This service handles all PDF processing operations
import { parsePdfContent, getSampleData, getSampleFiles } from '../utils/pdfParser';

/**
 * Process and parse a PDF file
 * @param {File} file - The PDF file to process
 * @returns {Promise<Object>} - The parsed data from the PDF
 */
export const processAndParsePdf = (file) => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target.result;
          
          // Convert ArrayBuffer to Unit8Array for PDF.js
          const uint8Array = new Uint8Array(arrayBuffer);
          
          // This would pass the PDF data to our parser
          const parsedData = await parsePdfContent(uint8Array, file.name);
          
          // Augment the result with file metadata
          parsedData.fileInfo = {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: new Date(file.lastModified).toISOString()
          };
          
          resolve(parsedData);
        } catch (error) {
          console.error("PDF parsing error:", error);
          reject(new Error(`Error parsing PDF: ${error.message}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading the PDF file'));
      };
      
      // Read the file as an ArrayBuffer
      reader.readAsArrayBuffer(file);
    } catch (error) {
      reject(new Error(`Error processing PDF: ${error.message}`));
    }
  });
};

/**
 * Get sample student data with pre-generated results
 * This bypasses the file reading process entirely
 * @returns {Promise<Array<Object>>} - Array of processed results
 */
export const getSamplePDFFiles = async () => {
  // Get sample student data from our generator
  const sampleData = getSampleData();
  const sampleFiles = getSampleFiles();
  
  // Create a fake processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Create processed results in the expected format
  return sampleData.map((data, index) => {
    const file = sampleFiles[index];
    return {
      id: `sample-${Date.now()}-${index}`,
      fileName: file.name,
      uploadDate: new Date().toISOString(),
      data: data,
      success: true
    };
  });
};

/**
 * Batch process multiple PDF files
 * @param {Array<File>} files - Array of PDF files to process
 * @returns {Promise<Array<Object>>} - Array of parsed data from the PDFs
 */
export const batchProcessPdfs = async (files) => {
  const results = [];
  
  for (const file of files) {
    try {
      const result = await processAndParsePdf(file);
      results.push({
        id: `${Date.now()}-${results.length}`, // Ensure unique ID
        fileName: file.name,
        data: result,
        success: true,
        uploadDate: new Date().toISOString()
      });
    } catch (error) {
      console.error(`Error processing ${file.name}:`, error);
      results.push({
        id: `${Date.now()}-${results.length}`, // Ensure unique ID
        fileName: file.name,
        error: error.message,
        success: false,
        uploadDate: new Date().toISOString()
      });
    }
  }
  
  return results;
};

/**
 * Validate if a file is a valid PDF
 * @param {File} file - The file to validate
 * @returns {boolean} - True if the file is a valid PDF
 */
export const validatePdfFile = (file) => {
  // Check MIME type
  if (file.type !== 'application/pdf') {
    return false;
  }
  
  // Check file extension
  const fileName = file.name.toLowerCase();
  if (!fileName.endsWith('.pdf')) {
    return false;
  }
  
  // Check file size (optional, adjust as needed)
  const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSizeInBytes) {
    return false;
  }
  
  return true;
};

/**
 * Extract file name information to try to get student details
 * This is a fallback for when direct PDF parsing doesn't give enough information
 * @param {string} fileName - The file name
 * @returns {Object} - Extracted metadata
 */
export const extractFileNameInfo = (fileName) => {
  // Remove extension
  const nameWithoutExt = fileName.replace(/\.pdf$/i, '');
  
  // Try to extract roll number if present (patterns like "22EC042" or "2022ECE042")
  const rollMatch = nameWithoutExt.match(/(?:^|\s)(\d{2}EC\d{3}|\d{4}ECE\d{3})(?:\s|$)/i);
  const rollNumber = rollMatch ? rollMatch[1] : null;
  
  // Try to extract semester information
  const semMatch = nameWithoutExt.match(/(?:^|\s)(?:sem|semester)[_\s-]*(\d)(?:\s|$)/i);
  const semester = semMatch ? parseInt(semMatch[1], 10) : null;
  
  // Try to extract year information
  const yearMatch = nameWithoutExt.match(/(?:^|\s)(?:year|yr)[_\s-]*(\d)(?:\s|$)/i);
  const year = yearMatch ? parseInt(yearMatch[1], 10) : null;
  
  return {
    rollNumber,
    semester,
    year,
    fullName: nameWithoutExt
  };
};