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
  const [includeAnalytics, setIncludeAnalytics] = useState(true);
  const [includeComparison, setIncludeComparison] = useState(true);
  
  // Check if a specific result or all results was requested
  useEffect(() => {
    if (location.state?.resultId) {
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

  // Handle export format change
  const handleExportFormatChange = (e) => {
    setExportFormat(e.target.value);
  };

  // Handle export type change
  const handleExportTypeChange = (e) => {
    setExportType(e.target.value);
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
        includeAnalytics: includeAnalytics,
        includeComparison: includeComparison
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
          className="btn btn-outline-secondary"
          onClick={() => navigate('/results')}
        >
          Back to Results
        </button>
      </div>
      
      {/* Alerts */}
      {errorMessage && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {errorMessage}
          <button type="button" className="btn-close" onClick={() => setErrorMessage(null)}></button>
        </div>
      )}
      
      {successMessage && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {successMessage}
          <button type="button" className="btn-close" onClick={() => setSuccessMessage(null)}></button>
        </div>
      )}
      
      {/* No Results Case */}
      {results.length === 0 ? (
        <div className="alert alert-info">
          No results available. Please process PDF files first.
          <div className="mt-3">
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/upload')}
            >
              Go to Upload
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Results Selection */}
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center bg-primary text-white">
              <h5 className="mb-0">Select Results for Excel Generation</h5>
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
                      <th>Filename</th>
                      <th>Upload Date</th>
                      <th>Details</th>
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
                        <td>{result.fileName}</td>
                        <td>{new Date(result.uploadDate).toLocaleString()}</td>
                        <td>
                          <button 
                            className="btn btn-sm btn-outline-info"
                            onClick={() => navigate(`/results/${result.id}`, { state: { result } })}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          {/* Excel Options and Generation */}
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Excel Generation Options</h5>
            </div>
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Export Format</label>
                  <select 
                    className="form-select"
                    value={exportFormat}
                    onChange={handleExportFormatChange}
                  >
                    <option value="xlsx">Excel (XLSX)</option>
                    <option value="xls">Excel 97-2003 (XLS)</option>
                    <option value="csv">CSV</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Export Type</label>
                  <select 
                    className="form-select"
                    value={exportType}
                    onChange={handleExportTypeChange}
                  >
                    <option value="individual">Individual Reports</option>
                    <option value="combined">Combined Report</option>
                    <option value="summary">Summary Only</option>
                  </select>
                </div>
              </div>
              
              <div className="form-check mb-3">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="includeAnalytics"
                  checked={includeAnalytics}
                  onChange={(e) => setIncludeAnalytics(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="includeAnalytics">
                  Include Analytics and Charts
                </label>
              </div>
              
              <div className="form-check mb-3">
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="includeComparison"
                  checked={includeComparison}
                  onChange={(e) => setIncludeComparison(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="includeComparison">
                  Include Comparative Analysis
                </label>
              </div>
            </div>
            <div className="card-footer">
              <div className="d-grid">
                <button 
                  className="btn btn-primary"
                  onClick={handleGenerateExcel}
                  disabled={selectedResults.length === 0 || generatingExcel}
                >
                  {generatingExcel ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Generating...
                    </>
                  ) : (
                    `Generate Excel (${selectedResults.length} selected)`
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