import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage/HomePage";
import Login from "./pages/Login/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Department from "./pages/Department/Department";
import Organization from "./pages/Organization/Organization";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "bootstrap/dist/css/bootstrap.min.css";

import "./App.css";

const App = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<ProtectedRoute element={<HomePage />} />} />
          <Route path="/department" element={<ProtectedRoute element={<Department />} />} />
          <Route path="/organization" element={<ProtectedRoute element={<Organization />} />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>

      {/* ToastContainer should be placed once in your app */}
      <ToastContainer position="top-right" autoClose={5000} />
    </>
  );
};

export default App;
