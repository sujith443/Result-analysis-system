// App.jsx - Main application component
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import FileUpload from './components/FileUpload';
import ResultsList from './components/ResultsList';
import ResultDetails from './components/ResultDetails';
import ExcelDownload from './components/ExcelDownload';
import BatchAnalysis from './components/BatchAnalysis';
import 'bootstrap/dist/css/bootstrap.min.css';
import "./App.css";

// Wrapper component to handle the result parameter
const ResultDetailsWrapper = ({ processedResults }) => {
  const { id } = useParams();
  const result = processedResults.find(r => r.id === id);
  return <ResultDetails result={result} />;
};

function App() {
  // State management for the application
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [processedResults, setProcessedResults] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Load any saved state from localStorage
  useEffect(() => {
    const savedResults = localStorage.getItem('processedResults');
    if (savedResults) {
      try {
        setProcessedResults(JSON.parse(savedResults));
      } catch (error) {
        console.error('Error loading saved results:', error);
      }
    }
    
    const savedFiles = localStorage.getItem('uploadedFiles');
    if (savedFiles) {
      try {
        setUploadedFiles(JSON.parse(savedFiles));
      } catch (error) {
        console.error('Error loading saved files:', error);
      }
    }
    
    setLoading(false);
  }, []);
  
  // Save results to localStorage when they change
  useEffect(() => {
    if (processedResults.length > 0) {
      localStorage.setItem('processedResults', JSON.stringify(processedResults));
    }
  }, [processedResults]);
  
  // Save uploaded files to localStorage when they change
  useEffect(() => {
    if (uploadedFiles.length > 0) {
      localStorage.setItem('uploadedFiles', JSON.stringify(uploadedFiles));
    }
  }, [uploadedFiles]);
  
  // Handle successful uploads
  const handleUploadSuccess = (files) => {
    setUploadedFiles(prevFiles => [...prevFiles, ...files]);
  };
  
  // Update processed results
  const updateProcessedResults = (results) => {
    setProcessedResults(prevResults => [...prevResults, ...results]);
  };

  // Clear all data
  const clearAllData = () => {
    setUploadedFiles([]);
    setProcessedResults([]);
    localStorage.removeItem('processedResults');
    localStorage.removeItem('uploadedFiles');
  };
  
  // Delete a specific result
  const deleteResult = (id) => {
    setProcessedResults(prevResults => prevResults.filter(result => result.id !== id));
  };
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <div className="container mt-4 mb-5">
          <Routes>
            <Route 
              path="/" 
              element={
                <Dashboard 
                  uploadedFiles={uploadedFiles}
                  processedResults={processedResults}
                  clearAllData={clearAllData}
                />
              } 
            />
            <Route 
              path="/upload" 
              element={
                <FileUpload 
                  onUploadSuccess={handleUploadSuccess}
                  updateProcessedResults={updateProcessedResults}
                />
              } 
            />
            <Route 
              path="/results" 
              element={
                <ResultsList 
                  results={processedResults}
                  deleteResult={deleteResult}
                />
              } 
            />
            <Route 
              path="/results/:id" 
              element={<ResultDetailsWrapper processedResults={processedResults} />} 
            />
            <Route 
              path="/excel" 
              element={<ExcelDownload results={processedResults} />} 
            />
            <Route 
              path="/batch-analysis" 
              element={<BatchAnalysis results={processedResults} />} 
            />
          </Routes>
        </div>
        <footer className="bg-light py-3 mt-5">
          <div className="container text-center">
            <p className="text-muted mb-0">SVIT College Result Analysis System &copy; {new Date().getFullYear()}</p>
            <p className="text-muted small mb-0">Jawaharlal Nehru Technological University, Anantapur</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;