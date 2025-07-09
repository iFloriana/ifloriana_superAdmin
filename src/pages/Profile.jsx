import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "./pages.css";
import AppointmentSidebar from "../AddContext/AppointmentSidebar";
import axios from "axios";
import defaultImage from "../../public/default.png";
import PhoneInput from "react-phone-input-2";

const Profile = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(null);
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [activeTab, setActiveTab] = useState("salon");
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [oldPasswordMatchError, setOldPasswordMatchError] = useState("");

  const navigate = useNavigate();
  const toggleForm = () => setShowForm((prev) => !prev);

  const API_BASE = import.meta.env.VITE_API_URL;
  const adminId = localStorage.getItem("admin_id");

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/${adminId}`);
      setFormData(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load profile");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [adminId, API_BASE]);

  const handleUpdatePassword = async () => {
    setOldPasswordMatchError("");
    setNewPasswordError("");
    setConfirmPasswordError("");

    if (newPassword.length < 8) {
      setNewPasswordError("New password must be at least 8 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      setConfirmPasswordError("New passwords do not match");
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      toast.error("Authentication token not found. Please log in again.");
      return;
    }

    try {
      const res = await axios.post(
        `${API_BASE}/auth/reset-password-with-old`,
        {
          email: email,
          old_password: oldPassword,
          new_password: newPassword,
          confirm_password: confirmPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(res.data.message);
      setEmail("");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setEmailError("");
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Something went wrong during password update."
      );
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "salon_name") {
      setFormData((prev) => ({
        ...prev,
        salonDetails: {
          ...prev.salonDetails,
          [name]: value,
        },
      }));
    } else if (name === "full_name" || name === "address") {
      setFormData((prev) => ({
        ...prev,
        admin: {
          ...prev.admin,
          [name]: value,
        },
      }));
    } else if (name === "email") {
      setFormData((prev) => ({
        ...prev,
        admin: {
          ...prev.admin,
          email: value,
        },
      }));
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(value)) {
        setEmailError("Enter a valid email address");
      } else {
        setEmailError("");
      }
    }
  };

  const handleUpdate = async () => {
    if (phoneError || emailError) {
      toast.error("Please correct the errors in the form before updating.");
      return;
    }

    const token = localStorage.getItem("authToken");

    try {
      const requestBody = {
        full_name: formData.admin.full_name,
        phone_number: formData.admin.phone_number,
        email: formData.admin.email,
        address: formData.admin.address,
        salonDetails: {
          salon_name: formData.salonDetails?.salon_name || "",
          image: formData.salonDetails?.image || "",
        },
      };

      await axios.put(`${API_BASE}/auth/update-admin/${adminId}`, requestBody, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      toast.success("Profile updated successfully!");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      console.error("Update failed:", error);
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        salonDetails: {
          ...prev.salonDetails,
          image: reader.result,
        },
      }));
    };
    reader.readAsDataURL(file);
  };

  if (!formData) return <p className="text-white">Loading...</p>;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center top-div">
        <p className="title">My Profile</p>
        <button className="btn apt-btn" onClick={toggleForm}>
          <i className="bi bi-plus-circle me-2"></i>Appointment
        </button>
        <AppointmentSidebar show={showForm} onClose={toggleForm} />
      </div>
      <div className="row inner-div rounded p-2 gap-5">
        <div className="col-md-2 bg-dark rounded text-white p-3">
          <div
            className={`sidebar-item-setting p-2 rounded ${
              activeTab === "salon" ? "active" : ""
            }`}
            onClick={() => setActiveTab("salon")}
          >
            <i className="bi bi-person-fill me-2 icon-blue"></i>
            <span>Personal information</span>
          </div>
          <hr />
          <div
            className={`sidebar-item-setting p-2 rounded ${
              activeTab === "password" ? "active" : ""
            }`}
            onClick={() => setActiveTab("password")}
          >
            <i className="bi bi-lock-fill me-2 icon-crayon"></i>
            <span>Change Password</span>
          </div>
        </div>
        <div className="col-md-9 bg-dark rounded text-white p-3">
          {activeTab === "salon" ? (
            <div className="container">
              <h5 className="mb-4">
                <i className="bi bi-person-fill me-2 icon-blue"></i>Personal
                Information
              </h5>
              <form className="my-2">
                <div className="row">
                  <div className="col-md-4">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      name="full_name"
                      className="form-control bg-dark text-white mb-3"
                      value={formData.admin.full_name || ""}
                      onChange={handleChange}
                    />
                    <label className="form-label">Contact Number</label>
                    <PhoneInput
                      country={"in"}
                      value={formData.admin.phone_number || ""}
                      onChange={(value) => {
                        setFormData((prev) => ({
                          ...prev,
                          admin: {
                            ...prev.admin,
                            phone_number: value,
                          },
                        }));

                        const plainNumber = value.replace(/\D/g, "");
                        if (plainNumber.length < 10) {
                          setPhoneError("Enter a valid phone number");
                        } else {
                          setPhoneError("");
                        }
                      }}
                      inputStyle={{
                        width: "100%",
                        backgroundColor: "#1e1e1e",
                        color: "white",
                      }}
                      containerStyle={{ width: "100%" }}
                    />
                    {phoneError && (
                      <small className="text-danger">{phoneError}</small>
                    )}
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">Salon Name</label>
                    <input
                      type="text"
                      name="salon_name"
                      className="form-control bg-dark text-white mb-3"
                      value={formData.salonDetails?.salon_name || ""}
                      onChange={handleChange}
                    />
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control bg-dark text-white"
                      value={formData.admin.email || ""}
                      onChange={handleChange}
                    />
                    {emailError && (
                      <small className="text-danger">{emailError}</small>
                    )}
                  </div>
                  <div className="col-md-4 text-center">
                    <img
                      src={formData.salonDetails?.image || defaultImage}
                      alt="Preview"
                      className="rounded-circle object-fit-cover"
                      style={{
                        width: "130px",
                        height: "130px",
                      }}
                    />
                    <div className="d-flex justify-content-center mt-3 gap-2">
                      <label className="btn btn-info btn-sm text-white mb-0">
                        Upload
                        <input
                          type="file"
                          accept="image/png, image/jpeg"
                          hidden
                          onChange={handleImageChange}
                        />
                      </label>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            salonDetails: {
                              ...prev.salonDetails,
                              image: "",
                            },
                          }))
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
                <div className="row mb-2">
                  <div className="col-md-8">
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      name="address"
                      className="form-control bg-dark text-white mb-5"
                      value={formData.admin.address || ""}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  className="btn apt-btn mt-2"
                  onClick={handleUpdate}
                >
                  Update Profile
                </button>
              </form>
            </div>
          ) : (
            <div className="container">
              <h5 className="mb-4">
                <i className="bi bi-lock-fill me-2 icon-crayon"></i>Change
                Password
              </h5>
              <div className="my-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control bg-dark text-white w-50"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    const emailRegex =
                      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                    if (!emailRegex.test(e.target.value)) {
                      setEmailError("Enter a valid email address");
                    } else {
                      setEmailError("");
                    }
                  }}
                />
                {emailError && (
                  <small className="text-danger">{emailError}</small>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label">Old Password</label>
                <input
                  type="password"
                  className="form-control bg-dark text-white w-50"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
                {oldPasswordMatchError && (
                  <small className="text-danger">{oldPasswordMatchError}</small>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-control bg-dark text-white w-50"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (
                      e.target.value.length < 8 &&
                      e.target.value.length > 0
                    ) {
                      setNewPasswordError(
                        "Password must be at least 8 characters long"
                      );
                    } else {
                      setNewPasswordError("");
                    }
                  }}
                />
                {newPasswordError && (
                  <small className="text-danger">{newPasswordError}</small>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-control bg-dark text-white w-50"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (
                      newPassword !== e.target.value &&
                      e.target.value.length > 0
                    ) {
                      setConfirmPasswordError("New passwords do not match");
                    } else {
                      setConfirmPasswordError("");
                    }
                  }}
                />
                {confirmPasswordError && (
                  <small className="text-danger">{confirmPasswordError}</small>
                )}
              </div>
              <button
                className="btn apt-btn me-3"
                onClick={handleUpdatePassword}
              >
                Update Password
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;
