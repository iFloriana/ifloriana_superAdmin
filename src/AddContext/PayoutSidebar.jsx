import React, { useState, useEffect } from "react";
import axios from "axios";
import "./context.css";
import { toast } from "react-toastify";

const PayoutSidebar = ({ show, onClose, selectedStaff }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const salonId = localStorage.getItem("salon_id");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show) {
      setPaymentMethod("");
      setDescription("");
    }
  }, [show, selectedStaff]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!paymentMethod) {
      toast.error("Please select a payment method.");
      return;
    }
    if (!selectedStaff || !selectedStaff.staff_id) {
      toast.error("No staff member selected or staff ID is missing.");
      console.error(
        "Error: selectedStaff or selectedStaff.staff_id is undefined."
      );
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/staffEarnings/pay/${selectedStaff.staff_id}`,
        {
          payment_method: paymentMethod,
          description: description,
          salon_id: salonId,
        }
      );
      if (response.status === 201) {
        toast.success("Payout successful!");
        onClose();
      } else {
        toast.error("Payout failed. Please try again.");
        console.error("Server responded with non-200 status:", response);
      }
    } catch (err) {
      console.error("Error during payout:", err);
      if (err.response && err.response.data && err.response.data.message) {
        toast.error(`Payout failed: ${err.response.data.message}`);
      } else if (err.message) {
        toast.error(`Failed to process payout: ${err.message}`);
      } else {
        toast.error("Failed to process payout. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {show && <div className="overlay-blur" onClick={onClose}></div>}
      <div className={`sidebar-div ${show ? "show" : ""}`}>
        <div className="p-4 bg-dark h-100 text-white overflow-auto">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="sidebar-title">Pay Out To</h5>
            <button className="btn btn-outline-danger" onClick={onClose}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          <hr />
          <form onSubmit={handleSubmit}>
            <div className="my-2 d-flex align-items-center gap-3">
              {selectedStaff && (
                <>
                  <img
                    src={
                      selectedStaff.staff_image ||
                      "https://via.placeholder.com/50"
                    }
                    alt={selectedStaff.staff_name}
                    className="rounded-circle"
                    width="50"
                    height="50"
                    style={{ objectFit: "cover" }}
                  />
                  <span>{selectedStaff.staff_name}</span>
                </>
              )}
            </div>
            <hr />
            <div className="mb-3">
              <label htmlFor="paymentMethodSelect" className="form-label">
                Select Method <span className="text-danger">*</span>
              </label>
              <select
                id="paymentMethodSelect"
                className="form-select bg-dark text-white"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                required
              >
                <option value="" hidden>
                  Select Method
                </option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="online">Online</option>
              </select>
            </div>
            <div className="mb-3">
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                id="description"
                className="bg-dark form-control text-white"
                rows="2"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>
            <div>
              Commission Earn: ₹ {selectedStaff?.commission_earning || 0}
            </div>
            <div>Tip Earn: ₹ {selectedStaff?.tip_earning || 0}</div>
            <div>Salary: ₹ {selectedStaff?.staff_salary || 0}</div>
            <hr />
            <div>Total Pay : ₹ {selectedStaff?.staff_earning || 0}</div>
            <button
              type="submit"
              className="btn page-btn mt-3"
              disabled={loading}
            >
              {loading ? "Processing..." : "Payout"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default PayoutSidebar;
