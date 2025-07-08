import React from "react";
import { useNavigate } from "react-router-dom";
import "./NotFound.css";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="notfound-container">
      <h1 className="notfound-title">404 - Page Not Found</h1>
      <p className="notfound-text">The page you are looking for does not exist.</p>
      <button className="notfound-btn" onClick={() => navigate("/")}>
        Go to Login
      </button>
    </div>
  );
};

export default NotFound;