import React, { useEffect, useState } from "react";
import Select from "react-select";
import "./context.css";
import defaultImage from "../../public/default.png";
import { toast } from "react-toastify";
import axios from "axios";
import imageCompression from "browser-image-compression";

const ProductCategorySidebar = ({
  show,
  onClose,
  editData,
  setEditData,
  onProductCategorySaved,
}) => {
  const [photo, setPhoto] = useState(null);
  const [brand, setBrand] = useState([]);
  const [selectBrands, setSelectBrands] = useState([]);
  const [status, setStatus] = useState(1);
  const [branches, setBranches] = useState([]);
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [name, setName] = useState("");

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
        .catch((err) => console.error("Error fetching branches:", err));
    }
  }, [show, API_URL, salonId]);

  useEffect(() => {
    if (show) {
      axios
        .get(`${API_URL}/brands?salon_id=${salonId}`)
        .then((res) => {
          const options = res.data.data
            .filter((brand) => brand.status === 1)
            .map((brand) => ({
              label: brand.name,
              value: brand._id,
            }));
          setBrand(options);
        })
        .catch((err) => console.error("Error fetching brands:", err));
    }
  }, [show, API_URL, salonId]);

  useEffect(() => {
    if (editData) {
      setName(editData.name || "");
      setPhoto(editData.image || null);
      setSelectBrands(
        (editData.brand_id || []).map((brand) => ({
          label: brand.name,
          value: brand._id,
        }))
      );
      setSelectedBranches(
        (editData.branch_id || []).map((branch) => ({
          label: branch.name,
          value: branch._id,
        }))
      );
      setStatus(editData.status ?? 1);
    } else {
      setName("");
      setPhoto(null);
      setSelectBrands([]);
      setSelectedBranches([]);
      setStatus(1);
    }
  }, [editData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || selectBrands.length === 0 || selectedBranches.length === 0) {
      toast.error("Please fill all required fields.");
      return;
    }

    const payload = {
      name: toTitleCase(name.trim()),
      image: photo,
      brand_id: selectBrands.map((b) => b.value),
      branch_id: selectedBranches.map((b) => b.value),
      status,
      salon_id: salonId,
    };

    try {
      if (editData) {
        await axios.put(
          `${API_URL}/productCategories/${editData._id}`,
          payload
        );
        toast.success("Category updated successfully!");
      } else {
        await axios.post(`${API_URL}/productCategories`, payload);
        toast.success("Category added successfully!");
      }
      setEditData(null);
      setName("");
      setPhoto(null);
      setSelectBrands([]);
      setSelectedBranches([]);
      setStatus(1);
      onClose();
      onProductCategorySaved();
    } catch (error) {
      console.error("Error submitting category:", error);
      toast.error(error.response?.data?.message || "Operation failed.");
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

  const customSelectStyles = {
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
        <div className="bg-dark p-4 h-100 overflow-auto text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="sidebar-title">Add New Category</h5>
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
                required
                type="text"
                className="form-control bg-dark text-white"
                placeholder="Enter Category Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">
                Brand(s) <span className="text-danger">*</span>
              </label>
              <Select
                required
                options={brand}
                isMulti
                value={selectBrands}
                onChange={setSelectBrands}
                classNamePrefix="react-select"
                styles={customSelectStyles}
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
                styles={customSelectStyles}
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
                  value={1}
                  checked={status === 1}
                  onChange={(e) => setStatus(Number(e.target.value))}
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
                  value={0}
                  checked={status === 0}
                  onChange={(e) => setStatus(Number(e.target.value))}
                />
                <label className="form-check-label" htmlFor="inactive">
                  Inactive
                </label>
              </div>
            </div>
            <button type="submit" className="btn page-btn me-2">
              <i className="bi bi-floppy me-2"></i>
              {editData ? "Update" : "Add"} Category
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

export default ProductCategorySidebar;
