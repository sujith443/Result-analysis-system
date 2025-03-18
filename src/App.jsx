import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import FileUpload from './components/FileUpload';
import ResultsList from './components/ResultsList';
import ResultDetails from './components/ResultDetails';
import ExcelDownload from './components/ExcelDownload';
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
  }, []);
  
  // Save results to localStorage when they change
  useEffect(() => {
    if (processedResults.length > 0) {
      localStorage.setItem('processedResults', JSON.stringify(processedResults));
    }
  }, [processedResults]);
  
  // Handle successful uploads
  const handleUploadSuccess = (files) => {
    setUploadedFiles(prevFiles => [...prevFiles, ...files]);
  };
  
  // Update processed results
  const updateProcessedResults = (results) => {
    setProcessedResults(prevResults => [...prevResults, ...results]);
  };
  
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
          </Routes>
        </div>
      </div>
    </Router>
  );
}

// Sample PDF Files for testing
export const samplePDFFiles = [
  { name: "Result_22EC011_Rajesh_Kumar.pdf", size: 245632, type: "application/pdf", lastModified: Date.now() },
  { name: "Result_22EC012_Priya_Sharma.pdf", size: 252144, type: "application/pdf", lastModified: Date.now() },
  { name: "Result_22EC013_Amit_Patel.pdf", size: 249021, type: "application/pdf", lastModified: Date.now() },
  { name: "Result_22EC014_Sunita_Reddy.pdf", size: 251365, type: "application/pdf", lastModified: Date.now() },
  { name: "Result_22EC015_Vikram_Singh.pdf", size: 247852, type: "application/pdf", lastModified: Date.now() },
  { name: "Result_22EC016_Neha_Joshi.pdf", size: 253214, type: "application/pdf", lastModified: Date.now() },
  { name: "Result_22EC017_Ravi_Verma.pdf", size: 248963, type: "application/pdf", lastModified: Date.now() },
  { name: "Result_22EC018_Ananya_Gupta.pdf", size: 250415, type: "application/pdf", lastModified: Date.now() },
  { name: "Result_22EC019_Sanjay_Desai.pdf", size: 246821, type: "application/pdf", lastModified: Date.now() },
  { name: "Result_22EC020_Meera_Krishnan.pdf", size: 251789, type: "application/pdf", lastModified: Date.now() }
];

export default App;