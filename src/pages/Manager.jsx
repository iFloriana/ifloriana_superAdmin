import { useEffect, useState } from "react";
import "./pages.css";
import AppointmentSidebar from "../AddContext/AppointmentSidebar";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import ManagerSidebar from "../AddContext/ManagerSidebar";
import moment from "moment";

const Manager = () => {
  const [showForm, setShowForm] = useState(false);
  const [showManagerForm, setShowManagerForm] = useState(false);
  const [managers, setManagers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [managerToEdit, setManagerToEdit] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const salonId = localStorage.getItem("salon_id");

  const toggleForm = () => setShowForm((prev) => !prev);

  const toggleManagerForm = (manager = null) => {
    setManagerToEdit(manager);
    setShowManagerForm((prev) => !prev);
  };

  const fetchManagers = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/managers?salon_id=${salonId}`
      );
      setManagers(response.data.data);
    } catch (error) {
      console.error("Error fetching managers:", error);
      toast.error("Failed to fetch managers.");
    }
  };

  const handleDeleteManager = async (managerId, name) => {
    Swal.fire({
      title: `Delete <b>${name}</b> Manager?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(
            `${API_URL}/managers/${managerId}?salon_id=${salonId}`
          );
          toast.success("Manager deleted successfully!");
          fetchManagers();
        } catch (error) {
          console.error("Error deleting manager:", error);
          toast.error("Failed to delete manager.");
        }
      }
    });
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  const filteredManagers = managers.filter(
    (manager) =>
      `${manager.first_name} ${manager.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      manager.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      manager.contact_number.includes(searchTerm) ||
      manager.branch_id?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="d-flex justify-content-between align-items-center top-div">
        <p className="title">Managers List</p>
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            className="d-flex align-items-center page-btn"
            onClick={() => toggleManagerForm()}
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
                <th>Contact Number</th>
                <th>Email</th>
                <th>Branch</th>
                <th>Updated At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredManagers.length > 0 ? (
                filteredManagers.map((manager) => (
                  <tr key={manager._id}>
                    <td>
                      <div className="d-flex justify-content-center align-items-center">
                        {manager.image && (
                          <img
                            src={manager.image}
                            alt="Manager"
                            className="rounded-circle me-2 object-fit-cover"
                            style={{ width: "50px", height: "50px" }}
                          />
                        )}
                        {manager.first_name} {manager.last_name}
                      </div>
                    </td>
                    <td>{manager.contact_number}</td>
                    <td>{manager.email}</td>
                    <td>
                      {manager.branch_id ? (
                        <div className="d-flex justify-content-center align-items-center">
                          {manager.branch_id.image && (
                            <img
                              src={manager.branch_id.image}
                              alt="Branch"
                              className="rounded-circle me-2 object-fit-cover"
                              style={{ width: "50px", height: "50px" }}
                            />
                          )}
                          {manager.branch_id.name}
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>{moment(manager.updatedAt).fromNow()}</td>
                    <td>
                      <i
                        className="bi bi-pencil-square me-3 icon-blue"
                        role="button"
                        onClick={() => toggleManagerForm(manager)}
                      ></i>
                      <i
                        className="bi bi-trash text-danger"
                        role="button"
                        onClick={() =>
                          handleDeleteManager(manager._id, manager.first_name)
                        }
                      ></i>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-danger">
                    No managers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <ManagerSidebar
        show={showManagerForm}
        onClose={() => toggleManagerForm()}
        managerToEdit={managerToEdit}
        onSaveSuccess={fetchManagers}
      />
    </>
  );
};

export default Manager;
