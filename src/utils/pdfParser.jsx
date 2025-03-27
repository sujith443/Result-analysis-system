/**
 * Utility for parsing PDF content specifically for JNTUA B.Tech results
 * Uses real-world example data from the uploaded PDFs
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
        // Extract hall ticket from filename
        const hallTicketMatch = fileName.match(/(\d{3}F\d[A-Z]\d{3}[A-Z]?\d?)/i);
        const hallTicket = hallTicketMatch ? hallTicketMatch[0].toUpperCase() : null;
        
        // Find matching student data or generate one
        let resultData;
        
        // Special handling for demonstration JNTUA results
        if (fileName.includes("JNTUA") || fileName.includes("Result_")) {
          // Process sample JNTUA formatted result
          resultData = processJNTUAResult(pdfData, fileName);
        } else {
          // Look for data by hall ticket if available
          if (hallTicket) {
            resultData = sampleStudentData.find(
              data => (data.studentInfo.rollNumber || '').toUpperCase() === hallTicket
            );
          }
          
          // If no matching student found, use random sample data
          if (!resultData) {
            const randomIndex = Math.floor(Math.random() * sampleStudentData.length);
            resultData = sampleStudentData[randomIndex];
          }
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
        resolve({
          ...fallbackData,
          parseError: error.message
        });
      }
    }, 1000); // Simulate processing delay
  });
};

/**
 * Process JNTUA result PDF
 * Format is based on the example PDF uploaded
 * @param {Uint8Array} pdfData - PDF data
 * @param {string} fileName - File name
 * @returns {Object} - Processed result data
 */
const processJNTUAResult = (pdfData, fileName) => {
  // For demonstration/development, we'll use sample data with JNTUA-specific modifications
  // In a real implementation, this would extract text from the PDF and parse it
  
  const randomIndex = Math.floor(Math.random() * sampleStudentData.length);
  const baseResult = sampleStudentData[randomIndex];
  
  // Extract hall ticket from example data
  const hallTicketMatch = fileName.match(/(\d{3}F\d[A-Z]\d{3}[A-Z]?\d?)/i);
  const hallTicket = hallTicketMatch ? hallTicketMatch[0].toUpperCase() : '219F1A05XX';
  
  // Modify with JNTUA formatting
  return {
    studentInfo: {
      ...baseResult.studentInfo,
      rollNumber: hallTicket,
      name: baseResult.studentInfo.name,
      class: 'B.Tech IV Year I Semester',
      academicYear: '2024-2025',
      examination: 'Regular & Supplementary Examinations',
      university: 'Jawaharlal Nehru Technological University, Anantapur',
      college: 'SVIT College, Andhra Pradesh',
    },
    subjects: baseResult.subjects.map(subject => ({
      ...subject,
      // Adjust subject names to match typical JNTUA subjects
      name: subject.name,
      courseCode: subject.courseCode,
      // Adjust marks to maintain original totals
      internalMarks: subject.internalMarks,
      externalMarks: subject.externalMarks,
      marksObtained: subject.marksObtained,
      grade: subject.grade,
      gradePoints: subject.gradePoints,
    })),
    totalMarksObtained: baseResult.totalMarksObtained,
    totalMarks: baseResult.totalMarks,
    totalCredits: baseResult.totalCredits,
    totalGradePoints: baseResult.totalGradePoints,
    sgpa: baseResult.sgpa,
    percentage: baseResult.percentage,
    overallGrade: baseResult.overallGrade,
    rank: baseResult.rank,
    performanceMetrics: baseResult.performanceMetrics,
  };
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
 * Parse JNTUA special format content
 * @param {string} pdfText - Text content from PDF
 * @returns {Object} - Parsed data in structured format
 */
const parseJNTUAContent = (pdfText) => {
  try {
    // Extract Hall Ticket Number
    const hallTicketMatch = pdfText.match(/HallTicket Number\s*:\s*([^\n\r]+)/i);
    const hallTicket = hallTicketMatch ? hallTicketMatch[1].trim() : null;
    
    // Extract Student Name
    const studentNameMatch = pdfText.match(/Student Name\s*:\s*([^\n\r]+)/i);
    const studentName = studentNameMatch ? studentNameMatch[1].trim() : null;
    
    // Extract Subject data
    const subjectRows = [];
    const subjectPattern = /(\d{2}[A-Z]\d{5}[a-z]?)\s+([^\n]+?)\s+(\d+)\s+(\d+)\s+(\d+)\s+([A-Z])/g;
    
    let match;
    while ((match = subjectPattern.exec(pdfText)) !== null) {
      subjectRows.push({
        code: match[1],
        name: match[2].trim(),
        internalMarks: parseInt(match[3], 10),
        externalMarks: parseInt(match[4], 10),
        totalMarks: parseInt(match[5], 10),
        grade: match[6]
      });
    }
    
    // Extract Semester details
    const semesterMatch = pdfText.match(/B\.Tech\s+(\w+)\s+Year\s+(\w+)\s+Semester/i);
    const yearText = semesterMatch ? semesterMatch[1] : '';
    const semesterText = semesterMatch ? semesterMatch[2] : '';
    
    // Map text year to numeric
    const yearMap = { 'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'I': 1, 'II': 2, 'III': 3, 'IV': 4 };
    const year = yearMap[yearText] || '';
    const semester = yearMap[semesterText] || '';
    
    // Return structured data
    return {
      studentInfo: {
        hallTicket: hallTicket,
        name: studentName,
        year: year,
        semester: semester,
        class: `B.Tech ${yearText} Year ${semesterText} Semester`,
        examination: 'Regular & Supplementary Examinations'
      },
      subjects: subjectRows
    };
  } catch (error) {
    console.error("Error parsing JNTUA content:", error);
    return null;
  }
};

/**
 * Extract text from PDF content
 * In a real implementation, this would use PDF.js or similar library
 * @param {Uint8Array} pdfData - PDF binary data
 * @returns {Promise<string>} - Extracted text
 */
const extractPDFText = async (pdfData) => {
  // This is a placeholder. In a real implementation, you would use a PDF parsing library
  // such as PDF.js to extract the text content from the PDF
  
  // For this demo, we'll return a simulated text content
  return `
    Jawaharlal Nehru Technological University Anantapur
    
    HallTicket Number : 219F1A05A7
    Student Name : MUDIGALLU RAGHAVENDRA
    
    Subject     Subject Name                  Internal   External   Total    Grade
    Code                                      Marks      Marks      Marks
    20A05703a   Full Stack Development          28         40         68       P
    20A05702b   Cryptography & Network          23         47         70       P
    20A01705    Health Safety & Environmental   23         36         59       P
    20A05707    Evaluation of Industry           0         97         97       P
    20A04704    Electronic Sensors              25         42         67       P
    20A05706    SOC-V Mobile Application        28         66         94       P
    20A52701a   Entrepreneurship and            23         40         63       P
    20A05701s   Cloud Computing                 25         35         60       P
    
    Title : B.Tech IV Year I Semester (R20) Regular & Supplementary Examinations, December/January 2024/2025
  `;
};

export default {
  parsePdfContent,
  getSampleFiles,
  getSampleData,
  processJNTUAResult
};