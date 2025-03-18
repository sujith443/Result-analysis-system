/**
 * Utility for generating sample student data
 * This creates realistic sample data for 10 BTech ECE 2nd Year 1st Semester students
 */

// Standard ECE subjects for 2nd Year 1st Semester
const eceSubjects = [
    { name: 'Signals and Systems', courseCode: 'EC2101', credits: 4, type: 'Theory', totalMarks: 100 },
    { name: 'Digital Electronics', courseCode: 'EC2102', credits: 4, type: 'Theory', totalMarks: 100 },
    { name: 'Analog Communication', courseCode: 'EC2103', credits: 3, type: 'Theory', totalMarks: 100 },
    { name: 'Electromagnetic Theory', courseCode: 'EC2104', credits: 3, type: 'Theory', totalMarks: 100 },
    { name: 'Probability and Statistics', courseCode: 'MA2101', credits: 3, type: 'Theory', totalMarks: 100 },
    { name: 'Digital Electronics Lab', courseCode: 'EC2105', credits: 2, type: 'Lab', totalMarks: 100 },
    { name: 'Analog Communication Lab', courseCode: 'EC2106', credits: 2, type: 'Lab', totalMarks: 100 }
  ];
  
  // Sample student information
  const sampleStudents = [
    { name: 'Rajesh Kumar', rollNumber: '22EC011', registrationNumber: '2022ECE011' },
    { name: 'Priya Sharma', rollNumber: '22EC012', registrationNumber: '2022ECE012' },
    { name: 'Amit Patel', rollNumber: '22EC013', registrationNumber: '2022ECE013' },
    { name: 'Sunita Reddy', rollNumber: '22EC014', registrationNumber: '2022ECE014' },
    { name: 'Vikram Singh', rollNumber: '22EC015', registrationNumber: '2022ECE015' },
    { name: 'Neha Joshi', rollNumber: '22EC016', registrationNumber: '2022ECE016' },
    { name: 'Ravi Verma', rollNumber: '22EC017', registrationNumber: '2022ECE017' },
    { name: 'Ananya Gupta', rollNumber: '22EC018', registrationNumber: '2022ECE018' },
    { name: 'Sanjay Desai', rollNumber: '22EC019', registrationNumber: '2022ECE019' },
    { name: 'Meera Krishnan', rollNumber: '22EC020', registrationNumber: '2022ECE020' }
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
      if (subject.name === 'Electromagnetic Theory') {
        marksVariance = getRandomInt(-10, 5);
      } else if (subject.name === 'Signals and Systems') {
        marksVariance = getRandomInt(-8, 8);
      } else {
        marksVariance = getRandomInt(-5, 10);
      }
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
      grade = 'A+';
      gradePoints = 10;
    } else if (marksObtained >= 80) {
      grade = 'A';
      gradePoints = 9;
    } else if (marksObtained >= 70) {
      grade = 'B+';
      gradePoints = 8;
    } else if (marksObtained >= 60) {
      grade = 'B';
      gradePoints = 7;
    } else if (marksObtained >= 50) {
      grade = 'C+';
      gradePoints = 6;
    } else if (marksObtained >= 40) {
      grade = 'C';
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
    const subjects = eceSubjects.map(subject => 
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
      overallGrade = 'A+';
    } else if (sgpa >= 8.0) {
      overallGrade = 'A';
    } else if (sgpa >= 7.0) {
      overallGrade = 'B+';
    } else if (sgpa >= 6.0) {
      overallGrade = 'B';
    } else if (sgpa >= 5.0) {
      overallGrade = 'C+';
    } else if (sgpa >= 4.0) {
      overallGrade = 'C';
    } else {
      overallGrade = 'F';
    }
    
    // Generate random rank (will be corrected after all students are processed)
    const tempRank = index + 1;
    
    return {
      studentInfo: {
        ...studentInfo,
        class: '2nd Year ECE',
        academicYear: '2023-2024',
        examination: 'Regular 1st Semester'
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
      name: `Result_${studentRoll}_${cleanName}.pdf`,
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