import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { processAndParsePdf, batchProcessPdfs, getSamplePDFFiles } from '../services/pdfService';

const FileUpload = ({ onUploadSuccess, updateProcessedResults }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const fileInputRef = useRef(null);
  const dragAreaRef = useRef(null);

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    addFiles(selectedFiles);
  };

  // Add files to the state
  const addFiles = (selectedFiles) => {
    // Only accept PDF files
    const pdfFiles = selectedFiles.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length !== selectedFiles.length) {
      setError('Only PDF files are accepted. Some files were not added.');
    } else {
      setError(null);
    }
    
    setFiles(prevFiles => [...prevFiles, ...pdfFiles]);
  };

  // Remove file from the list
  const removeFile = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  // Clear all files
  const clearFiles = () => {
    setFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Handle drag over event
  const handleDragOver = (e) => {
    e.preventDefault();
    if (dragAreaRef.current) {
      dragAreaRef.current.classList.add('bg-light');
    }
  };
  
  // Handle drag leave event
  const handleDragLeave = (e) => {
    e.preventDefault();
    if (dragAreaRef.current) {
      dragAreaRef.current.classList.remove('bg-light');
    }
  };
  
  // Handle drop event
  const handleDrop = (e) => {
    e.preventDefault();
    if (dragAreaRef.current) {
      dragAreaRef.current.classList.remove('bg-light');
    }
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };
  
  // Load demo data specifically using the JNTUA result format provided in the PDFs
  const loadDemoData = async () => {
    if (files.length > 0) {
      // Process user-uploaded files first
      await handleUpload();
    } else {
      // If no files uploaded, load the demo data
      setUploading(true);
      setProgress(0);
      setError(null);
      
      try {
        // Get sample JNTUA results based on the PDFs you provided
        const sampleResults = await getSamplePDFFiles();
        
        // Update progress
        setProgress(100);
        setSuccessMessage('Successfully loaded demo student files');
        
        // Update state with sample files/results
        const sampleFiles = sampleResults.map(result => ({
          name: result.fileName,
          size: 250000, // Mock size
          type: 'application/pdf',
          lastModified: Date.now()
        }));
        
        onUploadSuccess(sampleFiles);
        updateProcessedResults(sampleResults);
        
        // Clear files after successful operation
        setTimeout(() => {
          clearFiles();
          setUploading(false);
          setProgress(0);
        }, 1500);
        
      } catch (err) {
        setError(`Error loading demo data: ${err.message}`);
        setUploading(false);
      }
    }
  };
  
  // Process files and handle upload
  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select at least one PDF file to upload');
      return;
    }
    
    setUploading(true);
    setProgress(0);
    setError(null);
    
    try {
      const results = [];
      
      // Process each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Update progress
        setProgress(Math.round((i / files.length) * 100));
        
        // Process the PDF file
        const result = await processAndParsePdf(file);
        results.push({
          id: `${Date.now()}-${i}`,
          fileName: file.name,
          uploadDate: new Date().toISOString(),
          data: result
        });
      }
      
      // Update states with processed results
      setProgress(100);
      setSuccessMessage(`Successfully processed ${files.length} file(s)`);
      onUploadSuccess(files);
      updateProcessedResults(results);
      
      // Clear files after successful upload
      setTimeout(() => {
        clearFiles();
        setUploading(false);
        setProgress(0);
      }, 1500);
      
    } catch (err) {
      setError(`Error processing files: ${err.message}`);
      setUploading(false);
    }
  };

  return (
    <div className="file-upload">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Upload Result PDFs</h2>
            <Link to="/results" className="btn btn-outline-primary">
              <i className="bi bi-list-ul me-2"></i>View All Results
            </Link>
          </div>
          
          {/* Error Alert */}
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
              <button type="button" className="btn-close" onClick={() => setError(null)}></button>
            </div>
          )}
          
          {/* Success Alert */}
          {successMessage && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              <i className="bi bi-check-circle-fill me-2"></i>
              {successMessage}
              <button type="button" className="btn-close" onClick={() => setSuccessMessage('')}></button>
            </div>
          )}
          
          {/* File Input */}
          <div className="card mb-4">
            <div className="card-body p-0">
              <div 
                className="file-upload-container"
                ref={dragAreaRef}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <i className="bi bi-cloud-arrow-up text-primary display-4 mb-3"></i>
                <h5>Drag & Drop PDF Files Here</h5>
                <p className="text-muted mb-3">or click to browse</p>
                <input 
                  className="d-none" 
                  type="file" 
                  id="pdfFiles" 
                  accept=".pdf" 
                  multiple 
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  disabled={uploading}
                />
                <button 
                  className="btn btn-primary"
                  onClick={() => fileInputRef.current.click()}
                  disabled={uploading}
                >
                  <i className="bi bi-file-earmark-pdf me-2"></i>
                  Select PDF Files
                </button>
              </div>
            </div>
            
            {/* Demo Data Button */}
            <div className="card-footer bg-white">
              <div className="d-flex justify-content-center">
                <button 
                  className="btn btn-outline-secondary"
                  onClick={loadDemoData}
                  disabled={uploading}
                >
                  <i className="bi bi-database-fill me-2"></i>
                  Load Demo Data (JNTUA B.Tech Results)
                </button>
              </div>
            </div>
          </div>
          
          {/* Selected Files List */}
          {files.length > 0 && (
            <div className="card mb-4">
              <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Selected Files ({files.length})</h5>
                <button 
                  className="btn btn-sm btn-outline-light" 
                  onClick={clearFiles}
                  disabled={uploading}
                >
                  Clear All
                </button>
              </div>
              <div className="card-body p-0">
                <ul className="list-group list-group-flush">
                  {files.map((file, index) => (
                    <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <i className="bi bi-file-pdf text-danger me-2"></i>
                        <span className="me-2">{file.name}</span>
                        <small className="text-muted">({(file.size / 1024).toFixed(2)} KB)</small>
                      </div>
                      <button 
                        className="btn btn-sm btn-outline-danger" 
                        onClick={() => removeFile(index)}
                        disabled={uploading}
                      >
                        <i className="bi bi-x-circle"></i>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          {/* Progress Bar */}
          {uploading && (
            <div className="mb-4">
              <label className="form-label d-flex justify-content-between">
                <span>Processing: {progress}%</span>
                <span>{Math.round(progress / 100 * files.length)}/{files.length} files</span>
              </label>
              <div className="progress">
                <div 
                  className="progress-bar progress-bar-striped progress-bar-animated" 
                  role="progressbar" 
                  style={{ width: `${progress}%` }} 
                  aria-valuenow={progress} 
                  aria-valuemin="0" 
                  aria-valuemax="100"
                ></div>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="d-grid gap-2 d-md-flex justify-content-md-end">
            <button 
              className="btn btn-primary" 
              onClick={handleUpload}
              disabled={files.length === 0 || uploading}
            >
              {uploading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Processing...
                </>
              ) : (
                <>
                  <i className="bi bi-cpu me-2"></i>
                  Process Files
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* How to Use Guide */}
      <div className="row mt-5">
        <div className="col-12">
          <div className="card">
            <div className="card-header bg-light">
              <h5 className="mb-0">How to Use JNTUA Result Analysis</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4 mb-3">
                  <div className="card h-100 border-0">
                    <div className="card-body text-center">
                      <div className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                        <i className="bi bi-cloud-upload fs-4"></i>
                      </div>
                      <h5>Step 1: Upload PDFs</h5>
                      <p className="text-muted">Upload B.Tech student result PDFs from JNTUA by dragging and dropping or browsing your computer.</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div className="card h-100 border-0">
                    <div className="card-body text-center">
                      <div className="rounded-circle bg-success text-white d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                        <i className="bi bi-gear fs-4"></i>
                      </div>
                      <h5>Step 2: Process Results</h5>
                      <p className="text-muted">The system automatically extracts all student information and marks from the PDFs.</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div className="card h-100 border-0">
                    <div className="card-body text-center">
                      <div className="rounded-circle bg-warning text-white d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                        <i className="bi bi-file-earmark-excel fs-4"></i>
                      </div>
                      <h5>Step 3: Generate Reports</h5>
                      <p className="text-muted">View detailed analytics, compare performance, and download Excel reports.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;