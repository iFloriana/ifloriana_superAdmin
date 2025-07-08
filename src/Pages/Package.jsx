import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Package.css";
import axios from "axios";
import Swal from "sweetalert2";

const Package = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/package`);
      setPackages(response.data || []);
      setError("");
    } catch (error) {
      console.error("Error fetching packages:", error);
      setError("Failed to fetch packages. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_URL}/package/${id}`);
          await fetchPackages();
          Swal.fire("Deleted!", "Package has been deleted.", "success");
        } catch (error) {
          console.error("Error deleting package:", error);
          Swal.fire(
            "Error",
            "Failed to delete package. Please try again.",
            "error"
          );
        }
      }
    });
  };

  const handleEdit = (id) => {
    navigate(`/adminpanel/edit-package/${id}`);
  };

  return (
    <div className="main-pkg-div p-2">
      <div className="inner-div container">
        <h1 className="color">Packages</h1>
        <button
          className="salon-btn"
          onClick={() => navigate("/adminpanel/add-package")}
        >
          <i className="bi bi-plus-circle"></i> Add Package
        </button>
      </div>

      {success && (
        <div className="alert alert-success mt-3 text-center">{success}</div>
      )}

      <div className="pkg-div container mt-5">
        {loading && (
          <div className="text-center">
            <div className="spinner-border color" role="status"></div>
            <p className="text-danger">Loading packages...</p>
          </div>
        )}
        {error && <div className="alert alert-danger">{error}</div>}

        {!error && !loading && packages.length === 0 && (
          <p className="text-center text-muted">No packages available.</p>
        )}

        <div className="row">
          {Array.isArray(packages) &&
            packages.map((pkg) => (
              <div key={pkg.id} className="col-md-4 mb-4">
                <div className="card shadow-sm">
                  <div className="card-body">
                    <div className="card-header mb-3">
                      <h5 className="card-title">{pkg.package_name}</h5>
                      <h5 className="card-subtitle mb-2">
                        <strong>Price:</strong> ₹{pkg.price}
                      </h5>
                    </div>
                    <p className="card-text">{pkg.description}</p>
                    <p>
                      <strong>Subscription Plan:</strong>{" "}
                      {pkg.subscription_plan}
                    </p>
                    <p>
                      <strong>Services Included:</strong>
                    </p>
                    <ul>
                      {Array.isArray(pkg.services_included) &&
                        pkg.services_included.map((service, index) => (
                          <li key={index}>{service}</li>
                        ))}
                    </ul>
                    <p className="text-muted">
                      <small>Package ID: {pkg._id}</small>
                    </p>

                    <div className="d-flex justify-content-between mt-3">
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => handleEdit(pkg._id)}
                      >
                        <i className="bi bi-pencil-square"></i> Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(pkg._id)}
                      >
                        <i className="bi bi-trash"></i> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Package;
