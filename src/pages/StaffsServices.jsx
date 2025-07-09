import { useState, useEffect } from "react";
import axios from "axios";
import "./pages.css";
import AppointmentSidebar from "../AddContext/AppointmentSidebar";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";

const StaffsServices = () => {
  const [showForm, setShowForm] = useState(false);
  const [staffData, setStaffData] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("All");

  const toggleForm = () => setShowForm((prev) => !prev);

  const API_URL = import.meta.env.VITE_API_URL;
  const salonId = localStorage.getItem("salon_id");

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/staff-services-reports?salon_id=${salonId}`
        );
        if (response.data && response.data.data) {
          setStaffData(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching staff data:", error);
      }
    };

    fetchStaffData();
  }, [API_URL, salonId]);

  const filteredData = staffData.filter((staff) => {
    return selectedStaff === "All" || staff.staff_name === selectedStaff;
  });

  const handleExport = () => {
    const exportData = filteredData.map((staff, index) => ({
      "Sr. No.": index + 1,
      "Staff Name": staff.staff_name,
      Email: staff.staff_email || "N/A",
      "Total Services": staff.services,
      "Total Amount": staff.total_amount || 0,
      "Commission Amount": staff.commission_earn || 0,
      "Tips Earn": staff.tips_earn || 0,
      "Total Earning": staff.total_earning || 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Staff Report");

    XLSX.writeFile(workbook, "Staff_Services_Report.xlsx");

    toast.success("Download started");
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center top-div">
        <p className="title">Staff Services Reports</p>
        <button className="btn apt-btn" onClick={toggleForm}>
          <i className="bi bi-plus-circle me-2"></i>Appointment
        </button>
        <AppointmentSidebar show={showForm} onClose={toggleForm} />
      </div>
      <div className="inner-div rounded p-3">
        <div className="d-flex justify-content-between align-items-center">
          <button className="btn page-btn" onClick={handleExport}>
            <i className="bi bi-download me-2"></i>Export
          </button>

          <div className="d-flex justify-content-end align-items-center gap-3 custom-input-group">
            <div className="dropdown">
              <select
                className="form-select custom-select-input"
                value={selectedStaff}
                onChange={(e) => setSelectedStaff(e.target.value)}
              >
                <option value="All">Select employee</option>
                {Array.from(new Set(staffData.map((s) => s.staff_name))).map(
                  (name, idx) => (
                    <option key={idx} value={name}>
                      {name}
                    </option>
                  )
                )}
              </select>
            </div>
            <button
              className="btn page-btn"
              onClick={() => {
                setSelectedStaff("All");
                setSelectedDate("");
              }}
            >
              <i className="bi bi-arrow-clockwise"></i>
            </button>
          </div>
        </div>
        <div className="table-responsive custom-table-container mt-4">
          <table className="table table-dark table-bordered custom-table">
            <thead>
              <tr>
                <th>Sr. No.</th>
                <th>Staff</th>
                <th>Total Services</th>
                <th>Commission Amount</th>
                <th>Tips Earn</th>
                <th>Total Earning</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((staff, index) => (
                <tr key={staff._id}>
                  <td>{index + 1}</td>
                  <td>
                    <div className="d-flex justify-content-center align-items-center gap-2">
                      {staff.staff_image && (
                        <img
                          src={staff.staff_image}
                          alt={staff.staff_name}
                          width="40"
                          height="40"
                          className="rounded-circle object-fit-cover"
                        />
                      )}
                      <div>
                        <div>{staff.staff_name}</div>
                        <div className="small">
                          {staff.staff_email || "N/A"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{staff.service_count}</td>
                  <td>₹ {staff.commission || 0}</td>
                  <td>₹ {staff.tips || 0}</td>
                  <td>₹ {staff.total_earning || 0}</td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center text-danger">
                    No data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default StaffsServices;
