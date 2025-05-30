import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { FiLogOut, FiEdit2, FiChevronDown, FiHome, FiSettings, FiLayers, FiPieChart } from "react-icons/fi";
import "./Navbar.css";

const Navbar = () => {
  const [userData, setUserData] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Cloudinary image URL
  const cloudinaryImage = "https://res.cloudinary.com/kakani7/image/upload/v1748503564/MSI/zloxia3rhvacysbmspd8.png";

  // Extract user data from token
  useEffect(() => {
    const loadUserData = () => {
      const token = localStorage.getItem("token");
      const userName = localStorage.getItem("userName");
      const userId = localStorage.getItem("userId");
      const tenantId = localStorage.getItem("tenantId");

      if (token && userName && userId && tenantId) {
        try {
          const base64Url = token.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const decodedPayload = JSON.parse(atob(base64));

          setUserData({
            userName,
            userId,
            tenantId,
            email: decodedPayload.Email,
            role: decodedPayload.Role || "Member",
            expires: new Date(decodedPayload.exp * 1000).toLocaleString(),
          });
        } catch (error) {
          console.error("Error decoding token:", error);
        }
      }
    };

    loadUserData();
  }, [location]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleProfileEdit = () => {
    setShowDropdown(false);
    navigate("/profile");
  };

  const navItems = [
    { path: "/home", label: "Home", icon: <FiHome /> },
    { path: "/organization", label: "Organization", icon: <FiLayers /> },
    // { path: "/dashboard", label: "Dashboard", icon: <FiPieChart /> },
    { path: "/home", label: "Dashboard", icon: <FiPieChart /> },

    { path: "/department", label: "Department", icon: <FiLayers /> },
    // { path: "/settings", label: "Settings", icon: <FiSettings /> },
    { path: "/home", label: "Settings", icon: <FiSettings /> },

  ];

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <NavLink to="/home">
            <img
              src={cloudinaryImage}
              alt="School Logo"
              className="navbar-logo"
            />
            <span className="brand-name">School Management</span>
          </NavLink>
        </div>

        <nav className="navbar-content">
          <ul className="navbar-links">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink 
                  to={item.path} 
                  className={({ isActive }) => 
                    `nav-link ${isActive ? "active" : ""}`
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>

          {userData && (
            <div className="user-menu" ref={dropdownRef}>
              <button
                className="user-toggle"
                onClick={() => setShowDropdown(!showDropdown)}
                aria-expanded={showDropdown}
                aria-label="User menu"
              >
                {/* <div className="user-avatar">
                  <img src={cloudinaryImage} alt="User Avatar" />
                </div> */}
                <span className="user-name">{userData.userName}</span>
                <FiChevronDown className={`dropdown-icon ${showDropdown ? "rotate" : ""}`} />
              </button>

              {showDropdown && (
                <div className="dropdown-card">
                  <div className="user-header">
                    <div className="user-avatar large">
                      <img src={cloudinaryImage} alt="User Avatar" />
                    </div>
                    <div className="user-info">
                      <h4>{userData.userName}</h4>
                      <p className="user-role">{userData.role}</p>
                    </div>
                  </div>

                  <div className="user-details">
                    <div className="detail-item">
                      <span className="detail-label">Email:</span>
                      <span className="detail-value">{userData.email}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">User ID:</span>
                      <span className="detail-value">{userData.userId}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Tenant ID:</span>
                      <span className="detail-value">{userData.tenantId}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Session Expires:</span>
                      <span className="detail-value">{userData.expires}</span>
                    </div>
                  </div>

                  <div className="user-actions">
                    <button className="action-btn edit" onClick={handleProfileEdit}>
                      <FiEdit2 /> Edit Profile
                    </button>
                    <button className="action-btn logout" onClick={handleLogout}>
                      <FiLogOut /> Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;