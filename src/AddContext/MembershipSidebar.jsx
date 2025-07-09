import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./context.css";

const MembershipSidebar = ({ show, onClose, editData = null, onSuccess }) => {
  const [status, setStatus] = useState("active");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [discount, setDiscount] = useState("");
  const [discountType, setDiscountType] = useState("");
  const [price, setPrice] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;
  const salonId = localStorage.getItem("salon_id");

  useEffect(() => {
    if (editData) {
      setName(editData.membership_name || "");
      setDescription(editData.description || "");
      setDuration(editData.subscription_plan || "");
      setDiscount(editData.discount || "");
      setDiscountType(editData.discount_type || "");
      setPrice(editData.membership_amount || "");
      setStatus(editData.status === 1 ? "active" : "inactive");
    } else {
      setName("");
      setDescription("");
      setDuration("");
      setDiscount("");
      setDiscountType("");
      setPrice("");
      setStatus("active");
    }
  }, [editData, show]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      salon_id: salonId,
      membership_name: toTitleCase(name),
      description: toTitleCase(description),
      subscription_plan: duration,
      status: status === "active" ? 1 : 0,
      discount: Number(discount),
      discount_type: discountType,
      membership_amount: Number(price),
    };

    const request = editData
      ? axios.put(`${API_URL}/branch-memberships/${editData._id}`, payload)
      : axios.post(`${API_URL}/branch-memberships`, payload);

    request
      .then((res) => {
        toast.success(editData ? "Membership updated!" : "Membership created!");
        onClose();
        if (onSuccess) onSuccess();
      })
      .catch((err) => {
        console.error(err);
        toast.error(
          editData
            ? "Failed to update membership."
            : "Failed to create membership."
        );
      });
  };

  const toTitleCase = (str) => {
    return str
      .toLowerCase()
      .split(" ")
      .filter((word) => word.trim() !== "")
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (!show) return null;

  return (
    <>
      <div className="overlay-blur" onClick={onClose}></div>
      <div className={`sidebar-div ${show ? "show" : ""}`}>
        <div className="p-4 bg-dark h-100 text-white overflow-auto">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="sidebar-title">Membership</h5>
            <button className="btn btn-outline-danger" onClick={onClose}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          <hr />
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">
                Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control bg-dark text-white"
                placeholder="Enter Membership Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">
                Description <span className="text-danger">*</span>
              </label>
              <textarea
                required
                className="form-control bg-dark text-white"
                rows="3"
                placeholder="Enter Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>
            <div className="mb-3">
              <label className="form-label">
                Duration <span className="text-danger">*</span>
              </label>
              <select
                className="form-select bg-dark text-white"
                required
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              >
                <option hidden>Select Duration of Membership</option>
                <option value="1-month">1 month</option>
                <option value="3-months">3 months</option>
                <option value="6-months">6 months</option>
                <option value="12-months">12 months</option>
                <option value="lifetime">lifetime</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">
                Discount <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                className="form-control bg-dark text-white"
                placeholder="Enter Discount"
                required
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">
                Discount Type <span className="text-danger">*</span>
              </label>
              <select
                className="form-select bg-dark text-white"
                required
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
              >
                <option hidden>Select Discount Type</option>
                <option value="percentage">Percentage %</option>
                <option value="fixed">Fixed ₹</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">
                Price <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                className="form-control bg-dark text-white"
                placeholder="Enter Membership Price"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="mb-5">
              <label className="form-label d-block">Status</label>
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input custom-radio"
                  type="radio"
                  name="status"
                  id="active"
                  value="active"
                  checked={status === "active"}
                  onChange={(e) => setStatus(e.target.value)}
                />
                <label className="form-check-label" htmlFor="active">
                  Active
                </label>
              </div>
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input custom-radio"
                  type="radio"
                  name="status"
                  id="inactive"
                  value="inactive"
                  checked={status === "inactive"}
                  onChange={(e) => setStatus(e.target.value)}
                />
                <label className="form-check-label" htmlFor="inactive">
                  Inactive
                </label>
              </div>
            </div>
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

export default MembershipSidebar;
