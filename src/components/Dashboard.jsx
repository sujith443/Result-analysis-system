import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

const Dashboard = ({ uploadedFiles, processedResults, clearAllData }) => {
  // Calculate class statistics
  const classStats = useMemo(() => {
    if (processedResults.length === 0) {
      return {
        totalStudents: 0,
        avgSGPA: 0,
        avgPercentage: 0,
        topStudent: null,
        gradeCounts: {},
        subjectPerformance: []
      };
    }

    let totalSGPA = 0;
    let totalPercentage = 0;
    let topStudent = processedResults[0];
    let gradeCounts = {};
    let subjectPerformance = {};

    processedResults.forEach(result => {
      const sgpa = result.data?.sgpa || 0;
      const percentage = result.data?.percentage || 0;
      const grade = result.data?.overallGrade || 'N/A';

      totalSGPA += sgpa;
      totalPercentage += percentage;

      // Track top student
      if ((result.data?.sgpa || 0) > (topStudent.data?.sgpa || 0)) {
        topStudent = result;
      }

      // Count grades
      gradeCounts[grade] = (gradeCounts[grade] || 0) + 1;
      
      // Track subject performance
      if (result.data?.subjects) {
        result.data.subjects.forEach(subject => {
          if (!subjectPerformance[subject.name]) {
            subjectPerformance[subject.name] = {
              total: 0,
              count: 0
            };
          }
          
          subjectPerformance[subject.name].total += subject.marksObtained;
          subjectPerformance[subject.name].count += 1;
        });
      }
    });
    
    // Calculate average performance for each subject
    const subjectPerformanceArray = Object.entries(subjectPerformance).map(([name, data]) => ({
      name,
      average: data.total / data.count
    }));

    return {
      totalStudents: processedResults.length,
      avgSGPA: (totalSGPA / processedResults.length).toFixed(2),
      avgPercentage: Math.round(totalPercentage / processedResults.length),
      topStudent,
      gradeCounts,
      subjectPerformance: subjectPerformanceArray
    };
  }, [processedResults]);

  return (
    <div className="dashboard">
      <div className="row mb-4">
        <div className="col-md-8">
          <h1 className="mb-2">Result Analysis Dashboard</h1>
          <p className="text-muted">
            Welcome to the B.Tech Result Analysis System for SVIT College. Upload PDF results, analyze performance, and generate Excel reports.
          </p>
        </div>
        <div className="col-md-4 text-md-end d-flex align-items-center justify-content-md-end mt-3 mt-md-0">
          {processedResults.length > 0 && (
            <button 
              className="btn btn-outline-danger"
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
                  clearAllData();
                }
              }}
            >
              <i className="bi bi-trash me-2"></i>Clear All Data
            </button>
          )}
        </div>
      </div>

      {/* Key Statistics */}
      {processedResults.length > 0 ? (
        <>
          <div className="row mt-4">
            <div className="col-12">
              <div className="card mb-4">
                <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">BTech Semester Results - Class Overview</h5>
                  <span className="badge bg-light text-primary">
                    {classStats.totalStudents} Students
                  </span>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-3 mb-3">
                      <div className="card h-100 stat-card">
                        <div className="card-body">
                          <h6 className="text-muted mb-2">Students Processed</h6>
                          <h3 className="mb-0">{classStats.totalStudents}</h3>
                          <div className="mt-2">
                            <small className="text-muted">
                              <i className="bi bi-people me-1"></i>
                              Total results analyzed
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 mb-3">
                      <div className="card h-100 stat-card average">
                        <div className="card-body">
                          <h6 className="text-muted mb-2">Average SGPA</h6>
                          <h3 className="mb-0">{classStats.avgSGPA}</h3>
                          <div className="mt-2">
                            <small className="text-muted">
                              <i className="bi bi-graph-up me-1"></i>
                              Class performance
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 mb-3">
                      <div className="card h-100 stat-card performance">
                        <div className="card-body">
                          <h6 className="text-muted mb-2">Avg. Percentage</h6>
                          <h3 className="mb-0">{classStats.avgPercentage}%</h3>
                          <div className="mt-2">
                            <small className="text-muted">
                              <i className="bi bi-percent me-1"></i>
                              Overall marks
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3 mb-3">
                      <div className="card h-100 stat-card">
                        <div className="card-body">
                          <h6 className="text-muted mb-2">Top Performer</h6>
                          <h5 className="mb-0">{classStats.topStudent?.data?.studentInfo?.name}</h5>
                          <div className="mt-2">
                            <small className="text-success">
                              <i className="bi bi-trophy me-1"></i>
                              SGPA: {classStats.topStudent?.data?.sgpa}
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Latest Results */}
          <div className="row mt-4">
            <div className="col-12">
              <div className="card">
                <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Latest Results</h5>
                  <Link to="/results" className="btn btn-sm btn-outline-light">View All</Link>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Student Name</th>
                          <th>Roll Number</th>
                          <th>SGPA</th>
                          <th>Percentage</th>
                          <th>Grade</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {processedResults
                          .slice(0, 5) // Show only latest 5 results
                          .map(result => (
                            <tr key={result.id}>
                              <td>{result.data?.studentInfo?.name || 'N/A'}</td>
                              <td>{result.data?.studentInfo?.rollNumber || 'N/A'}</td>
                              <td>{result.data?.sgpa || 'N/A'}</td>
                              <td>{result.data?.percentage ? `${result.data.percentage}%` : 'N/A'}</td>
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
                                <Link 
                                  to={`/results/${result.id}`}
                                  className="btn btn-sm btn-outline-primary"
                                >
                                  View
                                </Link>
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
      ) : (
        <div className="row mt-3">
          <div className="col-12">
            <div className="card">
              <div className="card-body text-center py-5">
                <img src="/empty-state.svg" alt="No data" style={{ maxWidth: '200px', opacity: '0.7' }} className="mb-4" />
                <h4>No Results Data Available</h4>
                <p className="text-muted">Upload exam result PDFs to start analyzing student performance.</p>
                <Link to="/upload" className="btn btn-primary mt-3">
                  <i className="bi bi-cloud-upload me-2"></i>Upload PDF Files
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Cards */}
      <div className="row mt-4">
        <div className="col-md-4 mb-4">
          <div className="card dashboard-card h-100">
            <div className="card-body text-center py-4">
              <div className="icon-circle bg-primary text-white mb-3">
                <i className="bi bi-cloud-arrow-up-fill fs-3"></i>
              </div>
              <h5 className="card-title">Upload Result PDFs</h5>
              <p className="card-text text-muted">Upload student result PDFs for automatic data extraction and analysis.</p>
              <div className="d-grid mt-3">
                <Link to="/upload" className="btn btn-primary">
                  <i className="bi bi-upload me-2"></i>Upload Files
                </Link>
              </div>
            </div>
            <div className="card-footer text-muted">
              {uploadedFiles.length} files uploaded so far
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-4">
          <div className="card dashboard-card h-100">
            <div className="card-body text-center py-4">
              <div className="icon-circle bg-success text-white mb-3">
                <i className="bi bi-table fs-3"></i>
              </div>
              <h5 className="card-title">View Student Results</h5>
              <p className="card-text text-muted">Access and manage processed result data with detailed performance metrics.</p>
              <div className="d-grid mt-3">
                <Link to="/results" className="btn btn-success">
                  <i className="bi bi-list-check me-2"></i>View Results
                </Link>
              </div>
            </div>
            <div className="card-footer text-muted">
              {processedResults.length} results available to analyze
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-4">
          <div className="card dashboard-card h-100">
            <div className="card-body text-center py-4">
              <div className="icon-circle bg-warning text-white mb-3">
                <i className="bi bi-file-earmark-excel-fill fs-3"></i>
              </div>
              <h5 className="card-title">Generate Excel Reports</h5>
              <p className="card-text text-muted">Download structured Excel sheets with all student performance data.</p>
              <div className="d-grid mt-3">
                <Link to="/excel" className="btn btn-warning">
                  <i className="bi bi-download me-2"></i>Download Excel
                </Link>
              </div>
            </div>
            <div className="card-footer text-muted">
              {processedResults.length > 0 ? 'Excel reports ready for download' : 'No reports available yet'}
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-2">
        <div className="col-md-6 mb-4">
          <div className="card dashboard-card h-100">
            <div className="card-body text-center py-4">
              <div className="icon-circle bg-info text-white mb-3">
                <i className="bi bi-graph-up fs-3"></i>
              </div>
              <h5 className="card-title">Batch Analysis</h5>
              <p className="card-text text-muted">Analyze the entire batch with comparative metrics and insights.</p>
              <div className="d-grid mt-3">
                <Link to="/batch-analysis" className="btn btn-info">
                  <i className="bi bi-bar-chart-line me-2"></i>Analyze Batch
                </Link>
              </div>
            </div>
            <div className="card-footer text-muted">
              Benchmark student performance against the class
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">System Features</h5>
            </div>
            <div className="card-body">
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex align-items-center">
                  <i className="bi bi-shield-check text-success me-3 fs-4"></i>
                  <div>
                    <h6 className="mb-0">Secure PDF Processing</h6>
                    <small className="text-muted">Upload and process student results with data protection</small>
                  </div>
                </li>
                <li className="list-group-item d-flex align-items-center">
                  <i className="bi bi-robot text-primary me-3 fs-4"></i>
                  <div>
                    <h6 className="mb-0">Automated Data Extraction</h6>
                    <small className="text-muted">Extract student marks and details automatically from PDFs</small>
                  </div>
                </li>
                <li className="list-group-item d-flex align-items-center">
                  <i className="bi bi-file-earmark-spreadsheet text-warning me-3 fs-4"></i>
                  <div>
                    <h6 className="mb-0">Structured Excel Reports</h6>
                    <small className="text-muted">Generate comprehensive Excel files for detailed analysis</small>
                  </div>
                </li>
                <li className="list-group-item d-flex align-items-center">
                  <i className="bi bi-graph-up-arrow text-info me-3 fs-4"></i>
                  <div>
                    <h6 className="mb-0">Performance Analytics</h6>
                    <small className="text-muted">Visualize student performance with detailed metrics</small>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;