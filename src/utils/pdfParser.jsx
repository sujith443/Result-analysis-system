/**
 * Utility for parsing PDF content specifically for B.Tech ECE results
 * Uses sample data approach to simulate PDF extraction
 */
import { generateSampleStudentData, generateSampleFiles } from './sampleDataGenerator';

// Generate sample data once
const sampleStudentData = generateSampleStudentData();
const sampleFiles = generateSampleFiles();

/**
 * Parse PDF content from a Uint8Array
 * @param {Uint8Array} pdfData - PDF file data as Uint8Array
 * @param {string} fileName - The name of the file being processed
 * @returns {Promise<Object>} - Parsed data from the PDF
 */
export const parsePdfContent = async (pdfData, fileName) => {
  return new Promise((resolve) => {
    // Simulate processing time
    setTimeout(() => {
      try {
        // Extract roll number from filename
        const rollMatch = fileName.match(/22EC\d{3}/i);
        const rollNumber = rollMatch ? rollMatch[0] : null;
        
        // Find matching student data
        let resultData;
        if (rollNumber) {
          resultData = sampleStudentData.find(
            data => data.studentInfo.rollNumber.toUpperCase() === rollNumber.toUpperCase()
          );
        }
        
        // If no matching student found, use random sample data
        if (!resultData) {
          const randomIndex = Math.floor(Math.random() * sampleStudentData.length);
          resultData = sampleStudentData[randomIndex];
        }
        
        // Add file info
        resultData = {
          ...resultData,
          fileInfo: {
            name: fileName,
            size: pdfData.length,
            type: 'application/pdf',
            lastModified: new Date().toISOString()
          }
        };
        
        resolve(resultData);
      } catch (error) {
        console.error("Error parsing PDF:", error);
        // Fallback to random sample data if there's an error
        const randomIndex = Math.floor(Math.random() * sampleStudentData.length);
        const fallbackData = sampleStudentData[randomIndex];
        resolve(fallbackData);
      }
    }, 800); // Simulate processing delay
  });
};

/**
 * Get sample file objects for testing
 * @returns {Array<Object>} - Array of file-like objects
 */
export const getSampleFiles = () => {
  return sampleFiles;
};

/**
 * Get sample data for direct testing
 * @returns {Array<Object>} - Array of student result objects
 */
export const getSampleData = () => {
  return sampleStudentData;
};

/**
 * In a real implementation, we would use these functions to extract specific data
 * from the PDF structure
 */

/**
 * Extract student information from PDF content
 * @param {string} pdfText - Extracted text from PDF
 * @returns {Object} - Student information
 */
const extractStudentInfo = (pdfText) => {
  // This would contain regex patterns to extract student info
  // For example:
  // const nameMatch = pdfText.match(/Name of Student:[\s\n]+([A-Z\s]+)/);
  // const rollMatch = pdfText.match(/Roll Number:[\s\n]+([A-Z0-9]+)/);
  // etc.
  
  return {
    name: "EXTRACTED_NAME",
    rollNumber: "EXTRACTED_ROLL",
    class: "EXTRACTED_CLASS",
    academicYear: "EXTRACTED_YEAR",
    examination: "EXTRACTED_EXAM"
  };
};

/**
 * Extract subject results from PDF content
 * @param {string} pdfText - Extracted text from PDF
 * @returns {Array<Object>} - Subject results
 */
const extractSubjectResults = (pdfText) => {
  // This would contain logic to extract the table data
  // Either using regex patterns or more specialized table extraction
  
  // Return placeholder
  return [];
};

/**
 * Extract summary data from PDF content
 * @param {string} pdfText - Extracted text from PDF
 * @returns {Object} - Summary data (total marks, SGPA, etc.)
 */
const extractSummaryData = (pdfText) => {
  // This would extract summary data using regex patterns
  
  return {
    totalCredits: 0,
    totalGradePoints: 0,
    sgpa: 0,
    result: "",
    rank: ""
  };
};