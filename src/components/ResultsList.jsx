import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ResultsList = ({ results }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('uploadDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const navigate = useNavigate();

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle sort
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  // Filter and sort results
  const filteredResults = results
    .filter(result => {
      const fileName = result.fileName || '';
      const studentName = result.data?.studentInfo?.name || '';
      const rollNumber = result.data?.studentInfo?.rollNumber || '';
      
      return fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             rollNumber.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => {
      if (sortBy === 'fileName') {
        return sortOrder === 'asc' 
          ? a.fileName.localeCompare(b.fileName)
          : b.fileName.localeCompare(a.fileName);
      } else if (sortBy === 'uploadDate') {
        return sortOrder === 'asc'
          ? new Date(a.uploadDate) - new Date(b.uploadDate)
          : new Date(b.uploadDate) - new Date(a.uploadDate);
      } else if (sortBy === 'studentName') {
        const nameA = a.data?.studentInfo?.name || '';
        const nameB = b.data?.studentInfo?.name || '';
        return sortOrder === 'asc'
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      } else if (sortBy === 'rollNumber') {
        const rollA = a.data?.studentInfo?.rollNumber || '';
        const rollB = b.data?.studentInfo?.rollNumber || '';
        return sortOrder === 'asc'
          ? rollA.localeCompare(rollB)
          : rollB.localeCompare(rollA);
      }
      return 0;
    });
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Navigate to result details
  const viewResultDetails = (result) => {
    navigate(`/results/${result.id}`, { state: { result } });
  };

  return (
    <div className="results-list">
      <h2 className="mb-4">Processed Results</h2>
      
      {results.length === 0 ? (
        <div className="alert alert-info">
          <p>No results available. Please upload and process PDF files first.</p>
          <button 
            className="btn btn-primary mt-2"
            onClick={() => navigate('/upload')}
          >
            Go to Upload Page
          </button>
        </div>
      ) : (
        <>
          <div className="card mb-4">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-8">
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-search"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by name, roll number or filename..."
                      value={searchTerm}
                      onChange={handleSearch}
                    />
                  </div>
                </div>
                <div className="col-md-4 text-md-end mt-3 mt-md-0">
                  <span className="badge bg-primary">
                    {filteredResults.length} Result(s) found
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th 
                    onClick={() => handleSort('studentName')}
                    style={{ cursor: 'pointer' }}
                  >
                    Student Name
                    {sortBy === 'studentName' && (
                      <i className={`bi bi-arrow-${sortOrder === 'asc' ? 'up' : 'down'} ms-1`}></i>
                    )}
                  </th>
                  <th 
                    onClick={() => handleSort('rollNumber')}
                    style={{ cursor: 'pointer' }}
                  >
                    Roll Number
                    {sortBy === 'rollNumber' && (
                      <i className={`bi bi-arrow-${sortOrder === 'asc' ? 'up' : 'down'} ms-1`}></i>
                    )}
                  </th>
                  <th 
                    onClick={() => handleSort('fileName')}
                    style={{ cursor: 'pointer' }}
                  >
                    Filename
                    {sortBy === 'fileName' && (
                      <i className={`bi bi-arrow-${sortOrder === 'asc' ? 'up' : 'down'} ms-1`}></i>
                    )}
                  </th>
                  <th 
                    onClick={() => handleSort('uploadDate')}
                    style={{ cursor: 'pointer' }}
                  >
                    Upload Date
                    {sortBy === 'uploadDate' && (
                      <i className={`bi bi-arrow-${sortOrder === 'asc' ? 'up' : 'down'} ms-1`}></i>
                    )}
                  </th>
                  <th>Performance</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((result) => (
                  <tr key={result.id}>
                    <td>{result.data?.studentInfo?.name || 'N/A'}</td>
                    <td>{result.data?.studentInfo?.rollNumber || 'N/A'}</td>
                    <td>{result.fileName}</td>
                    <td>{formatDate(result.uploadDate)}</td>
                    <td>
                      {result.data?.sgpa && (
                        <span 
                          className={`badge bg-${
                            result.data.sgpa >= 8 ? 'success' : 
                            result.data.sgpa >= 6 ? 'primary' : 
                            result.data.sgpa >= 5 ? 'warning' : 'danger'
                          }`}
                        >
                          SGPA: {result.data.sgpa}
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm">
                        <button 
                          className="btn btn-outline-primary"
                          onClick={() => viewResultDetails(result)}
                        >
                          View Details
                        </button>
                        <Link 
                          to="/excel" 
                          className="btn btn-outline-success"
                          state={{ resultId: result.id }}
                        >
                          Excel
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Quick Actions Bar */}
          <div className="mt-4 d-flex justify-content-between">
            <button
              className="btn btn-outline-primary"
              onClick={() => navigate('/upload')}
            >
              Upload More Files
            </button>
            
            <Link
              to="/excel"
              className="btn btn-success"
              state={{ allResults: true }}
            >
              Generate Class Report
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default ResultsList;