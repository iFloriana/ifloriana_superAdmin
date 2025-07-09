import { useState, useEffect } from "react";
import axios from "axios";
import AppointmentSidebar from "../AddContext/AppointmentSidebar";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import CommissionSidebar from "../AddContext/CommissionSidebar";

const Commission = () => {
  const [showForm, setShowForm] = useState(false);
  const [showCommission, setShowCommission] = useState(false);
  const [commissions, setCommissions] = useState([]);
  const [editingCommission, setEditingCommission] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const salonId = localStorage.getItem("salon_id");

  const toggleCommission = () => {
    setShowCommission((prev) => !prev);
    if (!showCommission) {
      setEditingCommission(null);
    }
  };
  const toggleForm = () => setShowForm((prev) => !prev);

  useEffect(() => {
    fetchCommissions();
  }, []);

  const fetchCommissions = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/revenue-commissions?salon_id=${salonId}`
      );
      setCommissions(res.data.data);
    } catch (error) {
      toast.error("Failed to fetch commissions");
    }
  };

  const handleDelete = (id, name) => {
    Swal.fire({
      title: `Delete <b>${name}</b> Commission?`,
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
            `${API_URL}/revenue-commissions/${id}?salon_id=${salonId}`
          );
          toast.success("Commission deleted successfully");
          fetchCommissions();
        } catch (error) {
          toast.error("Failed to delete commission");
        }
      }
    });
  };

  const handleEdit = (commissionData) => {
    setEditingCommission(commissionData);
    setShowCommission(true);
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center top-div">
        <p className="title">Commission</p>
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
              placeholder="Search State..."
            />
          </div>
          <button
            className="d-flex align-items-center page-btn"
            onClick={toggleCommission}
          >
            <i className="bi bi-plus-circle-fill me-2"></i>New
          </button>
        </div>

        <div className="table-responsive custom-table-container mt-4">
          <table className="table table-dark table-bordered custom-table">
            <thead>
              <tr>
                <th rowSpan={2}>Sr. No.</th>
                <th rowSpan={2}>Name</th>
                <th rowSpan={2}>Branch</th>
                <th colSpan={2} className="text-center">
                  Commission
                </th>
                <th rowSpan={2}>Action</th>
              </tr>
              <tr>
                <th>Slot</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {commissions.map((item, i) =>
                item.commission.map((slot, index) => (
                  <tr key={slot._id}>
                    {index === 0 && (
                      <>
                        <td rowSpan={item.commission.length}>{i + 1}</td>
                        <td rowSpan={item.commission.length}>
                          {item.commission_name}
                        </td>
                        <td rowSpan={item.commission.length}>
                          {item.branch_id?.name || "-"}
                        </td>
                      </>
                    )}
                    <td>{slot.slot}</td>
                    <td>
                      {slot.amount}
                      {item.commission_type === "Percentage" ? " %" : " ₹"}
                    </td>
                    {index === 0 && (
                      <td rowSpan={item.commission.length}>
                        <i
                          className="bi bi-pencil-square me-3 icon-blue"
                          role="button"
                          onClick={() => handleEdit(item)}
                        ></i>
                        <i
                          className="bi bi-trash text-danger"
                          role="button"
                          onClick={() =>
                            handleDelete(item._id, item.commission_name)
                          }
                        ></i>
                      </td>
                    )}
                  </tr>
                ))
              )}
              {commissions.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-danger">
                    No commission found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <CommissionSidebar
        show={showCommission}
        onClose={toggleCommission}
        fetchCommissions={fetchCommissions}
        editingCommission={editingCommission}
      />
    </>
  );
};

export default Commission;
