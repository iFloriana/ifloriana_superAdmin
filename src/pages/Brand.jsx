import { useEffect, useState, useCallback } from "react";
import "./pages.css";
import AppointmentSidebar from "../AddContext/AppointmentSidebar";
import BrandSidebar from "../AddContext/BrandSidebar";
import { toast } from "react-toastify";
import axios from "axios";
import moment from "moment";
import Swal from "sweetalert2";

const Brand = () => {
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [showBrandSidebar, setShowBrandSidebar] = useState(false);
  const [brands, setBrands] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [brandSidebarMode, setBrandSidebarMode] = useState("add");
  const [selectedBrandData, setSelectedBrandData] = useState(null);

  const toggleAppointmentForm = () => setShowAppointmentForm((prev) => !prev);

  const API_BASE = import.meta.env.VITE_API_URL;
  const salonId = localStorage.getItem("salon_id");

  const fetchBrands = useCallback(() => {
    axios
      .get(`${API_BASE}/brands?salon_id=${salonId}`)
      .then((res) => {
        setBrands(res.data.data);
      })
      .catch((err) => {
        toast.error("Failed to fetch brands");
        console.error(err);
      });
  }, [API_BASE]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const handleNewBrandClick = () => {
    setBrandSidebarMode("add");
    setSelectedBrandData(null);
    setShowBrandSidebar(true);
  };

  const handleEditBrandClick = (brand) => {
    setBrandSidebarMode("edit");
    setSelectedBrandData(brand);
    setShowBrandSidebar(true);
  };

  const handleCloseBrandSidebar = () => {
    setShowBrandSidebar(false);
    setSelectedBrandData(null);
    setBrandSidebarMode("add");
    fetchBrands();
  };

  const handleDelete = (index) => {
    const brandToDelete = brands[index];

    Swal.fire({
      title: `Delete <b>"${brandToDelete.name}"</b> Brand?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`${API_BASE}/brands/${brandToDelete._id}?salon_id=${salonId}`)
          .then(() => {
            fetchBrands();
            toast.success(`${brandToDelete.name} deleted successfully`);
          })
          .catch((err) => {
            toast.error("Failed to delete brand");
            console.error(err);
          });
      }
    });
  };

  const filteredBrands = brands.filter((brand) => {
    const matchesStatus =
      statusFilter === "All" || String(brand.status) === statusFilter;
    const matchesSearch = brand.name
      .toLowerCase()
      .includes(searchText.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <>
      <div className="d-flex justify-content-between align-items-center top-div">
        <p className="title">Brands</p>

        <button className="btn apt-btn" onClick={toggleAppointmentForm}>
          <i className="bi bi-plus-circle me-2"></i>Appointment
        </button>
        <AppointmentSidebar
          show={showAppointmentForm}
          onClose={toggleAppointmentForm}
        />
      </div>
      <div className="p-3 inner-div rounded">
        <div className="d-flex justify-content-between align-items-center">
          <div className="dropdown">
            <select
              className="form-select custom-select-input"
              onChange={(e) => setStatusFilter(e.target.value)}
              value={statusFilter}
            >
              <option value="All">All</option>
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>
          <div className="d-flex justify-content-end align-items-center gap-3">
            <div className="input-group input-group-dark custom-input-group">
              <span className="input-group-text custom-input-group-text">
                <i className="bi bi-search icon-brown"></i>
              </span>
              <input
                type="text"
                className="form-control custom-text-input"
                placeholder="Search Name..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            <button
              className="d-flex align-items-center page-btn"
              onClick={handleNewBrandClick}
            >
              <i className="bi bi-plus-circle-fill me-2"></i>
              New
            </button>
          </div>
        </div>
        <div className="table-responsive custom-table-container mt-4">
          <table className="table table-dark table-bordered custom-table">
            <thead>
              <tr>
                <th>Sr. No.</th>
                <th>Name</th>
                <th>Updated At</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBrands.length > 0 ? (
                filteredBrands.map((brand, index) => (
                  <tr key={brand._id || index}>
                    <td>{index + 1}</td>
                    <td className="d-flex align-items-center justify-content-center gap-3">
                      {brand.image && (
                        <img
                          src={brand.image}
                          alt={brand.name}
                          style={{
                            width: "55px",
                            height: "55px",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                      )}
                      {brand.name}
                    </td>
                    <td>{moment(brand.updatedAt).fromNow()}</td>
                    <td>
                      <span
                        className={`badge ${
                          brand.status === 1 ? "bg-success" : "bg-secondary"
                        }`}
                      >
                        {brand.status === 1 ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <i
                        className="bi bi-pencil-square me-3 icon-blue"
                        role="button"
                        onClick={() => handleEditBrandClick(brand)}
                      ></i>
                      <i
                        className="bi bi-trash text-danger"
                        role="button"
                        onClick={() => handleDelete(index)}
                      ></i>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-danger">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <BrandSidebar
        show={showBrandSidebar}
        onClose={handleCloseBrandSidebar}
        mode={brandSidebarMode}
        brandData={selectedBrandData}
        onBrandUpdated={fetchBrands}
      />
    </>
  );
};

export default Brand;
