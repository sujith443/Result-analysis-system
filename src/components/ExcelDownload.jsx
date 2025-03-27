import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { generateExcel } from '../services/excelService';

const ExcelDownload = ({ results }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedResults, setSelectedResults] = useState([]);
  const [generatingExcel, setGeneratingExcel] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [exportFormat, setExportFormat] = useState('xlsx');
  const [exportType, setExportType] = useState('individual');
  
  // Check if specific results were requested
  useEffect(() => {
    if (location.state?.resultIds) {
      const resultIds = location.state.resultIds;
      // Find the results in the results array
      const selectedResults = results.filter(r => resultIds.includes(r.id));
      
      if (selectedResults.length > 0) {
        setSelectedResults(selectedResults);
      } else {
        setErrorMessage('The requested results were not found.');
      }
    } else if (location.state?.resultId) {
      const resultId = location.state.resultId;
      // Find the result in the results array
      const result = results.find(r => r.id === resultId);
      
      if (result) {
        setSelectedResults([result]);
      } else {
        setErrorMessage('The requested result was not found.');
      }
    } else if (location.state?.allResults) {
      // All results selected for class report
      setSelectedResults([...results]);
      setExportType('combined');
    }
  }, [location.state, results]);

  // Toggle selection of a result
  const toggleResultSelection = (resultId) => {
    setSelectedResults(prev => {
      const isSelected = prev.some(r => r.id === resultId);
      
      if (isSelected) {
        return prev.filter(r => r.id !== resultId);
      } else {
        const resultToAdd = results.find(r => r.id === resultId);
        return [...prev, resultToAdd];
      }
    });
  };

  // Select all results
  const selectAllResults = () => {
    setSelectedResults([...results]);
  };

  // Deselect all results
  const deselectAllResults = () => {
    setSelectedResults([]);
  };

  // Generate and download Excel
  const handleGenerateExcel = async () => {
    if (selectedResults.length === 0) {
      setErrorMessage('Please select at least one result to generate Excel.');
      return;
    }
    
    setGeneratingExcel(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    
    try {
      // Call the Excel generation service
      await generateExcel(selectedResults, {
        format: exportFormat,
        exportType: exportType,
        includeAnalytics: true,
        includeComparison: true
      });
      
      setSuccessMessage(`Excel file${selectedResults.length > 1 || exportType !== 'individual' ? 's' : ''} generated successfully!`);
      
    } catch (error) {
      setErrorMessage(`Error generating Excel: ${error.message}`);
    } finally {
      setGeneratingExcel(false);
    }
  };

  return (
    <div className="excel-download">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Generate Excel Reports</h2>
        <button 
          className="btn btn-outline-primary"
          onClick={() => navigate('/results')}
        >
          <i className="bi bi-arrow-left me-2"></i>Back to Results
        </button>
      </div>
      
      {/* Alerts */}
      {errorMessage && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {errorMessage}
          <button type="button" className="btn-close" onClick={() => setErrorMessage(null)}></button>
        </div>
      )}
      
      {successMessage && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <i className="bi bi-check-circle-fill me-2"></i>
          {successMessage}
          <button type="button" className="btn-close" onClick={() => setSuccessMessage(null)}></button>
        </div>
      )}
      
      {/* No Results Case */}
      {results.length === 0 ? (
        <div className="alert alert-info">
          <div className="text-center py-5">
            <i className="bi bi-inbox display-4 text-muted mb-3"></i>
            <h4>No Results Available</h4>
            <p className="text-muted">Please process PDF files first to generate Excel reports.</p>
            <button 
              className="btn btn-primary mt-2"
              onClick={() => navigate('/upload')}
            >
              <i className="bi bi-upload me-2"></i>Go to Upload
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Simple Excel Generation Card */}
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Generate Excel Reports</h5>
            </div>
            <div className="card-body">
              <div className="row mb-4">
                <div className="col-md-6">
                  <div className="form-group mb-3">
                    <label className="form-label">Report Type</label>
                    <select 
                      className="form-select"
                      value={exportType}
                      onChange={(e) => setExportType(e.target.value)}
                    >
                      <option value="individual">Individual Student Reports</option>
                      <option value="combined">Combined Class Report</option>
                      <option value="summary">Summary Report Only</option>
                    </select>
                    <div className="form-text">
                      {exportType === 'individual' ? 
                        'Generate separate Excel files for each selected student' : 
                        exportType === 'combined' ? 
                        'Generate a single Excel file with all student results' :
                        'Generate a summary report with class statistics only'}
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group mb-3">
                    <label className="form-label">File Format</label>
                    <select 
                      className="form-select"
                      value={exportFormat}
                      onChange={(e) => setExportFormat(e.target.value)}
                    >
                      <option value="xlsx">Excel (XLSX)</option>
                      <option value="xls">Excel 97-2003 (XLS)</option>
                      <option value="csv">CSV</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="d-grid gap-2">
                {/* Button for exporting all results */}
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    selectAllResults();
                    setTimeout(() => handleGenerateExcel(), 100);
                  }}
                  disabled={results.length === 0 || generatingExcel}
                >
                  {generatingExcel ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Generating...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-file-earmark-excel me-2"></i>
                      Download Excel for All Students
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* Results Selection */}
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center bg-primary text-white">
              <h5 className="mb-0">Or Select Specific Students</h5>
              <div>
                <button 
                  className="btn btn-sm btn-outline-light me-2"
                  onClick={selectAllResults}
                  disabled={results.length === selectedResults.length}
                >
                  Select All
                </button>
                <button 
                  className="btn btn-sm btn-outline-light"
                  onClick={deselectAllResults}
                  disabled={selectedResults.length === 0}
                >
                  Deselect All
                </button>
              </div>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th style={{ width: '50px' }}>
                        <div className="form-check">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            checked={results.length > 0 && selectedResults.length === results.length}
                            onChange={selectedResults.length === results.length ? deselectAllResults : selectAllResults}
                            id="selectAll"
                          />
                          <label className="form-check-label" htmlFor="selectAll"></label>
                        </div>
                      </th>
                      <th>Student Name</th>
                      <th>Roll Number</th>
                      <th>SGPA</th>
                      <th>Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result) => (
                      <tr key={result.id}>
                        <td>
                          <div className="form-check">
                            <input 
                              className="form-check-input" 
                              type="checkbox" 
                              checked={selectedResults.some(r => r.id === result.id)}
                              onChange={() => toggleResultSelection(result.id)}
                              id={`select-${result.id}`}
                            />
                            <label className="form-check-label" htmlFor={`select-${result.id}`}></label>
                          </div>
                        </td>
                        <td>{result.data?.studentInfo?.name || 'N/A'}</td>
                        <td>{result.data?.studentInfo?.rollNumber || 'N/A'}</td>
                        <td>{result.data?.sgpa || 'N/A'}</td>
                        <td>{result.data?.percentage ? `${result.data.percentage}%` : 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="d-grid mt-3">
                <button 
                  className="btn btn-success"
                  onClick={handleGenerateExcel}
                  disabled={selectedResults.length === 0 || generatingExcel}
                >
                  {generatingExcel ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Generating...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-file-earmark-excel me-2"></i>
                      Download Excel for Selected Students ({selectedResults.length})
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ExcelDownload;