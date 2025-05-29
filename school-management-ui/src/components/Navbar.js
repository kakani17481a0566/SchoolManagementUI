import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const [userData, setUserData] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
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
          joined: new Date(decodedPayload.exp * 1000).toLocaleDateString(),
        });
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

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

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/Home">
          <img
            src="https://res.cloudinary.com/kakani7/image/upload/v1748503564/MSI/zloxia3rhvacysbmspd8.png"
            alt="Logo"
            className="navbar-logo"
          />
        </Link>
      </div>

      <ul className="navbar-links">
        <li>
          <Link to="/Home">Home</Link>
        </li>

         <li>
          <Link to="/Organization">Organization</Link>
        </li>
        <li>
          <Link to="/dashboard">Dashboard</Link>
        </li>
        <li>
          <Link to="/settings">Settings</Link>
        </li>
        <li>
          <Link to="/department">Department</Link>
        </li>
        {userData && (
          <li className="dropdown-container" ref={dropdownRef}>
            <button
              className="dropdown-toggle"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              {userData.userName} &#9662;
            </button>
            {showDropdown && (
              <div className="dropdown-menu">
                <div className="user-card">
                  <div className="user-card-left">
                    <img
                      src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava1-bg.webp"
                      alt="Avatar"
                      className="user-avatar"
                    />
                    <h5>{userData.userName}</h5>
                    <p className="role">Member</p>
                    <button className="edit-btn">Edit</button>
                  </div>
                  <div className="user-card-right">
                    <h6>Information</h6>
                    <hr />
                    <ul className="info-list">
                      <li>
                        <strong>Email:</strong> {userData.email}
                      </li>
                      <li>
                        <strong>User ID:</strong> {userData.userId}
                      </li>
                      <li>
                        <strong>Tenant ID:</strong> {userData.tenantId}
                      </li>
                      <li>
                        <strong>Expires:</strong> {userData.joined}
                      </li>
                    </ul>
                    <button className="logout-btn" onClick={handleLogout}>
                      Log Out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
