import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./RegisterSalon.css";
import axios from "axios";

const RegisterSalon = () => {
  const [salon, setSalon] = useState({
    name: "",
    description: "",
    address: "",
    contact_number: "",
    contact_email: "",
    opening_time: "",
    closing_time: "",
    Category: "unisex",
    status: 1,
    package_id: null,
  });

  const [packages, setPackages] = useState([]);
  const [showPackages, setShowPackages] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    axios
      .get(`${API_URL}/package`)
      .then((response) => {
        setPackages(response.data);
      })
      .catch((error) => {
        console.error("Error fetching packages:", error);
      });
  }, []);

  const handleChange = (e) => {
    setSalon({ ...salon, [e.target.name]: e.target.value });
  };

  const handlePackageSelect = (package_id) => {
    setSalon({ ...salon, package_id });
    setShowPackages(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!salon.package_id) {
      alert("Please select a package.");
      return;
    }

    if (!/^[0-9]{10}$/.test(salon.contact_number)) {
      alert("Contact number must be exactly 10 digits.");
      return;
    }

    try {
      const formattedOpeningTime = salon.opening_time + ":00";
      const formattedClosingTime = salon.closing_time + ":00";

      const requestData = {
        name: salon.name,
        description: salon.description,
        address: salon.address,
        contact_number: salon.contact_number,
        contact_email: salon.contact_email,
        opening_time: formattedOpeningTime,
        closing_time: formattedClosingTime,
        Category: salon.Category,
        status: salon.status,
        package_id: salon.package_id,
      };

      console.log("Sending Data:", requestData);

      const response = await axios.post(
        import.meta.env.VITE_ADD_SALON_API,
        requestData
      );

      console.log("Salon registered successfully:", response.data);
      alert("Salon registered successfully!");

      setSalon({
        name: "",
        description: "",
        address: "",
        contact_number: "",
        contact_email: "",
        opening_time: "",
        closing_time: "",
        Category: "unisex",
        status: 1,
        package_id: null,
      });
    } catch (error) {
      console.error("Error registering salon:", error);
      console.error("Error response:", error.response);
      alert(
        `Failed to register salon: ${
          error.response?.data?.message || "Unknown error"
        }`
      );
    }
  };

  return (
    <div className="register-salon-container">
      <h2 className="text-center mb-4">Register New Salon</h2>
      <form onSubmit={handleSubmit} className="register-form">
        <div className="mb-3">
          <label className="form-label">Salon Name</label>
          <input
            type="text"
            name="name"
            className="form-control fcs"
            value={salon.name}
            onChange={handleChange}
            placeholder="Enter salon name"
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            name="description"
            className="form-control fcs"
            value={salon.description}
            onChange={handleChange}
            placeholder="Enter short description"
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Address</label>
          <input
            type="text"
            name="address"
            className="form-control fcs"
            value={salon.address}
            onChange={handleChange}
            placeholder="Enter address"
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Contact Number</label>
          <input
            type="tel"
            name="contact_number"
            className="form-control fcs"
            value={salon.contact_number}
            onChange={handleChange}
            pattern="[0-9]{10}"
            placeholder="Enter contact number"
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Contact Email</label>
          <input
            type="email"
            name="contact_email"
            className="form-control fcs"
            value={salon.contact_email}
            onChange={handleChange}
            placeholder="Enter contact email"
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Opening Time</label>
          <input
            type="time"
            name="opening_time"
            className="form-control fcs"
            value={salon.opening_time}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Closing Time</label>
          <input
            type="time"
            name="closing_time"
            className="form-control fcs"
            value={salon.closing_time}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Category</label>
          <select
            name="Category"
            className="form-control fcs"
            value={salon.Category}
            onChange={handleChange}
            required
          >
            <option value="unisex">Unisex</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>
        <div
          className="package-selection"
          onClick={() => setShowPackages(!showPackages)}
        >
          <span>
            {salon.package_id
              ? `Selected Package: ${
                  packages.find((pkg) => pkg.id === salon.package_id)?.name
                }`
              : "Select Package"}
          </span>
          <button type="button" id="togleButon" className="arrow-btn">
            ↓
          </button>
        </div>

        {showPackages && (
          <div className="package-list mt-3">
            {packages.map((pkg) => (
              <div
                key={pkg._id}
                className={`card package-card ${
                  salon.package_id === pkg.id ? "selected" : ""
                }`}
                onClick={() => handlePackageSelect(pkg.id)}
              >
                <div className="card-body">
                  <h5>{pkg.name}</h5>
                  <p>{pkg.description}</p>
                  <strong>₹{pkg.price}</strong>
                </div>
              </div>
            ))}
          </div>
        )}
        <button type="submit" className="btn submit-button w-100 mt-3">
          Register Salon
        </button>
      </form>
    </div>
  );
};

export default RegisterSalon;
