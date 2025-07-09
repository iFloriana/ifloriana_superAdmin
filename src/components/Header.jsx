import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMoneyBillWave,
  faMoneyBillTrendUp,
  faSun,
  faMoon,
} from "@fortawesome/free-solid-svg-icons";
import "./components.css";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import axios from "axios";

const Header = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();
  const [salon, setSalon] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;
  const adminId = localStorage.getItem("admin_id");

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    document.body.setAttribute("data-theme", newTheme ? "dark" : "light");
    localStorage.setItem("theme", newTheme ? "dark" : "light");
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    setIsDarkMode(savedTheme === "dark");
    document.body.setAttribute("data-theme", savedTheme);
  }, []);

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  const isActiveParent = (routes) => {
    return routes.some((route) => location.pathname.startsWith(route));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const MySwal = withReactContent(Swal);

  const handleLogout = () => {
    MySwal.fire({
      title: "Are you sure?",
      text: "Do you really want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, logout",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("isAuthenticated");
        navigate("/");
      }
    });
  };

  useEffect(() => {
    const salonId = localStorage.getItem("salon_id");
    if (!salonId) {
      console.error("No salon_id found in localStorage");
      return;
    }

    axios
      .get(`${API_URL}/admin/${adminId}`)
      .then((response) => {
        if (response.data) {
          setSalon(response.data);
        } else {
          console.error("Salon data not found in response", response);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch salon data", error);
      });
  }, []);

  return (
    <>
      <div className="header-custom p-3 d-flex justify-content-between align-items-center">
        <ul className="menu d-flex gap-4">
          <li
            className={`menu-item ${
              isActiveParent(["/dashboard", "/calendarbooking"])
                ? "active-parent"
                : ""
            }`}
          >
            Main
            <ul className="submenu">
              <li onClick={() => navigate("/dashboard")}>
                <i className="bi bi-speedometer2 me-2 icon-blue"></i>Dashboard
              </li>
              <li onClick={() => navigate("/calendarbooking")}>
                <i className="bi bi-calendar-check me-2 icon-yellow"></i>
                Calendar Bookings
              </li>
            </ul>
          </li>
          <li
            className={`menu-item ${
              isActiveParent([
                "/branch",
                "/bookings",
                "/services",
                "/package",
                "/customerpackage",
              ])
                ? "active-parent"
                : ""
            }`}
          >
            Company
            <ul className="submenu">
              <li onClick={() => navigate("/branch")}>
                <i className="bi bi-house-fill me-2 icon-purple"></i>Branches
              </li>
              <li onClick={() => navigate("/bookings")}>
                <i className="bi bi-calendar2-event-fill me-2 icon-crayon"></i>
                Bookings
              </li>
              <li onClick={() => navigate("/services/list")}>
                <i className="bi bi-person-fill-gear me-2 icon-blue"></i>
                Services
              </li>
              <li onClick={() => navigate("/package")}>
                <i className="bi bi-boxes me-2"></i>Packages
              </li>
              <li onClick={() => navigate("/customerpackage")}>
                <i className="bi bi-person-badge me-2 icon-purple"></i>
                Customer Packages
              </li>
            </ul>
          </li>
          <li
            className={`menu-item ${
              isActiveParent([
                "/products",
                "/orders",
                "/supply",
                "/product-variations",
              ])
                ? "active-parent"
                : ""
            }`}
          >
            Shop
            <ul className="submenu">
              <li onClick={() => navigate("/products/all-products")}>
                <i className="bi bi-shop-window me-2 icon-crayon"></i>Products
              </li>
              <li onClick={() => navigate("/orders")}>
                <i className="bi bi-bag-check-fill me-2 icon-blue"></i>Orders
              </li>
            </ul>
          </li>
          <li
            className={`menu-item ${
              isActiveParent(["/empoloyees", "/customers", "/reviews"])
                ? "active-parent"
                : ""
            }`}
          >
            Users
            <ul className="submenu">
              <li onClick={() => navigate("/empoloyees")}>
                <i className="bi bi-person-vcard-fill me-2 icon-purple"></i>
                Staff
              </li>
              <li onClick={() => navigate("/managers")}>
                <i className="bi bi-person-rolodex me-2 text-danger"></i>
                Manager
              </li>
              <li onClick={() => navigate("/customers")}>
                <i className="bi bi-person-lines-fill me-2 icon-crayon"></i>
                Customer
              </li>
            </ul>
          </li>
          <li
            className={`menu-item ${
              isActiveParent(["/tax", "/staffearning", "/coupon"])
                ? "active-parent"
                : ""
            }`}
          >
            Finance
            <ul className="submenu">
              <li onClick={() => navigate("/tax")}>
                <FontAwesomeIcon
                  icon={faMoneyBillTrendUp}
                  className="me-2 icon-yellow"
                />
                Tax
              </li>
              <li onClick={() => navigate("/staffearning")}>
                <FontAwesomeIcon
                  icon={faMoneyBillWave}
                  className="me-2 icon-purple"
                />
                Staff Earning
              </li>
            </ul>
          </li>
          <li
            className={`menu-item ${
              isActiveParent([
                "/order-report",
                "/overallbooking",
                "/staffpayout",
                "/dailybooking",
                "/staffservice",
                "/location",
              ])
                ? "active-parent"
                : ""
            }`}
          >
            Reports
            <ul className="submenu">
              <li onClick={() => navigate("/order-report")}>
                <i className="bi bi-pie-chart-fill me-2 icon-yellow"></i>
                Order Report
              </li>
              <li onClick={() => navigate("/overallbooking")}>
                <i className="bi bi-graph-up me-2 icon-purple"></i>Booking
                Report
              </li>
              <li onClick={() => navigate("/staffpayout")}>
                <i className="bi bi-cash-stack me-2 icon-crayon"></i>Staff
                Payout
              </li>
            </ul>
          </li>
          <li
            className={`menu-item ${
              isActiveParent([
                "/setting",
                "/notification",
                "/pages",
                "/appbanner",
                "/accesscontrol",
              ])
                ? "active-parent"
                : ""
            }`}
          >
            System
            <ul className="submenu">
              <li onClick={() => navigate("/setting")}>
                <i className="bi bi-gear-wide-connected me-2 icon-purple"></i>
                Settings
              </li>
              <li onClick={() => navigate("/notification/notification-list")}>
                <i className="bi bi-bell-fill me-2 icon-blue"></i>Notification
              </li>
            </ul>
          </li>
        </ul>
        <div
          className="d-flex align-items-center gap-3 position-relative"
          ref={dropdownRef}
        >
          <i className="bi bi-bell-fill fs-4 icon-purple" role="button"></i>
          <i
            className="bi bi-gear-wide-connected fs-4 icon-blue"
            role="button"
            onClick={() => navigate("/setting")}
          ></i>
          <FontAwesomeIcon
            icon={isDarkMode ? faSun : faMoon}
            className={`fs-4 ${isDarkMode ? "icon-yellow" : "icon-crayon"}`}
            onClick={toggleTheme}
            style={{ cursor: "pointer" }}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          />
          {salon?.salonDetails.image ? (
            <img
              src={salon.salonDetails.image}
              alt={salon.admin.full_name}
              className="rounded-circle profile-icon"
              onClick={toggleDropdown}
              style={{
                width: "40px",
                height: "40px",
                objectFit: "cover",
                cursor: "pointer",
              }}
            />
          ) : (
            <i
              className="bi bi-person-circle fs-4 profile-icon"
              onClick={toggleDropdown}
            ></i>
          )}
          {showDropdown && (
            <div
              className="dropdown-menu show dropdown-menu-dark mt-2"
              style={{ right: 0, top: "100%", position: "absolute" }}
            >
              <div className="dropdown-header fw-bold">
                {salon?.admin.full_name || "Salon"}
              </div>
              <button
                className="dropdown-item fw-bold"
                onClick={() => navigate("/profile")}
              >
                <i className="bi bi-person-circle"></i> My Profile
              </button>
              <hr />
              <button className="dropdown-item fw-bold" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right text-danger"></i> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Header;
