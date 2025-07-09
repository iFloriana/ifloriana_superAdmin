import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./pages.css";
import AppointmentSidebar from "../AddContext/AppointmentSidebar";
import PayoutSidebar from "../AddContext/PayoutSidebar";

const StaffEarnings = () => {
  const [showForm, setShowForm] = useState(false);
  const [showPayoutsidebar, setShowPayoutsidebar] = useState(false);
  const [staffEarningsData, setStaffEarningsData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const salonId = localStorage.getItem("salon_id");

  const togglePayoutsidebar = (staff) => {
    setSelectedStaff(staff);
    setShowPayoutsidebar((prev) => !prev);
  };
  const toggleForm = () => setShowForm((prev) => !prev);

  useEffect(() => {
    const fetchStaffEarnings = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `${API_URL}/staffEarnings?salon_id=${salonId}`
        );
        if (response.data) {
          setStaffEarningsData(response.data);
        } else {
          toast.warn("No earnings data found in the response.");
          setStaffEarningsData([]);
        }
      } catch (err) {
        console.error("Error fetching staff earnings:", err);
        setError("Failed to fetch staff earnings. Please try again later.");
        toast.error("Failed to fetch staff earnings.");
      } finally {
        setLoading(false);
      }
    };

    fetchStaffEarnings();
  }, [API_URL]);

  const filteredEarnings = useMemo(() => {
    if (!searchTerm) {
      return staffEarningsData;
    }
    return staffEarningsData.filter((earning) =>
      earning.staff_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [staffEarningsData, searchTerm]);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center top-div">
        <p className="title">Staff Earnings</p>
        <button className="btn apt-btn" onClick={toggleForm}>
          <i className="bi bi-plus-circle me-2"></i>Appointment
        </button>
        <AppointmentSidebar show={showForm} onClose={toggleForm} />
      </div>
      <div className="inner-div p-3 rounded">
        <div className="d-flex justify-content-end">
          <div className="input-group input-group-dark custom-input-group-reviews">
            <span className="input-group-text custom-input-group-text">
              <i className="bi bi-search icon-brown"></i>
            </span>
            <input
              type="text"
              className="form-control custom-text-input"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="table-responsive custom-table-container mt-4">
          <table className="table table-dark table-bordered custom-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Total Booking</th>
                <th>Service Amount</th>
                <th>Commission Earning</th>
                <th>Tip Earning</th>
                <th>Staff Earning</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center text-dangert">
                    Loading staff earnings...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="8" className="text-center text-danger">
                    Staffs not found
                  </td>
                </tr>
              ) : filteredEarnings.length > 0 ? (
                filteredEarnings.map((earning) => (
                  <tr key={earning.staff_id}>
                    <td className="d-flex justify-content-center align-items-center gap-2">
                      {earning.staff_image && (
                        <img
                          src={earning.staff_image}
                          alt={earning.staff_name}
                          className="rounded-circle object-fit-cover"
                          width="40"
                          height="40"
                        />
                      )}
                      <span>{earning.staff_name}</span>
                    </td>
                    <td>{earning.total_booking}</td>
                    <td>₹ {earning.service_amount}</td>
                    <td>₹ {earning.commission_earning}</td>
                    <td>₹ {earning.tip_earning}</td>
                    <td>₹ {earning.staff_earning}</td>
                    <td>
                      <i
                        className="bi bi-cash-coin icon-crayon"
                        role="button"
                        onClick={() => togglePayoutsidebar(earning)}
                      ></i>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center text-danger">
                    No staff earnings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <PayoutSidebar
        show={showPayoutsidebar}
        onClose={() => togglePayoutsidebar(null)}
        selectedStaff={selectedStaff}
      />
    </>
  );
};

export default StaffEarnings;
