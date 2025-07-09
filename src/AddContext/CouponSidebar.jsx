import React, { useEffect, useState } from "react";
import Select from "react-select";
import axios from "axios";
import "./context.css";
import defaultImage from "../../public/default.png";
import imageCompression from "browser-image-compression";
import { toast } from "react-toastify";
import moment from "moment";

const CouponSidebar = ({ show, onClose, editingCoupon, refreshCoupons }) => {
  const [photo, setPhoto] = useState(null);
  const [status, setStatus] = useState("active");
  const [branches, setBranches] = useState([]);
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [couponType, setCouponType] = useState("custom");
  const [couponCode, setCouponCode] = useState("");
  const [discountType, setDiscountType] = useState("percent");
  const [discountAmount, setDiscountAmount] = useState("");
  const [useLimit, setUseLimit] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;
  const salonId = localStorage.getItem("salon_id");

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
    let isMounted = true;

    const fetchBranchesAndSetForm = async () => {
      if (!show) return;

      try {
        const res = await axios.get(`${API_URL}/branches?salon_id=${salonId}`);
        if (!isMounted) return;

        const options = res.data.data
          .filter((branch) => branch.status === 1)
          .map((branch) => ({
            label: branch.name,
            value: branch._id,
          }));
        setBranches(options);

        if (editingCoupon) {
          setPhoto(editingCoupon.image || null);
          setName(editingCoupon.name || "");
          setDescription(editingCoupon.description || "");
          setStartDate(
            moment(editingCoupon.start_date).format("YYYY-MM-DD") || ""
          );
          setEndDate(moment(editingCoupon.end_date).format("YYYY-MM-DD") || "");
          setCouponType(editingCoupon.coupon_type || "custom");
          setCouponCode(editingCoupon.coupon_code || "");
          setDiscountType(editingCoupon.discount_type || "percent");
          2;
          setDiscountAmount(Number(editingCoupon.discount_amount) || "");
          setUseLimit(Number(editingCoupon.use_limit) || "");
          setStatus(editingCoupon.status === 1 ? "active" : "inactive");

          let couponBranchIds = [];
          if (Array.isArray(editingCoupon.branch_id)) {
            couponBranchIds = editingCoupon.branch_id
              .map((branchObj) => branchObj._id || branchObj.salon_id)
              .filter(Boolean);
          }

          const selected = options.filter((option) =>
            couponBranchIds.includes(option.value)
          );
          setSelectedBranches(selected);
          const foundBranchIds = selected.map((b) => b.value);
          const notFoundBranchIds = couponBranchIds.filter(
            (id) => !foundBranchIds.includes(id)
          );
          if (notFoundBranchIds.length > 0) {
            console.warn(
              "Warning: Some branch IDs from editingCoupon were not found in fetched branches:",
              notFoundBranchIds
            );
          }
        } else {
          setPhoto(null);
          setName("");
          setDescription("");
          setStartDate("");
          setEndDate("");
          setCouponType("custom");
          setCouponCode("");
          setDiscountType("percent");
          setDiscountAmount("");
          setUseLimit("");
          setStatus("active");
          setSelectedBranches([]);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching branches for coupons:", err);
          toast.error("Failed to load branches for coupons.");
        }
      }
    };

    fetchBranchesAndSetForm();

    return () => {
      isMounted = false;
    };
  }, [show, editingCoupon, API_URL, salonId]);

  const toTitleCase = (str) => {
    if (!str) return "";
    return str
      .toLowerCase()
      .split(" ")
      .filter((word) => word.trim() !== "")
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !name ||
      !description ||
      !startDate ||
      !endDate ||
      selectedBranches.length === 0 ||
      !couponType ||
      !couponCode ||
      !discountType ||
      !discountAmount ||
      Number(discountAmount) <= 0 ||
      !useLimit ||
      Number(useLimit) <= 0
    ) {
      toast.error("Please fill all required fields with valid values.");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast.error("Start Date cannot be after End Date.");
      return;
    }

    const payload = {
      image: photo || "",
      name: toTitleCase(name),
      branch_id: selectedBranches.map((b) => b.value),
      description,
      start_date: startDate,
      end_date: endDate,
      coupon_type: couponType,
      coupon_code: couponCode.toUpperCase(),
      discount_type: discountType,
      discount_amount: Number(discountAmount),
      use_limit: Number(useLimit),
      status: status === "active" ? 1 : 0,
      salon_id: salonId,
    };

    try {
      if (editingCoupon) {
        await axios.put(`${API_URL}/coupons/${editingCoupon._id}`, payload);
        toast.success("Coupon updated successfully!");
      } else {
        await axios.post(`${API_URL}/coupons`, payload);
        toast.success("Coupon added successfully!");
      }
      onClose();
      refreshCoupons();
    } catch (error) {
      console.error(
        `Error ${editingCoupon ? "updating" : "adding"} coupon:`,
        error.response ? error.response.data : error.message
      );
      toast.error(
        `Failed to ${
          editingCoupon ? "update" : "add"
        } coupon. Please try again. ${error.response?.data?.message || ""}`
      );
    }
  };

  if (!show) return null;

  return (
    <>
      {show && <div className="overlay-blur" onClick={onClose}></div>}
      <div className={`sidebar-div ${show ? "show" : ""}`}>
        <div className="p-4 bg-dark text-white h-100 overflow-auto">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="sidebar-title">
              {editingCoupon ? "Edit Coupon" : "Add New Coupon"}
            </h5>
            <button onClick={onClose} className="btn btn-outline-danger">
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
            <div className="mb-3">
              <label className="form-label">
                Branch(es) <span className="text-danger">*</span>
              </label>
              <Select
                required
                isMulti
                options={branches}
                className="text-dark"
                value={selectedBranches}
                onChange={setSelectedBranches}
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
            <div className="mb-3">
              <label className="form-label">
                Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="form-control bg-dark text-white"
                placeholder="Enter Name"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">
                Description <span className="text-danger">*</span>
              </label>
              <textarea
                required
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
                className="form-control bg-dark text-white"
                placeholder="Enter Description"
              ></textarea>
            </div>
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">
                  Start Date <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  className="form-control bg-dark text-white"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">
                  End Date <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  className="form-control bg-dark text-white"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">
                Coupon Type <span className="text-danger">*</span>
              </label>
              <select
                className="form-select bg-dark text-white"
                required
                value={couponType}
                onChange={(e) => setCouponType(e.target.value)}
              >
                <option value="custom">Custom</option>
                <option value="bulk">Bulk</option>
                <option value="event">Event</option>
                <option value="seasonal">Seasonal</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">
                Coupon Code <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                required
                className="form-control bg-dark text-white"
                placeholder="Enter Coupon Code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">
                Discount Type <span className="text-danger">*</span>
              </label>
              <select
                className="form-select bg-dark text-white"
                required
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value)}
              >
                <option value="percent">Percent</option>
                <option value="fixed">Fixed</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">
                Discount Amount <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                required
                className="form-control bg-dark text-white"
                placeholder="0"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(e.target.value)}
                min="0"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">
                Use Limit <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                required
                className="form-control bg-dark text-white"
                value={useLimit}
                onChange={(e) => setUseLimit(e.target.value)}
                min="0"
              />
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
              {editingCoupon ? "Update Coupon" : "Add Coupon"}
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

export default CouponSidebar;
