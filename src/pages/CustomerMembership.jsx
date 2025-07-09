import { useEffect, useState } from "react";
import AppointmentSidebar from "../AddContext/AppointmentSidebar";
import axios from "axios";
import "./pages.css";

const CustomerMembership = () => {
  const [showForm, setShowForm] = useState(false);
  const [memberships, setMemberships] = useState([]);
  const [refreshMemberships, setRefreshMemberships] = useState(false);
  const toggleForm = () => setShowForm((prev) => !prev);

  const API_BASE = import.meta.env.VITE_API_URL;
  const salonId = localStorage.getItem("salon_id");

  useEffect(() => {
    axios
      .get(`${API_BASE}/customers?salon_id=${salonId}`)
      .then((res) => {
        const filtered = res.data.data.filter(
          (c) =>
            c.branch_membership && Object.keys(c.branch_membership).length > 0
        );
        setMemberships(filtered);
      })
      .catch((err) => {
        console.error("Failed to fetch data", err);
      });
  }, [refreshMemberships]);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center top-div">
        <p className="title">Customer Memebership</p>
        <button className="btn apt-btn" onClick={toggleForm}>
          <i className="bi bi-plus-circle me-2"></i>Appointment
        </button>
        <AppointmentSidebar show={showForm} onClose={toggleForm} />
      </div>
      <div className="inner-div p-3 rounded">
        <div className="table-responsive custom-table-container mt-4">
          <table className="table table-dark table-bordered custom-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact Number</th>
                <th>Membership</th>
                <th>Price</th>
                <th>Start Date</th>
                <th>Expiry Date</th>
              </tr>
            </thead>
            <tbody>
              {memberships.map((customer, index) => {
                const membership = customer.branch_membership;
                const expiryDate = new Date(
                  customer.branch_membership_valid_till
                );
                const currentDate = new Date();
                currentDate.setHours(0, 0, 0, 0);

                const isExpired = expiryDate < currentDate;

                return (
                  <tr key={customer._id}>
                    <td>
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
                    <td>{customer.phone_number}</td>
                    <td>{membership.membership_name}</td>
                    <td>{membership.membership_amount}</td>
                    <td>
                      {new Date(
                        customer.branch_membership_bought_at
                      ).toLocaleDateString()}
                    </td>
                    <td>
                      {expiryDate.toLocaleDateString()}
                      {isExpired && (
                        <span className="badge bg-danger ms-2">Expired</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default CustomerMembership;
