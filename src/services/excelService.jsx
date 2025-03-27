// Enhanced Excel service that handles Excel generation and downloading
import * as XLSX from 'xlsx';
import { 
  createStudentInfoWorksheet, 
  createSubjectResultsWorksheet, 
  createPerformanceAnalysisWorksheet 
} from '../utils/excelGenerator';

/**
 * Generate Excel file(s) from the processed results
 * @param {Array<Object>} results - Array of result objects
 * @param {Object} options - Options for Excel generation
 * @returns {Promise<void>}
 */
export const generateExcel = async (results, options = {}) => {
  try {
    // Default options
    const defaultOptions = {
      format: 'xlsx',
      exportType: 'individual',
      includeAnalytics: true,
      includeComparison: true
    };
    
    // Merge default options with provided options
    const mergedOptions = { ...defaultOptions, ...options };
    
    // Handle different export types
    if (mergedOptions.exportType === 'combined') {
      return generateCombinedExcel(results, mergedOptions);
    } else if (mergedOptions.exportType === 'summary') {
      return generateSummaryExcel(results, mergedOptions);
    } else {
      // Default to individual reports
      return generateIndividualExcels(results, mergedOptions);
    }
  } catch (error) {
    console.error("Excel generation error:", error);
    throw new Error(`Error generating Excel: ${error.message}`);
  }
};

/**
 * Generate individual Excel files for each result
 * @param {Array<Object>} results - Array of result objects
 * @param {Object} options - Options for Excel generation
 * @returns {Promise<void>}
 */
const generateIndividualExcels = async (results, options) => {
  for (const result of results) {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    
    // Add student information worksheet
    const studentInfoSheet = createStudentInfoWorksheet(result.data?.studentInfo, {
      totalMarksObtained: result.data?.totalMarksObtained,
      totalMarks: result.data?.totalMarks,
      percentage: result.data?.percentage,
      sgpa: result.data?.sgpa,
      overallGrade: result.data?.overallGrade,
      rank: result.data?.rank
    });
    XLSX.utils.book_append_sheet(workbook, studentInfoSheet, 'Student Info');
    
    // Add subject results worksheet
    const subjectsSheet = createSubjectResultsWorksheet(result.data?.subjects || [], 'Subject Results');
    XLSX.utils.book_append_sheet(workbook, subjectsSheet, 'Subject Results');
    
    // Add analytics worksheet if required
    if (options.includeAnalytics) {
      const analyticsSheet = createPerformanceAnalysisWorksheet(result.data?.subjects || []);
      XLSX.utils.book_append_sheet(workbook, analyticsSheet, 'Performance Analysis');
    }
    
    // Generate filename
    const studentName = result.data?.studentInfo?.name 
      ? result.data.studentInfo.name.replace(/\s+/g, '_') 
      : 'Unknown';
    const rollNumber = result.data?.studentInfo?.rollNumber || '';
    const filename = `SVIT_Result_${studentName}_${rollNumber}_${new Date().toISOString().slice(0, 10)}.${options.format}`;
    
    // Write the workbook and trigger download
    XLSX.writeFile(workbook, filename);
    
    // Add a slight delay to avoid browser limitations with multiple downloads
    await new Promise(resolve => setTimeout(resolve, 500));
  }
};

/**
 * Generate a combined Excel file for multiple results
 * @param {Array<Object>} results - Array of result objects
 * @param {Object} options - Options for Excel generation
 * @returns {Promise<void>}
 */
const generateCombinedExcel = async (results, options) => {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Add a summary worksheet
  addSummaryWorksheet(workbook, results);
  
  // Add individual worksheets for each result
  for (const [index, result] of results.entries()) {
    // Create a worksheet name based on student info or index
    const sheetName = result.data?.studentInfo?.name 
      ? `${result.data.studentInfo.name.slice(0, 20)}` 
      : `Result ${index + 1}`;
    
    // Add subject results for this student
    const subjectsSheet = createSubjectResultsWorksheet(result.data?.subjects || [], `Results for ${sheetName}`);
    XLSX.utils.book_append_sheet(workbook, subjectsSheet, sheetName);
  }
  
  // Add comparative analysis if required
  if (options.includeComparison) {
    addComparativeWorksheet(workbook, results);
  }
  
  // Generate filename
  const filename = `SVIT_Combined_Results_${new Date().toISOString().slice(0, 10)}.${options.format}`;
  
  // Write the workbook and trigger download
  XLSX.writeFile(workbook, filename);
};

/**
 * Generate a summary Excel file for multiple results
 * @param {Array<Object>} results - Array of result objects
 * @param {Object} options - Options for Excel generation
 * @returns {Promise<void>}
 */
const generateSummaryExcel = async (results, options) => {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Add a summary worksheet
  addSummaryWorksheet(workbook, results);
  
  // Add comparative analysis if required
  if (options.includeComparison) {
    addComparativeWorksheet(workbook, results);
  }
  
  // Generate filename
  const filename = `SVIT_Results_Summary_${new Date().toISOString().slice(0, 10)}.${options.format}`;
  
  // Write the workbook and trigger download
  XLSX.writeFile(workbook, filename);
};

/**
 * Add a summary worksheet to the workbook for multiple results
 * @param {Object} workbook - XLSX workbook
 * @param {Array<Object>} results - Array of result objects
 */
const addSummaryWorksheet = (workbook, results) => {
  // Create worksheet headers
  const wsData = [
    ['SVIT College - Summary of Student Results'],
    ['Jawaharlal Nehru Technological University, Anantapur'],
    [],
    ['Student Name', 'Roll Number', 'Total Marks', 'SGPA', 'Percentage', 'Grade', 'Rank']
  ];
  
  // Add data rows for each result
  for (const result of results) {
    const studentInfo = result.data?.studentInfo || {};
    
    wsData.push([
      studentInfo.name || 'N/A',
      studentInfo.rollNumber || 'N/A',
      `${result.data?.totalMarksObtained || 0}/${result.data?.totalMarks || 0}`,
      result.data?.sgpa || 'N/A',
      result.data?.percentage ? `${result.data.percentage}%` : 'N/A',
      result.data?.overallGrade || 'N/A',
      result.data?.rank || 'N/A'
    ]);
  }
  
  // Add overall statistics
  wsData.push(
    [],
    ['Overall Class Statistics'],
    []
  );
  
  // Calculate average SGPA
  const averageSGPA = results.reduce((sum, result) => {
    return sum + (result.data?.sgpa || 0);
  }, 0) / results.length;
  
  // Calculate average percentage
  const averagePercentage = results.reduce((sum, result) => {
    return sum + (result.data?.percentage || 0);
  }, 0) / results.length;
  
  // Count grades
  const gradeCounts = results.reduce((counts, result) => {
    const grade = result.data?.overallGrade;
    if (grade) {
      counts[grade] = (counts[grade] || 0) + 1;
    }
    return counts;
  }, {});
  
  // Add statistics rows
  wsData.push(
    ['Total Students', results.length],
    ['Average SGPA', averageSGPA.toFixed(2)],
    ['Average Percentage', `${averagePercentage.toFixed(2)}%`]
  );
  
  // Add grade distribution
  wsData.push(
    [],
    ['Grade Distribution'],
    []
  );
  
  for (const [grade, count] of Object.entries(gradeCounts)) {
    wsData.push([
      grade,
      count,
      `${((count / results.length) * 100).toFixed(2)}%`
    ]);
  }
  
  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(wsData);
  
  // Apply some basic styling
  if (worksheet['!cols']) {
    worksheet['!cols'] = worksheet['!cols'].map(col => ({ ...col, width: 15 }));
  } else {
    worksheet['!cols'] = [
      { width: 25 },  // Student Name
      { width: 15 },  // Roll Number
      { width: 15 },  // Total Marks
      { width: 10 },  // SGPA
      { width: 15 },  // Percentage
      { width: 10 },  // Grade
      { width: 10 }   // Rank
    ];
  }
  
  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Summary');
};

/**
 * Add a comparative analysis worksheet to the workbook
 * @param {Object} workbook - XLSX workbook
 * @param {Array<Object>} results - Array of result objects
 */
const addComparativeWorksheet = (workbook, results) => {
  // Create worksheet headers
  const wsData = [
    ['Comparative Analysis of Student Results'],
    ['SVIT College, Jawaharlal Nehru Technological University, Anantapur'],
    [],
    ['Subject-wise Performance Comparison'],
    []
  ];
  
  // Get all unique subjects across results
  const allSubjects = new Set();
  for (const result of results) {
    const subjects = result.data?.subjects || [];
    for (const subject of subjects) {
      if (subject.name) {
        allSubjects.add(subject.name);
      }
    }
  }
  
  // Create header row with student names
  const headerRow = ['Subject'];
  for (const result of results) {
    headerRow.push(result.data?.studentInfo?.name || `Student ${results.indexOf(result) + 1}`);
  }
  headerRow.push('Class Average');
  wsData.push(headerRow);
  
  // Add rows for each subject
  for (const subjectName of allSubjects) {
    const subjectRow = [subjectName];
    
    // Track total percentage for calculating average
    let totalPercentage = 0;
    let studentCount = 0;
    
    // Add percentage for each student
    for (const result of results) {
      const subjects = result.data?.subjects || [];
      const subject = subjects.find(s => s.name === subjectName);
      
      if (subject) {
        const percentage = Math.round((subject.marksObtained / 100) * 100);
        subjectRow.push(`${percentage}%`);
        totalPercentage += percentage;
        studentCount++;
      } else {
        subjectRow.push('N/A');
      }
    }
    
    // Add class average for the subject
    const classAverage = studentCount > 0 ? Math.round(totalPercentage / studentCount) : 0;
    subjectRow.push(`${classAverage}%`);
    
    wsData.push(subjectRow);
  }
  
  // Add overall performance comparison
  wsData.push(
    [],
    ['Overall Performance Comparison'],
    []
  );
  
  // Header row for overall performance
  const overallHeaderRow = ['Metric'];
  for (const result of results) {
    overallHeaderRow.push(result.data?.studentInfo?.name || `Student ${results.indexOf(result) + 1}`);
  }
  overallHeaderRow.push('Class Average');
  wsData.push(overallHeaderRow);
  
  // SGPA row
  const sgpaRow = ['SGPA'];
  let totalSGPA = 0;
  
  for (const result of results) {
    const sgpa = result.data?.sgpa || 0;
    sgpaRow.push(sgpa.toFixed(2));
    totalSGPA += sgpa;
  }
  
  // Add class average SGPA
  const averageSGPA = results.length > 0 ? (totalSGPA / results.length).toFixed(2) : 0;
  sgpaRow.push(averageSGPA);
  wsData.push(sgpaRow);
  
  // Percentage row
  const percentageRow = ['Percentage'];
  let totalPercentage = 0;
  
  for (const result of results) {
    const percentage = result.data?.percentage || 0;
    percentageRow.push(`${percentage}%`);
    totalPercentage += percentage;
  }
  
  // Add class average percentage
  const averagePercentage = results.length > 0 ? Math.round(totalPercentage / results.length) : 0;
  percentageRow.push(`${averagePercentage}%`);
  wsData.push(percentageRow);
  
  // Overall grade row
  const gradeRow = ['Grade'];
  for (const result of results) {
    gradeRow.push(result.data?.overallGrade || 'N/A');
  }
  
  // Calculate most common grade as "class average"
  const gradeCounts = results.reduce((counts, result) => {
    const grade = result.data?.overallGrade;
    if (grade) {
      counts[grade] = (counts[grade] || 0) + 1;
    }
    return counts;
  }, {});
  
  let mostCommonGrade = 'N/A';
  let maxCount = 0;
  
  for (const [grade, count] of Object.entries(gradeCounts)) {
    if (count > maxCount) {
      mostCommonGrade = grade;
      maxCount = count;
    }
  }
  
  gradeRow.push(mostCommonGrade);
  wsData.push(gradeRow);
  
  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(wsData);
  
  // Apply some basic column widths
  worksheet['!cols'] = [
    { width: 25 },  // Subject/Metric
    ...Array(results.length).fill({ width: 15 }),  // Student columns
    { width: 15 }   // Average column
  ];
  
  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Comparative Analysis');
};

export default generateExcel;