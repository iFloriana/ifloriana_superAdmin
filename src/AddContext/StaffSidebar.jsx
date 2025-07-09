import { useEffect, useState } from "react";
import Select from "react-select";
import "./context.css";
import defaultImage from "../../public/default.png";
import imageCompression from "browser-image-compression";
import axios from "axios";
import { toast } from "react-toastify";
import "react-phone-input-2/lib/style.css";
import PhoneInput from "react-phone-input-2";

const StaffSidebar = ({ show, onClose, staffToEdit, onSaveSuccess }) => {
  const [photo, setPhoto] = useState(null);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [gender, setGender] = useState("male");
  const [selectedServices, setSelectedServices] = useState([]);
  const [status, setStatus] = useState("active");
  const [fullName, setFullName] = useState("");
  const [showInCalendar, setShowInCalendar] = useState(true);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [services, setServices] = useState([]);
  const [allServiceOptions, setAllServiceOptions] = useState([]);
  const [shiftStart, setShiftStart] = useState("");
  const [shiftEnd, setShiftEnd] = useState("");
  const [lunchDuration, setLunchDuration] = useState("");
  const [lunchTiming, setLunchTiming] = useState("");
  const [loading, setLoading] = useState(false);
  const [commissions, setCommissions] = useState([]);
  const [selectedCommission, setSelectedCommission] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const salonId = localStorage.getItem("salon_id");

  useEffect(() => {
    if (show) {
      if (!staffToEdit) {
        resetForm();
      } else {
        setPhoto(staffToEdit.image || null);
        setFullName(staffToEdit.full_name || "");
        setPhone(staffToEdit.phone_number || "");
        setEmail(staffToEdit.email || "");
        setGender(staffToEdit.gender || "male");
        setShowInCalendar(staffToEdit.show_in_calendar || true);
        setStatus(staffToEdit.status === 1 ? "active" : "inactive");
        setShiftStart(staffToEdit.assign_time?.start_shift || "");
        setShiftEnd(staffToEdit.assign_time?.end_shift || "");
        setLunchDuration(staffToEdit.lunch_time?.duration || "");
        setLunchTiming(staffToEdit.lunch_time?.timing || "");
        setPassword("");
        setConfirmPassword("");

        if (staffToEdit.branch_id) {
          setSelectedBranch(staffToEdit.branch_id._id);
        } else {
          setSelectedBranch(null);
        }

        if (staffToEdit.service_id && Array.isArray(staffToEdit.service_id)) {
          setSelectedServices(
            staffToEdit.service_id.map((service) => ({
              label: service.name,
              value: service._id,
            }))
          );
        } else {
          setSelectedServices([]);
        }
        if (staffToEdit.assigned_commission_id) {
          setSelectedCommission(staffToEdit.assigned_commission_id);
        } else {
          setSelectedCommission(null);
        }
      }

      axios
        .get(`${API_URL}/services?salon_id=${salonId}`)
        .then((res) => {
          const fetchedServiceOptions = res.data.data
            .filter((s) => s.status === 1)
            .map((s) => ({
              label: s.name,
              value: s._id,
            }));
          setAllServiceOptions(fetchedServiceOptions);
          setServices([
            { label: "All", value: "all" },
            ...fetchedServiceOptions,
          ]);
        })
        .catch((err) => console.error("Error fetching services:", err));

      axios
        .get(`${API_URL}/branches?salon_id=${salonId}`)
        .then((res) => {
          const activeBranches = res.data.data.filter((b) => b.status === 1);
          setBranches(activeBranches);
        })
        .catch((err) => console.error("Error fetching branches:", err));

      axios
        .get(`${API_URL}/revenue-commissions?salon_id=${salonId}`)
        .then((res) => {
          const fetchedCommissions = res.data.data.map((commission) => ({
            label: commission.commission_name,
            value: commission._id,
          }));
          setCommissions(fetchedCommissions);
        })
        .catch((err) => console.error("Error fetching commissions:", err));
    }
  }, [show, staffToEdit, API_URL]);

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
    if (!staffToEdit && value.length < 8) {
      setPasswordError("Password must be at least 8 characters");
    } else {
      setPasswordError("");
    }

    if (confirmPassword && value !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
    } else if (value === confirmPassword) {
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

  const handleServiceChange = (selectedOptions) => {
    const allOptionSelected = selectedOptions.some(
      (option) => option.value === "all"
    );

    if (allOptionSelected) {
      setSelectedServices(allServiceOptions);
    } else {
      setSelectedServices(selectedOptions);
    }
  };

  const resetForm = () => {
    setPhoto(null);
    setPhone("");
    setEmail("");
    setPhoneError("");
    setEmailError("");
    setPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setConfirmPasswordError("");
    setGender("male");
    setSelectedServices([]);
    setStatus("active");
    setFullName("");
    setShowInCalendar(true);
    setSelectedBranch(null);
    setSelectedCommission(null);
    setShiftStart("");
    setShiftEnd("");
    setLunchDuration("");
    setLunchTiming("");
  };

  const toTitleCase = (str) => {
    return str
      .toLowerCase()
      .split(" ")
      .filter((word) => word.trim() !== "")
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (
      !fullName ||
      !email ||
      !phone ||
      !selectedBranch ||
      selectedServices.length === 0 ||
      !shiftStart ||
      !shiftEnd ||
      !lunchDuration ||
      !lunchTiming ||
      !selectedCommission
    ) {
      toast.error("Please fill all required fields.");
      setLoading(false);
      return;
    }
    if (!staffToEdit) {
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

    if (phoneError || emailError) {
      toast.error("Please correct the errors in the form.");
      setLoading(false);
      return;
    }

    const payload = {
      full_name: toTitleCase(fullName),
      email: email,
      phone_number: phone.replace(/\D/g, ""),
      gender: gender,
      image: photo,
      branch_id: selectedBranch,
      service_id: selectedServices.map((s) => s.value),
      assign_time: {
        start_shift: shiftStart,
        end_shift: shiftEnd,
      },
      lunch_time: {
        duration: Number(lunchDuration),
        timing: lunchTiming,
      },
      status: status === "active" ? 1 : 0,
      show_in_calendar: showInCalendar,
      assigned_commission_id: selectedCommission,
      salon_id: salonId,
    };
    if (!staffToEdit || password) {
      payload.password = password;
      payload.confirm_password = confirmPassword;
    }

    try {
      let response;
      if (staffToEdit) {
        response = await axios.put(
          `${API_URL}/staffs/${staffToEdit._id}`,
          payload
        );
        toast.success(response.data.message || "Staff updated successfully!");
      } else {
        response = await axios.post(`${API_URL}/staffs`, payload);
        toast.success(response.data.message || "Staff added successfully!");
      }
      resetForm();
      onClose();
      if (onSaveSuccess) {
        onSaveSuccess();
      }
    } catch (error) {
      console.error("Error saving staff:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to save staff. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const selectStyles = {
    control: (base) => ({
      ...base,
      backgroundColor: "#212529",
      color: "#fff",
      borderColor: "#333",
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

  if (!show) return null;

  return (
    <>
      <div className="overlay-blur" onClick={onClose}></div>
      <div className={`sidebar-div ${show ? "show" : ""}`}>
        <div className="bg-dark p-4 text-white h-100 overflow-auto">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="sidebar-title">
              {staffToEdit ? "Edit Staff" : "Add New Staff"}
            </h5>
            <button className="btn btn-outline-danger" onClick={onClose}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          <hr />
          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
              <div className="col-md-8">
                <div className="mb-3">
                  <label className="form-label">
                    Full Name <span className="text-danger">*</span>
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
                <label className="form-label mt-3">
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
                  inputProps={{
                    required: true,
                  }}
                />
                {phoneError && (
                  <div className="text-danger mt-1">{phoneError}</div>
                )}
              </div>
              <div className="col-md-4 d-flex align-items-center justify-content-center">
                <div className="text-center mb-4">
                  <img
                    src={photo || defaultImage}
                    alt="Preview"
                    className="rounded-circle"
                    style={{
                      width: "130px",
                      height: "130px",
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
              </div>
            </div>
            {!staffToEdit && (
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
                    required={!staffToEdit}
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
                    required={!staffToEdit}
                    value={confirmPassword}
                    onChange={(e) => validateConfirmPassword(e.target.value)}
                  />
                  {confirmPasswordError && (
                    <div className="text-danger ">{confirmPasswordError}</div>
                  )}
                </div>
              </div>
            )}

            <div className="row mb-3">
              <div className="col-md-6">
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
              <div className="col-md-6 d-flex align-items-center">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input custom-check"
                    id="showincalender"
                    checked={showInCalendar}
                    onChange={(e) => setShowInCalendar(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="showincalender">
                    Show in Calendar
                  </label>
                </div>
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">
                Select Branch <span className="text-danger">*</span>
              </label>
              <select
                className="form-select bg-dark text-white"
                value={selectedBranch || ""}
                onChange={(e) => setSelectedBranch(e.target.value)}
                required
              >
                <option hidden>Select Branch</option>
                {branches.map((branch) => (
                  <option key={branch._id} value={branch._id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">
                Select Services <span className="text-danger">*</span>
              </label>
              <Select
                options={services}
                isMulti
                value={selectedServices}
                onChange={handleServiceChange}
                styles={selectStyles}
                required
              />
            </div>
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">
                  Shift Start Time <span className="text-danger">*</span>
                </label>
                <input
                  type="time"
                  className="form-control bg-dark text-white mb-2"
                  value={shiftStart}
                  onChange={(e) => setShiftStart(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">
                  Shift End Time <span className="text-danger">*</span>
                </label>
                <input
                  type="time"
                  className="form-control bg-dark text-white mb-2"
                  value={shiftEnd}
                  onChange={(e) => setShiftEnd(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">
                Select Commission <span className="text-danger">*</span>
              </label>
              <select
                className="form-select bg-dark text-white"
                value={selectedCommission || ""}
                onChange={(e) => setSelectedCommission(e.target.value)}
                required
              >
                <option hidden>Select Commission</option>
                {commissions.map((commission) => (
                  <option key={commission.value} value={commission.value}>
                    {commission.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">
                  Lunch Duration
                  <small> (min)</small> <span className="text-danger">*</span>
                </label>
                <input
                  required
                  type="number"
                  className="form-control bg-dark text-white"
                  value={lunchDuration}
                  onChange={(e) => setLunchDuration(e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">
                  Lunch Time <span className="text-danger">*</span>
                </label>
                <input
                  required
                  type="time"
                  className="form-control bg-dark text-white"
                  value={lunchTiming}
                  onChange={(e) => setLunchTiming(e.target.value)}
                />
              </div>
            </div>
            <div className="mb-4">
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
                  {staffToEdit ? "Updating..." : "Adding..."}
                </>
              ) : (
                <>
                  <i className="bi bi-floppy me-2"></i>
                  {staffToEdit ? "Update Staff" : "Add Staff"}
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

export default StaffSidebar;
