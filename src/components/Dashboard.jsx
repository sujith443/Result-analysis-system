import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

const Dashboard = ({ uploadedFiles, processedResults }) => {
  // Calculate class statistics
  const classStats = useMemo(() => {
    if (processedResults.length === 0) {
      return {
        totalStudents: 0,
        avgSGPA: 0,
        avgPercentage: 0,
        topStudent: null,
        gradeCounts: {}
      };
    }

    let totalSGPA = 0;
    let totalPercentage = 0;
    let topStudent = processedResults[0];
    let gradeCounts = {};

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
    });

    return {
      totalStudents: processedResults.length,
      avgSGPA: (totalSGPA / processedResults.length).toFixed(2),
      avgPercentage: Math.round(totalPercentage / processedResults.length),
      topStudent,
      gradeCounts
    };
  }, [processedResults]);

  return (
    <div className="dashboard">
      <div className="row">
        <div className="col-12">
          <h1 className="text-center mb-4">Result Analysis System</h1>
          <p className="text-center lead">
            Upload exam result PDFs and convert them into structured Excel sheets for analysis
          </p>
        </div>
      </div>

      {/* Key Statistics */}
      {processedResults.length > 0 && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="card mb-4">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">BTech ECE 2nd Year 1st Semester - Class Overview</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-3 mb-3">
                    <div className="card text-center h-100">
                      <div className="card-body">
                        <h5 className="card-title">Students</h5>
                        <p className="card-text display-4">{classStats.totalStudents}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card text-center h-100">
                      <div className="card-body">
                        <h5 className="card-title">Avg. SGPA</h5>
                        <p className="card-text display-4">{classStats.avgSGPA}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card text-center h-100">
                      <div className="card-body">
                        <h5 className="card-title">Avg. Percentage</h5>
                        <p className="card-text display-4">{classStats.avgPercentage}%</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card text-center h-100">
                      <div className="card-body">
                        <h5 className="card-title">Top Student</h5>
                        <p className="card-text">
                          <strong>{classStats.topStudent?.data?.studentInfo?.name}</strong>
                          <br />
                          SGPA: {classStats.topStudent?.data?.sgpa}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Cards */}
      <div className="row mt-3">
        <div className="col-md-4">
          <div className="card text-center mb-4 h-100">
            <div className="card-body">
              <h5 className="card-title">Upload PDFs</h5>
              <p className="card-text">Upload student result PDFs for processing.</p>
              <div className="d-grid">
                <Link to="/upload" className="btn btn-primary">Upload Files</Link>
              </div>
            </div>
            <div className="card-footer text-muted">
              {uploadedFiles.length} files uploaded
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card text-center mb-4 h-100">
            <div className="card-body">
              <h5 className="card-title">View Results</h5>
              <p className="card-text">Access and manage processed result data.</p>
              <div className="d-grid">
                <Link to="/results" className="btn btn-success">View Results</Link>
              </div>
            </div>
            <div className="card-footer text-muted">
              {processedResults.length} results available
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card text-center mb-4 h-100">
            <div className="card-body">
              <h5 className="card-title">Generate Excel</h5>
              <p className="card-text">Download structured Excel sheets of results.</p>
              <div className="d-grid">
                <Link to="/excel" className="btn btn-warning">Download Excel</Link>
              </div>
            </div>
            <div className="card-footer text-muted">
              {processedResults.length > 0 ? 'Excel reports ready for download' : 'No reports available yet'}
            </div>
          </div>
        </div>
      </div>

      {/* Latest Results */}
      {processedResults.length > 0 && (
        <div className="row mt-3">
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
                            <td>{result.data?.overallGrade || 'N/A'}</td>
                            <td>
                              <Link 
                                to={`/results/${result.id}`}
                                state={{ result }}
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
      )}

      {/* Grade Distribution */}
      {processedResults.length > 0 && (
        <div className="row mt-3">
          <div className="col-12">
            <div className="card">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Grade Distribution</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  {Object.entries(classStats.gradeCounts).map(([grade, count]) => (
                    <div key={grade} className="col-md-2 col-sm-4 col-6 mb-3">
                      <div className={`card text-center h-100 bg-light`}>
                        <div className="card-body p-2">
                          <h5 className="card-title mb-0">{grade}</h5>
                          <p className="card-text display-6">{count}</p>
                          <p className="text-muted small">
                            {Math.round((count / classStats.totalStudents) * 100)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">System Overview</h5>
            </div>
            <div className="card-body">
              <h5 className="card-title">Result Analysis System Features</h5>
              <ul className="list-group list-group-flush">
                <li className="list-group-item">Upload student result PDFs securely</li>
                <li className="list-group-item">Automatic data extraction from PDFs</li>
                <li className="list-group-item">Structured Excel sheet generation</li>
                <li className="list-group-item">Student marks and subject-wise performance analysis</li>
                <li className="list-group-item">Comprehensive academic performance evaluation</li>
                <li className="list-group-item">Class-wide performance comparison</li>
                <li className="list-group-item">Subject-wise analytics for educators</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;