import React, { useEffect, useState } from "react";
import "./context.css";
import defaultImage from "../../public/default.png";
import imageCompression from "browser-image-compression";
import "react-phone-input-2/lib/style.css";
import PhoneInput from "react-phone-input-2";
import axios from "axios";
import { toast } from "react-toastify";
import Select from "react-select"; // Import react-select

const CustomerSidebar = ({
  show,
  onClose,
  editData = null,
  prefillName = "",
  onCustomerCreated = null,
}) => {
  const [photo, setPhoto] = useState(null);
  const [status, setStatus] = useState("active");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [gender, setGender] = useState("male");
  const [memberships, setMemberships] = useState([]);
  const [packages, setPackages] = useState([]);
  const [selectedMembership, setSelectedMembership] = useState("");
  const [selectedPackage, setSelectedPackage] = useState([]);
  const [assignMembership, setAssignMembership] = useState(false);

  const salonId = localStorage.getItem("salon_id");
  const API_URL = import.meta.env.VITE_API_URL;

  const resetForm = () => {
    setPhoto(null);
    setStatus("active");
    setFullName("");
    setPhone("");
    setEmail("");
    setPhoneError("");
    setPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setConfirmPasswordError("");
    setGender("male");
    setSelectedMembership("");
    setSelectedPackage([]);
    setAssignMembership(false);
  };

  useEffect(() => {
    if (show && editData) {
      setPhoto(editData.image || null);
      setFullName(editData.full_name || "");
      setPhone(editData.phone_number || "");
      setEmail(editData.email || "");
      setGender(editData.gender || "male");
      setStatus(editData.status === 1 ? "active" : "inactive");

      const hasMembership =
        editData.branch_membership && editData.branch_membership._id;
      const hasPackage =
        Array.isArray(editData.branch_package) &&
        editData.branch_package.length > 0;

      if (hasMembership || hasPackage) {
        setAssignMembership(true);
        setSelectedMembership(
          hasMembership ? editData.branch_membership._id : ""
        );
        // Map existing packages to the format react-select expects { value: id, label: name }
        setSelectedPackage(
          hasPackage
            ? editData.branch_package.map((p) => ({
                value: p._id,
                label: p.package_name,
              }))
            : []
        );
      } else {
        setAssignMembership(false);
        setSelectedMembership("");
        setSelectedPackage([]);
      }
    } else if (show && !editData) {
      resetForm();
      if (prefillName) {
        setFullName(prefillName);
      }
    }
  }, [show, editData]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSizeKB = 150;
    const allowedTypes = ["image/jpeg", "image/png"];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG and PNG files are allowed.");
      return;
    }

    const fileSizeKB = file.size / 1024;
    if (fileSizeKB > maxSizeKB) {
      toast.error("Image too large. Maximum size is 150KB.");
      return;
    }

    try {
      const options = {
        maxSizeMB: 0.2,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result);
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error("Compression failed:", error);
      toast.error("Image compression failed.");
    }
  };

  const removePhoto = () => {
    setPhoto(null);
  };

  const validatePhone = (value) => {
    setPhone(value);
    const plainNumber = value.replace(/\D/g, "");
    if (plainNumber.length < 10) {
      setPhoneError("Enter a valid phone number");
    } else {
      setPhoneError("");
    }
  };

  const validatePassword = (value) => {
    setPassword(value);
    if (value.length < 8) {
      setPasswordError("Password must be at least 8 characters");
    } else {
      setPasswordError("");
    }

    if (confirmPassword && value !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError("");
    }
  };

  const validateConfirmPassword = (value) => {
    setConfirmPassword(value);
    if (value !== password) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError("");
    }
  };

  useEffect(() => {
    const fetchMembershipsAndPackages = async () => {
      try {
        const [membershipRes, packageRes] = await Promise.all([
          axios.get(`${API_URL}/branch-memberships?salon_id=${salonId}`),
          axios.get(`${API_URL}/branchPackages?salon_id=${salonId}`),
        ]);

        setMemberships(membershipRes.data.data || []);
        setPackages(packageRes.data.data || []);
      } catch (err) {
        toast.error("Failed to fetch memberships or packages");
        console.error(err);
      }
    };

    if (show) {
      fetchMembershipsAndPackages();
    }
  }, [show, salonId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      return;
    }

    const payload = {
      image: photo,
      full_name: toTitleCase(fullName),
      email: email,
      phone_number: phone,
      gender: gender,
      salon_id: salonId,
      status: status === "active" ? 1 : 0,
    };

    if (assignMembership) {
      payload.branch_membership = selectedMembership || undefined;
      payload.branch_package =
        selectedPackage.length > 0
          ? selectedPackage.map((p) => p.value)
          : undefined;
    }

    if (!editData) {
      payload.password = password;
      payload.confirm_password = confirmPassword;
    }

    try {
      if (editData) {
        await axios.put(`${API_URL}/customers/${editData._id}`, payload);
        toast.success("Customer updated successfully!");
      } else {
        const res = await axios.post(`${API_URL}/customers`, payload);
        toast.success("Customer created successfully!");
        if (res.data?.data && typeof onCustomerCreated === "function") {
          onCustomerCreated(res.data.data);
        }
        resetForm();
      }
      onClose();
    } catch (error) {
      console.error("Error saving customer:", error);
      toast.error(`Failed to ${editData ? "update" : "create"} customer.`);
    }
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

  const packageOptions = packages.map((p) => ({
    value: p._id,
    label: p.package_name,
  }));

  const custonStyle = {
    control: (base) => ({
      ...base,
      backgroundColor: "#212529",
      color: "#fff",
      borderColor: "#333",
    }),
    singleValue: (base) => ({
      ...base,
      color: "#fff",
    }),
    input: (base) => ({
      ...base,
      color: "#fff",
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "#000",
      color: "#fff",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused || state.isSelected ? "#8f6b55" : "#000",
      color: "#fff",
      cursor: "pointer",
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "#8f6b55",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "#fff",
    }),
    placeholder: (base) => ({
      ...base,
      color: "#ccc",
    }),
  };

  return (
    <>
      <div className="overlay-blur" onClick={onClose}></div>
      <div className={`sidebar-div ${show ? "show" : ""}`}>
        <div className="p-4 bg-dark text-white h-100 overflow-auto">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="sidebar-title">
              {editData ? "Update Customer" : "Add New Customer"}
            </h5>
            <button className="btn btn-outline-danger" onClick={onClose}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          <hr />
          <form onSubmit={handleSubmit}>
            <div className="text-center mb-4">
              <img
                src={photo || defaultImage}
                alt="Preview"
                className="rounded-circle"
                style={{
                  width: "120px",
                  height: "120px",
                  objectFit: "cover",
                }}
              />
              <div className="d-flex justify-content-center mt-3 gap-2">
                <label className="btn btn-info btn-sm text-white mb-0">
                  Upload
                  <input
                    type="file"
                    accept="image/png, image/jpeg"
                    onChange={handleUpload}
                    hidden
                  />
                </label>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={removePhoto}
                >
                  Remove
                </button>
              </div>
            </div>
            <div className=" mb-3">
              <label className="form-label">
                Full Name<span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control bg-dark text-white"
                placeholder="Enter Full Name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control bg-dark text-white"
                placeholder="Enter Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">
                Phone Number <span className="text-danger">*</span>
              </label>
              <PhoneInput
                country={"in"}
                value={phone}
                onChange={validatePhone}
                inputStyle={{
                  width: "100%",
                  backgroundColor: "#1e1e1e",
                  color: "white",
                }}
                containerStyle={{ width: "100%" }}
              />
              {phoneError && (
                <div className="text-danger mt-1">{phoneError}</div>
              )}
            </div>
            {!editData && (
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control bg-dark text-white"
                    placeholder="Enter Password"
                    value={password}
                    onChange={(e) => validatePassword(e.target.value)}
                  />
                  {passwordError && (
                    <div className="text-danger mt-1">{passwordError}</div>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    className="form-control bg-dark text-white"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => validateConfirmPassword(e.target.value)}
                  />
                  {confirmPassword && (
                    <div className="text-danger ">{confirmPasswordError}</div>
                  )}
                </div>
              </div>
            )}
            <div className="mb-2">
              <label className="form-label d-block">
                Gender <span className="text-danger">*</span>
              </label>
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input custom-radio"
                  type="radio"
                  name="gender"
                  id="male"
                  value="male"
                  checked={gender === "male"}
                  onChange={(e) => setGender(e.target.value)}
                />
                <label className="form-check-label" htmlFor="male">
                  Male
                </label>
              </div>
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input custom-radio"
                  type="radio"
                  name="gender"
                  id="female"
                  value="female"
                  checked={gender === "female"}
                  onChange={(e) => setGender(e.target.value)}
                />
                <label className="form-check-label" htmlFor="female">
                  Female
                </label>
              </div>
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input custom-radio"
                  type="radio"
                  name="gender"
                  id="other"
                  value="other"
                  checked={gender === "other"}
                  onChange={(e) => setGender(e.target.value)}
                />
                <label className="form-check-label" htmlFor="other">
                  Other
                </label>
              </div>
            </div>
            <hr />
            <div className="mb-3">
              <label className="form-label d-block">
                Want to Assign Membership or Package?
              </label>
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  name="assignMembership"
                  id="assignYes"
                  value="yes"
                  checked={assignMembership}
                  onChange={() => setAssignMembership(true)}
                />
                <label className="form-check-label" htmlFor="assignYes">
                  Yes
                </label>
              </div>
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  name="assignMembership"
                  id="assignNo"
                  value="no"
                  checked={!assignMembership}
                  onChange={() => setAssignMembership(false)}
                />
                <label className="form-check-label" htmlFor="assignNo">
                  No
                </label>
              </div>
            </div>
            {assignMembership && (
              <>
                <div className="mb-3">
                  <label className="form-label">Assign Membership</label>
                  <select
                    className="form-select bg-dark text-white"
                    value={selectedMembership}
                    onChange={(e) => setSelectedMembership(e.target.value)}
                  >
                    <option value="">-- No Membership --</option>
                    {memberships.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.membership_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Assign Package</label>
                  <Select
                    isMulti
                    name="packages"
                    options={packageOptions}
                    classNamePrefix="react-select"
                    value={selectedPackage}
                    onChange={(selectedOptions) =>
                      setSelectedPackage(selectedOptions || [])
                    }
                    placeholder="-- Select Package(s) --"
                    styles={custonStyle}
                  />
                </div>
              </>
            )}
            <hr />
            <div className="mb-5">
              <label className="form-label d-block">
                Status <span className="text-danger">*</span>
              </label>
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
              {editData ? "Update Customer" : "Add Customer"}
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

export default CustomerSidebar;
