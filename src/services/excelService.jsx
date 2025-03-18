// This service handles Excel generation and downloading
import * as XLSX from 'xlsx';

/**
 * Generate Excel file(s) from the processed ECE results
 * @param {Array<Object>} results - Array of ECE result objects
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
    addStudentInfoWorksheet(workbook, result);
    
    // Add subject results worksheet
    addECESubjectResultsWorksheet(workbook, result);
    
    // Add analytics worksheet if required
    if (options.includeAnalytics) {
      addAnalyticsWorksheet(workbook, result);
    }
    
    // Generate filename
    const filename = generateFilename(result, options);
    
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
    
    // Add the worksheet
    const worksheet = createECEResultWorksheet(result);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  }
  
  // Add comparative analysis if required
  if (options.includeComparison) {
    addECEComparativeWorksheet(workbook, results);
  }
  
  // Generate filename
  const filename = `ECE_Combined_Results_${new Date().toISOString().slice(0, 10)}.${options.format}`;
  
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
    addECEComparativeWorksheet(workbook, results);
  }
  
  // Generate filename
  const filename = `ECE_Results_Summary_${new Date().toISOString().slice(0, 10)}.${options.format}`;
  
  // Write the workbook and trigger download
  XLSX.writeFile(workbook, filename);
};

/**
 * Add a student information worksheet to the workbook
 * @param {Object} workbook - XLSX workbook
 * @param {Object} result - Result object containing ECE student data
 */
const addStudentInfoWorksheet = (workbook, result) => {
  // Extract student data from the result
  const { data } = result;
  const studentInfo = data?.studentInfo || {};
  
  // Create worksheet data
  const wsData = [
    ['Student Information'],
    ['Name', studentInfo.name || 'N/A'],
    ['Roll Number', studentInfo.rollNumber || 'N/A'],
    ['Registration Number', studentInfo.registrationNumber || 'N/A'],
    ['Class/Section', studentInfo.class || 'N/A'],
    ['Academic Year', studentInfo.academicYear || 'N/A'],
    ['Examination', studentInfo.examination || 'N/A'],
    [],
    ['Result Summary'],
    ['Total Marks Obtained', data?.totalMarksObtained || 'N/A'],
    ['Total Marks', data?.totalMarks || 'N/A'],
    ['Total Credits', data?.totalCredits || 'N/A'],
    ['Total Grade Points', data?.totalGradePoints || 'N/A'],
    ['SGPA', data?.sgpa || 'N/A'],
    ['Percentage', data?.percentage ? `${data.percentage}%` : 'N/A'],
    ['Overall Grade', data?.overallGrade || 'N/A'],
    ['Rank', data?.rank || 'N/A']
  ];
  
  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(wsData);
  
  // Style the worksheet (headers, etc.)
  styleWorksheet(worksheet);
  
  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Student Info');
};

/**
 * Add a subject results worksheet to the workbook specifically for ECE subjects
 * @param {Object} workbook - XLSX workbook
 * @param {Object} result - Result object containing ECE subject data
 */
const addECESubjectResultsWorksheet = (workbook, result) => {
  // Extract subject data from the result
  const { data } = result;
  const subjects = data?.subjects || [];
  
  // Create worksheet headers
  const wsData = [
    ['Subject-wise Results for ECE 2nd Year 1st Semester'],
    [],
    ['Course Code', 'Subject', 'Credits', 'Type', 'Internal (40)', 'External (60)', 'Total (100)', 'Grade', 'Grade Points']
  ];
  
  // Add subject data rows
  for (const subject of subjects) {
    wsData.push([
      subject.courseCode || 'N/A',
      subject.name || 'N/A',
      subject.credits || 0,
      subject.type || 'N/A',
      subject.internalMarks || 0,
      subject.externalMarks || 0,
      subject.marksObtained || 0,
      subject.grade || 'N/A',
      subject.gradePoints || 0
    ]);
  }
  
  // Add total row if subjects exist
  if (subjects.length > 0) {
    wsData.push([
      'Total',
      '',
      data.totalCredits || subjects.reduce((sum, subject) => sum + (subject.credits || 0), 0),
      '',
      subjects.reduce((sum, subject) => sum + (subject.internalMarks || 0), 0),
      subjects.reduce((sum, subject) => sum + (subject.externalMarks || 0), 0),
      data.totalMarksObtained || subjects.reduce((sum, subject) => sum + (subject.marksObtained || 0), 0),
      data.overallGrade || 'N/A',
      data.totalGradePoints || subjects.reduce((sum, subject) => sum + (subject.gradePoints * subject.credits || 0), 0)
    ]);
  }
  
  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(wsData);
  
  // Style the worksheet (headers, etc.)
  styleWorksheet(worksheet);
  
  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Subject Results');
};

/**
 * Add an analytics worksheet to the workbook
 * @param {Object} workbook - XLSX workbook
 * @param {Object} result - Result object
 */
const addAnalyticsWorksheet = (workbook, result) => {
  // Extract data from the result
  const { data } = result;
  const subjects = data?.subjects || [];
  
  // Create worksheet data for subject-wise performance
  const wsData = [
    ['Subject-wise Performance Analysis for ECE Courses'],
    [],
    ['Subject', 'Percentage', 'Performance Level']
  ];
  
  // Add subject data with performance level
  for (const subject of subjects) {
    const percentage = Math.round((subject.marksObtained / 100) * 100); // Assuming total marks is 100
    let performanceLevel = 'N/A';
    
    if (percentage >= 90) {
      performanceLevel = 'Excellent';
    } else if (percentage >= 75) {
      performanceLevel = 'Very Good';
    } else if (percentage >= 60) {
      performanceLevel = 'Good';
    } else if (percentage >= 45) {
      performanceLevel = 'Satisfactory';
    } else {
      performanceLevel = 'Needs Improvement';
    }
    
    wsData.push([
      subject.name || 'N/A',
      percentage,
      performanceLevel
    ]);
  }
  
  // Add strengths and weaknesses based on performance
  wsData.push(
    [],
    ['Strengths and Areas for Improvement Based on ECE Curriculum'],
    []
  );
  
  // Identify strengths (subjects with highest marks)
  const sortedSubjects = [...subjects].sort((a, b) => {
    const percentageA = (a.marksObtained / 100) * 100;
    const percentageB = (b.marksObtained / 100) * 100;
    return percentageB - percentageA;
  });
  
  // Add strengths (top 2 subjects or all if less than 2)
  wsData.push(['Strengths']);
  const strengthSubjects = sortedSubjects.slice(0, Math.min(2, sortedSubjects.length));
  for (const subject of strengthSubjects) {
    const percentage = Math.round((subject.marksObtained / 100) * 100);
    wsData.push([`${subject.name}: ${percentage}%`]);
  }
  
  wsData.push([]);
  
  // Add areas for improvement (bottom 2 subjects or all if less than 2)
  wsData.push(['Areas for Improvement']);
  const improvementSubjects = sortedSubjects.slice(-Math.min(2, sortedSubjects.length));
  for (const subject of improvementSubjects) {
    const percentage = Math.round((subject.marksObtained / 100) * 100);
    wsData.push([`${subject.name}: ${percentage}%`]);
  }
  
  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(wsData);
  
  // Style the worksheet (headers, etc.)
  styleWorksheet(worksheet);
  
  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Performance Analysis');
};

/**
 * Add a summary worksheet to the workbook for multiple ECE results
 * @param {Object} workbook - XLSX workbook
 * @param {Array<Object>} results - Array of ECE result objects
 */
const addSummaryWorksheet = (workbook, results) => {
  // Create worksheet headers
  const wsData = [
    ['Summary of ECE 2nd Year 1st Semester Results'],
    [],
    ['Student Name', 'Roll Number', 'Registration Number', 'Total Marks', 'SGPA', 'Percentage', 'Grade', 'Rank']
  ];
  
  // Add data rows for each result
  for (const result of results) {
    const { data } = result;
    const studentInfo = data?.studentInfo || {};
    
    wsData.push([
      studentInfo.name || 'N/A',
      studentInfo.rollNumber || 'N/A',
      studentInfo.registrationNumber || 'N/A',
      `${data?.totalMarksObtained || 0}/${data?.totalMarks || 0}`,
      data?.sgpa || 'N/A',
      data?.percentage ? `${data.percentage}%` : 'N/A',
      data?.overallGrade || 'N/A',
      data?.rank ? `${data.rank}/60` : 'N/A'
    ]);
  }
  
  // Add overall statistics
  wsData.push(
    [],
    ['Overall Class Statistics for ECE Department'],
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
  
  // Style the worksheet (headers, etc.)
  styleWorksheet(worksheet);
  
  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Summary');
};

/**
 * Add a comparative analysis worksheet for ECE subjects to the workbook
 * @param {Object} workbook - XLSX workbook
 * @param {Array<Object>} results - Array of result objects
 */
const addECEComparativeWorksheet = (workbook, results) => {
  // Create worksheet headers
  const wsData = [
    ['Comparative Analysis of ECE 2nd Year 1st Semester Results'],
    [],
    ['Subject-wise Performance Comparison'],
    []
  ];
  
  // Get all unique ECE subjects across results
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
  
  // Style the worksheet (headers, etc.)
  styleWorksheet(worksheet);
  
  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Comparative Analysis');
};

/**
 * Create a result worksheet for a single ECE result
 * @param {Object} result - Result object
 * @returns {Object} - XLSX worksheet
 */
const createECEResultWorksheet = (result) => {
  // Extract data from the result
  const { data } = result;
  const studentInfo = data?.studentInfo || {};
  const subjects = data?.subjects || [];
  
  // Create worksheet data
  const wsData = [
    [`ECE Result: ${studentInfo.name || 'N/A'}`],
    [],
    ['Student Information'],
    ['Name', studentInfo.name || 'N/A'],
    ['Roll Number', studentInfo.rollNumber || 'N/A'],
    ['Registration Number', studentInfo.registrationNumber || 'N/A'],
    ['Class/Section', studentInfo.class || 'N/A'],
    [],
    ['Subject Results'],
    ['Course Code', 'Subject', 'Credits', 'Type', 'Internal', 'External', 'Total', 'Grade', 'Grade Points']
  ];
  
  // Add subject data rows
  for (const subject of subjects) {
    wsData.push([
      subject.courseCode || 'N/A',
      subject.name || 'N/A',
      subject.credits || 0,
      subject.type || 'N/A',
      subject.internalMarks || 0,
      subject.externalMarks || 0,
      subject.marksObtained || 0,
      subject.grade || 'N/A',
      subject.gradePoints || 0
    ]);
  }
  
  // Add total row if subjects exist
  if (subjects.length > 0) {
    wsData.push([
      'Total',
      '',
      data.totalCredits || subjects.reduce((sum, subject) => sum + (subject.credits || 0), 0),
      '',
      subjects.reduce((sum, subject) => sum + (subject.internalMarks || 0), 0),
      subjects.reduce((sum, subject) => sum + (subject.externalMarks || 0), 0),
      data.totalMarksObtained || subjects.reduce((sum, subject) => sum + (subject.marksObtained || 0), 0),
      data.overallGrade || 'N/A',
      data.totalGradePoints || subjects.reduce((sum, subject) => sum + (subject.gradePoints * subject.credits || 0), 0)
    ]);
    
    // Add SGPA and percentage information
    wsData.push(
      [],
      ['SGPA', data.sgpa || 'N/A'],
      ['Percentage', data.percentage ? `${data.percentage}%` : 'N/A'],
      ['Rank', data.rank ? `${data.rank}/60` : 'N/A']
    );
  }
  
  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(wsData);
  
  // Style the worksheet
  styleWorksheet(worksheet);
  
  return worksheet;
};

/**
 * Style a worksheet with formatting
 * @param {Object} worksheet - XLSX worksheet
 */
const styleWorksheet = (worksheet) => {
  // This function would apply styling to the worksheet
  // Like cell merging, colors, fonts, etc.
  // Note: Basic styling capabilities in XLSX are limited in client-side JS
  // For advanced styling, a server-side solution might be needed
  
  // We can set some basic properties
  worksheet['!cols'] = [
    { wch: 15 }, // Course Code
    { wch: 25 }, // Subject
    { wch: 10 }, // Credits
    { wch: 12 }, // Type
    { wch: 15 }, // Internal
    { wch: 15 }, // External
    { wch: 15 }, // Total
    { wch: 12 }, // Grade
    { wch: 15 }  // Grade Points
  ];
};

/**
 * Generate a filename for the Excel file
 * @param {Object} result - Result object
 * @param {Object} options - Options for Excel generation
 * @returns {string} - The filename
 */
const generateFilename = (result, options) => {
  const { data } = result;
  const studentInfo = data?.studentInfo || {};
  const studentName = studentInfo.name 
    ? studentInfo.name.replace(/\s+/g, '_') 
    : 'Unknown';
  
  const rollNumber = studentInfo.rollNumber || '';
  const date = new Date().toISOString().slice(0, 10);
  
  return `ECE_Result_${studentName}_${rollNumber}_${date}.${options.format}`;
};