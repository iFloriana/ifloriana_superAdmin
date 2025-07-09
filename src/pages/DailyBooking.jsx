import { useState, useEffect } from "react";
import axios from "axios";
import AppointmentSidebar from "../AddContext/AppointmentSidebar";
import "./pages.css";

const DailyBooking = () => {
  const [showForm, setShowForm] = useState(false);
  const [bookingData, setBookingData] = useState([]);
  const [sortOrder, setSortOrder] = useState("desc");

  const toggleForm = () => setShowForm((prev) => !prev);

  const API_URL = import.meta.env.VITE_API_URL;
  const salonId = localStorage.getItem("salon_id");

  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        const response = await axios.get(`${API_URL}/dailyBookings`, {
          params: { salon_id: salonId },
        });
        if (response.data && response.data.data) {
          const sorted = [...response.data.data].sort(
            (a, b) => new Date(b.date) - new Date(a.date)
          );
          setBookingData(sorted);
        }
      } catch (error) {
        console.error("Error fetching booking data:", error);
      }
    };

    fetchBookingData();
  }, [API_URL, salonId]);

  const handleSortByDate = () => {
    const newOrder = sortOrder === "asc" ? "desc" : "asc";
    const sortedData = [...bookingData].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return newOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    setSortOrder(newOrder);
    setBookingData(sortedData);
  };

  const formatDate = (isoDate) => {
    const [year, month, day] = isoDate.split("-");
    return `${day}-${month}-${year}`;
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center top-div">
        <p className="title">Daily Bookings Reports</p>
        <div className="d-flex justify-content-end align-items-center gap-3">
          <button className="btn apt-btn" onClick={toggleForm}>
            <i className="bi bi-plus-circle me-2"></i>Appointment
          </button>
          <AppointmentSidebar show={showForm} onClose={toggleForm} />
        </div>
      </div>

      <div className="inner-div p-3 rounded">
        <div className="d-flex justify-content-between">
          <button className="btn page-btn">
            <i className="bi bi-download me-2"></i>Export
          </button>
          <button className="btn page-btn" onClick={handleSortByDate}>
            {sortOrder === "asc" ? (
              <i className="bi bi-caret-up-fill"></i>
            ) : (
              <i className="bi bi-caret-down-fill"></i>
            )}
          </button>
        </div>

        <div className="table-responsive custom-table-container mt-4">
          <table className="table table-dark table-bordered custom-table">
            <thead>
              <tr>
                <th>Booking Date</th>
                <th>Total Booking</th>
                <th>Total Services</th>
                <th>Service Amount</th>
                <th>Tax Amount</th>
                <th>Tip Amount</th>
                <th>Additional Discount</th>
                <th>Final Amount</th>
              </tr>
            </thead>
            <tbody>
              {bookingData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center">
                    No data available
                  </td>
                </tr>
              ) : (
                bookingData.map((item, index) => (
                  <tr key={index}>
                    <td>{formatDate(item.date)}</td>
                    <td>{item.appointmentsCount}</td>
                    <td>{item.servicesCount}</td>
                    <td>{item.serviceAmount}</td>
                    <td>{item.taxAmount}</td>
                    <td>{item.tipsEarning}</td>
                    <td>{item.additionalDiscount}</td>
                    <td>{item.finalAmount}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default DailyBooking;
