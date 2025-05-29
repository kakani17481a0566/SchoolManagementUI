import React from "react";
import Navbar from "../../components/Navbar";

import "./HomePage.css";

const HomePage = () => {
  return (
    <div className="home-page">
      <Navbar />
      <header className="home-header">
        <h1>Welcome to Your Dashboard</h1>
        <p>Your personalized home page after login</p>
      </header>
      <main className="home-main">
        <div className="welcome-message">
          <h2>Hello!</h2>
          <p>You’re logged in. Explore your dashboard.</p>
        </div>
      </main>
      <footer className="home-footer">
        <p>&copy; 2025 MyWebsite. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;
