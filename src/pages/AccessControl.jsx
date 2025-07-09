import { useState } from "react";
import "./pages.css";
import AppointmentSidebar from "../AddContext/AppointmentSidebar";

const AccessControl = () => {
  const [showForm, setShowForm] = useState(false);
  const toggleForm = () => setShowForm((prev) => !prev);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center top-div">
        <p className="title">Permission</p>
        <button className="btn apt-btn" onClick={toggleForm}>
          <i className="bi bi-plus-circle me-2"></i>Appointment
        </button>
        <AppointmentSidebar show={showForm} onClose={toggleForm} />
      </div>
      <div className="text-white p-3 inner-div rounded d-flex align-items-center flex-column">
        <div className="text-center mb-5">
          <h4>Permission & Role</h4>
        </div>
        <div className="p-2 border rounded text-white d-flex justify-content-between align-items-center w-50 mb-3">
          <h5>Manager</h5>
          <button className="btn apt-btn">Permission</button>
        </div>
        <div className="p-2 border rounded text-white d-flex justify-content-between align-items-center w-50 mb-3">
          <h5>Employee</h5>
          <button className="btn apt-btn">Permission</button>
        </div>
        <div className="p-2 border rounded text-white d-flex justify-content-between align-items-center w-50 mb-3">
          <h5>User</h5>
          <button className="btn apt-btn">Permission</button>
        </div>
      </div>
    </>
  );
};

export default AccessControl;
