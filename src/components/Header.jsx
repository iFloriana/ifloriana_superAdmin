import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../components/Header.css";

const Header = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token");
      navigate("/");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="main-content">
      <div className="header-container">
        <div className="left-section">
          <input
            type="text"
            className="form-control search-input"
            placeholder="Search..."
          />
          <button className="salon-btn" onClick={() => navigate("/subscribe")}>
            <i className="bi bi-plus-circle"></i> &nbsp;Signup New Salon
          </button>
          <button
            className="salon-btn"
            onClick={() => navigate("/adminpanel/add-package")}
          >
            <i className="bi bi-plus-circle"></i> &nbsp;Add New Package
          </button>
        </div>

        <div className="right-section">
          <i
            className="bi bi-bell notification-icon"
            onClick={() => alert("No new notifications")}
          ></i>

          <div
            className={`profile-container ${showDropdown ? "show" : ""}`}
            ref={dropdownRef}
          >
            <i
              className="bi bi-person-circle profile-icon"
              onClick={() => setShowDropdown((prev) => !prev)}
            ></i>

            {showDropdown && (
              <div className="dropdown-menu">
                <div className="dropdown-item">
                  <i className="bi bi-person-circle me-2"></i>
                  <span>Admin</span>
                </div>
                <hr className="dropdown-divider" />
                <button className="btn btn-danger w-100" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
