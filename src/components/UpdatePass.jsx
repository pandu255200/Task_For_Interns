import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import "./styles/UpdatePassword.css";

const UpdatePassword = () => {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
   const API_BASE = process.env.REACT_APP_API_BASE_URL;
  // const API_URL = "http://localhost:5000";

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          setUser(data);
          setEmail(data.email);
        } else {
          setMessage("Failed to load user details");
        }
      } catch (err) {
        setMessage("Something went wrong while loading user info");
      }
    };

    fetchUser();
  }, []);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/auth/update-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, oldPassword, newPassword }),
      });

      const data = await res.json();
      if (res.ok) setMessage(data.message);
      else setMessage(data.error || "Failed to update password");
    } catch (err) {
      setMessage("Something went wrong");
    }
  };

  return (
    <div className="update-password-container">
      <h2>Profile Details</h2>

      {user && (
        <div className="user-details">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Date of Joining:</strong> {new Date(user.dateOfJoining).toLocaleDateString()}</p>
        </div>
      )}

      <form className="update-password-form" onSubmit={handleUpdatePassword}>
        <input
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="password-wrappers">
          <input
            type={showOldPassword ? "text" : "password"}
            placeholder="Current Password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowOldPassword(!showOldPassword)}
            className="toggle-icon-btn"
            title="Toggle visibility"
          >
            <FontAwesomeIcon icon={showOldPassword ? faEyeSlash : faEye} />
          </button>
        </div>

        <div className="password-wrappers">
          <input
            type={showNewPassword ? "text" : "password"}
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="toggle-icon-btn"
            title="Toggle visibility"
          >
            <FontAwesomeIcon icon={showNewPassword ? faEyeSlash : faEye} />
          </button>
        </div>

        <button type="submit">Update Password</button>
      </form>

      {message && <p className="messages">{message}</p>}
    </div>
  );
};

export default UpdatePassword;
