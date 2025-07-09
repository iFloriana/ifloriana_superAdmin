import { useState, useEffect } from "react";
import Select from "react-select";
import axios from "axios";
import "./context.css";
import defaultImage from "../../public/default.png";
import imageCompression from "browser-image-compression";
import { toast } from "react-toastify";
import "react-phone-input-2/lib/style.css";
import PhoneInput from "react-phone-input-2";

const BranchSidebar = ({
  show,
  onClose,
  editBranchData,
  onBranchAddedOrUpdated,
}) => {
  const [photo, setPhoto] = useState(null);
  const [branchName, setBranchName] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState([
    "cash",
    "upi",
  ]);
  const [serviceOptions, setServiceOptions] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [status, setStatus] = useState("active");

  const API_URL = import.meta.env.VITE_API_URL;
  const salonId = localStorage.getItem("salon_id");

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

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get(`${API_URL}/services?salon_id=${salonId}`);
        const activeServices = res.data.data.filter(
          (service) => service.status === 1
        );
        setServiceOptions([
          { value: "__all__", label: "Select All" },
          ...activeServices.map((service) => ({
            value: service._id,
            label: service.name,
          })),
        ]);
      } catch (err) {
        toast.error("Failed to load services");
      }
    };
    fetchServices();
  }, [API_URL]);

  useEffect(() => {
    if (editBranchData) {
      setIsEditMode(true);
      setBranchName(editBranchData.name || "");
      setGender(editBranchData.category || "");
      setPhone(editBranchData.contact_number || "");
      setEmail(editBranchData.contact_email || "");
      setAddress(editBranchData.address || "");
      setLandmark(editBranchData.landmark || "");
      setPincode(editBranchData.postal_code || "");
      setCity(editBranchData.city || "");
      setState(editBranchData.state || "");
      setCountry(editBranchData.country || "");
      setDescription(editBranchData.description || "");
      setPhoto(editBranchData.image || null);
      setStatus(editBranchData.status === 1 ? "active" : "inactive");
      setSelectedPaymentMethods(editBranchData.payment_method || []);
    } else {
      setIsEditMode(false);
      setBranchName("");
      setGender("");
      setPhone("");
      setEmail("");
      setAddress("");
      setLandmark("");
      setPincode("");
      setCity("");
      setState("");
      setCountry("");
      setDescription("");
      setPhoto(null);
      setStatus("active");
      setSelectedServices([]);
      setSelectedPaymentMethods(["cash", "upi"]);
    }
  }, [editBranchData]);

  useEffect(() => {
    if (
      editBranchData &&
      serviceOptions.length > 0 &&
      editBranchData.service_id
    ) {
      const selectedServiceIds = editBranchData.service_id.map((item) =>
        typeof item === "object" ? item._id : item
      );
      const prefilledServices = serviceOptions.filter((service) =>
        selectedServiceIds.includes(service.value)
      );
      setSelectedServices(prefilledServices);
    }
  }, [serviceOptions, editBranchData]);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (phoneError || emailError) {
      toast.error("Please fix the errors in the form.");
      return;
    }

    const payload = {
      name: toTitleCase(branchName),
      salon_id: salonId,
      category: gender,
      status: status === "active" ? 1 : 0,
      contact_email: email,
      contact_number: phone,
      payment_method: selectedPaymentMethods,
      service_id: selectedServices.map((service) => service.value),
      address: toTitleCase(address),
      landmark: toTitleCase(landmark),
      country: toTitleCase(country),
      state: toTitleCase(state),
      city: toTitleCase(city),
      postal_code: pincode,
      description: toTitleCase(description),
      image: photo,
    };

    try {
      if (isEditMode) {
        await axios.put(`${API_URL}/branches/${editBranchData._id}`, payload);
        toast.success("Branch updated successfully!");
      } else {
        await axios.post(`${API_URL}/branches`, payload);
        toast.success("Branch added successfully!");
      }
      onClose();
      onBranchAddedOrUpdated();
    } catch (error) {
      console.error("Error submitting branch data:", error);
      toast.error("Failed to save branch. Please try again.");
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

  return (
    <>
      <div className="overlay-blur" onClick={onClose}></div>
      <div className={`sidebar-div bg-dark ${show ? "show" : ""}`}>
        <div className="p-4 text-white h-100 overflow-auto">
          <div className="d-flex justify-content-between">
            <h5 className="sidebar-title">
              {isEditMode ? "Edit Branch" : "Add New Branch"}
            </h5>
            <button className="btn btn-outline-danger" onClick={onClose}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          <hr />
          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">
                  Branch Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control bg-dark text-white"
                  placeholder="Enter Branch Name"
                  required
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                />

                <label className="form-label mt-3">
                  Catgeory <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select bg-dark text-white"
                  required
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option hidden>Select Catgeory</option>
                  <option value="unisex">Unisex</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div className="col-md-6">
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
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">
                Select Services <span className="text-danger">*</span>
              </label>
              <Select
                options={serviceOptions}
                isMulti
                value={selectedServices}
                onChange={(selected) => {
                  const isSelectAll = selected.some(
                    (s) => s.value === "__all__"
                  );
                  if (isSelectAll) {
                    setSelectedServices(
                      serviceOptions.filter((s) => s.value !== "__all__")
                    );
                  } else {
                    setSelectedServices(selected);
                  }
                }}
                classNamePrefix="react-select"
                styles={{
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
                    backgroundColor:
                      state.isFocused || state.isSelected ? "#8f6b55" : "#000",
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
                }}
              />
            </div>
            <div className="row mb-3">
              <div className="col-md-6">
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

                <label className="form-label mt-3">
                  Address <span className="text-danger">*</span>
                </label>
                <input
                  required
                  type="text"
                  className="form-control bg-dark text-white"
                  placeholder="Enter Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div className="col-md-6">
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
                  Landmark <span className="text-danger">*</span>
                </label>
                <input
                  required
                  type="text"
                  className="form-control bg-dark text-white"
                  placeholder="Enter Landmark"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                />
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-3">
                <label className="form-label">
                  Pincode <span className="text-danger">*</span>
                </label>
                <input
                  required
                  type="text"
                  className="form-control bg-dark text-white"
                  placeholder="Pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">
                  City <span className="text-danger">*</span>
                </label>
                <input
                  required
                  type="text"
                  className="form-control bg-dark text-white"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">
                  State <span className="text-danger">*</span>
                </label>
                <input
                  required
                  type="text"
                  className="form-control bg-dark text-white"
                  placeholder="State"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">
                  Country <span className="text-danger">*</span>
                </label>
                <input
                  required
                  type="text"
                  className="form-control bg-dark text-white"
                  placeholder="Country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">
                Supported Payment Methods <span className="text-danger">*</span>
              </label>
              <div className="d-flex gap-3">
                <div className="form-check">
                  <input
                    className="form-check-input custom-check"
                    type="checkbox"
                    value="cash"
                    id="cash"
                    checked={selectedPaymentMethods.includes("cash")}
                    onChange={(e) =>
                      setSelectedPaymentMethods((prev) =>
                        e.target.checked
                          ? [...prev, "cash"]
                          : prev.filter((method) => method !== "cash")
                      )
                    }
                  />
                  <label className="form-check-label" htmlFor="cash">
                    Cash
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input custom-check"
                    type="checkbox"
                    value="upi"
                    id="upi"
                    checked={selectedPaymentMethods.includes("upi")}
                    onChange={(e) =>
                      setSelectedPaymentMethods((prev) =>
                        e.target.checked
                          ? [...prev, "upi"]
                          : prev.filter((method) => method !== "upi")
                      )
                    }
                  />
                  <label className="form-check-label" htmlFor="upi">
                    UPI
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input custom-check"
                    type="checkbox"
                    value="razorpay"
                    id="razorpay"
                    checked={selectedPaymentMethods.includes("razorpay")}
                    onChange={(e) =>
                      setSelectedPaymentMethods((prev) =>
                        e.target.checked
                          ? [...prev, "razorpay"]
                          : prev.filter((method) => method !== "razorpay")
                      )
                    }
                  />
                  <label className="form-check-label" htmlFor="razorpay">
                    Razorpay
                  </label>
                </div>
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                required
                className="form-control bg-dark text-white"
                rows="3"
                placeholder="Enter description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>
            <div className="mb-4">
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
              {isEditMode ? "Update Branch" : "Add Branch"}
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

export default BranchSidebar;
