import { useState, useEffect } from "react";
import AppointmentSidebar from "../AddContext/AppointmentSidebar";

const NotificationTamplate = () => {
  const [showForm, setShowForm] = useState(false);
  const toggleForm = () => setShowForm((prev) => !prev);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center top-div">
        <p className="title">Notification Templates</p>
        <button className="btn apt-btn" onClick={toggleForm}>
          <i className="bi bi-plus-circle me-2"></i>Appointment
        </button>
        <AppointmentSidebar show={showForm} onClose={toggleForm} />
      </div>
      <div className="p-3 inner-div rounded">
        <div className="d-flex justify-content-end align-items-center gap-3">
          <div className="dropdown">
            <select className="form-select custom-select-input">
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="input-group input-group-dark custom-input-group-reviews">
            <span className="input-group-text custom-input-group-text">
              <i className="bi bi-search icon-brown"></i>
            </span>
            <input
              type="text"
              className="form-control custom-text-input"
              placeholder="Search.."
            />
          </div>
        </div>
        <div className="table-responsive custom-table-container mt-4">
          <table className="table table-dark table-bordered custom-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Label</th>
                <th>Type</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="5" className="text-center text-danger">
                  No data found
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default NotificationTamplate;
