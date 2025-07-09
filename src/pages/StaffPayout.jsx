import { useState, useEffect, useCallback } from "react";
import "./pages.css";
import AppointmentSidebar from "../AddContext/AppointmentSidebar";
import { toast } from "react-toastify";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const StaffPayout = () => {
  const [showForm, setShowForm] = useState(false);
  const [payoutData, setPayoutData] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [searchDate, setSearchDate] = useState("");

  const toggleForm = () => setShowForm((prev) => !prev);

  const API_URL = import.meta.env.VITE_API_URL;
  const salonId = localStorage.getItem("salon_id");

  const fetchPayouts = useCallback(async () => {
    try {
      const res = await axios.get(
        `${API_URL}/staff-payouts?salon_id=${salonId}`
      );
      setPayoutData(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  }, [API_URL, salonId]);

  useEffect(() => {
    fetchPayouts();
  }, [fetchPayouts]);

  const filteredPayouts = payoutData.filter((item) => {
    const nameMatch = item.staff?.name
      ?.toLowerCase()
      .includes(searchName.toLowerCase());
    const dateMatch = searchDate
      ? new Date(item.payment_date).toISOString().split("T")[0] === searchDate
      : true;
    return nameMatch && dateMatch;
  });

  const handleExport = () => {
    if (filteredPayouts.length === 0) {
      toast.info("No data to export.");
      return;
    }

    const exportData = filteredPayouts.map((item) => ({
      "Payment Date": new Date(item.payment_date).toLocaleDateString(),
      "Staff Name": item.staff?.name || "",
      Phone: item.staff?.phone || "",
      "Commission Amount": item.commission_amount || 0,
      "Tips Amount": item.tips_amount || 0,
      "Payment Type": item.payment_type || "-",
      "Total Pay": item.total_pay || 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payouts");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const fileData = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(fileData, "Staff_Payout_Report.xlsx");

    toast.success("Download Started!");
  };

  const handleReset = () => {
    setSearchName("");
    setSearchDate("");
    fetchPayouts();
    toast.info("list refreshed.");
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center top-div">
        <p className="title">Staff Payout Reports</p>
        <button className="btn apt-btn" onClick={toggleForm}>
          <i className="bi bi-plus-circle me-2"></i>Appointment
        </button>
        <AppointmentSidebar show={showForm} onClose={toggleForm} />
      </div>

      <div className="inner-div rounded p-3">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <button className="btn page-btn" onClick={handleExport}>
            <i className="bi bi-download me-2"></i>Export
          </button>
          <div className="d-flex gap-2 align-items-center">
            <input
              type="text"
              placeholder="Search by Staff Name"
              className="form-control custom-text-input"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
            <input
              type="date"
              className="form-control custom-text-input"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
            />
            <button className="btn page-btn" onClick={handleReset}>
              <i className="bi bi-arrow-clockwise"></i>
            </button>
          </div>
        </div>
        <div className="table-responsive custom-table-container mt-4">
          <table className="table table-dark table-bordered custom-table">
            <thead>
              <tr>
                <th>Payment Date</th>
                <th>Staff</th>
                <th>Commission Amount</th>
                <th>Tips Amount</th>
                <th>Payment Type</th>
                <th>Total Pay</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayouts.length > 0 ? (
                filteredPayouts.map((item, index) => (
                  <tr key={index}>
                    <td>{new Date(item.payment_date).toLocaleDateString()}</td>
                    <td>
                      <div className="d-flex justify-content-center align-items-center gap-2">
                        {item.staff?.image && (
                          <img
                            src={item.staff?.image || "/default.png"}
                            alt="staff"
                            width="40"
                            height="40"
                            style={{ borderRadius: "50%", objectFit: "cover" }}
                          />
                        )}
                        <div>
                          <div>{item.staff?.name}</div>
                          <div style={{ fontSize: "12px" }}>
                            {item.staff?.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>₹ {item.commission_amount || 0}</td>
                    <td>₹ {item.tips || 0}</td>
                    <td>{item.payment_type || "-"}</td>
                    <td>₹ {item.total_pay || 0}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-danger">
                    No payout data available
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

export default StaffPayout;
