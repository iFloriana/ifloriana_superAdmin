import { useEffect, useState } from "react";
import "./pages.css";
import AppointmentSidebar from "../AddContext/AppointmentSidebar";
import AppBannerSidebar from "../AddContext/AppBannerSidebar";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const AppBanner = () => {
  const [showForm, setShowForm] = useState(false);
  const [showAppBanner, setShowAppBanner] = useState(false);
  const [banners, setBanners] = useState([]);

  const toggleForm = () => setShowForm((prev) => !prev);
  const toggleAppBanner = () => setShowAppBanner((prev) => !prev);

  const API_BASE = import.meta.env.VITE_API_URL;
  const salonId = localStorage.getItem("salon_id");

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await axios.get(`${API_BASE}/appBanners?salon_id=${salonId}`);
      setBanners(res.data);
    } catch (err) {
      console.error("Error fetching banners", err);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: `Are you sure?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_BASE}/appBanners/${id}?salon_id=${salonId}`);
        toast.success("Deleted successfully!");
        fetchBanners();
      } catch (err) {
        toast.error("Failed to delete.");
      }
    }
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center top-div">
        <p className="title">App Banner</p>
        <button className="btn apt-btn" onClick={toggleForm}>
          <i className="bi bi-plus-circle me-2"></i>Appointment
        </button>
        <AppointmentSidebar show={showForm} onClose={toggleForm} />
      </div>

      <div className="p-3 inner-div rounded">
        <div className="d-flex justify-content-end align-items-center gap-3">
          <div className="input-group input-group-dark custom-input-group-reviews">
            <span className="input-group-text custom-input-group-text">
              <i className="bi bi-search icon-brown"></i>
            </span>
            <input
              type="text"
              className="form-control custom-text-input"
              placeholder="Search.."
            />
          </div>
          <button
            className="d-flex align-items-center page-btn"
            onClick={toggleAppBanner}
          >
            <i className="bi bi-plus-circle-fill me-2"></i>
            New
          </button>
        </div>

        <div className="table-responsive custom-table-container mt-4">
          <table className="table table-dark table-bordered custom-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Url</th>
                <th>Type</th>
                <th>Link ID</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {banners.length > 0 ? (
                banners.map((banner) => (
                  <tr key={banner._id}>
                    <td className="d-flex justify-content-center align-items-center gap-2">
                      {banner.image && (
                        <img
                          src={banner.image}
                          alt={banner.name}
                          width="40"
                          height="40"
                          className="rounded object-fit-cover"
                        />
                      )}
                      {banner.name}
                    </td>
                    <td>{banner.url || "-"}</td>
                    <td>{banner.type}</td>
                    <td>{banner.linkId || "-"} </td>
                    <td>
                      <span
                        className={`badge ${
                          banner.status === 1 ? "bg-success" : "bg-secondary"
                        }`}
                      >
                        {banner.status === 1 ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <i
                        className="bi bi-pencil-square me-3 icon-blue"
                        role="button"
                      ></i>
                      <i
                        className="bi bi-trash text-danger"
                        role="button"
                        onClick={() => handleDelete(banner._id)}
                      ></i>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-danger">
                    No banners found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <AppBannerSidebar show={showAppBanner} onClose={toggleAppBanner} />
    </>
  );
};

export default AppBanner;
