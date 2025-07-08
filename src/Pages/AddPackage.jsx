import React, { useState } from "react";
import "./Package.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddPackage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    package_name: "",
    price: "",
    description: "",
    services_included: "",
    subscription_plan: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const servicesArray = formData.services_included
      .split(",")
      .map((service) => service.trim());

    const payload = {
      package_name: toTitleCase(formData.package_name),
      price: parseFloat(formData.price),
      description: formData.description,
      services_included: servicesArray,
      subscription_plan: formData.subscription_plan,
    };

    try {
      const response = await axios.post(`${API_URL}/package`, payload);
      if (response.status === 201 || response.status === 200) {
        toast.success("Package added successfully!");
        setTimeout(() => {
          navigate("/adminpanel/package");
        }, 2000);
      }
    } catch (error) {
      console.error("Error adding package:", error);
      toast.error("Failed to add package.");
    }
  };

  const toTitleCase = (str) => {
    if (!str) return "";
    return str
      .toLowerCase()
      .split(" ")
      .filter((word) => word.trim() !== "")
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="container mt-5 parent-divv">
      <h2 className="text-center mb-4 color">Add New Package</h2>
      <div className="card p-4 shadow card-border">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Package Name</label>
            <input
              type="text"
              name="package_name"
              className="form-control fcs"
              value={formData.package_name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Price (₹)</label>
            <input
              type="number"
              name="price"
              className="form-control fcs"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              className="form-control fcs"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">
              Services Included (comma-separated)
            </label>
            <input
              type="text"
              name="services_included"
              className="form-control fcs"
              value={formData.services_included}
              onChange={handleChange}
              placeholder="e.g., Service 1, Service 2, Service 3"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Subscription Plan</label>
            <select
              name="subscription_plan"
              className="form-select fcs"
              value={formData.subscription_plan}
              onChange={handleChange}
              required
            >
              <option value="">Select Plan</option>
              <option value="1-month">1 Month</option>
              <option value="3-months">3 Months</option>
              <option value="6-months">6 Months</option>
              <option value="1-year">1 Year</option>
            </select>
          </div>
          <div className="text-center">
            <button
              type="submit"
              className="btn submit-button"
              disabled={loading}
            >
              {loading ? "Adding Package..." : "Add Package"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPackage;
