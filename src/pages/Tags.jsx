import { useEffect, useState } from "react";
import "./pages.css";
import AppointmentSidebar from "../AddContext/AppointmentSidebar";
import TagSidebar from "../AddContext/TagSidebar";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import axios from "axios";

const Tags = () => {
  const [showForm, setShowForm] = useState(false);
  const [showTagSidebar, setShowTagSidebar] = useState(false);
  const [tags, setTags] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editingTag, setEditingTag] = useState(null);

  const toggleForm = () => setShowForm((prev) => !prev);

  const API_URL = import.meta.env.VITE_API_URL;
  const salonId = localStorage.getItem("salon_id");

  const openTagSidebarForNew = () => {
    setEditingTag(null);
    setShowTagSidebar(true);
  };

  const openTagSidebarForEdit = (tag) => {
    setEditingTag(tag);
    setShowTagSidebar(true);
  };

  const closeTagSidebar = () => {
    setShowTagSidebar(false);
    setEditingTag(null);
    fetchTags();
  };

  const fetchTags = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/tags?salon_id=${salonId}`);
      setTags(data.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch tags");
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleDelete = async (id, name) => {
    const confirm = await Swal.fire({
      title: `Delete <b>"${name}"</b> Tag?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        const response = await axios.delete(
          `${API_URL}/tags/${id}?salon_id=${salonId}`
        );
        if (response.status === 200) {
          toast.success("Tag deleted successfully");
          fetchTags();
        } else {
          toast.error("Failed to delete tag");
        }
      } catch (error) {
        console.error(error);
        toast.error("Something went wrong!");
      }
    }
  };

  const filteredTags = tags.filter((tag) => {
    const matchesSearch = tag.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All"
        ? true
        : statusFilter === "Active"
        ? tag.status === 1
        : tag.status !== 1;

    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <div className="d-flex justify-content-between align-items-center top-div">
        <p className="title">Tags</p>
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
              onClick={openTagSidebarForNew}
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
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTags.length > 0 ? (
                filteredTags.map((tag, index) => (
                  <tr key={tag._id}>
                    <td>{index + 1}</td>
                    <td>{tag.name}</td>
                    <td>
                      <span
                        className={`badge rounded-pill px-3 ${
                          tag.status === 1 ? "bg-success" : "bg-secondary"
                        }`}
                      >
                        {tag.status === 1 ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <i
                        className="bi bi-pencil-square text-info me-3"
                        role="button"
                        onClick={() => openTagSidebarForEdit(tag)}
                      ></i>
                      <i
                        className="bi bi-trash text-danger"
                        role="button"
                        onClick={() => handleDelete(tag._id, tag.name)}
                      ></i>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center text-danger">
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <TagSidebar
        show={showTagSidebar}
        onClose={closeTagSidebar}
        editingTag={editingTag}
      />
    </>
  );
};

export default Tags;
