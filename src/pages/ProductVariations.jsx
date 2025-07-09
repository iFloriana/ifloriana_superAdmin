import { useEffect, useState } from "react";
import "./pages.css";
import AppointmentSidebar from "../AddContext/AppointmentSidebar";
import VariationSidebar from "../AddContext/VariationSidebar";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import axios from "axios";
import moment from "moment";

const ProductVariations = () => {
  const [showForm, setShowForm] = useState(false);
  const [showVariation, setShowVariation] = useState(false);
  const [variations, setVariations] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingVariation, setEditingVariation] = useState(null);

  const toggleForm = () => setShowForm((prev) => !prev);

  const toggleVariation = (variation = null) => {
    setEditingVariation(variation);
    setShowVariation((prev) => !prev);
  };

  const API_BASE = import.meta.env.VITE_API_URL;
  const salonId = localStorage.getItem("salon_id");

  const fetchVariations = async () => {
    try {
      const res = await axios.get(`${API_BASE}/variations?salon_id=${salonId}`);
      setVariations(res.data.data);
    } catch (error) {
      toast.error("Failed to fetch variations");
    }
  };

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: `Delete <b>${name}</b> Variation?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_BASE}/variations/${id}?salon_id=${salonId}`);
        toast.success("Variation deleted successfully");
        fetchVariations();
      } catch (error) {
        toast.error("Error deleting variation");
      }
    }
  };

  useEffect(() => {
    fetchVariations();
  }, []);

  const handleVariationSidebarClose = () => {
    setShowVariation(false);
    setEditingVariation(null);
    fetchVariations();
  };

  const filteredVariations = variations.filter((item) => {
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" && item.status === 1) ||
      (statusFilter === "Inactive" && item.status === 0);

    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <>
      <div className="d-flex justify-content-between align-items-center top-div">
        <p className="title">Variations</p>
        <button className="btn apt-btn" onClick={toggleForm}>
          <i className="bi bi-plus-circle me-2"></i>Appointment
        </button>
        <AppointmentSidebar show={showForm} onClose={toggleForm} />
      </div>

      <div className="p-3 inner-div rounded">
        <div className="d-flex justify-content-between align-items-center">
          <div className="dropdown">
            <select
              className="form-select custom-select-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
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
                placeholder="Search.."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              className="d-flex align-items-center page-btn"
              onClick={() => toggleVariation()}
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
                <th>Type</th>
                <th>Updated At</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredVariations.length > 0 ? (
                filteredVariations.map((item, index) => (
                  <tr key={item._id}>
                    <td>{index + 1}</td>
                    <td>{item.name}</td>
                    <td>{item.type}</td>
                    <td>{moment(item.updatedAt).fromNow()}</td>
                    <td className="text-center">
                      <span
                        className={`badge ${
                          item.status === 1 ? "bg-success" : "bg-secondary"
                        }`}
                      >
                        {item.status === 1 ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <i
                        className="bi bi-pencil-square me-3 icon-blue"
                        role="button"
                        onClick={() => toggleVariation(item)}
                      ></i>
                      <i
                        className="bi bi-trash text-danger"
                        role="button"
                        onClick={() => handleDelete(item._id, item.name)}
                      ></i>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-danger">
                    No variations found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <VariationSidebar
        show={showVariation}
        onClose={handleVariationSidebarClose}
        editingVariation={editingVariation}
        setEditingVariation={setEditingVariation}
      />
    </>
  );
};

export default ProductVariations;
