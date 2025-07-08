import React from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <a href="https://www.ifloriana.com" target="_blank" rel="noopener noreferrer">
          <img
            src="/iFloriana-light-logo.png"
            alt="Logo"
            className="sidebar-logo"
          />
        </a>
      </div>
      <ul className="sidebar-menu">
        <li>
          <NavLink
            to="/adminpanel"
            className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}
            end
          >
            <i className="bi bi-house-door"></i>
            <span>Dashboard</span>
          </NavLink>
        </li>
        {/* <li>
          <NavLink
            to="/adminpanel/salon1"
            className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}
          >
            <i className="bi bi-list-ul"></i>
            <span>Registered Salon List</span>
          </NavLink>
        </li> */}
        <li>
          <NavLink
            to="/adminpanel/package"
            className={({ isActive }) => (isActive ? "sidebar-link active" : "sidebar-link")}
          >
            <i className="bi bi-boxes"></i>
            <span>All Packages</span>
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;