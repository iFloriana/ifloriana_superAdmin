import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./context.css";

const AssignMembership = ({ show, onClose, onMembershipAssigned }) => {
  const salonId = localStorage.getItem("salon_id");
  const API_URL = import.meta.env.VITE_API_URL;

  const [customers, setCustomers] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedMembershipId, setSelectedMembershipId] = useState("");
  const [selectedCustomerDetails, setSelectedCustomerDetails] = useState(null);
  const [selectedMembershipDetails, setSelectedMembershipDetails] =
    useState(null);

  useEffect(() => {
    if (show) {
      const fetchCustomers = async () => {
        try {
          const response = await axios.get(
            `${API_URL}/customers?salon_id=${salonId}`
          );
          setCustomers(response.data.data);
        } catch (error) {
          console.error("Error fetching customers:", error);
          toast.error("Failed to fetch customers.");
        }
      };
      fetchCustomers();
    }
  }, [show, API_URL, salonId]);

  useEffect(() => {
    if (show) {
      const fetchMemberships = async () => {
        try {
          const response = await axios.get(
            `${API_URL}/branch-memberships?salon_id=${salonId}`
          );
          setMemberships(response.data.data);
        } catch (error) {
          console.error("Error fetching memberships:", error);
          toast.error("Failed to fetch memberships.");
        }
      };
      fetchMemberships();
    }
  }, [show, API_URL, salonId]);

  const handleCustomerChange = (e) => {
    const customerId = e.target.value;
    setSelectedCustomerId(customerId);
    const customer = customers.find((cust) => cust._id === customerId);
    setSelectedCustomerDetails(customer);
  };

  const handleMembershipChange = (e) => {
    const membershipId = e.target.value;
    setSelectedMembershipId(membershipId);
    const membership = memberships.find((mem) => mem._id === membershipId);
    setSelectedMembershipDetails(membership);
  };

  const clearCustomerSelection = () => {
    setSelectedCustomerId("");
    setSelectedCustomerDetails(null);
  };

  const clearMembershipSelection = () => {
    setSelectedMembershipId("");
    setSelectedMembershipDetails(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCustomerId || !selectedMembershipId) {
      toast.error("Please select both a customer and a membership.");
      return;
    }

    try {
      const payload = {
        customer_id: selectedCustomerId,
        branchMembership_id: selectedMembershipId,
        salon_id: salonId,
      };
      const response = await axios.post(
        `${API_URL}/customer-memberships/purchase`,
        payload
      );
      toast.success(
        response.data.message || "Membership assigned successfully!"
      );
      onClose();
      if (onMembershipAssigned) {
        // Call the prop function
        onMembershipAssigned();
      }
    } catch (error) {
      console.error("Error assigning membership:", error);
      toast.error(
        error.response?.data?.message || "Failed to assign membership."
      );
    }
  };

  if (!show) return null;

  return (
    <>
      <div className="overlay-blur" onClick={onClose}></div>
      <div className={`sidebar-div ${show ? "show" : ""}`}>
        <div className="p-4 bg-dark h-100 text-white overflow-auto">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="sidebar-title">Assign Membership to Customer</h5>
            <button className="btn btn-outline-danger" onClick={onClose}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          <hr />
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="customerSelect" className="form-label">
                Customer <span className="text-danger">*</span>
              </label>
              <select
                id="customerSelect"
                className="form-select bg-dark text-white"
                required
                value={selectedCustomerId}
                onChange={handleCustomerChange}
              >
                <option value="" hidden>
                  Select Customer
                </option>
                {customers.map((customer) => (
                  <option key={customer._id} value={customer._id}>
                    {customer.full_name}
                  </option>
                ))}
              </select>
            </div>

            {selectedCustomerDetails && (
              <div className="card bg-black text-white w-75 mb-3">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-2">
                    {selectedCustomerDetails.image && (
                      <img
                        src={selectedCustomerDetails.image}
                        alt={selectedCustomerDetails.full_name}
                        className="rounded-circle me-3"
                        style={{
                          width: "60px",
                          height: "60px",
                          objectFit: "cover",
                        }}
                      />
                    )}
                    <div>
                      <h5 className="card-title mb-0">
                        {selectedCustomerDetails.full_name}
                      </h5>
                      <p className="card-text mb-0">
                        <i className="bi bi-telephone me-2"></i>
                        {selectedCustomerDetails.phone_number}
                      </p>
                      <p className="card-text mb-0">
                        <i className="bi bi-envelope me-2"></i>
                        {selectedCustomerDetails.email}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-light ms-auto"
                      onClick={clearCustomerSelection}
                    >
                      <i className="bi bi-x-lg"></i> Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-3">
              <label htmlFor="membershipSelect" className="form-label">
                Membership <span className="text-danger">*</span>
              </label>
              <select
                id="membershipSelect"
                className="form-select bg-dark text-white"
                required
                value={selectedMembershipId}
                onChange={handleMembershipChange}
              >
                <option value="" hidden>
                  Select Membership
                </option>
                {memberships.map((membership) => (
                  <option key={membership._id} value={membership._id}>
                    {membership.membership_name}
                  </option>
                ))}
              </select>
            </div>

            {selectedMembershipDetails && (
              <div className="card bg-black text-white w-75 mb-5">
                <div className="card-body">
                  <div className="d-flex align-items-center mb-2">
                    <div>
                      <h5 className="card-title mb-2">
                        {selectedMembershipDetails.membership_name}
                      </h5>
                      <p className="card-text mb-2">
                        <i className="bi bi-coin me-2"></i>
                        Discount:{" "}
                        {selectedMembershipDetails.discount_type ===
                        "percentage"
                          ? `${selectedMembershipDetails.discount} %`
                          : `₹ ${selectedMembershipDetails.discount}`}
                      </p>
                      <p className="card-text mb-2">
                        <i className="bi bi-cash-coin me-2"></i>
                        Amount: {selectedMembershipDetails.membership_amount}
                      </p>
                      <p className="card-text mb-0">
                        <i className="bi bi-clock-history me-2"></i>
                        Duration: {selectedMembershipDetails.subscription_plan}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-light ms-auto"
                      onClick={clearMembershipSelection}
                    >
                      <i className="bi bi-x-lg"></i> Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button type="submit" className="btn page-btn me-2">
              <i className="bi bi-floppy me-2"></i>
              Submit
            </button>
            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={onClose}
            >
              <i className="bi bi-x-lg me-2"></i>Cancel
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AssignMembership;
