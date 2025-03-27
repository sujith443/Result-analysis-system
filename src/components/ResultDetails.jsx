import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Pie, Bar } from 'react-chartjs-2';

const ResultDetails = ({ result }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const locationResult = location.state?.result;
  
  // Use result from location state if it exists
  const resultData = result || locationResult;
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
    // If no result data is available, redirect to results list
    if (!resultData) {
      navigate('/results');
    }
  }, [resultData, navigate]);
  
  // If result is not available, show loading
  if (!resultData) {
    return (
      <div className="d-flex justify-content-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Extract data from result
  const { fileName, uploadDate, data } = resultData;
  
  // Helper to format dates
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Helper to determine color based on performance
  const getPerformanceColor = (percentage) => {
    if (percentage >= 85) return 'success';
    if (percentage >= 70) return 'primary';
    if (percentage >= 50) return 'warning';
    return 'danger';
  };
  
  // Prepare chart data for performance distribution
  const preparePerformanceData = () => {
    if (!data?.subjects || data.subjects.length === 0) return null;
    
    // Count marks in each range
    const ranges = [
      { label: '90-100', count: 0, color: 'rgba(40, 167, 69, 0.7)' },
      { label: '80-89', count: 0, color: 'rgba(0, 123, 255, 0.7)' },
      { label: '70-79', count: 0, color: 'rgba(23, 162, 184, 0.7)' },
      { label: '60-69', count: 0, color: 'rgba(255, 193, 7, 0.7)' },
      { label: '50-59', count: 0, color: 'rgba(220, 53, 69, 0.7)' },
      { label: 'Below 50', count: 0, color: 'rgba(108, 117, 125, 0.7)' }
    ];
    
    // Count subjects in each range
    data.subjects.forEach(subject => {
      const marks = subject.marksObtained;
      if (marks >= 90) ranges[0].count++;
      else if (marks >= 80) ranges[1].count++;
      else if (marks >= 70) ranges[2].count++;
      else if (marks >= 60) ranges[3].count++;
      else if (marks >= 50) ranges[4].count++;
      else ranges[5].count++;
    });
    
    // Filter out empty ranges
    const filteredRanges = ranges.filter(range => range.count > 0);
    
    return {
      labels: filteredRanges.map(range => range.label),
      datasets: [
        {
          data: filteredRanges.map(range => range.count),
          backgroundColor: filteredRanges.map(range => range.color),
          borderColor: filteredRanges.map(range => range.color.replace('0.7', '1')),
          borderWidth: 1
        }
      ]
    };
  };
  
  // Prepare chart data for subject-wise performance
  const prepareSubjectData = () => {
    if (!data?.subjects || data.subjects.length === 0) return null;
    
    return {
      labels: data.subjects.map(subject => subject.name),
      datasets: [
        {
          label: 'Marks Obtained',
          data: data.subjects.map(subject => subject.marksObtained),
          backgroundColor: data.subjects.map(subject => 
            `rgba(${subject.marksObtained >= 75 ? '40, 167, 69' : 
              subject.marksObtained >= 60 ? '0, 123, 255' : 
              subject.marksObtained >= 50 ? '255, 193, 7' : 
              '220, 53, 69'}, 0.7)`
          ),
          borderWidth: 1
        }
      ]
    };
  };
  
  const performanceData = preparePerformanceData();
  const subjectData = prepareSubjectData();
  
  // Chart options
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.parsed.y} marks`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Marks'
        }
      }
    }
  };

  return (
    <div className="result-details">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Student Result Details</h2>
        <div>
          <button 
            className="btn btn-outline-secondary me-2"
            onClick={() => navigate('/results')}
          >
            <i className="bi bi-arrow-left me-1"></i> Back to Results
          </button>
          <button
            className="btn btn-success"
            onClick={() => navigate('/excel', { state: { resultIds: [id] } })}
          >
            <i className="bi bi-file-earmark-excel me-2"></i>Download Excel
          </button>
        </div>
      </div>
      
      {/* Student Info Card */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-2 text-center mb-3 mb-md-0">
              <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: '80px', height: '80px' }}>
                <span className="display-5">{data?.studentInfo?.name?.[0] || '?'}</span>
              </div>
            </div>
            <div className="col-md-7 mb-3 mb-md-0">
              <h3 className="mb-1">{data?.studentInfo?.name || 'N/A'}</h3>
              <div className="text-muted mb-2">
                Roll Number: <strong>{data?.studentInfo?.rollNumber || 'N/A'}</strong> | 
                Class: <strong>{data?.studentInfo?.class || 'N/A'}</strong>
              </div>
              <div>
                <span className={`badge bg-${getPerformanceColor(data?.percentage || 0)} me-2`}>
                  SGPA: {data?.sgpa || 'N/A'}
                </span>
                <span className={`badge bg-${getPerformanceColor(data?.percentage || 0)} me-2`}>
                  {data?.percentage || 0}%
                </span>
                <span className={`badge bg-${getPerformanceColor(data?.percentage || 0)}`}>
                  Grade: {data?.overallGrade || 'N/A'}
                </span>
              </div>
            </div>
            <div className="col-md-3 text-md-end">
              <div className="text-muted small mb-2">
                <i className="bi bi-calendar me-1"></i> {formatDate(uploadDate)}
              </div>
              <div className="text-muted small">
                <i className="bi bi-file-earmark-pdf me-1"></i> {fileName}
              </div>
              <div className="mt-2">
                <span className="badge bg-secondary me-1">
                  <i className="bi bi-award me-1"></i> Rank: {data?.rank || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <i className="bi bi-grid me-1"></i> Overview
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'subjects' ? 'active' : ''}`}
            onClick={() => setActiveTab('subjects')}
          >
            <i className="bi bi-book me-1"></i> Subject Details
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'analysis' ? 'active' : ''}`}
            onClick={() => setActiveTab('analysis')}
          >
            <i className="bi bi-graph-up me-1"></i> Performance Analysis
          </button>
        </li>
      </ul>
      
      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          {/* Performance Overview */}
          <div className="row mb-4">
            <div className="col-md-3 mb-3">
              <div className="card h-100 performance-card">
                <div className={`card-header bg-${getPerformanceColor(data?.percentage || 0)} text-white`}>
                  <h5 className="mb-0">Total Marks</h5>
                </div>
                <div className="card-body text-center">
                  <h2 className={`display-4 text-${getPerformanceColor(data?.percentage || 0)}`}>
                    {data?.totalMarksObtained || 0}
                  </h2>
                  <p className="text-muted">out of {data?.totalMarks || 0}</p>
                  <div className="progress mt-2">
                    <div 
                      className={`progress-bar bg-${getPerformanceColor(data?.percentage || 0)}`} 
                      role="progressbar" 
                      style={{ width: `${data?.percentage || 0}%` }}
                      aria-valuenow={data?.percentage || 0} 
                      aria-valuemin="0" 
                      aria-valuemax="100"
                    >
                      {data?.percentage || 0}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card h-100 performance-card">
                <div className={`card-header bg-${getPerformanceColor(data?.sgpa * 10 || 0)} text-white`}>
                  <h5 className="mb-0">SGPA</h5>
                </div>
                <div className="card-body text-center">
                  <h2 className={`display-4 text-${getPerformanceColor(data?.sgpa * 10 || 0)}`}>
                    {data?.sgpa || 'N/A'}
                  </h2>
                  <p className="text-muted">out of 10.0</p>
                  <div className="progress mt-2">
                    <div 
                      className={`progress-bar bg-${getPerformanceColor(data?.sgpa * 10 || 0)}`} 
                      role="progressbar" 
                      style={{ width: `${(data?.sgpa || 0) * 10}%` }}
                      aria-valuenow={(data?.sgpa || 0) * 10} 
                      aria-valuemin="0" 
                      aria-valuemax="100"
                    >
                      {data?.sgpa || 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card h-100 performance-card">
                <div className="card-header bg-info text-white">
                  <h5 className="mb-0">Credits</h5>
                </div>
                <div className="card-body text-center">
                  <h2 className="display-4 text-info">
                    {data?.totalCredits || 0}
                  </h2>
                  <p className="text-muted">Total Credits</p>
                  <p className="mt-2">
                    <span className="badge bg-info">
                      {data?.totalGradePoints || 0} Grade Points
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card h-100 performance-card">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">Grade</h5>
                </div>
                <div className="card-body text-center">
                  <h2 className="display-4 text-primary">
                    {data?.overallGrade || 'N/A'}
                  </h2>
                  <p className="text-muted">Overall Grade</p>
                  <p className="mt-2">
                    <span className="badge bg-secondary">
                      Rank: {data?.rank || 'N/A'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Charts Row */}
          <div className="row mb-4">
            <div className="col-md-5">
              {performanceData && (
                <div className="card h-100">
                  <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">Marks Distribution</h5>
                  </div>
                  <div className="card-body">
                    <div style={{ height: '240px' }} className="d-flex justify-content-center align-items-center">
                      <Pie data={performanceData} />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="col-md-7">
              {subjectData && (
                <div className="card h-100">
                  <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">Subject Performance</h5>
                  </div>
                  <div className="card-body">
                    <div style={{ height: '240px' }}>
                      <Bar data={subjectData} options={barOptions} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Subjects Tab */}
      {activeTab === 'subjects' && (
        <div className="card">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">Subject-wise Results</h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Course Code</th>
                    <th>Subject</th>
                    <th>Credits</th>
                    <th>Type</th>
                    <th>Internal (40)</th>
                    <th>External (60)</th>
                    <th>Total</th>
                    <th>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.subjects ? (
                    data.subjects.map((subject, index) => (
                      <tr key={index}>
                        <td>{subject.courseCode}</td>
                        <td>{subject.name}</td>
                        <td>{subject.credits}</td>
                        <td>{subject.type}</td>
                        <td>{subject.internalMarks}</td>
                        <td>{subject.externalMarks}</td>
                        <td>
                          <span className={`badge bg-${getPerformanceColor(subject.marksObtained)}`}>
                            {subject.marksObtained}
                          </span>
                        </td>
                        <td>{subject.grade}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center">No subject data available</td>
                    </tr>
                  )}
                </tbody>
                {data?.subjects && (
                  <tfoot className="table-light">
                    <tr>
                      <th colSpan="2">Total</th>
                      <th>{data.totalCredits || data.subjects.reduce((sum, subject) => sum + subject.credits, 0)}</th>
                      <th>-</th>
                      <th>
                        {data.subjects.reduce((sum, subject) => sum + subject.internalMarks, 0)}
                      </th>
                      <th>
                        {data.subjects.reduce((sum, subject) => sum + subject.externalMarks, 0)}
                      </th>
                      <th>
                        {data.totalMarksObtained || data.subjects.reduce((sum, subject) => sum + subject.marksObtained, 0)}
                      </th>
                      <th>{data.overallGrade || 'N/A'}</th>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      )}
      
      {/* Analysis Tab */}
      {activeTab === 'analysis' && (
        <div>
          {data?.subjects && (
            <div className="row">
              <div className="col-md-6 mb-4">
                <div className="card h-100">
                  <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">Performance Analysis</h5>
                  </div>
                  <div className="card-body">
                    <h6 className="border-bottom pb-2 mb-3">Strengths</h6>
                    <ul className="list-group mb-4">
                      {[...data.subjects]
                        .sort((a, b) => b.marksObtained - a.marksObtained)
                        .slice(0, 3)
                        .map((subject, index) => (
                          <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                            <div>
                              <i className={`bi bi-star-fill text-${getPerformanceColor(subject.marksObtained)} me-2`}></i>
                              {subject.name}
                            </div>
                            <span className={`badge bg-${getPerformanceColor(subject.marksObtained)}`}>
                              {subject.marksObtained}%
                            </span>
                          </li>
                        ))
                      }
                    </ul>
                    
                    <h6 className="border-bottom pb-2 mb-3">Areas for Improvement</h6>
                    <ul className="list-group">
                      {[...data.subjects]
                        .sort((a, b) => a.marksObtained - b.marksObtained)
                        .slice(0, 3)
                        .map((subject, index) => (
                          <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                            <div>
                              <i className={`bi bi-lightning-charge-fill text-${getPerformanceColor(subject.marksObtained)} me-2`}></i>
                              {subject.name}
                            </div>
                            <span className={`badge bg-${getPerformanceColor(subject.marksObtained)}`}>
                              {subject.marksObtained}%
                            </span>
                          </li>
                        ))
                      }
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="col-md-6 mb-4">
                <div className="card h-100">
                  <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">Achievement Summary</h5>
                  </div>
                  <div className="card-body">
                    {/* Overall Performance */}
                    <div className="mb-4">
                      <h6 className="mb-3">Overall Performance</h6>
                      <div className="progress mb-2" style={{ height: '20px' }}>
                        <div 
                          className={`progress-bar bg-${getPerformanceColor(data?.percentage || 0)}`} 
                          role="progressbar" 
                          style={{ width: `${data?.percentage || 0}%` }}
                          aria-valuenow={data?.percentage || 0} 
                          aria-valuemin="0" 
                          aria-valuemax="100"
                        >
                          {data?.percentage || 0}%
                        </div>
                      </div>
                      <div className="d-flex justify-content-between text-muted small">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </div>
                    
                    {/* Performance Metrics */}
                    <div className="mb-4">
                      <h6 className="mb-3">Performance Metrics</h6>
                      <div className="card bg-light">
                        <div className="card-body">
                          <ul className="list-unstyled mb-0">
                            <li className="mb-2 d-flex justify-content-between">
                              <span>Attendance:</span>
                              <strong>{data?.performanceMetrics?.attendancePercentage || 'N/A'}%</strong>
                            </li>
                            <li className="mb-2 d-flex justify-content-between">
                              <span>Class Participation:</span>
                              <strong>{data?.performanceMetrics?.classParticipation || 'N/A'}</strong>
                            </li>
                            <li className="mb-2 d-flex justify-content-between">
                              <span>SGPA:</span>
                              <strong>{data?.sgpa || 'N/A'}</strong>
                            </li>
                            <li className="d-flex justify-content-between">
                              <span>Overall Grade:</span>
                              <strong>{data?.overallGrade || 'N/A'}</strong>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    
                    {/* Recommendations */}
                    <div>
                      <h6 className="mb-3">Recommendations</h6>
                      <div className="alert alert-info mb-0">
                        <i className="bi bi-info-circle-fill me-2"></i>
                        {data?.performanceMetrics?.improvements && data.performanceMetrics.improvements.length > 0 ? (
                          <span>
                            Focus on improving: <strong>{data.performanceMetrics.improvements.join(', ')}</strong>
                          </span>
                        ) : (
                          <span>Keep up the good work!</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="d-flex justify-content-between mt-4">
        <button 
          className="btn btn-outline-primary"
          onClick={() => window.print()}
        >
          <i className="bi bi-printer me-1"></i> Print Result
        </button>
        <div>
          <button 
            className="btn btn-outline-secondary me-2"
            onClick={() => navigate('/results')}
          >
            Back to Results
          </button>
          <button 
            className="btn btn-success"
            onClick={() => navigate('/excel', { state: { resultIds: [id] } })}
          >
            <i className="bi bi-file-excel me-1"></i> Download as Excel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultDetails;