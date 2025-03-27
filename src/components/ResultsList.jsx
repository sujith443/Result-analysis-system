import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ResultsList = ({ results, deleteResult }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('uploadDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedResults, setSelectedResults] = useState([]);
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
  
  // Toggle selection of a result
  const toggleResultSelection = (resultId) => {
    setSelectedResults(prev => {
      if (prev.includes(resultId)) {
        return prev.filter(id => id !== resultId);
      } else {
        return [...prev, resultId];
      }
    });
  };
  
  // Select all results
  const selectAllResults = () => {
    if (selectedResults.length === filteredResults.length) {
      setSelectedResults([]);
    } else {
      setSelectedResults(filteredResults.map(result => result.id));
    }
  };
  
  // Delete selected results
  const handleDeleteSelected = () => {
    if (selectedResults.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedResults.length} selected result(s)?`)) {
      selectedResults.forEach(id => deleteResult(id));
      setSelectedResults([]);
    }
  };
  
  // Handle batch export
  const handleBatchExport = () => {
    navigate('/excel', { state: { resultIds: selectedResults } });
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
      } else if (sortBy === 'sgpa') {
        const sgpaA = a.data?.sgpa || 0;
        const sgpaB = b.data?.sgpa || 0;
        return sortOrder === 'asc'
          ? sgpaA - sgpaB
          : sgpaB - sgpaA;
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

  // Get grade badge color
  const getGradeBadgeColor = (sgpa) => {
    if (!sgpa) return 'secondary';
    if (sgpa >= 8) return 'success';
    if (sgpa >= 6) return 'primary';
    if (sgpa >= 5) return 'warning';
    return 'danger';
  };

  return (
    <div className="results-list">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Student Results</h2>
        <div>
          <Link to="/upload" className="btn btn-outline-primary me-2">
            <i className="bi bi-upload me-2"></i>Upload More
          </Link>
          <Link to="/excel" className="btn btn-success" state={{ allResults: true }}>
            <i className="bi bi-file-earmark-excel me-2"></i>Generate Class Report
          </Link>
        </div>
      </div>
      
      {results.length === 0 ? (
        <div className="alert alert-info">
          <div className="text-center py-5">
            <i className="bi bi-inbox display-4 text-muted mb-3"></i>
            <h4>No Results Available</h4>
            <p className="text-muted">Upload and process PDF files to see student results here.</p>
            <Link to="/upload" className="btn btn-primary mt-2">
              <i className="bi bi-upload me-2"></i>Go to Upload Page
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="card mb-4">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-md-8 mb-3 mb-md-0">
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
                <div className="col-md-4 text-md-end d-flex justify-content-end">
                  <div className="dropdown me-2">
                    <button className="btn btn-outline-primary dropdown-toggle" type="button" id="sortDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                      <i className="bi bi-sort-alpha-down me-1"></i> Sort
                    </button>
                    <ul className="dropdown-menu" aria-labelledby="sortDropdown">
                      <li><button className="dropdown-item" onClick={() => handleSort('studentName')}>By Name</button></li>
                      <li><button className="dropdown-item" onClick={() => handleSort('rollNumber')}>By Roll Number</button></li>
                      <li><button className="dropdown-item" onClick={() => handleSort('sgpa')}>By SGPA</button></li>
                      <li><button className="dropdown-item" onClick={() => handleSort('uploadDate')}>By Upload Date</button></li>
                    </ul>
                  </div>
                  <span className="badge bg-primary d-flex align-items-center">
                    {filteredResults.length} Result{filteredResults.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Batch Actions */}
          {selectedResults.length > 0 && (
            <div className="alert alert-info d-flex justify-content-between align-items-center mb-4">
              <div>
                <i className="bi bi-info-circle-fill me-2"></i>
                {selectedResults.length} result{selectedResults.length !== 1 ? 's' : ''} selected
              </div>
              <div>
                <button 
                  className="btn btn-sm btn-warning me-2"
                  onClick={handleBatchExport}
                >
                  <i className="bi bi-file-earmark-excel me-1"></i>
                  Export Selected
                </button>
                <button 
                  className="btn btn-sm btn-danger"
                  onClick={handleDeleteSelected}
                >
                  <i className="bi bi-trash me-1"></i>
                  Delete Selected
                </button>
              </div>
            </div>
          )}

          <div className="table-responsive">
            <table className="table table-striped table-hover border">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '40px' }}>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={selectedResults.length === filteredResults.length && filteredResults.length > 0}
                        onChange={selectAllResults}
                      />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('studentName')}
                    style={{ cursor: 'pointer' }}
                    className="align-middle"
                  >
                    <div className="d-flex align-items-center">
                      Student Name
                      {sortBy === 'studentName' && (
                        <i className={`bi bi-arrow-${sortOrder === 'asc' ? 'up' : 'down'} ms-1`}></i>
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('rollNumber')}
                    style={{ cursor: 'pointer' }}
                    className="align-middle"
                  >
                    <div className="d-flex align-items-center">
                      Roll Number
                      {sortBy === 'rollNumber' && (
                        <i className={`bi bi-arrow-${sortOrder === 'asc' ? 'up' : 'down'} ms-1`}></i>
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('sgpa')}
                    style={{ cursor: 'pointer' }}
                    className="align-middle"
                  >
                    <div className="d-flex align-items-center">
                      Performance
                      {sortBy === 'sgpa' && (
                        <i className={`bi bi-arrow-${sortOrder === 'asc' ? 'up' : 'down'} ms-1`}></i>
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('uploadDate')}
                    style={{ cursor: 'pointer' }}
                    className="align-middle"
                  >
                    <div className="d-flex align-items-center">
                      Upload Date
                      {sortBy === 'uploadDate' && (
                        <i className={`bi bi-arrow-${sortOrder === 'asc' ? 'up' : 'down'} ms-1`}></i>
                      )}
                    </div>
                  </th>
                  <th className="align-middle">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((result) => (
                  <tr key={result.id}>
                    <td>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={selectedResults.includes(result.id)}
                          onChange={() => toggleResultSelection(result.id)}
                        />
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="bg-light rounded-circle text-center me-2" style={{width: '36px', height: '36px', lineHeight: '36px'}}>
                          {(result.data?.studentInfo?.name?.[0] || '?').toUpperCase()}
                        </span>
                        <div>
                          <div className="fw-bold">{result.data?.studentInfo?.name || 'N/A'}</div>
                          <small className="text-muted">{result.fileName}</small>
                        </div>
                      </div>
                    </td>
                    <td className="align-middle">{result.data?.studentInfo?.rollNumber || 'N/A'}</td>
                    <td className="align-middle">
                      <div className="d-flex flex-column">
                        <div className="d-flex align-items-center mb-1">
                          <span className="me-2">SGPA: <strong>{result.data?.sgpa || 'N/A'}</strong></span>
                          <span 
                            className={`badge badge-grade bg-${getGradeBadgeColor(result.data?.sgpa)}`}
                          >
                            {result.data?.overallGrade || 'N/A'}
                          </span>
                        </div>
                        <div className="d-flex align-items-center">
                          <div className="progress flex-grow-1" style={{ height: '6px' }}>
                            <div 
                              className={`progress-bar bg-${getGradeBadgeColor(result.data?.sgpa)}`} 
                              role="progressbar" 
                              style={{ width: `${result.data?.percentage || 0}%` }}
                              aria-valuenow={result.data?.percentage || 0} 
                              aria-valuemin="0" 
                              aria-valuemax="100"
                            ></div>
                          </div>
                          <span className="ms-2 small">{result.data?.percentage || 0}%</span>
                        </div>
                      </div>
                    </td>
                    <td className="align-middle">{formatDate(result.uploadDate)}</td>
                    <td className="align-middle">
                      <div className="btn-group btn-group-sm">
                        <button 
                          className="btn btn-outline-primary"
                          onClick={() => viewResultDetails(result)}
                        >
                          <i className="bi bi-eye me-1"></i> View
                        </button>
                        <Link 
                          to="/excel" 
                          className="btn btn-outline-success"
                          state={{ resultIds: [result.id] }}
                        >
                          <i className="bi bi-file-excel me-1"></i> Excel
                        </Link>
                        <button 
                          className="btn btn-outline-danger"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this result?')) {
                              deleteResult(result.id);
                            }
                          }}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
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
              <i className="bi bi-upload me-2"></i>Upload More Files
            </button>
            
            <Link
              to="/excel"
              className="btn btn-success"
              state={{ allResults: true }}
            >
              <i className="bi bi-file-earmark-excel me-2"></i>Generate Class Report
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default ResultsList;