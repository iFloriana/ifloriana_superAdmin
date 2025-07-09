import React, { useEffect, useState } from "react";
import "./context.css";
import Select from "react-select";
import defaultImage from "../../public/default.png";
import imageCompression from "browser-image-compression";
import "react-phone-input-2/lib/style.css";
import PhoneInput from "react-phone-input-2";
import axios from "axios";
import { toast } from "react-toastify";

const ManagerSidebar = ({ show, onClose, managerToEdit, onSaveSuccess }) => {
  const [photo, setPhoto] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [gender, setGender] = useState("male");
  const [branches, setBranches] = useState([]);
  const [selectedBranches, setSelectedBranches] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;
  const salonId = localStorage.getItem("salon_id");

  useEffect(() => {
    if (show) {
      if (managerToEdit) {
        setPhoto(managerToEdit.image || null);
        setFirstName(managerToEdit.first_name || "");
        setLastName(managerToEdit.last_name || "");
        setPhone(managerToEdit.contact_number || "");
        setEmail(managerToEdit.email || "");
        setGender(managerToEdit.gender || "male");
        if (managerToEdit.branch_id) {
          if (Array.isArray(managerToEdit.branch_id)) {
            if (managerToEdit.branch_id.length > 0) {
              setSelectedBranches({
                label: managerToEdit.branch_id[0].name,
                value: managerToEdit.branch_id[0]._id,
              });
            } else {
              setSelectedBranches(null);
            }
          } else {
            setSelectedBranches({
              label: managerToEdit.branch_id.name,
              value: managerToEdit.branch_id._id,
            });
          }
        } else {
          setSelectedBranches(null);
        }

        setPassword("");
        setConfirmPassword("");
      } else {
        resetForm();
      }

      axios
        .get(`${API_URL}/branches?salon_id=${salonId}`)
        .then((res) => {
          const options = res.data.data
            .filter((branch) => branch.status === 1)
            .map((branch) => ({
              label: branch.name,
              value: branch._id,
            }));
          setBranches(options);
        })
        .catch((err) => console.error("Error fetching branches:", err));
    }
  }, [show, managerToEdit, API_URL, salonId]);

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

  const validateEmail = (value) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(value)) {
      setEmailError("Enter a valid email address");
    } else {
      setEmailError("");
    }
    setEmail(value);
  };

  const validatePassword = (value) => {
    setPassword(value);
    if (!managerToEdit && value.length < 8) {
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

  const resetForm = () => {
    setPhoto(null);
    setFirstName("");
    setLastName("");
    setPhone("");
    setEmail("");
    setPhoneError("");
    setEmailError("");
    setPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setConfirmPasswordError("");
    setGender("male");
    setSelectedBranches(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!firstName || !lastName || !email || !phone || !selectedBranches) {
      toast.error("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    if (!managerToEdit) {
      if (!password || !confirmPassword) {
        toast.error("Please enter and confirm password.");
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        toast.error("Passwords do not match.");
        setLoading(false);
        return;
      }
      if (passwordError || confirmPasswordError) {
        toast.error("Please correct password errors.");
        setLoading(false);
        return;
      }
    }

    if (emailError || phoneError) {
      toast.error("Please correct the errors in the form.");
      setLoading(false);
      return;
    }

    const payload = {
      first_name: toTitleCase(firstName),
      last_name: toTitleCase(lastName),
      email: email,
      contact_number: phone.replace(/\D/g, ""),
      gender: gender,
      branch_id: selectedBranches ? selectedBranches.value : null,
      salon_id: salonId,
    };

    if (photo) {
      payload.image = photo;
    }

    if (!managerToEdit || password) {
      payload.password = password;
      payload.confirm_password = confirmPassword;
    }

    try {
      let response;
      if (managerToEdit) {
        response = await axios.put(
          `${API_URL}/managers/${managerToEdit._id}`,
          payload
        );
        toast.success(response.data.message || "Manager updated successfully!");
      } else {
        response = await axios.post(`${API_URL}/managers`, payload);
        toast.success(response.data.message || "Manager added successfully!");
      }
      resetForm();
      onClose();
      if (onSaveSuccess) {
        onSaveSuccess();
      }
    } catch (error) {
      console.error("Error saving manager:", error);
      toast.error(error.response?.data?.message || "Failed to save manager.");
    } finally {
      setLoading(false);
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

  return (
    <>
      <div className="overlay-blur" onClick={onClose}></div>
      <div className={`sidebar-div ${show ? "show" : ""}`}>
        <div className="p-4 bg-dark text-white h-100 overflow-auto">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="sidebar-title">
              {managerToEdit ? "Edit Manager" : "Add New Manager"}
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
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">
                  First Name<span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control bg-dark text-white"
                  placeholder="Enter First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">
                  Last Name<span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control bg-dark text-white"
                  placeholder="Enter Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">
                Email <span className="text-danger">*</span>
              </label>
              <input
                required
                type="email"
                className="form-control bg-dark text-white"
                placeholder="Enter Email"
                value={email}
                onChange={(e) => validateEmail(e.target.value)}
              />
              {emailError && (
                <div className="text-danger mt-1">{emailError}</div>
              )}
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
            {!managerToEdit && (
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">
                    Password <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    className="form-control bg-dark text-white"
                    placeholder="Enter Password"
                    value={password}
                    onChange={(e) => validatePassword(e.target.value)}
                    required
                  />
                  {passwordError && (
                    <div className="text-danger mt-1">{passwordError}</div>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label">
                    Confirm Password <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    className="form-control bg-dark text-white"
                    placeholder="Confirm Password"
                    required
                    value={confirmPassword}
                    onChange={(e) => validateConfirmPassword(e.target.value)}
                  />
                  {confirmPasswordError && (
                    <div className="text-danger ">{confirmPasswordError}</div>
                  )}
                </div>
              </div>
            )}

            <div className="mb-3">
              <label className="form-label">
                Branch(es) <span className="text-danger">*</span>
              </label>
              <Select
                required
                options={branches}
                className="text-dark"
                value={selectedBranches}
                onChange={setSelectedBranches}
                isMulti={false}
                styles={{
                  control: (base) => ({
                    ...base,
                    backgroundColor: "#212529",
                    borderColor: "#333",
                    color: "#fff",
                  }),
                  singleValue: (base) => ({
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
                    backgroundColor:
                      state.isFocused || state.isSelected ? "#8f6b55" : "#000",
                    color: "#fff",
                    cursor: "pointer",
                  }),
                  placeholder: (base) => ({
                    ...base,
                    color: "#ccc",
                  }),
                }}
              />
            </div>
            <div className="mb-4">
              <label className="form-label d-block">Gender</label>
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
            <button
              type="submit"
              className="btn page-btn me-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  ></span>{" "}
                  {managerToEdit ? "Updating..." : "Adding..."}
                </>
              ) : (
                <>
                  <i className="bi bi-floppy me-2"></i>
                  {managerToEdit ? "Update Manager" : "Add Manager"}
                </>
              )}
            </button>
            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={onClose}
              disabled={loading}
            >
              <i className="bi bi-x-lg me-2"></i>Cancel
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ManagerSidebar;
