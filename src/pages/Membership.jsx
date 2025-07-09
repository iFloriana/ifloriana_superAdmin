import { useEffect, useState } from "react";
import "./pages.css";
import AppointmentSidebar from "../AddContext/AppointmentSidebar";
import MembershipSidebar from "../AddContext/MembershipSidebar";
import axios from "axios";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const Membership = () => {
  const [showForm, setShowForm] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [memberships, setMemberships] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [editData, setEditData] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const salonId = localStorage.getItem("salon_id");

  const toggleForm = () => setShowForm((prev) => !prev);

  const toggleMemberForm = (data = null) => {
    setEditData(data);
    setShowMemberForm(true);
  };

  const closeMemberForm = () => {
    setShowMemberForm(false);
    setEditData(null);
  };

  const fetchMemberships = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/branch-memberships?salon_id=${salonId}`
      );
      setMemberships(response.data.data);
    } catch (error) {
      console.error("Error fetching memberships:", error);
    }
  };

  useEffect(() => {
    fetchMemberships();
  }, []);

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: `Delete <b>${name}</b>?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(
        `${API_URL}/branch-memberships/${id}?salon_id=${salonId}`
      );
      setMemberships((prev) => prev.filter((m) => m._id !== id));
      toast.success("Membership deleted successfully!");
      fetchMemberships();
    } catch (error) {
      toast.error("Error deleting membership!");
      console.error("Error deleting membership:", error);
    }
  };

  const filteredMemberships = memberships.filter((item) => {
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" && item.status === 1) ||
      (statusFilter === "Inactive" && item.status !== 1);

    const matchesSearch = item.membership_name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const handleExport = () => {
    const exportData = memberships.map((item) => ({
      Name: item.membership_name,
      Discount: `${item.discount}${item.discount_type === "fixed" ? "₹" : "%"}`,
      Duration: item.subscription_plan,
      Price: `₹${item.membership_amount}`,
      Status: item.status === 1 ? "Active" : "Inactive",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Memberships");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    toast.success("Download Started");
    saveAs(blob, "Memberships.xlsx");
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center top-div">
        <p className="title">Memberships</p>
        <button className="btn apt-btn" onClick={toggleForm}>
          <i className="bi bi-plus-circle me-2"></i>Appointment
        </button>
        <AppointmentSidebar show={showForm} onClose={toggleForm} />
      </div>
      <div className="inner-div p-3 rounded">
        <div className="d-flex justify-content-between align-items-center">
          <button className="btn page-btn" onClick={handleExport}>
            <i className="bi bi-download me-2"></i>Export
          </button>
          <div className="d-flex justify-content-end align-items-center gap-3">
            <div className="dropdown">
              <select
                className="form-select custom-select-input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
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
              onClick={() => toggleMemberForm(null)}
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
                <th>Name</th>
                <th>Discount</th>
                <th>Duration</th>
                <th>Price</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredMemberships.length > 0 ? (
                filteredMemberships.map((item) => (
                  <tr key={item._id}>
                    <td>{item.membership_name}</td>
                    <td>
                      {item.discount}
                      {item.discount_type === "fixed" ? "₹" : "%"}
                    </td>
                    <td>{item.subscription_plan}</td>
                    <td>₹{item.membership_amount}</td>
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
                        onClick={() => toggleMemberForm(item)}
                      ></i>
                      <i
                        className="bi bi-trash text-danger"
                        role="button"
                        onClick={() =>
                          handleDelete(item._id, item.membership_name)
                        }
                      ></i>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-danger">
                    No memberships found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <MembershipSidebar
        show={showMemberForm}
        onClose={closeMemberForm}
        editData={editData}
        onSuccess={fetchMemberships}
      />
    </>
  );
};

export default Membership;
