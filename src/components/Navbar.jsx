import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  
  // Function to determine if a nav link is active
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };
  
  // Toggle navbar collapse
  const toggleNavbar = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  // Handle scroll event to change navbar style
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <nav className={`navbar navbar-expand-lg navbar-dark bg-primary ${scrolled ? 'shadow' : ''}`}>
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img src="/logo.png" alt="SVIT Logo" width="30" height="30" className="me-2" />
          <span>SVIT Result Analysis System</span>
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          onClick={toggleNavbar}
          aria-controls="navbarNav" 
          aria-expanded={!isCollapsed}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className={`collapse navbar-collapse ${isCollapsed ? '' : 'show'}`} id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/')}`} to="/">Dashboard</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/upload')}`} to="/upload">Upload PDF</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/results')}`} to="/results">Results</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/batch-analysis')}`} to="/batch-analysis">Batch Analysis</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/excel')}`} to="/excel">Get Excel</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;