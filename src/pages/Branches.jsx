import { useEffect, useState } from "react";
import "./pages.css";
import AppointmentSidebar from "../AddContext/AppointmentSidebar";
import BranchSidebar from "../AddContext/BranchSidebar";
import { toast } from "react-toastify";
import axios from "axios";
import Swal from "sweetalert2";

const Branches = () => {
  const [showForm, setShowForm] = useState(false);
  const [showBranchForm, setShowBranchForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const API_BASE = import.meta.env.VITE_API_URL;
  const salonId = localStorage.getItem("salon_id");

  const toggleForm = () => setShowForm((prev) => !prev);
  const toggleBranchForm = () => {
    if (showBranchForm) {
      setEditingBranch(null);
    }
    setShowBranchForm((prev) => !prev);
  };

  const fetchBranches = async () => {
    try {
      const res = await axios.get(`${API_BASE}/branches?salon_id=${salonId}`);
      setBranches(res.data.data);
    } catch (err) {
      toast.error("Failed to load branches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, [API_BASE]);

  const handleBranchAddedOrUpdated = () => {
    fetchBranches();
  };

  const handleEdit = (branch) => {
    setEditingBranch(branch);
    setShowBranchForm(true);
  };

  const handleDelete = async (id, name) => {
    const confirm = await Swal.fire({
      title: `Delete <b>"${name}"</b> Branch?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`${API_BASE}/branches/${id}?salon_id=${salonId}`);
        setBranches(branches.filter((b) => b._id !== id));
        toast.success("Branch deleted successfully");
      } catch (err) {
        toast.error("Failed to delete branch");
      }
    }
  };

  const filteredBranches = branches.filter((branch) => {
    const matchStatus =
      filterStatus === "All" ||
      (filterStatus === "Active" && branch.status === 1) ||
      (filterStatus === "Inactive" && branch.status !== 1);

    const matchSearch = branch.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    return matchStatus && matchSearch;
  });

  return (
    <>
      <div className="d-flex justify-content-between align-items-center top-div">
        <p className="title">Branches</p>
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
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="d-flex justify-content-end align-items-center gap-3">
            <div className="input-group input-group-dark custom-input-group">
              <span className="input-group-text custom-input-group-text">
                <i className="bi bi-search"></i>
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
              onClick={toggleBranchForm}
            >
              <i className="bi bi-plus-circle-fill me-2"></i>
              Branch
            </button>
          </div>
        </div>

        <div className="table-responsive custom-table-container mt-4">
          <table className="table table-dark table-bordered custom-table">
            <thead>
              <tr>
                <th>Branch Name</th>
                <th>Contact No</th>
                <th>Area</th>
                <th>Number of Staffs</th>
                <th>Category</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center">
                    Loading...
                  </td>
                </tr>
              ) : filteredBranches.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center text-danger">
                    No branches found
                  </td>
                </tr>
              ) : (
                filteredBranches.map((branch) => (
                  <tr key={branch._id}>
                    <td>
                      <div className="d-flex justify-content-center align-items-center gap-2">
                        {branch.image && (
                          <img
                            src={branch.image}
                            alt="profile"
                            className="rounded-circle object-fit-cover"
                            width="40"
                            height="40"
                          />
                        )}
                        <div>
                          <div>{branch.name}</div>
                          <div className="small">{branch.contact_email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{branch.contact_number}</td>
                    <td>
                      {branch.landmark} - {branch.city}
                    </td>
                    <td>
                      <span className="bg-secondary text-white p-2 rounded">
                        {branch.staff_count}
                      </span>
                    </td>
                    <td>{branch.category}</td>
                    <td>
                      <span
                        className={`badge ${
                          branch.status === 1 ? "bg-success" : "bg-secondary"
                        }`}
                      >
                        {branch.status === 1 ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <i
                        className="bi bi-pencil-square me-3 icon-blue"
                        role="button"
                        onClick={() => handleEdit(branch)}
                      ></i>
                      <i
                        className="bi bi-trash text-danger"
                        role="button"
                        onClick={() => handleDelete(branch._id, branch.name)}
                      ></i>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <BranchSidebar
        show={showBranchForm}
        onClose={toggleBranchForm}
        editBranchData={editingBranch}
        onBranchAddedOrUpdated={handleBranchAddedOrUpdated}
      />
    </>
  );
};

export default Branches;
