import React, { useEffect, useState } from "react";
import axios from "axios";
import "./context.css";
import { toast } from "react-toastify";

const CommissionSidebar = ({
  show,
  onClose,
  fetchCommissions,
  editingCommission,
}) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const salonId = localStorage.getItem("salon_id");

  const [branches, setBranches] = useState([]);
  const [formData, setFormData] = useState({
    branch_id: "",
    commission_name: "",
    commission_type: "Percentage",
    commission: [{ slot: "", amount: "" }],
    salon_id: salonId,
  });

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    if (editingCommission) {
      setFormData({
        branch_id: editingCommission.branch_id?._id || "",
        commission_name: editingCommission.commission_name || "",
        commission_type: editingCommission.commission_type || "Percentage",
        commission:
          editingCommission.commission.length > 0
            ? editingCommission.commission
            : [{ slot: "", amount: "" }],
        salon_id: salonId,
      });
    } else {
      setFormData({
        branch_id: "",
        commission_name: "",
        commission_type: "Percentage",
        commission: [{ slot: "", amount: "" }],
        salon_id: salonId,
      });
    }
  }, [editingCommission, salonId]);

  const fetchBranches = async () => {
    try {
      const res = await axios.get(`${API_URL}/branches?salon_id=${salonId}`);
      setBranches(res.data.data);
    } catch (error) {
      toast.error("Failed to fetch branches");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSlotChange = (index, e) => {
    const { name, value } = e.target;
    const newCommissionSlots = [...formData.commission];
    newCommissionSlots[index] = { ...newCommissionSlots[index], [name]: value };
    setFormData((prev) => ({ ...prev, commission: newCommissionSlots }));
  };

  const handleAddSlot = () => {
    setFormData((prev) => ({
      ...prev,
      commission: [...prev.commission, { slot: "", amount: "" }],
    }));
  };

  const handleRemoveSlot = (index) => {
    const newCommissionSlots = formData.commission.filter(
      (_, i) => i !== index
    );
    setFormData((prev) => ({ ...prev, commission: newCommissionSlots }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCommission) {
        await axios.put(
          `${API_URL}/revenue-commissions/${editingCommission._id}`,
          formData
        );
        toast.success("Commission updated successfully");
      } else {
        await axios.post(`${API_URL}/revenue-commissions`, formData);
        toast.success("Commission added successfully");
      }
      onClose();
      fetchCommissions();
    } catch (error) {
      toast.error("Failed to save commission");
      console.error("Commission save error:", error);
    }
  };

  if (!show) return null;

  return (
    <>
      <div className="overlay-blur" onClick={onClose}></div>
      <div className={`sidebar-div ${show ? "show" : ""}`}>
        <div className="p-4 bg-dark h-100 text-white overflow-auto">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="sidebar-title">
              {editingCommission ? "Edit Commission" : "Add New Commission"}
            </h5>
            <button className="btn btn-outline-danger" onClick={onClose}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          <hr />
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">
                Branch <span className="text-danger">*</span>
              </label>
              <select
                className="form-select bg-dark text-white"
                name="branch_id"
                value={formData.branch_id}
                onChange={handleInputChange}
                required
              >
                <option value="" hidden>
                  Select Branch
                </option>
                {branches.map((branch) => (
                  <option key={branch._id} value={branch._id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">
                Commission Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control bg-dark text-white"
                placeholder="Enter Commission Name"
                name="commission_name"
                value={formData.commission_name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">
                Commission Type <span className="text-danger">*</span>
              </label>
              <select
                className="form-select bg-dark text-white"
                name="commission_type"
                value={formData.commission_type}
                onChange={handleInputChange}
                required
              >
                <option value="Percentage">Percentage %</option>
                <option value="Fixed">Fixed ₹</option>
              </select>
            </div>

            {formData.commission.map((slotItem, index) => (
              <div className="row mb-3 align-items-center" key={index}>
                <div className="col-md-5">
                  <label className="form-label">
                    Slot <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control bg-dark text-white"
                    placeholder="Ex: 1000-1999"
                    name="slot"
                    value={slotItem.slot}
                    onChange={(e) => handleSlotChange(index, e)}
                    required
                  />
                </div>
                <div className="col-md-5">
                  <label className="form-label">
                    Amount <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control bg-dark text-white"
                    placeholder="Ex: 5"
                    name="amount"
                    value={slotItem.amount}
                    onChange={(e) => handleSlotChange(index, e)}
                    required
                  />
                </div>
                <div
                  className="col-md-2 d-flex align-items-end"
                  style={{ height: "100%" }}
                >
                  {formData.commission.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleRemoveSlot(index)}
                      style={{ marginBottom: "1px" }}
                    >
                      <i className="bi bi-x-circle"></i>
                    </button>
                  )}
                </div>
              </div>
            ))}

            <span
              role="button"
              className="btn page-btn"
              onClick={handleAddSlot}
            >
              + Add Slot
            </span>

            <div className="my-5">
              <button type="submit" className="btn page-btn me-2">
                <i className="bi bi-floppy me-2"></i>{" "}
                {editingCommission ? "Update Commission" : "Add Commission"}
              </button>
              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={onClose}
              >
                <i className="bi bi-x-lg me-2"></i>Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CommissionSidebar;
