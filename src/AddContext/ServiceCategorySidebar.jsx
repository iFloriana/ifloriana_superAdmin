import React, { useState, useEffect } from "react";
import "./context.css";
import axios from "axios";
import defaultImage from "../../public/default.png";
import imageCompression from "browser-image-compression";
import { toast } from "react-toastify";

const ServiceCategorySidebar = ({
  show,
  onClose,
  initialData,
  onCategorySaved,
}) => {
  const [photo, setPhoto] = useState(null);
  const [status, setStatus] = useState("active");
  const [name, setName] = useState("");
  const salonId = localStorage.getItem("salon_id");

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setPhoto(initialData.image || null);
      setStatus(initialData.status === 1 ? "active" : "inactive");
    } else {
      setName("");
      setPhoto(null);
      setStatus("active");
    }
  }, [initialData, show]);

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

  const toTitleCase = (str) => {
    return str
      .toLowerCase()
      .split(" ")
      .filter((word) => word.trim() !== "")
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(" ");
  };

  const createCategory = async () => {
    try {
      const response = await axios.post(`${API_URL}/categories`, {
        salon_id: salonId,
        name: toTitleCase(name),
        image: photo || "",
        status: status === "active" ? 1 : 0,
      });

      toast.success(response.data.message || "Category created successfully");
      onCategorySaved();
      onClose();
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Failed to create category.");
    }
  };

  const updateCategory = async () => {
    try {
      const response = await axios.put(
        `${API_URL}/categories/${initialData._id}`,
        {
          name: toTitleCase(name),
          image: photo || "",
          status: status === "active" ? 1 : 0,
        }
      );

      toast.success(response.data.message || "Category updated successfully");
      onCategorySaved();
      onClose();
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Category name is required.");
      return;
    }

    if (initialData) {
      await updateCategory();
    } else {
      await createCategory();
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
              {initialData ? "Edit Category" : "Add New Category"}
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
              {initialData ? "Update Category" : "Add Category"}
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

export default ServiceCategorySidebar;
