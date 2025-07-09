import { useState, useEffect } from "react";
import "./pages.css";
import AppointmentSidebar from "../AddContext/AppointmentSidebar";
import UnitSidebar from "../AddContext/UnitSidebar";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import moment from "moment";
import axios from "axios";

const Units = () => {
  const [showForm, setShowForm] = useState(false);
  const [showUnitSidebar, setShowUnitSidebar] = useState(false);
  const [units, setUnits] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editingUnit, setEditingUnit] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const salonId = localStorage.getItem("salon_id");

  const toggleForm = () => setShowForm((prev) => !prev);

  const openUnitSidebarForNew = () => {
    setEditingUnit(null);
    setShowUnitSidebar(true);
  };

  const openUnitSidebarForEdit = (unit) => {
    setEditingUnit(unit);
    setShowUnitSidebar(true);
  };

  const closeUnitSidebar = () => {
    setShowUnitSidebar(false);
    setEditingUnit(null);
    fetchUnits();
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/units?salon_id=${salonId}`);
      setUnits(data.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch units");
    }
  };

  const handleDelete = async (id, uName) => {
    const confirm = await Swal.fire({
      title: `Delete <b>"${uName}"</b> Unit?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        const response = await fetch(
          `${API_URL}/units/${id}?salon_id=${salonId}`,
          {
            method: "DELETE",
          }
        );
        if (response.ok) {
          toast.success("Unit deleted successfully");
          fetchUnits();
        } else {
          toast.error("Failed to delete unit");
        }
      } catch (error) {
        console.error(error);
        toast.error("Something went wrong!");
      }
    }
  };

  const filteredUnits = units.filter((unit) => {
    const matchesSearch = unit.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All"
        ? true
        : statusFilter === "Active"
        ? unit.status === 1
        : unit.status !== 1;

    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <div className="d-flex justify-content-between align-items-center top-div">
        <p className="title">Units</p>
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
              onClick={openUnitSidebarForNew}
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
              {filteredUnits.length > 0 ? (
                filteredUnits.map((unit, index) => (
                  <tr key={unit._id}>
                    <td>{index + 1}</td>
                    <td>{unit.name}</td>
                    <td>{moment(unit.updatedAt).fromNow()}</td>
                    <td>
                      <span
                        className={`badge ${
                          unit.status === 1 ? "bg-success" : "bg-secondary"
                        }`}
                      >
                        {unit.status === 1 ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <i
                        className="bi bi-pencil-square text-info me-3"
                        role="button"
                        onClick={() => openUnitSidebarForEdit(unit)}
                      ></i>
                      <i
                        className="bi bi-trash text-danger"
                        role="button"
                        onClick={() => handleDelete(unit._id, unit.name)}
                      ></i>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-danger">
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <UnitSidebar
        show={showUnitSidebar}
        onClose={closeUnitSidebar}
        editingUnit={editingUnit}
      />
    </>
  );
};

export default Units;
