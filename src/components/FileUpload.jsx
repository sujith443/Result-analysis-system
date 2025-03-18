import React, { useState, useRef } from 'react';
import { processAndParsePdf, batchProcessPdfs, getSamplePDFFiles } from '../services/pdfService';

const FileUpload = ({ onUploadSuccess, updateProcessedResults }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
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
  
  // Load sample data directly - bypassing file processing
  const loadSampleData = async () => {
    setUploading(true);
    setProgress(0);
    setError(null);
    
    try {
      // Get sample data
      const sampleResults = await getSamplePDFFiles();
      
      // Update progress
      setProgress(100);
      setSuccessMessage('Successfully loaded 10 sample student files');
      
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
      setError(`Error loading sample data: ${err.message}`);
      setUploading(false);
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
          <h2 className="mb-4">Upload Result PDFs</h2>
          
          {/* Error Alert */}
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              {error}
              <button type="button" className="btn-close" onClick={() => setError(null)}></button>
            </div>
          )}
          
          {/* Success Alert */}
          {successMessage && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              {successMessage}
              <button type="button" className="btn-close" onClick={() => setSuccessMessage('')}></button>
            </div>
          )}
          
          {/* File Input */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="mb-3">
                <label htmlFor="pdfFiles" className="form-label">Select PDF files to upload</label>
                <input 
                  className="form-control" 
                  type="file" 
                  id="pdfFiles" 
                  accept=".pdf" 
                  multiple 
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  disabled={uploading}
                />
              </div>
              
              {/* Sample Data Button */}
              <div className="mt-3">
                <button 
                  className="btn btn-outline-secondary"
                  onClick={loadSampleData}
                  disabled={uploading}
                >
                  <i className="bi bi-database-fill me-2"></i>
                  Load Sample BTech ECE Student Data (10 students)
                </button>
              </div>
            </div>
          </div>
          
          {/* Selected Files List */}
          {files.length > 0 && (
            <div className="card mb-4">
              <div className="card-header d-flex justify-content-between align-items-center">
                <span>Selected Files ({files.length})</span>
                <button 
                  className="btn btn-sm btn-outline-danger" 
                  onClick={clearFiles}
                  disabled={uploading}
                >
                  Clear All
                </button>
              </div>
              <ul className="list-group list-group-flush">
                {files.map((file, index) => (
                  <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <i className="bi bi-file-pdf text-danger me-2"></i>
                      {file.name}
                      <small className="text-muted ms-2">({(file.size / 1024).toFixed(2)} KB)</small>
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
          )}
          
          {/* Progress Bar */}
          {uploading && (
            <div className="mb-4">
              <label className="form-label">Processing: {progress}%</label>
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
          <div className="d-grid gap-2 d-md-flex">
            <button 
              className="btn btn-primary me-md-2" 
              onClick={handleUpload}
              disabled={files.length === 0 || uploading}
            >
              {uploading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Processing...
                </>
              ) : (
                'Process Files'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;