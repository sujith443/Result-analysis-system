import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

const ResultDetails = ({ result }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const locationResult = location.state?.result;
  
  // Use result from location state if it exists
  const resultData = result || locationResult;
  
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

  return (
    <div className="result-details">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Student Result Details</h2>
        <button 
          className="btn btn-outline-secondary"
          onClick={() => navigate('/results')}
        >
          Back to Results
        </button>
      </div>
      
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">File Information</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <p><strong>Filename:</strong> {fileName}</p>
              <p><strong>Upload Date:</strong> {formatDate(uploadDate)}</p>
            </div>
            <div className="col-md-6">
              <p><strong>Result ID:</strong> {id}</p>
              <p><strong>Status:</strong> <span className="badge bg-success">Processed</span></p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Student Information Section */}
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">Student Information</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <p><strong>Student Name:</strong> {data?.studentInfo?.name || 'N/A'}</p>
              <p><strong>Registration Number:</strong> {data?.studentInfo?.registrationNumber || 'N/A'}</p>
            </div>
            <div className="col-md-4">
              <p><strong>Roll Number:</strong> {data?.studentInfo?.rollNumber || 'N/A'}</p>
              <p><strong>Class/Section:</strong> {data?.studentInfo?.class || 'N/A'}</p>
            </div>
            <div className="col-md-4">
              <p><strong>Academic Year:</strong> {data?.studentInfo?.academicYear || 'N/A'}</p>
              <p><strong>Examination:</strong> {data?.studentInfo?.examination || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Subject Results Section */}
      <div className="card mb-4">
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
      
      {/* Overall Performance Section */}
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">Overall Performance</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-3">
              <div className="card text-center h-100">
                <div className="card-body">
                  <h5 className="card-title">Total Marks</h5>
                  <p className="card-text display-6">
                    {data?.totalMarksObtained || 'N/A'}/{data?.totalMarks || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card text-center h-100">
                <div className="card-body">
                  <h5 className="card-title">Percentage</h5>
                  <p className={`card-text display-6 text-${getPerformanceColor(data?.percentage || 0)}`}>
                    {data?.percentage ? `${data.percentage}%` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card text-center h-100">
                <div className="card-body">
                  <h5 className="card-title">SGPA</h5>
                  <p className={`card-text display-6 text-${data?.sgpa >= 8 ? 'success' : data?.sgpa >= 6 ? 'primary' : data?.sgpa >= 4 ? 'warning' : 'danger'}`}>
                    {data?.sgpa || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card text-center h-100">
                <div className="card-body">
                  <h5 className="card-title">Rank</h5>
                  <p className="card-text display-6">
                    {data?.rank ? `${data.rank}/60` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Performance Analysis */}
      {data?.subjects && (
        <div className="card mb-4">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">Performance Analysis</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <h6 className="border-bottom pb-2 mb-3">Strengths</h6>
                <ul className="list-group">
                  {[...data.subjects]
                    .sort((a, b) => b.marksObtained - a.marksObtained)
                    .slice(0, 2)
                    .map((subject, index) => (
                      <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                        {subject.name}
                        <span className={`badge bg-${getPerformanceColor(subject.marksObtained)}`}>
                          {subject.marksObtained}%
                        </span>
                      </li>
                    ))
                  }
                </ul>
              </div>
              <div className="col-md-6">
                <h6 className="border-bottom pb-2 mb-3">Areas for Improvement</h6>
                <ul className="list-group">
                  {[...data.subjects]
                    .sort((a, b) => a.marksObtained - b.marksObtained)
                    .slice(0, 2)
                    .map((subject, index) => (
                      <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                        {subject.name}
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
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="d-flex justify-content-end mb-4">
        <button 
          className="btn btn-outline-primary me-2"
          onClick={() => window.print()}
        >
          <i className="bi bi-printer me-1"></i> Print Result
        </button>
        <button 
          className="btn btn-success"
          onClick={() => navigate('/excel', { state: { resultId: id } })}
        >
          <i className="bi bi-file-excel me-1"></i> Download as Excel
        </button>
      </div>
    </div>
  );
};

export default ResultDetails;