import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(
        `https://localhost:7171/api/User?username=${username}&password=${password}`,
        {
          method: "GET",
          headers: {
            accept: "*/*",
          },
        }
      );

      const result = await response.json();
      setLoading(false);

      if (result.statusCode === 200) {
        const { userName, userId, tenantId, token } = result.data;

        // Store values in localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("userName", userName);
        localStorage.setItem("userId", userId);
        localStorage.setItem("tenantId", tenantId);

        navigate("/home");
      } else {
        alert(result.message || "Login failed.");
      }
    } catch (error) {
      setLoading(false);
      alert("Something went wrong. Please try again.");
      console.error(error);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card-grid">
        <div className="grid-left">
          <img
            className="logo-img"
            src="https://res.cloudinary.com/kakani7/image/upload/v1747899023/SCHOOL_MANAGMENT/LOGIN_PAGE/rcceblgdl3graafbi4u8.svg"
            alt="Logo"
          />
        </div>
        <div className="grid-right">
          <form className="login-form" onSubmit={handleLogin}>
            <h2>Login</h2>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
