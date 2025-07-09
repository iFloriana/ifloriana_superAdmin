import React, { useState } from "react";
import "./context.css";
import defaultImage from "../../public/default.png";

const AppBannerSidebar = ({ show, onClose }) => {
  const salonId = localStorage.getItem("salon_id");
  const [photo, setPhoto] = useState(null);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Only JPG and PNG files are allowed.");
    }
  };

  const removePhoto = () => {
    setPhoto(null);
  };

  if (!show) return null;

  return (
    <>
      <div className="overlay-blur" onClick={onClose}></div>
      <div className={`sidebar-div ${show ? "show" : ""}`}>
        <div className="p-4 bg-dark text-white h-100 overflow-auto">
          <div className="d-flex justify-content-between">
            <h5 className="sidebar-title">Add New App Banner</h5>
            <button className="btn btn-outline-danger" onClick={onClose}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          <hr />
          <form>
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
                placeholder="Enter Name"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">
                URL <span className="text-danger">*</span>
              </label>
              <input
                required
                type="text"
                className="form-control bg-dark text-white"
                placeholder="Enter URL"
              />
            </div>
            <div className="mb-3">
              <label className="form-label mt-3">
                Type <span className="text-danger">*</span>
              </label>
              <select className="form-select bg-dark text-white" required>
                <option hidden>Select Type</option>
                <option value="Category">Category</option>
                <option value="Service">Service</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label mt-3">
                Link ID <span className="text-danger">*</span>
              </label>
              <select className="form-select bg-dark text-white" required>
                <option hidden>Select Link ID</option>
                <option value="1">1</option>
                <option value="2">2</option>
              </select>
            </div>
            <button type="submit" className="btn page-btn me-2">
              <i className="bi bi-floppy me-2"></i>Save
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

export default AppBannerSidebar;
