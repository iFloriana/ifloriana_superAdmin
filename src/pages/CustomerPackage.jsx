import { useEffect, useState } from "react";
import axios from "axios";
import AppointmentSidebar from "../AddContext/AppointmentSidebar";
import "./pages.css";

const CustomerPackage = () => {
  const [showForm, setShowForm] = useState(false);
  const [packages, setPackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [filter, setFilter] = useState("All");

  const API_URL = import.meta.env.VITE_API_URL;
  const salonId = localStorage.getItem("salon_id");

  const toggleForm = () => setShowForm((prev) => !prev);

  useEffect(() => {
    axios
      .get(`${API_URL}/customers?salon_id=${salonId}`)
      .then((response) => {
        if (response.data?.data) {
          const filtered = response.data.data.filter(
            (customer) =>
              customer.branch_package && customer.branch_package.length > 0
          );
          setPackages(filtered);
          setFilteredPackages(filtered);
        }
      })
      .catch((error) => {
        console.error("Error fetching customer packages:", error);
      });
  }, []);

  const handleFilterChange = (e) => {
    const selected = e.target.value;
    setFilter(selected);

    if (selected === "All") {
      setFilteredPackages(packages);
    } else {
      const now = new Date();
      const filtered = packages.filter((customer) => {
        return customer.branch_package.some((pkg) => {
          if (!pkg) return false;
          const isExpired = new Date(pkg.end_date) < now;
          return selected === "Active" ? !isExpired : isExpired;
        });
      });

      setFilteredPackages(filtered);
    }
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center top-div">
        <p className="title">Customer Packages</p>
        <button className="btn apt-btn" onClick={toggleForm}>
          <i className="bi bi-plus-circle me-2"></i>Appointment
        </button>
        <AppointmentSidebar show={showForm} onClose={toggleForm} />
      </div>
      <div className="inner-div text-white p-3 rounded">
        <div className="mx-4 d-flex justify-content-end">
          <div className="dropdown">
            <select
              className="form-select custom-select-input"
              value={filter}
              onChange={handleFilterChange}
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
        </div>
        <div className="table-responsive custom-table-container mt-4">
          <table className="table table-dark table-bordered custom-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Package</th>
                <th>No Of Services</th>
                <th>Package Price</th>
                <th>Start Date</th>
                <th>Expiry Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredPackages.map((customer) => {
                if (
                  !customer.branch_package ||
                  customer.branch_package.length === 0
                ) {
                  return null;
                }
                return customer.branch_package.map((pkg, index) => {
                  if (!pkg) return null;
                  return (
                    <tr key={`${customer._id}-${pkg._id || index}`}>
                      {index === 0 ? (
                        <td rowSpan={customer.branch_package.length}>
                          {customer.image && (
                            <img
                              src={customer.image}
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                                marginRight: "10px",
                                objectFit: "cover",
                              }}
                              alt="Customer"
                            />
                          )}
                          {customer.full_name}
                        </td>
                      ) : null}
                      <td>{pkg.package_name}</td>
                      <td>{pkg.package_details?.length || 0}</td>
                      <td>{pkg.package_price}</td>
                      <td>
                        {new Date(
                          customer.branch_package_bought_at
                        ).toLocaleDateString()}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            new Date(pkg.end_date) < new Date()
                              ? "bg-danger p-2"
                              : "bg-secondary p-2"
                          }`}
                        >
                          {new Date(pkg.end_date).toLocaleDateString()}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            pkg.status === 1
                              ? "bg-success p-2"
                              : "bg-secondary p-2"
                          }`}
                        >
                          {pkg.status === 1 ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  );
                });
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default CustomerPackage;
