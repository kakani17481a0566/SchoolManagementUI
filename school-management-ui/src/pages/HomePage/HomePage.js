// src/pages/HomePage/HomePage.js
import React, { useEffect, useState } from "react";
import "./HomePage.css";

const HomePage = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const decodedPayload = JSON.parse(atob(base64));

        setUserData({
          userName: decodedPayload.Username,
          email: decodedPayload.Email,
          joined: new Date(decodedPayload.exp * 1000).toLocaleDateString(),
        });
      } catch (error) {
        console.error("Invalid token:", error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="home-page">
      <header className="home-header">
        <h1>Welcome to Your Dashboard</h1>
        <p>Your personalized home page after login</p>
      </header>
      <main className="home-main">
        <div className="welcome-message">
          <h2>Welcome, {userData?.userName || "User"}</h2>
          <p>You're logged in! Here you can see your profile and settings.</p>
        </div>
        <div className="user-info">
          <h3>User Information</h3>
          <ul>
            <li><strong>Name:</strong> {userData?.userName || "-"}</li>
            <li><strong>Email:</strong> {userData?.email || "-"}</li>
            <li><strong>Token Expires:</strong> {userData?.joined || "-"}</li>
          </ul>
        </div>
        <button className="logout-btn" onClick={handleLogout}>Log Out</button>
      </main>
      <footer className="home-footer">
        <p>&copy; 2025 MyWebsite. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;
