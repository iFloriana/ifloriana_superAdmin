import { useEffect, useState } from "react";
import "./pages.css";
import AppointmentSidebar from "../AddContext/AppointmentSidebar";
import TaxSidebar from "../AddContext/TaxSidebar";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import axios from "axios";

const Tax = () => {
  const [showForm, setShowForm] = useState(false);
  const [showTax, setShowTax] = useState(false);
  const [tax, setTax] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingTax, setEditingTax] = useState(null);

  const toggleForm = () => setShowForm((prev) => !prev);

  const toggleTax = () => {
    setShowTax((prev) => !prev);
    if (showTax) {
      setEditingTax(null);
    }
  };

  const API_URL = import.meta.env.VITE_API_URL;
  const salonId = localStorage.getItem("salon_id");

  const fetchTax = async () => {
    try {
      const data = await axios.get(`${API_URL}/taxes?salon_id=${salonId}`);
      setTax(data.data.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch Tax");
    }
  };

  useEffect(() => {
    fetchTax();
  }, []);

  const handleDelete = async (id, name) => {
    const confirm = await Swal.fire({
      title: `Delete <b>${name}</b> Tax?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/taxes/${id}?salon_id=${salonId}`);
        toast.success("Tax deleted successfully");
        fetchTax();
      } catch (error) {
        toast.error("Failed to delete tax");
        console.error(error);
      }
    }
  };

  const handleEdit = (taxItem) => {
    setEditingTax(taxItem);
    setShowTax(true);
  };

  const filteredTax = tax.filter((item) => {
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" && item.status === 1) ||
      (statusFilter === "Inactive" && item.status !== 1);

    const matchesSearch = item.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <>
      <div className="d-flex justify-content-between align-items-center top-div">
        <p className="title">Tax</p>
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              className="d-flex align-items-center page-btn"
              onClick={toggleTax}
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
                <th>Title</th>
                <th>Value</th>
                <th>Module Type</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTax.length > 0 ? (
                filteredTax.map((item) => (
                  <tr key={item._id}>
                    <td>{item.title}</td>
                    <td>
                      {item.type === "percent"
                        ? `${item.value} %`
                        : `₹ ${item.value}`}
                    </td>
                    <td>{item.tax_type}</td>
                    <td>
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
                        onClick={() => handleEdit(item)}
                      ></i>
                      <i
                        className="bi bi-trash text-danger"
                        role="button"
                        onClick={() => handleDelete(item._id, item.title)}
                      ></i>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-danger">
                    No Taxes found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <TaxSidebar
        show={showTax}
        onClose={toggleTax}
        editingTax={editingTax}
        refreshTaxes={fetchTax}
      />
    </>
  );
};

export default Tax;
