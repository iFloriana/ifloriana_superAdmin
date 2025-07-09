import { useEffect, useState } from "react";
import Select from "react-select";
import axios from "axios";
import "./context.css";
import defaultImage from "../../public/default.png";
import imageCompression from "browser-image-compression";
import { toast } from "react-toastify";

const BrandSidebar = ({ show, onClose, mode, brandData, onBrandUpdated }) => {
  const [status, setStatus] = useState("active");
  const [photo, setPhoto] = useState(null);
  const [brandName, setBrandName] = useState("");
  const [branches, setBranches] = useState([]);
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;
  const salonId = localStorage.getItem("salon_id");

  useEffect(() => {
    if (show) {
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
        .catch((err) => toast.error("Error fetching branches: " + err.message));
    }
  }, [show, API_URL, salonId]);

  useEffect(() => {
    if (mode === "edit" && brandData && branches.length > 0) {
      setBrandName(brandData.name);
      setPhoto(brandData.image);
      setStatus(brandData.status === 1 ? "active" : "inactive");

      if (
        Array.isArray(brandData.branch_id) &&
        brandData.branch_id.length > 0
      ) {
        const selected = brandData.branch_id
          .map((branchObj) => {
            const branchId =
              typeof branchObj === "string" ? branchObj : branchObj._id;
            return branches.find((b) => b.value === branchId);
          })
          .filter(Boolean);
        setSelectedBranches(selected);
      } else {
        setSelectedBranches([]);
      }
    }
  }, [mode, brandData, branches]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      branch_id: selectedBranches.map((b) => b.value),
      image: photo,
      name: toTitleCase(brandName.trim()),
      status: status === "active" ? 1 : 0,
      salon_id: salonId,
    };

    let request;
    let successMessage;
    let errorMessage;

    if (mode === "add") {
      request = axios.post(`${API_URL}/brands`, data);
      successMessage = "Brand added successfully!";
      errorMessage = "Failed to add brand. Please try again.";
    } else if (mode === "edit" && brandData && brandData._id) {
      request = axios.put(`${API_URL}/brands/${brandData._id}`, data);
      successMessage = "Brand updated successfully!";
      errorMessage = "Failed to update brand. Please try again.";
    } else {
      toast.error("Invalid operation mode.");
      setLoading(false);
      return;
    }

    request
      .then(() => {
        toast.success(successMessage);
        setBrandName("");
        setPhoto(null);
        setSelectedBranches([]);
        setStatus("active");
        if (onBrandUpdated) onBrandUpdated();
        setTimeout(() => {
          onClose();
        }, 10);
      })
      .catch((err) => {
        console.error("Operation failed:", err);
        toast.error(errorMessage);
      })
      .finally(() => {
        setLoading(false);
      });
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
        <div className="p-4 bg-dark h-100 text-white overflow-auto">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="sidebar-title">
              {mode === "add" ? "Add New Brand" : "Edit Brand"}
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
            <div className="mb-3">
              <label className="form-label">
                Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control bg-dark text-white"
                placeholder="Enter Brand Name"
                required
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
              />
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
              <i
                className={`bi bi-${
                  loading ? "arrow-clockwise" : "floppy"
                } me-2`}
              ></i>
              {loading
                ? "Processing..."
                : mode === "add"
                ? "Add Brand"
                : "Update Brand"}
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

export default BrandSidebar;
