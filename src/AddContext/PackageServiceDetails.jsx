import React from "react";
import "./context.css";

const PackageServiceDetails = ({ show, onClose, services, packageName }) => {
  return (
    <>
      {show && <div className="overlay-blur" onClick={onClose}></div>}
      <div className={`sidebar-div ${show ? "show" : ""}`}>
        <div className="p-4 bg-dark h-100 text-white overflow-auto">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="sidebar-title">
              {packageName ? `${packageName} Package` : "Package Services"}
            </h5>
            <button className="btn btn-outline-danger" onClick={onClose}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          <hr />
          <div className="sidebar-body mt-3">
            {" "}
            {services?.length === 0 ? (
              <p>No services found in this package.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-dark table-bordered custom-table">
                  <thead>
                    <tr>
                      <th>Service Name</th>
                      <th>Regular Price</th>
                      <th>Discounted Price</th>
                      <th>Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((detail, index) => (
                      <tr key={index}>
                        <td>{detail.service_id?.name || "N/A"}</td>
                        <td className="text-danger">
                          {" "}
                          ₹ {detail.service_id?.regular_price || 0}
                        </td>
                        <td className="text-success">
                          {" "}
                          ₹ {detail.discounted_price || 0}
                        </td>
                        <td>{detail.quantity || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PackageServiceDetails;
