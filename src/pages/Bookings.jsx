import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./pages.css";
import axios from "axios";
import AppointmentSidebar from "../AddContext/AppointmentSidebar";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PymentModel from "../popup/PymentModel";

const Bookings = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [appointmentToEdit, setAppointmentToEdit] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchDate, setSearchDate] = useState("");
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;
  const salonId = localStorage.getItem("salon_id");

  const fetchAppointments = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/appointments?salon_id=${salonId}`
      );
      setAppointments(res.data.data);
    } catch (err) {
      console.error("Error fetching appointments:", err);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [API_URL, salonId]);

  const toggleForm = () => {
    if (showForm) {
      setAppointmentToEdit(null);
    }
    setShowForm((prev) => !prev);
  };

  const handleEditClick = (appointment) => {
    setAppointmentToEdit(appointment);
    setShowForm(true);
  };

  const handleDeleteClick = async (appointmentId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_URL}/appointments/${appointmentId}`);
          fetchAppointments();
          toast.success("Appointment deleted successfully!");
        } catch (err) {
          console.error("Error deleting appointment:", err);
          toast.error("Failed to delete appointment. Please try again.");
        }
      }
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case "upcoming":
        return "badge custom-upcoming-badge";
      case "check-in":
        return "badge bg-warning text-dark";
      case "check-out":
        return "badge bg-success";
      case "cancelled":
        return "badge bg-danger";
      default:
        return "badge bg-secondary";
    }
  };

  const getPaymentStatusBadgeClass = (paymentStatus) => {
    switch (paymentStatus.toLowerCase()) {
      case "pending":
        return "badge bg-warning text-dark";
      case "paid":
        return "badge bg-success";
      default:
        return "badge bg-secondary";
    }
  };

  const capitalizeFirstLetter = (string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const handleOpenPaymentModalFromSidebar = (appointment) => {
    setSelectedAppointment(appointment);
    setShowPaymentModal(true);
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center top-div">
        <p className="title">Bookings</p>
        <div className="d-flex justify-content-end align-items-center gap-3">
          <button className="btn apt-btn" onClick={toggleForm}>
            <i className="bi bi-plus-circle me-2"></i>Appointment
          </button>
          <AppointmentSidebar
            show={showForm}
            onClose={toggleForm}
            appointmentData={appointmentToEdit}
            onAppointmentSaved={fetchAppointments}
            onOpenPaymentModal={handleOpenPaymentModalFromSidebar}
          />
          <button
            className="btn page-btn"
            onClick={() => navigate("/calendarbooking")}
          >
            <i className="bi bi-calendar-event-fill me-2"></i>
            Calendar View
          </button>
        </div>
      </div>
      <div className="p-3 inner-div rounded">
        <div className="d-flex justify-content-between align-items-center">
          <button className="btn page-btn">
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
                <option value="upcoming">Upcoming</option>
                <option value="check-in">Check-in</option>
                <option value="check-out">Check-out</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="input-group input-group-dark custom-input-group">
              <span className="input-group-text custom-input-group-text">
                <i className="bi bi-search icon-brown"></i>
              </span>
              <input
                type="date"
                className="form-control custom-text-input"
                placeholder="Search by Date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
              />
            </div>
            <button
              className="btn page-btn d-flex"
              onClick={() => setSortAsc((prev) => !prev)}
            >
              <i
                className={`bi ${
                  sortAsc ? "bi-caret-up-fill" : "bi-caret-down-fill"
                }`}
              ></i>
            </button>
          </div>
        </div>
        <div className="table-responsive custom-table-container mt-4">
          <table className="table table-dark table-bordered custom-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Client</th>
                <th>Amount</th>
                <th>Staff Name</th>
                <th>Services</th>
                <th>Membership</th>
                <th>Package</th>
                <th>Status</th>
                <th>Payment Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {appointments
                .filter((apt) => {
                  const matchesStatus =
                    statusFilter === "All" ||
                    apt.status?.toLowerCase() === statusFilter.toLowerCase();

                  const matchesDate =
                    !searchDate ||
                    new Date(apt.appointment_date).toLocaleDateString(
                      "en-CA"
                    ) === searchDate;

                  return matchesStatus && matchesDate;
                })
                .sort((a, b) => {
                  const dateA = new Date(a.appointment_date);
                  const dateB = new Date(b.appointment_date);
                  return sortAsc ? dateA - dateB : dateB - dateA;
                }).length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center text-danger">
                    No Bookings found
                  </td>
                </tr>
              ) : (
                appointments
                  .filter((apt) => {
                    const matchesStatus =
                      statusFilter === "All" ||
                      apt.status?.toLowerCase() === statusFilter.toLowerCase();

                    const matchesDate =
                      !searchDate ||
                      new Date(apt.appointment_date).toLocaleDateString(
                        "en-CA"
                      ) === searchDate;

                    return matchesStatus && matchesDate;
                  })
                  .sort((a, b) => {
                    const dateA = new Date(a.appointment_date);
                    const dateB = new Date(b.appointment_date);
                    return sortAsc ? dateA - dateB : dateB - dateA;
                  })
                  .map((apt, index) => (
                    <tr key={index}>
                      <td>
                        {apt.appointment_date
                          ? new Date(apt.appointment_date).toLocaleDateString()
                          : "-"}{" "}
                        - {apt.appointment_time}
                      </td>
                      <td>
                        <div className="d-flex justify-content-center align-items-center gap-2">
                          {apt.customer?.image && (
                            <img
                              src={apt.customer?.image}
                              alt="client"
                              width="40"
                              height="40"
                              className="rounded-circle object-fit-cover"
                            />
                          )}
                          <span>{apt.customer?.full_name}</span>
                        </div>
                      </td>
                      <td>₹ {apt.total_payment || "0"}</td>
                      <td>
                        {Array.isArray(apt.services) && apt.services.length > 0
                          ? apt.services.map((serviceObj, staffIndex) =>
                              serviceObj.staff ? (
                                <div
                                  key={staffIndex}
                                  className="d-flex justify-content-center align-items-center gap-2 mb-1"
                                >
                                  {serviceObj.staff.image && (
                                    <img
                                      src={serviceObj.staff.image}
                                      alt="staff"
                                      width="40"
                                      height="40"
                                      className="rounded-circle object-fit-cover"
                                    />
                                  )}
                                  <span>{serviceObj.staff.full_name}</span>
                                </div>
                              ) : null
                            )
                          : "-"}
                      </td>
                      <td>
                        {Array.isArray(apt.services) && apt.services.length > 0
                          ? apt.services.map((s, index) => (
                              <div key={index}>{s.service?.name}</div>
                            ))
                          : "-"}
                      </td>
                      <td>
                        {apt.customer?.branch_membership ? (
                          <span className="badge bg-secondary">Yes</span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>
                        {Array.isArray(apt.customer?.branch_package) &&
                        apt.customer.branch_package.length > 0 ? (
                          <span className="badge bg-secondary">Yes</span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>
                        <span className={getStatusBadgeClass(apt.status)}>
                          {capitalizeFirstLetter(apt.status)}
                        </span>
                      </td>
                      <td>
                        <span
                          className={getPaymentStatusBadgeClass(
                            apt.payment_status
                          )}
                        >
                          {apt.payment_status === "N/A"
                            ? "-"
                            : capitalizeFirstLetter(apt.payment_status)}
                        </span>
                      </td>
                      <td>
                        <i
                          className="bi bi-box-arrow-in-up-right icon-blue me-2"
                          role="button"
                          onClick={() => handleEditClick(apt)}
                        ></i>
                        <i
                          className="bi bi-trash text-danger me-2"
                          role="button"
                          onClick={() => handleDeleteClick(apt.appointment_id)}
                        ></i>
                        <i
                          className={`bi bi-receipt ${
                            apt.status?.toLowerCase() === "check-out"
                              ? "icon-crayon"
                              : "text-black"
                          }`}
                          role="button"
                          style={{
                            pointerEvents:
                              apt.status?.toLowerCase() === "check-out"
                                ? "auto"
                                : "none",
                            cursor:
                              apt.status?.toLowerCase() === "check-out"
                                ? "pointer"
                                : "not-allowed",
                          }}
                          onClick={() => {
                            setSelectedAppointment(apt);
                            setShowPaymentModal(true);
                          }}
                        ></i>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {showPaymentModal && selectedAppointment && (
        <PymentModel
          appointment={selectedAppointment}
          onClose={() => setShowPaymentModal(false)}
          onPaymentSuccess={fetchAppointments}
        />
      )}
    </>
  );
};

export default Bookings;
