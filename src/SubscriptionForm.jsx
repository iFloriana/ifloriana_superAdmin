import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/bootstrap.css";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";

const SubscriptionForm = () => {
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    full_name: "",
    phone_number: "",
    email: "",
    address: "",
    package_id: null,
    salonDetails: {
      salon_name: "",
    },
  });

  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPackageCards, setShowPackageCards] = useState(false);
  const [formErrors, setFormErrors] = useState({
    phoneNumber: "",
    email: "",
  });

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await axios.get(`${API_URL}/package`);
        setPackages(
          response.data.map((pkg) => ({
            ...pkg,
            name: pkg.package_name,
            id: pkg._id,
          }))
        );
      } catch (error) {
        console.error("Error fetching packages:", error);
        setError("Failed to load packages");
      }
    };

    fetchPackages();
  }, []);

  useEffect(() => {
    if (packages.length > 0) {
      const packageType = searchParams.get("plan");
      if (packageType) {
        const matchedPackage = packages.find((pkg) =>
          pkg.name.toLowerCase().includes(packageType.toLowerCase())
        );
        if (matchedPackage) {
          setFormData((prev) => ({
            ...prev,
            package: matchedPackage.id,
          }));
          setSelectedPackage(matchedPackage);
        }
      }
    }
  }, [packages, searchParams]);

  const toTitleCase = (str) => {
    if (!str) return "";
    return str
      .toLowerCase()
      .split(" ")
      .filter((word) => word.trim() !== "")
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === "email") {
      const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      setFormErrors((prev) => ({
        ...prev,
        email: emailValid ? "" : "Enter a valid email address",
      }));
    }
  };

  const handlePhoneChange = (value) => {
    setFormData((prevData) => ({
      ...prevData,
      phoneNumber: value,
    }));

    const isValid = value.length >= 10 && value.startsWith("91");
    setFormErrors((prev) => ({
      ...prev,
      phoneNumber: isValid ? "" : "Enter a valid phone number",
    }));
  };

  const handleSelectPackage = (pkg) => {
    setFormData((prev) => ({
      ...prev,
      package: pkg.id,
    }));
    setSelectedPackage(pkg);
    setShowDropdown(false);
  };

  const handlePayment = async () => {
    if (!selectedPackage) {
      setError("Please select a package");
      return;
    }

    setLoading(true);
    try {
      const amount = parseInt(selectedPackage.price) * 100;
      const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

      const options = {
        key: RAZORPAY_KEY,
        amount: amount,
        currency: "INR",
        name: formData.salonName,
        description: `Subscription - ${selectedPackage.name}`,
        image: "https://ifloriana.com/logo.png",
        handler: async (response) => {
          console.log("Payment Success:", response);

          try {
            await axios.post(`${API_URL}/auth/signup`, {
              full_name: toTitleCase(formData.full_name),
              phone_number: formData.phone_number,
              email: formData.email,
              address: formData.address,
              package_id: selectedPackage.id,
              salonDetails: {
                salon_name: toTitleCase(formData.salonDetails.salon_name),
              },
            });

            Swal.fire({
              icon: "success",
              title: "Payment Successful!",
              html: `Credentials have been sent to <strong>${formData.email}</strong>.`,
              confirmButtonColor: "#3085d6",
              confirmButtonText: "OK",
            }).then(() => {
              setFormData({
                full_name: "",
                phone_number: "",
                email: "",
                address: "",
                package_id: null,
                salonDetails: {
                  salon_name: "",
                },
              });
              setSelectedPackage(null);
              window.location.href = "https://admin.ifloriana.com/login";
            });
          } catch (error) {
            console.error("Error posting data:", error);
            setError("Failed to send signup details. Please contact support.");
          }
        },
        prefill: {
          name: formData.full_name,
          email: formData.email,
          contact: formData.phone_number,
        },
        theme: {
          color: "#3399cc",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Error:", error);
      setError("Something went wrong! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handlePayment();
  };

  return (
    <div>
      <div className="header-signup-form">
        <a href="https://www.ifloriana.com/" target="_blank" className="col">
          <img src="iFloriana-light-logo.png" alt="iFloriana-logo" />
        </a>
        <span>
          <a href="https://ifloriana.com/" target="_blanck">
            Home
          </a>
          <a href="https://ifloriana.com/index.php/pricing/" target="_blanck">
            Pricing
          </a>
          <a href="https://ifloriana.com/index.php/about-us/" target="_blanck">
            About us
          </a>
          <a
            href="https://ifloriana.com/index.php/contact-us/"
            target="_blanck"
          >
            Contact us
          </a>
        </span>
      </div>
      <div className="container form-container">
        <form
          onSubmit={handleSubmit}
          className="p-4 border-container rounded shadow"
        >
          <h3 className="text-center mb-5 ft-color">Signup your Salon</h3>
          <div className="mb-3">
            <label>Full Name</label>
            <input
              type="text"
              className="form-control input-field"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>
          <div className="mb-3">
            <label>Salon Name</label>
            <input
              type="text"
              className="form-control input-field"
              name="salon_name"
              value={formData.salonDetails.salon_name}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  salonDetails: {
                    ...prev.salonDetails,
                    salon_name: e.target.value,
                  },
                }))
              }
              placeholder="Enter your salon name"
              required
            />
          </div>
          <div className="row mb-3">
            <div className="col-md-6">
              <label>Phone Number</label>
              <PhoneInput
                country={"in"}
                value={formData.phone_number}
                onChange={(value) =>
                  setFormData((prevData) => ({
                    ...prevData,
                    phone_number: value,
                  }))
                }
                inputClass="form-control"
                containerClass="w-100"
                inputProps={{ name: "phone_number", required: true }}
              />
              {formErrors.phoneNumber && (
                <p className="text-danger mt-1">{formErrors.phoneNumber}</p>
              )}
            </div>
            <div className="col-md-6">
              <label>Email ID</label>
              <input
                type="email"
                className="form-control input-field"
                name="email"
                placeholder="example@gmail.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {formErrors.email && (
                <p className="text-danger mt-1">{formErrors.email}</p>
              )}
            </div>
          </div>
          <div className="mb-3">
            <label>Salon Address</label>
            <textarea
              className="form-control input-field"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              placeholder="Enter your salon address"
            ></textarea>
          </div>
          <div className="mb-3">
            <div
              onClick={() => setShowPackageCards(true)}
              style={{
                cursor: "pointer",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "5px",
              }}
            >
              {selectedPackage ? selectedPackage.name : "Select Package"}
            </div>

            {showPackageCards && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    onClick={() => handleSelectPackage(pkg)}
                    className="card mt-3"
                    style={{ cursor: "pointer", width: "25rem" }}
                  >
                    <div className="card shadow-sm">
                      <div className="card-body">
                        <div className="card-header mb-3">
                          <h5 className="card-title">{pkg.name}</h5>
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
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <p className="text-danger text-center">{error}</p>}

          <button
            type="submit"
            className="btn submit-button w-100"
            disabled={loading}
          >
            {loading
              ? "Processing..."
              : `Subscribe & Pay ₹${
                  selectedPackage ? selectedPackage.price : "0"
                }`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubscriptionForm;
