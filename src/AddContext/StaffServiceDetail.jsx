import React from "react";
import "./context.css";

const StaffServiceDetail = ({ show, onClose, staffServices, staffName }) => {
  return (
    <>
      {show && <div className="overlay-blur" onClick={onClose}></div>}
      <div className={`sidebar-div ${show ? "show" : ""}`}>
        <div className="p-4 bg-dark h-100 text-white overflow-auto">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="sidebar-title">
              {staffName ? `${staffName}'s Service List` : "Staff Service List"}
            </h5>
            <button className="btn btn-outline-danger" onClick={onClose}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          <hr />
          {staffServices && staffServices.length > 0 ? (
            <ul className="list-group">
              {staffServices.map((service) => (
                <li
                  key={service._id}
                  className="list-group-item bg-dark text-white border-secondary text-start"
                >
                  {service.name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">No services assigned to this staff.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default StaffServiceDetail;
