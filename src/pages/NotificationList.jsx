import { useState } from "react";
import AppointmentSidebar from "../AddContext/AppointmentSidebar";

const NotificationList = () => {
  const [showForm, setShowForm] = useState(false);
  const toggleForm = () => setShowForm((prev) => !prev);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center top-div">
        <p className="title">Notifications</p>
        <button className="btn apt-btn" onClick={toggleForm}>
          <i className="bi bi-plus-circle me-2"></i>Appointment
        </button>
        <AppointmentSidebar show={showForm} onClose={toggleForm} />
      </div>
      <div className="inner-div rounded p-3">
        <div className="table-responsive custom-table-container mt-4">
          <table className="table table-dark table-bordered custom-table">
            <thead>
              <tr>
                <th>Text</th>
                <th>Module</th>
                <th>Updated at</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="3" className="text-center text-danger">
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

export default NotificationList;
