import React from 'react';
import Navbar from '../../components/Navbar';
import './Department.css';

const Department = () => {
  return (
    <div className="department-page">
      <Navbar />

      <header className="department-header">
        <h1>Departments</h1>
        <p>Manage and view all departments here.</p>
      </header>

      <main className="department-main">
        {/* Example content: list of departments */}
        <ul className="department-list">
          <li>Mathematics</li>
          <li>Science</li>
          <li>English</li>
          <li>History</li>
          <li>Computer Science</li>
        </ul>
      </main>

      <footer className="department-footer">
        &copy; 2025 School Management System
      </footer>
    </div>
  );
};

export default Department;
