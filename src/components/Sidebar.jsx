import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import * as bootstrap from "bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMoneyBillWave,
  faMoneyBillTrendUp,
} from "@fortawesome/free-solid-svg-icons";
import "./components.css";

const Sidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [openSubmenus, setOpenSubmenus] = useState({
    services: false,
    products: false,
    supply: false,
    location: false,
    notification: false,
  });

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [settingsDisabled, setSettingsDisabled] = useState(false); // Set to true to temporarily disable
  const [accessDisabled, setAccessDisabled] = useState(true); // Set to true to temporarily disable

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
    } else {
      setIsDarkMode(false);
    }
    const handleStorageChange = () => {
      const currentTheme = localStorage.getItem("theme");
      setIsDarkMode(currentTheme === "dark");
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (collapsed) {
      const tooltipTriggerList = document.querySelectorAll(
        '[data-bs-toggle="tooltip"]'
      );
      tooltipTriggerList.forEach((el) => new bootstrap.Tooltip(el));
    }
  }, [collapsed]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1100) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getLogoSrc = () => {
    if (collapsed) {
      return "/ifloriana_fav.png";
    } else {
      return isDarkMode ? "/iFloriana-light-logo.png" : "/ifloriana_logo.png";
    }
  };

  return (
    <div
      className={`sidebar-custom vh-100 px-3 d-flex flex-column justify-content-between ${
        collapsed ? "collapsed" : ""
      }`}
    >
      <div>
        <div>
          <a
            href="https://ifloriana.com"
            target="_blank"
            rel="noopener noreferrer"
            className="logo-div"
          >
            <img
              src={getLogoSrc()}
              alt="iFloriana"
              className="img-fluid sidebar-logo mb-2"
            />
          </a>
        </div>
        <ul className="nav flex-column sidebar-content">
          <p className="mb-1">{collapsed ? "-" : "Main"}</p>
          <li className="nav-item">
            <Link
              to="/quickbooking"
              className={`nav-link sidebar-link d-flex align-items-center ${
                location.pathname === "/quickbooking" ? "active" : ""
              }`}
            >
              <i
                className="bi-lightning-charge me-2 text-danger"
                data-bs-toggle="tooltip"
                data-bs-placement="right"
                title="Quick Booking"
              ></i>
              {!collapsed && "Quick Booking"}
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/dashboard"
              className={`nav-link sidebar-link d-flex align-items-center ${
                location.pathname === "/dashboard" ? "active" : ""
              }`}
            >
              <i
                className="bi bi-speedometer2 me-2 icon-blue"
                data-bs-toggle="tooltip"
                data-bs-placement="right"
                title="Dashboard"
              ></i>
              {!collapsed && "Dashboard"}
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/calendarbooking"
              className={`nav-link sidebar-link d-flex align-items-center ${
                location.pathname === "/calendarbooking" ? "active" : ""
              }`}
            >
              <i
                className="bi bi-calendar-check me-2 icon-yellow"
                data-bs-toggle="tooltip"
                data-bs-placement="right"
                title="Calender Booking"
              ></i>
              {!collapsed && "Calender Booking"}
            </Link>
          </li>
          <p className="mb-1">{collapsed ? "-" : "Company"}</p>
          <li className="nav-item">
            <Link
              to="/branch"
              className={`nav-link sidebar-link d-flex align-items-center ${
                location.pathname === "/branch" ? "active" : ""
              }`}
            >
              <i
                className="bi bi-house-fill me-2 icon-purple"
                data-bs-toggle="tooltip"
                data-bs-placement="right"
                title="Branches"
              ></i>
              {!collapsed && "Branches"}
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/bookings"
              className={`nav-link sidebar-link d-flex align-items-center ${
                location.pathname === "/bookings" ? "active" : ""
              }`}
            >
              <i
                className="bi bi-calendar2-event-fill me-2 icon-crayon"
                data-bs-toggle="tooltip"
                data-bs-placement="right"
                title="Bookings"
              ></i>
              {!collapsed && "Bookings"}
            </Link>
          </li>
          <li className="nav-item">
            <div
              className="nav-link sidebar-link d-flex align-items-center"
              onClick={() =>
                setOpenSubmenus({
                  ...openSubmenus,
                  services: !openSubmenus.services,
                  products: false,
                  supply: false,
                  location: false,
                  notification: false,
                })
              }
              style={{ cursor: "pointer" }}
            >
              <span>
                <i className="bi bi-person-gear me-2 icon-blue"></i>
                {!collapsed && "Services"}
              </span>
              <div className="ms-auto">
                <i
                  className={`bi ${
                    openSubmenus.services ? "bi-chevron-up" : "bi-chevron-right"
                  }`}
                ></i>
              </div>
            </div>

            {openSubmenus.services && (
              <ul className="nav flex-column ms-4">
                <li className="nav-item">
                  <Link
                    to="/services/list"
                    className={`nav-link sidebar-link d-flex align-items-center ${
                      location.pathname === "/services/list" ? "active" : ""
                    }`}
                  >
                    <i className="bi bi-list-task me-2 icon-yellow"></i> List
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/services/category"
                    className={`nav-link sidebar-link d-flex align-items-center ${
                      location.pathname === "/services/category" ? "active" : ""
                    }`}
                  >
                    <i className="bi bi-list-nested me-2 icon-purple"></i>
                    Category
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/services/sub-category"
                    className={`nav-link sidebar-link d-flex align-items-center ${
                      location.pathname === "/services/sub-category"
                        ? "active"
                        : ""
                    }`}
                  >
                    <i className="bi bi-list-columns me-2 icon-crayon"></i>Sub
                    Category
                  </Link>
                </li>
              </ul>
            )}
          </li>
          <li className="nav-item">
            <Link
              to="/package"
              className={`nav-link sidebar-link d-flex align-items-center ${
                location.pathname === "/package" ? "active" : ""
              }`}
            >
              <i
                className="bi bi-boxes me-2"
                data-bs-toggle="tooltip"
                data-bs-placement="right"
                title="Packages"
              ></i>
              {!collapsed && "Packages"}
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/membership"
              className={`nav-link sidebar-link d-flex align-items-center ${
                location.pathname === "/membership" ? "active" : ""
              }`}
            >
              <i
                className="bi bi bi-person-heart me-2 icon-yellow"
                data-bs-toggle="tooltip"
                data-bs-placement="right"
                title="Membership"
              ></i>
              {!collapsed && "Membership"}
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/customerpackage"
              className={`nav-link sidebar-link d-flex align-items-center ${
                location.pathname === "/customerpackage" ? "active" : ""
              }`}
            >
              <i
                className="bi bi-person-badge me-2 icon-purple"
                data-bs-toggle="tooltip"
                data-bs-placement="right"
                title="Customer Package"
              ></i>
              {!collapsed && "Customer Package"}
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/customermembership"
              className={`nav-link sidebar-link d-flex align-items-center ${
                location.pathname === "/customermembership" ? "active" : ""
              }`}
            >
              <i
                className="bi bi-person-up me-2 icon-blue"
                data-bs-toggle="tooltip"
                data-bs-placement="right"
                title="Customer Membership"
              ></i>
              {!collapsed && "Customer Membership"}
            </Link>
          </li>
          <p>{collapsed ? "-" : "Shop"}</p>
          <li className="nav-item">
            <div
              className="nav-link sidebar-link d-flex align-items-center"
              onClick={() =>
                setOpenSubmenus({
                  ...openSubmenus,
                  products: !openSubmenus.products,
                  services: false,
                  supply: false,
                  location: false,
                  notification: false,
                })
              }
              style={{ cursor: "pointer" }}
            >
              <span>
                <i className="bi bi-shop-window me-2 icon-crayon"></i>
                {!collapsed && "Products"}
              </span>
              <div className="ms-auto">
                <i
                  className={`bi ${
                    openSubmenus.products ? "bi-chevron-up" : "bi-chevron-right"
                  }`}
                ></i>
              </div>
            </div>

            {openSubmenus.products && (
              <ul className="nav flex-column ms-4">
                <li className="nav-item">
                  <Link
                    to="/products/all-products"
                    className={`nav-link sidebar-link d-flex align-items-center ${
                      location.pathname === "/products/all-products"
                        ? "active"
                        : ""
                    }`}
                  >
                    <i className="bi bi-list-task me-2 icon-yellow"></i>
                    All Products
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/products/brands"
                    className={`nav-link sidebar-link d-flex align-items-center ${
                      location.pathname === "/products/brands" ? "active" : ""
                    }`}
                  >
                    <i className="bi bi-slack me-2 icon-purple"></i>
                    Brands
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/products/categories"
                    className={`nav-link sidebar-link d-flex align-items-center ${
                      location.pathname === "/products/categories"
                        ? "active"
                        : ""
                    }`}
                  >
                    <i className="bi bi-list-nested me-2 icon-crayon"></i>
                    Category
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/products/sub-categories"
                    className={`nav-link sidebar-link d-flex align-items-center ${
                      location.pathname === "/products/sub-categories"
                        ? "active"
                        : ""
                    }`}
                  >
                    <i className="bi bi-list-columns me-2 icon-blue"></i>Sub
                    Category
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/products/units"
                    className={`nav-link sidebar-link d-flex align-items-center ${
                      location.pathname === "/products/units" ? "active" : ""
                    }`}
                  >
                    <i className="bi bi-unity me-2"></i>Units
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/products/tags"
                    className={`nav-link sidebar-link d-flex align-items-center ${
                      location.pathname === "/products/tags" ? "active" : ""
                    }`}
                  >
                    <i className="bi bi-bookmark-plus-fill me-2 icon-purple"></i>
                    Tags
                  </Link>
                </li>
              </ul>
            )}
          </li>
          <li className="nav-item">
            <Link
              to="/product-variations"
              className={`nav-link sidebar-link d-flex align-items-center ${
                location.pathname === "/product-variations" ? "active" : ""
              }`}
            >
              <i
                className="bi bi-palette2 me-2 icon-blue"
                data-bs-toggle="tooltip"
                data-bs-placement="right"
                title="Product Variations"
              ></i>
              {!collapsed && "Product Variations"}
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/orders"
              className={`nav-link sidebar-link d-flex align-items-center ${
                location.pathname.startsWith("/orders") ? "active" : ""
              }`}
            >
              <i
                className="bi bi-bag-check-fill me-2 icon-yellow"
                data-bs-toggle="tooltip"
                data-bs-placement="right"
                title="Orders"
              ></i>
              {!collapsed && "Orders"}
            </Link>
          </li>

          <p className="mb-1">{collapsed ? "-" : "User"}</p>
          <li className="nav-item">
            <Link
              to="/managers"
              className={`nav-link sidebar-link d-flex align-items-center ${
                location.pathname === "/managers" ? "active" : ""
              }`}
            >
              <i
                className="bi bi-person-rolodex me-2 text-danger"
                data-bs-toggle="tooltip"
                data-bs-placement="right"
                title="Manager"
              ></i>
              {!collapsed && "Manager"}
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/empoloyees"
              className={`nav-link sidebar-link d-flex align-items-center ${
                location.pathname === "/empoloyees" ? "active" : ""
              }`}
            >
              <i
                className="bi bi-person-vcard-fill me-2 icon-crayon"
                data-bs-toggle="tooltip"
                data-bs-placement="right"
                title="Staffs"
              ></i>
              {!collapsed && "Staffs"}
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/customers"
              className={`nav-link sidebar-link d-flex align-items-center ${
                location.pathname === "/customers" ? "active" : ""
              }`}
            >
              <i
                className="bi bi-person-lines-fill me-2 icon-blue"
                data-bs-toggle="tooltip"
                data-bs-placement="right"
                title="Customers"
              ></i>
              {!collapsed && "Customers"}
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/reviews"
              className={`nav-link sidebar-link d-flex align-items-center ${
                location.pathname === "/reviews" ? "active" : ""
              }`}
            >
              <i
                className="bi bi-star-fill me-2"
                data-bs-toggle="tooltip"
                data-bs-placement="right"
                title="Reviews"
              ></i>
              {!collapsed && "Reviews"}
            </Link>
          </li>
          <p>{collapsed ? "-" : "Finance"}</p>
          <li className="nav-item">
            <Link
              to="/tax"
              className={`nav-link sidebar-link d-flex align-items-center ${
                location.pathname === "/tax" ? "active" : ""
              }`}
            >
              <FontAwesomeIcon
                icon={faMoneyBillTrendUp}
                className="icon-purple me-2"
                data-bs-toggle="tooltip"
                data-bs-placement="right"
                title="Income"
              />
              {!collapsed && "Tax"}
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/staffearning"
              className={`nav-link sidebar-link d-flex align-items-center ${
                location.pathname === "/staffearning" ? "active" : ""
              }`}
            >
              <FontAwesomeIcon
                icon={faMoneyBillWave}
                className="me-2 icon-crayon"
                data-bs-toggle="tooltip"
                data-bs-placement="right"
                title="Staff Earning"
              />
              {!collapsed && "Staff Earning"}
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/commission"
              className={`nav-link sidebar-link d-flex align-items-center ${
                location.pathname === "/commission" ? "active" : ""
              }`}
            >
              <i
                className="bi bi-cash-coin text-danger me-2"
                data-bs-toggle="tooltip"
                data-bs-placement="right"
                title="Commision"
              ></i>
              {!collapsed && "Commission"}
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/coupon"
              className={`nav-link sidebar-link d-flex align-items-center ${
                location.pathname === "/coupon" ? "active" : ""
              }`}
            >
              <i
                className="bi bi-ticket-detailed-fill me-2 icon-blue"
                data-bs-toggle="tooltip"
                data-bs-placement="right"
                title="Coupon"
              ></i>
              {!collapsed && "Coupons"}
            </Link>
          </li>
          <p>{collapsed ? "-" : "Reports"}</p>
          <li className="nav-item">
            <Link
              to="/dailybooking"
              className={`nav-link sidebar-link d-flex align-items-center ${
                location.pathname === "/dailybooking" ? "active" : ""
              }`}
            >
              <i
                className="bi bi-file-earmark-arrow-down-fill me-2 icon-yellow"
                data-bs-toggel="tooltip"
                data-bs-placement="right"
                title="Daily Bookings"
              ></i>
              {!collapsed && "Daily Bookings"}
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/order-report"
              className={`nav-link sidebar-link d-flex align-items-center ${
                location.pathname === "/order-report" ? "active" : ""
              }`}
            >
              <i
                className="bi bi-pie-chart-fill me-2 icon-purple"
                data-bs-toggle="tooltip"
                data-bs-placement="right"
                title="Oreder Report"
              ></i>
              {!collapsed && "Oreder Report"}
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/overallbooking"
              className={`nav-link sidebar-link d-flex align-items-center ${
                location.pathname === "/overallbooking" ? "active" : ""
              }`}
            >
              <i
                className="bi bi-graph-up me-2 icon-crayon"
                data-bs-toggle="tooltip"
                data-bs-placement="right"
                title="Overall Booking"
              ></i>
              {!collapsed && "Overall Booking"}
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/staffpayout"
              className={`nav-link sidebar-link d-flex align-items-center ${
                location.pathname === "/staffpayout" ? "active" : ""
              }`}
            >
              <i
                className="bi bi-cash-stack me-2 icon-blue"
                data-bs-toggle="tooltip"
                data-bs-placement="right"
                title="Staff Payout"
              ></i>
              {!collapsed && "Staff Payout"}
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/staffservice"
              className={`nav-link sidebar-link d-flex align-items-center ${
                location.pathname === "/staffservice" ? "active" : ""
              }`}
            >
              <i
                className="bi bi-people-fill me-2 icon-purple"
                data-bs-toggle="tooltip"
                data-bs-placement="right"
                title="Staff Service"
              ></i>
              {!collapsed && "Staff Service"}
            </Link>
          </li>
          <p>{collapsed ? "-" : "System"}</p>
          <li className="nav-item">
            {settingsDisabled ? (
              <div
                className={`nav-link sidebar-link d-flex align-items-center disabled-link ${
                  location.pathname === "/setting" ? "active" : ""
                }`}
                data-bs-toggle="tooltip"
                data-bs-placement="right"
                title="Settings (Temporarily Disabled)"
              >
                <i className="bi bi-gear-wide-connected me-2 icon-crayon"></i>
                {!collapsed && "Settings"}
              </div>
            ) : (
              <Link
                to="/setting"
                className={`nav-link sidebar-link d-flex align-items-center ${
                  location.pathname === "/setting" ? "active" : ""
                }`}
              >
                <i
                  className="bi bi-gear-wide-connected me-2 icon-crayon"
                  data-bs-toggle="tooltip"
                  data-bs-placement="right"
                  title="Settings"
                ></i>
                {!collapsed && "Settings"}
              </Link>
            )}
          </li>
          <li className="nav-item">
            <div
              className="nav-link sidebar-link d-flex align-items-center"
              onClick={() =>
                setOpenSubmenus({
                  ...openSubmenus,
                  notification: !openSubmenus.notification,
                  supply: false,
                  services: false,
                  products: false,
                  location: false,
                })
              }
              style={{ cursor: "pointer" }}
            >
              <span>
                <i className="bi bi-bell-fill me-2 icon-blue"></i>
                {!collapsed && "Notification"}
              </span>
              <div className="ms-auto">
                <i
                  className={`bi ${
                    openSubmenus.notification
                      ? "bi-chevron-up"
                      : "bi-chevron-right"
                  }`}
                ></i>
              </div>
            </div>

            {openSubmenus.notification && (
              <ul className="nav flex-column ms-4">
                <li className="nav-item">
                  <Link
                    to="/notification/notification-list"
                    className={`nav-link sidebar-link d-flex align-items-center ${
                      location.pathname === "/notification/notification-list"
                        ? "active"
                        : ""
                    }`}
                  >
                    <i className="bi bi-list-task me-2 icon-yellow"></i>
                    List
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    to="/notification/tamplate"
                    className={`nav-link sidebar-link d-flex align-items-center ${
                      location.pathname === "/notification/tamplate"
                        ? "active"
                        : ""
                    }`}
                  >
                    <i className="bi bi-journal me-2 icon-purple"></i>
                    Template
                  </Link>
                </li>
              </ul>
            )}
          </li>
          <li className="nav-item">
            <Link
              to="/appbanner"
              className={`nav-link sidebar-link d-flex align-items-center ${
                location.pathname === "/appbanner" ? "active" : ""
              }`}
            >
              <i
                className="bi bi-image me-2 icon-yellow"
                data-bs-toggle="tooltip"
                data-bs-placement="right"
                title="App Banner"
              ></i>
              {!collapsed && "App Banner"}
            </Link>
          </li>
          <li className="nav-item">
            {accessDisabled ? (
              <div
                className={`nav-link sidebar-link d-flex align-items-center disabled-link ${
                  location.pathname === "/accesscontrol" ? "active" : ""
                }`}
                data-bs-toggle="tooltip"
                data-bs-placement="right"
                title="Access Control (Temporarily Disabled)"
              >
                <i className="bi bi-person-fill-lock me-2 icon-purple"></i>
                {!collapsed && "Access Control"}
              </div>
            ) : (
              <Link
                to="/accesscontrol"
                className={`nav-link sidebar-link d-flex align-items-center ${
                  location.pathname === "/accesscontrol" ? "active" : ""
                }`}
              >
                <i
                  className="bi bi-person-fill-lock me-2 icon-purple"
                  data-bs-toggle="tooltip"
                  data-bs-placement="right"
                  title="Access Control"
                ></i>
                {!collapsed && "Access Control"}
              </Link>
            )}
          </li>
        </ul>
      </div>

      <div className="toggle-btn-container">
        <button
          className="btn-sm btn-outline-light w-100 mt-3 toggle-btn"
          onClick={() => setCollapsed(!collapsed)}
        >
          <i
            className={`bi ${
              collapsed ? "bi-arrow-right-square" : "bi-arrow-left-square"
            }`}
          ></i>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
