import React, { useEffect, useState } from "react";
import "./context.css";
import axios from "axios";
import defaultImage from "../../public/default.png";
import imageCompression from "browser-image-compression";
import { toast } from "react-toastify";

const ServiceSubCategorySidebar = ({
  show,
  onClose,
  initialData,
  onSubCategorySaved,
}) => {
  const [name, setName] = useState("");
  const [status, setStatus] = useState("active");
  const [photo, setPhoto] = useState(null);
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);

  const salonId = localStorage.getItem("salon_id");
  const API_URL = import.meta.env.VITE_API_URL;

  const toTitleCase = (str) => {
    return str
      .toLowerCase()
      .split(" ")
      .filter((word) => word.trim() !== "")
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(" ");
  };

  useEffect(() => {
    if (show) {
      axios
        .get(`${API_URL}/categories?salon_id=${salonId}`)
        .then((res) => {
          const options = res.data.data
            .filter((cat) => cat.status === 1)
            .map((cat) => ({
              label: cat.name,
              value: cat._id,
            }));
          setCategories(options);
        })
        .catch((err) => console.error("Error fetching categories:", err));

      if (initialData) {
        setName(initialData.name);
        setPhoto(initialData.image || null);
        setStatus(initialData.status === 1 ? "active" : "inactive");
        setCategory(initialData.category_id?._id);
      } else {
        setName("");
        setPhoto(null);
        setStatus("active");
        setCategory("");
      }
    }
  }, [show, initialData, API_URL]);

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

  const createSubCategory = async () => {
    const data = {
      salon_id: salonId,
      image: photo,
      category_id: category,
      name: toTitleCase(name),
      status: status === "active" ? 1 : 0,
    };

    try {
      const res = await axios.post(`${API_URL}/subcategories`, data);
      toast.success(res.data.message || "SubCategory added successfully");
      onSubCategorySaved();
      onClose();
    } catch (error) {
      console.error("Create SubCategory error:", error);
      toast.error("Failed to create SubCategory.");
    }
  };

  const updateSubCategory = async () => {
    const data = {
      image: photo,
      category_id: category,
      name: toTitleCase(name),
      status: status === "active" ? 1 : 0,
    };

    try {
      const res = await axios.put(
        `${API_URL}/subcategories/${initialData._id}?salon_id=${salonId}`,
        data
      );
      toast.success(res.data.message || "SubCategory updated successfully");
      onSubCategorySaved();
      onClose();
    } catch (error) {
      console.error("Update SubCategory error:", error);
      toast.error("Failed to update SubCategory.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !category) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (initialData) {
      await updateSubCategory();
    } else {
      await createSubCategory();
    }
  };

  if (!show) return null;
  return (
    <>
      <div className="overlay-blur" onClick={onClose}></div>
      <div className={`sidebar-div ${show ? "show" : ""}`}>
        <div className="p-4 bg-dark h-100 text-white">
          <div className="d-flex justify-content-between">
            <h5 className="sidebar-title">
              {initialData ? "Edit Sub Category" : "Add New Sub Category"}
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
                Category <span className="text-danger">*</span>
              </label>
              <select
                className="form-select bg-dark text-white"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="" hidden>
                  Select category
                </option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">
                Name <span className="text-danger">*</span>
              </label>
              <input
                required
                type="text"
                className="form-control bg-dark text-white"
                placeholder="Enter Sub Category Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
              {initialData ? "Update Sub Category" : "Add Sub Category"}
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

export default ServiceSubCategorySidebar;
