/**
 * Utility for generating sample student data for B.Tech students at SVIT College
 * This creates realistic sample data for BTech IV Year I Semester students
 */

// Standard B.Tech subjects for IV Year I Semester based on uploaded PDF
const btechSubjects = [
  { name: 'Full Stack Development', courseCode: '20A05703a', credits: 3, type: 'Theory', totalMarks: 100 },
  { name: 'Cryptography & Network Security', courseCode: '20A05702b', credits: 3, type: 'Theory', totalMarks: 100 },
  { name: 'Health Safety & Environmental Management', courseCode: '20A01705', credits: 3, type: 'Theory', totalMarks: 100 },
  { name: 'Evaluation of Industry Internship', courseCode: '20A05707', credits: 3, type: 'Theory', totalMarks: 100 },
  { name: 'Electronic Sensors', courseCode: '20A04704', credits: 3, type: 'Theory', totalMarks: 100 },
  { name: 'SOC-V Mobile Application Development', courseCode: '20A05706', credits: 2, type: 'Lab', totalMarks: 100 },
  { name: 'Entrepreneurship and Incubation', courseCode: '20A52701a', credits: 3, type: 'Theory', totalMarks: 100 },
  { name: 'Cloud Computing', courseCode: '20A05701s', credits: 3, type: 'Theory', totalMarks: 100 }
];

// Sample student information based on uploaded PDF
const sampleStudents = [
  { name: 'MUDIGALLU RAGHAVENDRA', rollNumber: '219F1A05A7', registrationNumber: '219F1A05A7' },
  { name: 'M PAVANKALYAN', rollNumber: '219F1A05A4', registrationNumber: '219F1A05A4' },
  { name: 'G TAUFIQ UMAR', rollNumber: '219F1A0585', registrationNumber: '219F1A0585' },
  { name: 'KOGILA VINAY', rollNumber: '219F1A0597', registrationNumber: '219F1A0597' },
  { name: 'KAYALA MANJUNATH', rollNumber: '229F5A0502', registrationNumber: '229F5A0502' },
  { name: 'RAJESH KUMAR T', rollNumber: '219F1A05B1', registrationNumber: '219F1A05B1' },
  { name: 'PRIYA SHARMA K', rollNumber: '219F1A05B2', registrationNumber: '219F1A05B2' },
  { name: 'AMIT R', rollNumber: '219F1A05B3', registrationNumber: '219F1A05B3' },
  { name: 'SUNITA REDDY J', rollNumber: '219F1A05B4', registrationNumber: '219F1A05B4' },
  { name: 'VIKRAM M', rollNumber: '219F1A05B5', registrationNumber: '219F1A05B5' }
];

/**
 * Generate a random integer between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} - Random integer
 */
const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Generate subject results with realistic marks
 * @param {Object} subject - Subject information
 * @param {string} studentRoll - Student roll number (for consistent generation)
 * @returns {Object} - Subject result
 */
const generateSubjectResult = (subject, studentRoll) => {
  // Use student roll to create consistent but varied results
  const rollSeed = parseInt(studentRoll.slice(-2)) % 10;
  
  // Base marks for the student (65-95 range based on student roll)
  const baseMarks = 65 + ((rollSeed * 3) % 20);
  
  // Add variance based on subject
  let marksVariance = 0;
  
  // Labs tend to have higher marks
  if (subject.type === 'Lab') {
    marksVariance = getRandomInt(5, 15);
  } else {
    // Tougher subjects get lower marks typically
    if (subject.name === 'Cryptography & Network Security') {
      marksVariance = getRandomInt(-10, 5);
    } else if (subject.name === 'Full Stack Development') {
      marksVariance = getRandomInt(-8, 8);
    } else {
      marksVariance = getRandomInt(-5, 10);
    }
  }
  
  // Special case for Evaluation of Industry Internship - typically all external marks
  if (subject.courseCode === '20A05707') {
    return {
      ...subject,
      internalMarks: 0,
      externalMarks: getRandomInt(90, 99),
      marksObtained: getRandomInt(90, 99),
      grade: 'S',
      gradePoints: 10
    };
  }
  
  // Calculate final marks (capped at 100)
  const marksObtained = Math.min(100, Math.max(40, baseMarks + marksVariance));
  
  // Split into internal (40%) and external (60%)
  const internalMarks = Math.round(marksObtained * 0.4);
  const externalMarks = marksObtained - internalMarks;
  
  // Calculate grade based on marks
  let grade;
  let gradePoints;
  
  if (marksObtained >= 90) {
    grade = 'S';
    gradePoints = 10;
  } else if (marksObtained >= 80) {
    grade = 'A';
    gradePoints = 9;
  } else if (marksObtained >= 70) {
    grade = 'B';
    gradePoints = 8;
  } else if (marksObtained >= 60) {
    grade = 'C';
    gradePoints = 7;
  } else if (marksObtained >= 50) {
    grade = 'D';
    gradePoints = 6;
  } else if (marksObtained >= 40) {
    grade = 'E';
    gradePoints = 5;
  } else {
    grade = 'F';
    gradePoints = 0;
  }
  
  return {
    ...subject,
    internalMarks,
    externalMarks,
    marksObtained,
    grade,
    gradePoints
  };
};

/**
 * Generate a complete student result record
 * @param {Object} studentInfo - Student information
 * @param {number} index - Index for sorting/ranking
 * @returns {Object} - Full student result data
 */
const generateStudentResult = (studentInfo, index) => {
  // Generate results for each subject
  const subjects = btechSubjects.map(subject => 
    generateSubjectResult(subject, studentInfo.rollNumber)
  );
  
  // Calculate totals and averages
  const totalMarksObtained = subjects.reduce((sum, subject) => sum + subject.marksObtained, 0);
  const totalMarks = subjects.reduce((sum, subject) => sum + subject.totalMarks, 0);
  const totalCredits = subjects.reduce((sum, subject) => sum + subject.credits, 0);
  const totalGradePoints = subjects.reduce((sum, subject) => sum + (subject.gradePoints * subject.credits), 0);
  
  // Calculate SGPA and percentage
  const sgpa = parseFloat((totalGradePoints / totalCredits).toFixed(2));
  const percentage = Math.round((totalMarksObtained / totalMarks) * 100);
  
  // Determine overall grade
  let overallGrade;
  if (sgpa >= 9.0) {
    overallGrade = 'S';
  } else if (sgpa >= 8.0) {
    overallGrade = 'A';
  } else if (sgpa >= 7.0) {
    overallGrade = 'B';
  } else if (sgpa >= 6.0) {
    overallGrade = 'C';
  } else if (sgpa >= 5.0) {
    overallGrade = 'D';
  } else if (sgpa >= 4.0) {
    overallGrade = 'E';
  } else {
    overallGrade = 'F';
  }
  
  // Generate random rank (will be corrected after all students are processed)
  const tempRank = index + 1;
  
  return {
    studentInfo: {
      ...studentInfo,
      class: 'B.Tech IV Year I Semester',
      academicYear: '2024-2025',
      examination: 'Regular & Supplementary Examinations'
    },
    subjects,
    totalMarksObtained,
    totalMarks,
    totalCredits,
    totalGradePoints,
    sgpa,
    percentage,
    overallGrade,
    rank: tempRank,
    performanceMetrics: {
      attendancePercentage: getRandomInt(75, 98),
      classParticipation: ['Good', 'Excellent', 'Satisfactory', 'Very Good'][getRandomInt(0, 3)],
      improvements: subjects.filter(s => s.marksObtained < 65).map(s => s.name)
    }
  };
};

/**
 * Generate complete sample data for all students
 * @returns {Array<Object>} - Array of student result objects
 */
export const generateSampleStudentData = () => {
  // Generate raw results for all students
  const rawResults = sampleStudents.map((student, index) => 
    generateStudentResult(student, index)
  );
  
  // Sort by SGPA to assign proper ranks
  const sortedResults = [...rawResults].sort((a, b) => b.sgpa - a.sgpa);
  
  // Assign correct ranks
  const rankedResults = sortedResults.map((result, index) => ({
    ...result,
    rank: index + 1
  }));
  
  // Re-sort to original order
  const finalResults = [];
  for (const original of rawResults) {
    const rankedResult = rankedResults.find(r => 
      r.studentInfo.rollNumber === original.studentInfo.rollNumber
    );
    finalResults.push(rankedResult);
  }
  
  return finalResults;
};

/**
 * Generate a sample file object
 * @param {string} studentRoll - Student roll number
 * @param {string} studentName - Student name
 * @returns {Object} - File-like object
 */
export const generateSampleFile = (studentRoll, studentName) => {
  const cleanName = studentName.replace(/\s+/g, '_');
  return {
    name: `JNTUA_Result_${studentRoll}_${cleanName}.pdf`,
    size: getRandomInt(240000, 260000),
    type: 'application/pdf',
    lastModified: Date.now() - getRandomInt(0, 7 * 24 * 60 * 60 * 1000) // Random date in last week
  };
};

/**
 * Generate sample files for all students
 * @returns {Array<Object>} - Array of file-like objects
 */
export const generateSampleFiles = () => {
  return sampleStudents.map(student => 
    generateSampleFile(student.rollNumber, student.name)
  );
};