// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage/HomePage";
import Login from "./pages/Login/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";
import Department from "./pages/Department/Department";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<ProtectedRoute element={<HomePage />} />} />
        <Route path="*" element={<Navigate to="/login" />} />
        <Route path="/department" element={<Department/>} />
              <Route path="/department" element={<Department/>} />
      </Routes>
    </Router>
  );
};

export default App;
