/**
 * Utility for generating Excel files
 * This file contains helper functions for creating Excel workbooks
 * and sheets with specific formatting
 */
import * as XLSX from 'xlsx';

/**
 * Create a styled cell
 * @param {any} value - Cell value
 * @param {Object} style - Cell style object
 * @returns {Object} - Cell object with value and style
 */
export const createStyledCell = (value, style = {}) => {
  return { v: value, s: style };
};

/**
 * Create a header cell with standard styling
 * @param {string} value - Header text
 * @returns {Object} - Styled header cell
 */
export const createHeaderCell = (value) => {
  // Basic header style
  const headerStyle = {
    font: { bold: true, color: { rgb: 'FFFFFF' } },
    fill: { fgColor: { rgb: '4472C4' } },
    alignment: { horizontal: 'center', vertical: 'center' }
  };
  
  return createStyledCell(value, headerStyle);
};

/**
 * Create a title cell with standard styling
 * @param {string} value - Title text
 * @returns {Object} - Styled title cell
 */
export const createTitleCell = (value) => {
  // Title style
  const titleStyle = {
    font: { bold: true, sz: 14 },
    alignment: { horizontal: 'center' }
  };
  
  return createStyledCell(value, titleStyle);
};

/**
 * Create a section header cell with standard styling
 * @param {string} value - Section header text
 * @returns {Object} - Styled section header cell
 */
export const createSectionHeaderCell = (value) => {
  // Section header style
  const sectionStyle = {
    font: { bold: true },
    fill: { fgColor: { rgb: 'E7E6E6' } }
  };
  
  return createStyledCell(value, sectionStyle);
};

/**
 * Create a data row with alternating row styling
 * @param {Array<any>} values - Row values
 * @param {boolean} isEven - Whether this is an even row
 * @returns {Array<Object>} - Array of styled cells
 */
export const createDataRow = (values, isEven = false) => {
  // Basic data row style
  const rowStyle = isEven 
    ? { fill: { fgColor: { rgb: 'F2F2F2' } } }
    : {};
  
  // Create styled cells for each value
  return values.map(value => createStyledCell(value, rowStyle));
};

/**
 * Create a total row with standard styling
 * @param {Array<any>} values - Row values
 * @returns {Array<Object>} - Array of styled cells
 */
export const createTotalRow = (values) => {
  // Total row style
  const totalStyle = {
    font: { bold: true },
    fill: { fgColor: { rgb: 'D9E1F2' } },
    border: {
      top: { style: 'thin' },
      bottom: { style: 'thin' }
    }
  };
  
  // Create styled cells for each value
  return values.map(value => createStyledCell(value, totalStyle));
};

/**
 * Apply column widths to a worksheet
 * @param {Object} worksheet - XLSX worksheet
 * @param {Array<number>} widths - Array of column widths
 */
export const applyColumnWidths = (worksheet, widths) => {
  worksheet['!cols'] = widths.map(width => ({ wch: width }));
};

/**
 * Apply cell merges to a worksheet
 * @param {Object} worksheet - XLSX worksheet
 * @param {Array<Object>} merges - Array of merge objects with s and e properties
 */
export const applyCellMerges = (worksheet, merges) => {
  worksheet['!merges'] = merges;
};

/**
 * Create a subject results worksheet
 * @param {Array<Object>} subjects - Array of subject result objects
 * @param {string} title - Worksheet title
 * @returns {Object} - XLSX worksheet
 */
export const createSubjectResultsWorksheet = (subjects, title = 'Subject Results') => {
  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet([
    [title],
    [],
    ['Subject', 'Marks Obtained', 'Total Marks', 'Percentage', 'Grade']
  ]);
  
  // Current row index (0-based)
  let rowIndex = 3; // Start after headers
  
  // Add subject data rows
  for (let i = 0; i < subjects.length; i++) {
    const subject = subjects[i];
    const percentage = Math.round((subject.marksObtained / subject.totalMarks) * 100);
    
    // Set cells with styled data
    const row = createDataRow([
      subject.name,
      subject.marksObtained,
      subject.totalMarks,
      `${percentage}%`,
      subject.grade
    ], i % 2 === 1); // Apply alternating row styling
    
    // Add row to worksheet
    for (let colIndex = 0; colIndex < row.length; colIndex++) {
      const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
      worksheet[cellRef] = row[colIndex];
    }
    
    // Increment row index
    rowIndex++;
  }
  
  // Calculate totals
  const totalMarksObtained = subjects.reduce((sum, subject) => sum + subject.marksObtained, 0);
  const totalPossibleMarks = subjects.reduce((sum, subject) => sum + subject.totalMarks, 0);
  const totalPercentage = Math.round((totalMarksObtained / totalPossibleMarks) * 100);
  
  // Get overall grade
  let overallGrade;
  if (totalPercentage >= 90) {
    overallGrade = 'A+';
  } else if (totalPercentage >= 80) {
    overallGrade = 'A';
  } else if (totalPercentage >= 70) {
    overallGrade = 'B+';
  } else if (totalPercentage >= 60) {
    overallGrade = 'B';
  } else if (totalPercentage >= 50) {
    overallGrade = 'C';
  } else if (totalPercentage >= 40) {
    overallGrade = 'D';
  } else {
    overallGrade = 'F';
  }
  
  // Add total row
  const totalRow = createTotalRow([
    'Total',
    totalMarksObtained,
    totalPossibleMarks,
    `${totalPercentage}%`,
    overallGrade
  ]);
  
  // Add total row to worksheet
  for (let colIndex = 0; colIndex < totalRow.length; colIndex++) {
    const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
    worksheet[cellRef] = totalRow[colIndex];
  }
  
  // Apply styling to headers
  for (let colIndex = 0; colIndex < 5; colIndex++) {
    const cellRef = XLSX.utils.encode_cell({ r: 2, c: colIndex });
    const currentValue = worksheet[cellRef]?.v || '';
    worksheet[cellRef] = createHeaderCell(currentValue);
  }
  
  // Apply styling to title
  const titleCell = XLSX.utils.encode_cell({ r: 0, c: 0 });
  const currentTitle = worksheet[titleCell]?.v || '';
  worksheet[titleCell] = createTitleCell(currentTitle);
  
  // Apply column widths
  applyColumnWidths(worksheet, [30, 15, 15, 15, 15]);
  
  // Apply cell merges
  applyCellMerges(worksheet, [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } } // Merge title cell across all columns
  ]);
  
  // Set worksheet range
  worksheet['!ref'] = XLSX.utils.encode_range({
    s: { r: 0, c: 0 },
    e: { r: rowIndex, c: 4 }
  });
  
  return worksheet;
};

/**
 * Create a student information worksheet
 * @param {Object} studentInfo - Student information object
 * @param {Object} resultSummary - Result summary object
 * @returns {Object} - XLSX worksheet
 */
export const createStudentInfoWorksheet = (studentInfo, resultSummary) => {
  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet([
    ['Student Result Information'],
    [],
    ['Student Information'],
    ['Name:', studentInfo.name],
    ['Roll Number:', studentInfo.rollNumber],
    ['Class/Section:', studentInfo.class],
    ['Academic Year:', studentInfo.academicYear],
    ['Examination:', studentInfo.examination],
    [],
    ['Result Summary'],
    ['Total Marks Obtained:', resultSummary.totalMarksObtained],
    ['Total Marks:', resultSummary.totalMarks],
    ['Percentage:', `${resultSummary.percentage}%`],
    ['Overall Grade:', resultSummary.overallGrade],
    ['Rank:', resultSummary.rank]
  ]);
  
  // Apply styling to main title
  const titleCell = XLSX.utils.encode_cell({ r: 0, c: 0 });
  worksheet[titleCell] = createTitleCell(worksheet[titleCell]?.v || '');
  
  // Apply styling to section headers
  const studentInfoHeaderCell = XLSX.utils.encode_cell({ r: 2, c: 0 });
  worksheet[studentInfoHeaderCell] = createSectionHeaderCell(worksheet[studentInfoHeaderCell]?.v || '');
  
  const resultSummaryHeaderCell = XLSX.utils.encode_cell({ r: 9, c: 0 });
  worksheet[resultSummaryHeaderCell] = createSectionHeaderCell(worksheet[resultSummaryHeaderCell]?.v || '');
  
  // Apply column widths
  applyColumnWidths(worksheet, [20, 30]);
  
  // Apply cell merges
  applyCellMerges(worksheet, [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }, // Merge title cell
    { s: { r: 2, c: 0 }, e: { r: 2, c: 1 } }, // Merge student info header
    { s: { r: 9, c: 0 }, e: { r: 9, c: 1 } }  // Merge result summary header
  ]);
  
  return worksheet;
};

/**
 * Create a performance analysis worksheet
 * @param {Array<Object>} subjects - Array of subject result objects
 * @returns {Object} - XLSX worksheet
 */
export const createPerformanceAnalysisWorksheet = (subjects) => {
  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet([
    ['Performance Analysis'],
    [],
    ['Subject-wise Performance']
  ]);
  
  // Add performance chart data
  let rowIndex = 3;
  
  // Headers
  worksheet[XLSX.utils.encode_cell({ r: rowIndex, c: 0 })] = createHeaderCell('Subject');
  worksheet[XLSX.utils.encode_cell({ r: rowIndex, c: 1 })] = createHeaderCell('Percentage');
  worksheet[XLSX.utils.encode_cell({ r: rowIndex, c: 2 })] = createHeaderCell('Performance Level');
  
  rowIndex++;
  
  // Subject data
  for (let i = 0; i < subjects.length; i++) {
    const subject = subjects[i];
    const percentage = Math.round((subject.marksObtained / subject.totalMarks) * 100);
    
    // Determine performance level
    let performanceLevel;
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
    
    // Create row with data
    const row = createDataRow([
      subject.name,
      `${percentage}%`,
      performanceLevel
    ], i % 2 === 1);
    
    // Add row to worksheet
    for (let colIndex = 0; colIndex < row.length; colIndex++) {
      const cellRef = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
      worksheet[cellRef] = row[colIndex];
    }
    
    rowIndex++;
  }
  
  // Add strengths and weaknesses section
  rowIndex += 2;
  worksheet[XLSX.utils.encode_cell({ r: rowIndex, c: 0 })] = createSectionHeaderCell('Strengths and Areas for Improvement');
  rowIndex += 2;
  
  // Sort subjects by performance
  const sortedSubjects = [...subjects].sort((a, b) => {
    const percentageA = (a.marksObtained / a.totalMarks) * 100;
    const percentageB = (b.marksObtained / b.totalMarks) * 100;
    return percentageB - percentageA;
  });
  
  // Add strengths (top 2 subjects)
  worksheet[XLSX.utils.encode_cell({ r: rowIndex, c: 0 })] = createSectionHeaderCell('Strengths');
  rowIndex++;
  
  for (let i = 0; i < Math.min(2, sortedSubjects.length); i++) {
    const subject = sortedSubjects[i];
    const percentage = Math.round((subject.marksObtained / subject.totalMarks) * 100);
    
    worksheet[XLSX.utils.encode_cell({ r: rowIndex, c: 0 })] = { 
      v: subject.name, 
      s: { alignment: { indent: 1 } } 
    };
    worksheet[XLSX.utils.encode_cell({ r: rowIndex, c: 1 })] = { 
      v: `${percentage}%`
    };
    
    rowIndex++;
  }
  
  rowIndex++;
  
  // Add areas for improvement (bottom 2 subjects)
  worksheet[XLSX.utils.encode_cell({ r: rowIndex, c: 0 })] = createSectionHeaderCell('Areas for Improvement');
  rowIndex++;
  
  const improvementSubjects = sortedSubjects.slice(-Math.min(2, sortedSubjects.length));
  for (let i = 0; i < improvementSubjects.length; i++) {
    const subject = improvementSubjects[i];
    const percentage = Math.round((subject.marksObtained / subject.totalMarks) * 100);
    
    worksheet[XLSX.utils.encode_cell({ r: rowIndex, c: 0 })] = { 
      v: subject.name, 
      s: { alignment: { indent: 1 } } 
    };
    worksheet[XLSX.utils.encode_cell({ r: rowIndex, c: 1 })] = { 
      v: `${percentage}%`
    };
    
    rowIndex++;
  }
  
  // Apply styling to title
  const titleCell = XLSX.utils.encode_cell({ r: 0, c: 0 });
  worksheet[titleCell] = createTitleCell(worksheet[titleCell]?.v || '');
  
  // Apply column widths
  applyColumnWidths(worksheet, [30, 15, 25]);
  
  // Apply cell merges
  applyCellMerges(worksheet, [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }, // Merge title cell
    { s: { r: 2, c: 0 }, e: { r: 2, c: 2 } }, // Merge performance section header
    { s: { r: rowIndex - improvementSubjects.length - 2, c: 0 }, e: { r: rowIndex - improvementSubjects.length - 2, c: 2 } } // Merge areas for improvement header
  ]);
  
  // Set worksheet range
  worksheet['!ref'] = XLSX.utils.encode_range({
    s: { r: 0, c: 0 },
    e: { r: rowIndex, c: 2 }
  });
  
  return worksheet;
};