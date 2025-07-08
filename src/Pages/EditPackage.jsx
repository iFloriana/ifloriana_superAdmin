import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Package.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EditPackage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

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

  useEffect(() => {
    const fetchPackageDetails = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/package/${id}`);
        const pkg = response.data;

        setFormData({
          package_name: pkg.package_name,
          price: pkg.price,
          description: pkg.description,
          services_included: pkg.services_included.join(", "),
          subscription_plan: pkg.subscription_plan,
        });
      } catch (error) {
        console.error("Error fetching package:", error);
        setError("Failed to fetch package details.");
      } finally {
        setLoading(false);
      }
    };

    fetchPackageDetails();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const updatedPackage = {
      ...formData,
      services_included: formData.services_included
        .split(",")
        .map((service) => service.trim()),
    };

    try {
      await axios.put(`${API_URL}/package/${id}`, updatedPackage);
      toast.success("Package updated successfully!");
      setTimeout(() => {
        navigate("/adminpanel/package");
      }, 1500);
    } catch (error) {
      console.error("Error updating package:", error);
      toast.error("Failed to update package.");
    }
  };

  return (
    <div className="container mt-5 p-div p-3">
      <h2 className="text-center mb-4 color">Edit Package</h2>

      {loading && (
        <div className="text-center">
          <div className="spinner-border color" role="status"></div>
          <p className="text-muted">Loading package details...</p>
        </div>
      )}

      {!loading && !error && (
        <form onSubmit={handleSubmit} className="form-div">
          <div className="mb-3">
            <label className="form-label">Package Name</label>
            <input
              type="text"
              name="package_name"
              value={formData.package_name}
              onChange={handleChange}
              className="form-control fcs"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Price (₹)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="form-control fcs"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-control fcs"
              rows="3"
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
              value={formData.services_included}
              onChange={handleChange}
              className="form-control fcs"
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

          <div className="btn-ctr my-3">
            <button type="submit" className="btn btn-success">
              <i className="bi bi-save"></i> Update Package
            </button>
            <button
              type="button"
              className="btn btn-secondary ms-2"
              onClick={() => navigate("/adminpanel/package")}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EditPackage;
