import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

const BatchAnalysis = ({ results }) => {
  const navigate = useNavigate();
  const [analysisType, setAnalysisType] = useState('overview');
  
  // Calculate batch statistics
  const batchStats = useMemo(() => {
    if (results.length === 0) {
      return {
        totalStudents: 0,
        passPercentage: 0,
        averageSGPA: 0,
        averagePercentage: 0,
        topPerformers: [],
        gradeCounts: {},
        subjectPerformance: {},
      };
    }
    
    let totalSGPA = 0;
    let totalPercentage = 0;
    let passCount = 0;
    let gradeCounts = {};
    let subjectPerformance = {};
    
    // Sort results by SGPA for top performers
    const sortedResults = [...results].sort((a, b) => 
      (b.data?.sgpa || 0) - (a.data?.sgpa || 0)
    );
    
    // Process each result
    results.forEach(result => {
      const sgpa = result.data?.sgpa || 0;
      const percentage = result.data?.percentage || 0;
      const grade = result.data?.overallGrade || 'N/A';
      
      totalSGPA += sgpa;
      totalPercentage += percentage;
      
      // Count passes (SGPA >= 5.0 is usually passing)
      if (sgpa >= 5.0) {
        passCount++;
      }
      
      // Count grades
      gradeCounts[grade] = (gradeCounts[grade] || 0) + 1;
      
      // Process subjects
      if (result.data?.subjects) {
        result.data.subjects.forEach(subject => {
          if (!subjectPerformance[subject.name]) {
            subjectPerformance[subject.name] = {
              totalMarks: 0,
              count: 0,
              grades: {}
            };
          }
          
          subjectPerformance[subject.name].totalMarks += subject.marksObtained;
          subjectPerformance[subject.name].count += 1;
          
          // Count grades for this subject
          if (!subjectPerformance[subject.name].grades[subject.grade]) {
            subjectPerformance[subject.name].grades[subject.grade] = 0;
          }
          subjectPerformance[subject.name].grades[subject.grade]++;
        });
      }
    });
    
    // Get top 5 performers
    const topPerformers = sortedResults.slice(0, 5);
    
    // Calculate average for each subject
    const subjectAverages = Object.entries(subjectPerformance).map(([name, data]) => ({
      name,
      average: data.totalMarks / data.count,
      grades: data.grades
    }));
    
    // Sort subjects by average performance
    const sortedSubjects = [...subjectAverages].sort((a, b) => b.average - a.average);
    
    return {
      totalStudents: results.length,
      passPercentage: (passCount / results.length) * 100,
      averageSGPA: totalSGPA / results.length,
      averagePercentage: totalPercentage / results.length,
      topPerformers,
      gradeCounts,
      subjectPerformance: sortedSubjects
    };
  }, [results]);
  
  // Get grade distribution data for charts
  const gradeDistributionData = {
    labels: Object.keys(batchStats.gradeCounts),
    datasets: [
      {
        label: 'Number of Students',
        data: Object.values(batchStats.gradeCounts),
        backgroundColor: [
          'rgba(54, 162, 235, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 99, 132, 0.7)',
          'rgba(255, 159, 64, 0.7)',
        ],
        borderWidth: 1
      }
    ]
  };
  
  // Get subject performance data for charts
  const subjectPerformanceData = {
    labels: batchStats.subjectPerformance.map(subject => subject.name),
    datasets: [
      {
        label: 'Average Marks',
        data: batchStats.subjectPerformance.map(subject => subject.average),
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }
    ]
  };
  
  // Get SGPA distribution data
  const sgpaDistributionData = {
    labels: ['<5.0', '5.0-6.0', '6.0-7.0', '7.0-8.0', '8.0-9.0', '9.0-10.0'],
    datasets: [
      {
        label: 'Number of Students',
        data: [
          results.filter(r => (r.data?.sgpa || 0) < 5.0).length,
          results.filter(r => (r.data?.sgpa || 0) >= 5.0 && (r.data?.sgpa || 0) < 6.0).length,
          results.filter(r => (r.data?.sgpa || 0) >= 6.0 && (r.data?.sgpa || 0) < 7.0).length,
          results.filter(r => (r.data?.sgpa || 0) >= 7.0 && (r.data?.sgpa || 0) < 8.0).length,
          results.filter(r => (r.data?.sgpa || 0) >= 8.0 && (r.data?.sgpa || 0) < 9.0).length,
          results.filter(r => (r.data?.sgpa || 0) >= 9.0).length
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(255, 159, 64, 0.7)',
          'rgba(255, 205, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(153, 102, 255, 0.7)'
        ],
        borderWidth: 1
      }
    ]
  };
  
  // Chart options
  const barOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Subject-wise Performance'
      },
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Average Marks'
        }
      }
    }
  };

  return (
    <div className="batch-analysis">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Batch Performance Analysis</h2>
        <div>
          <button 
            className="btn btn-outline-primary me-2"
            onClick={() => navigate('/results')}
          >
            <i className="bi bi-arrow-left me-1"></i> Back to Results
          </button>
          <button 
            className="btn btn-success"
            onClick={() => navigate('/excel', { state: { allResults: true } })}
          >
            <i className="bi bi-file-earmark-excel me-2"></i>Download Batch Report
          </button>
        </div>
      </div>
      
      {results.length === 0 ? (
        <div className="alert alert-info">
          <div className="text-center py-5">
            <i className="bi bi-inbox display-4 text-muted mb-3"></i>
            <h4>No Results Available</h4>
            <p className="text-muted">Upload and process PDF files to analyze batch performance.</p>
            <button 
              className="btn btn-primary mt-2"
              onClick={() => navigate('/upload')}
            >
              <i className="bi bi-upload me-2"></i>Go to Upload Page
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Key Statistics Cards */}
          <div className="row mb-4">
            <div className="col-md-3 mb-3">
              <div className="card h-100">
                <div className="card-body">
                  <h6 className="text-muted mb-2">Total Students</h6>
                  <h3 className="mb-0">{batchStats.totalStudents}</h3>
                  <div className="mt-2">
                    <small className="text-muted">
                      Processed results
                    </small>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card h-100">
                <div className="card-body">
                  <h6 className="text-muted mb-2">Average SGPA</h6>
                  <h3 className="mb-0">{batchStats.averageSGPA.toFixed(2)}</h3>
                  <div className="mt-2">
                    <small className="text-muted">
                      Batch performance
                    </small>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card h-100">
                <div className="card-body">
                  <h6 className="text-muted mb-2">Average Percentage</h6>
                  <h3 className="mb-0">{batchStats.averagePercentage.toFixed(2)}%</h3>
                  <div className="mt-2">
                    <small className="text-muted">
                      Overall marks
                    </small>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card h-100">
                <div className="card-body">
                  <h6 className="text-muted mb-2">Pass Percentage</h6>
                  <h3 className="mb-0">{batchStats.passPercentage.toFixed(2)}%</h3>
                  <div className="mt-2">
                    <small className="text-muted">
                      Students with SGPA ≥ 5.0
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Analysis Type Tabs */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button 
                className={`nav-link ${analysisType === 'overview' ? 'active' : ''}`}
                onClick={() => setAnalysisType('overview')}
              >
                <i className="bi bi-grid me-1"></i> Overview
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${analysisType === 'subjects' ? 'active' : ''}`}
                onClick={() => setAnalysisType('subjects')}
              >
                <i className="bi bi-book me-1"></i> Subject Analysis
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${analysisType === 'students' ? 'active' : ''}`}
                onClick={() => setAnalysisType('students')}
              >
                <i className="bi bi-people me-1"></i> Student Performance
              </button>
            </li>
          </ul>
          
          {/* Overview Analysis */}
          {analysisType === 'overview' && (
            <>
              <div className="row mb-4">
                <div className="col-md-6 mb-4">
                  <div className="card h-100">
                    <div className="card-header bg-primary text-white">
                      <h5 className="mb-0">Grade Distribution</h5>
                    </div>
                    <div className="card-body">
                      <div style={{ height: '300px' }} className="d-flex justify-content-center align-items-center">
                        <Pie data={gradeDistributionData} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 mb-4">
                  <div className="card h-100">
                    <div className="card-header bg-primary text-white">
                      <h5 className="mb-0">SGPA Distribution</h5>
                    </div>
                    <div className="card-body">
                      <div style={{ height: '300px' }} className="d-flex justify-content-center align-items-center">
                        <Bar 
                          data={sgpaDistributionData}
                          options={{
                            responsive: true,
                            plugins: {
                              legend: {
                                display: false
                              }
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="row mb-4">
                <div className="col-12">
                  <div className="card">
                    <div className="card-header bg-primary text-white">
                      <h5 className="mb-0">Top Performers</h5>
                    </div>
                    <div className="card-body p-0">
                      <div className="table-responsive">
                        <table className="table table-hover mb-0">
                          <thead>
                            <tr>
                              <th>Rank</th>
                              <th>Student Name</th>
                              <th>Roll Number</th>
                              <th>SGPA</th>
                              <th>Percentage</th>
                              <th>Grade</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {batchStats.topPerformers.map((result, index) => (
                              <tr key={result.id}>
                                <td>{index + 1}</td>
                                <td>{result.data?.studentInfo?.name || 'N/A'}</td>
                                <td>{result.data?.studentInfo?.rollNumber || 'N/A'}</td>
                                <td>{result.data?.sgpa || 'N/A'}</td>
                                <td>{result.data?.percentage ? `${result.data.percentage.toFixed(2)}%` : 'N/A'}</td>
                                <td>
                                  <span 
                                    className={`badge bg-${
                                      result.data?.sgpa >= 8 ? 'success' : 
                                      result.data?.sgpa >= 6 ? 'primary' : 
                                      result.data?.sgpa >= 5 ? 'warning' : 'danger'
                                    }`}
                                  >
                                    {result.data?.overallGrade || 'N/A'}
                                  </span>
                                </td>
                                <td>
                                  <button 
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => navigate(`/results/${result.id}`, { state: { result } })}
                                  >
                                    <i className="bi bi-eye me-1"></i>View
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
          
          {/* Subject Analysis */}
          {analysisType === 'subjects' && (
            <>
              <div className="row mb-4">
                <div className="col-md-8 mb-4">
                  <div className="card h-100">
                    <div className="card-header bg-primary text-white">
                      <h5 className="mb-0">Subject-wise Performance</h5>
                    </div>
                    <div className="card-body">
                      <div style={{ height: '400px' }}>
                        <Bar data={subjectPerformanceData} options={barOptions} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 mb-4">
                  <div className="card h-100">
                    <div className="card-header bg-primary text-white">
                      <h5 className="mb-0">Subject Performance Ranking</h5>
                    </div>
                    <div className="card-body">
                      <ol className="list-group list-group-flush list-group-numbered">
                        {batchStats.subjectPerformance.slice(0, 6).map(subject => (
                          <li key={subject.name} className="list-group-item d-flex justify-content-between align-items-center">
                            <div className="ms-2 me-auto">
                              <div className="fw-bold">{subject.name}</div>
                              <small className="text-muted">Average: {subject.average.toFixed(2)}%</small>
                            </div>
                            <span className={`badge bg-${
                              subject.average >= 75 ? 'success' : 
                              subject.average >= 60 ? 'primary' : 
                              subject.average >= 50 ? 'warning' : 'danger'
                            }`}>
                              {subject.average.toFixed(2)}%
                            </span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card mb-4">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">Detailed Subject Analysis</h5>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-striped table-hover mb-0">
                      <thead>
                        <tr>
                          <th>Subject Name</th>
                          <th>Average Marks</th>
                          <th>Pass Rate</th>
                          <th>Grade Distribution</th>
                          <th>Performance Level</th>
                        </tr>
                      </thead>
                      <tbody>
                        {batchStats.subjectPerformance.map(subject => {
                          // Calculate pass rate (grade C or better)
                          const passingGrades = Object.entries(subject.grades)
                            .filter(([grade]) => !['F', 'D'].includes(grade))
                            .reduce((sum, [_, count]) => sum + count, 0);
                          const totalCount = Object.values(subject.grades).reduce((sum, count) => sum + count, 0);
                          const passRate = totalCount > 0 ? (passingGrades / totalCount) * 100 : 0;
                          
                          // Determine performance level
                          let performanceLevel;
                          if (subject.average >= 80) performanceLevel = 'Excellent';
                          else if (subject.average >= 70) performanceLevel = 'Very Good';
                          else if (subject.average >= 60) performanceLevel = 'Good';
                          else if (subject.average >= 50) performanceLevel = 'Satisfactory';
                          else performanceLevel = 'Needs Improvement';
                          
                          return (
                            <tr key={subject.name}>
                              <td>{subject.name}</td>
                              <td>{subject.average.toFixed(2)}%</td>
                              <td>{passRate.toFixed(2)}%</td>
                              <td>
                                <div className="d-flex">
                                  {Object.entries(subject.grades).map(([grade, count]) => (
                                    <div 
                                      key={grade} 
                                      title={`${grade}: ${count} students`}
                                      className={`badge bg-${
                                        grade === 'A+' || grade === 'A' ? 'success' : 
                                        grade === 'B+' || grade === 'B' ? 'primary' : 
                                        grade === 'C+' || grade === 'C' ? 'info' : 
                                        grade === 'D' ? 'warning' : 'danger'
                                      } me-1`}
                                    >
                                      {grade}: {count}
                                    </div>
                                  ))}
                                </div>
                              </td>
                              <td>
                                <span className={`badge bg-${
                                  subject.average >= 80 ? 'success' : 
                                  subject.average >= 70 ? 'primary' : 
                                  subject.average >= 60 ? 'info' : 
                                  subject.average >= 50 ? 'warning' : 'danger'
                                }`}>
                                  {performanceLevel}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
          
          {/* Student Performance */}
          {analysisType === 'students' && (
            <>
              <div className="row mb-4">
                <div className="col-md-6 mb-4">
                  <div className="card h-100">
                    <div className="card-header bg-primary text-white">
                      <h5 className="mb-0">Student Performance Distribution</h5>
                    </div>
                    <div className="card-body">
                      <div style={{ height: '300px' }}>
                        <Pie data={sgpaDistributionData} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 mb-4">
                  <div className="card h-100">
                    <div className="card-header bg-primary text-white">
                      <h5 className="mb-0">Performance Metrics</h5>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <div className="card border-0 bg-light">
                            <div className="card-body text-center">
                              <h6 className="card-title text-muted">Pass Percentage</h6>
                              <h3 className="mb-0">{batchStats.passPercentage.toFixed(2)}%</h3>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <div className="card border-0 bg-light">
                            <div className="card-body text-center">
                              <h6 className="card-title text-muted">Average SGPA</h6>
                              <h3 className="mb-0">{batchStats.averageSGPA.toFixed(2)}</h3>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <div className="card border-0 bg-light">
                            <div className="card-body text-center">
                              <h6 className="card-title text-muted">High Achievers</h6>
                              <h3 className="mb-0">
                                {results.filter(r => (r.data?.sgpa || 0) >= 8.0).length}
                              </h3>
                              <small className="text-muted">SGPA ≥ 8.0</small>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <div className="card border-0 bg-light">
                            <div className="card-body text-center">
                              <h6 className="card-title text-muted">Need Improvement</h6>
                              <h3 className="mb-0">
                                {results.filter(r => (r.data?.sgpa || 0) < 5.0).length}
                              </h3>
                              <small className="text-muted">SGPA  5.0</small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card mb-4">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">All Students Performance</h5>
                </div>
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-striped table-hover mb-0">
                      <thead>
                        <tr>
                          <th>Student Name</th>
                          <th>Roll Number</th>
                          <th>SGPA</th>
                          <th>Percentage</th>
                          <th>Grade</th>
                          <th>Performance</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results
                          .sort((a, b) => (b.data?.sgpa || 0) - (a.data?.sgpa || 0))
                          .map(result => {
                            // Determine performance level
                            let performanceLevel;
                            const sgpa = result.data?.sgpa || 0;
                            if (sgpa >= 8.5) performanceLevel = 'Outstanding';
                            else if (sgpa >= 7.5) performanceLevel = 'Excellent';
                            else if (sgpa >= 6.5) performanceLevel = 'Very Good';
                            else if (sgpa >= 5.5) performanceLevel = 'Good';
                            else if (sgpa >= 5.0) performanceLevel = 'Satisfactory';
                            else performanceLevel = 'Needs Improvement';
                            
                            return (
                              <tr key={result.id}>
                                <td>{result.data?.studentInfo?.name || 'N/A'}</td>
                                <td>{result.data?.studentInfo?.rollNumber || 'N/A'}</td>
                                <td>{result.data?.sgpa || 'N/A'}</td>
                                <td>{result.data?.percentage ? `${result.data.percentage.toFixed(2)}%` : 'N/A'}</td>
                                <td>
                                  <span className={`badge bg-${
                                    result.data?.sgpa >= 8 ? 'success' : 
                                    result.data?.sgpa >= 6 ? 'primary' : 
                                    result.data?.sgpa >= 5 ? 'warning' : 'danger'
                                  }`}>
                                    {result.data?.overallGrade || 'N/A'}
                                  </span>
                                </td>
                                <td>
                                  <span className={`badge bg-${
                                    sgpa >= 7.5 ? 'success' : 
                                    sgpa >= 6.0 ? 'primary' : 
                                    sgpa >= 5.0 ? 'warning' : 'danger'
                                  }`}>
                                    {performanceLevel}
                                  </span>
                                </td>
                                <td>
                                  <button 
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => navigate(`/results/${result.id}`, { state: { result } })}
                                  >
                                    <i className="bi bi-eye me-1"></i>View
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
          
          <div className="d-flex justify-content-end mt-4">
            <button 
              className="btn btn-outline-primary me-2"
              onClick={() => window.print()}
            >
              <i className="bi bi-printer me-1"></i> Print Analysis
            </button>
            <button 
              className="btn btn-success"
              onClick={() => navigate('/excel', { state: { allResults: true } })}
            >
              <i className="bi bi-file-earmark-excel me-1"></i> Download Batch Report
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default BatchAnalysis;