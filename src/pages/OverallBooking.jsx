import { useState, useEffect } from "react";
import axios from "axios";
import "./pages.css";
import AppointmentSidebar from "../AddContext/AppointmentSidebar";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";

const OverallBooking = () => {
  const [showForm, setShowForm] = useState(false);
  const [paymentData, setPaymentData] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState("All");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("All");

  const toggleForm = () => setShowForm((prev) => !prev);

  const API_URL = import.meta.env.VITE_API_URL;
  const INVOICE_API_URL = import.meta.env.VITE_INVOICE_URL;
  const salonId = localStorage.getItem("salon_id");

  const fetchPaymentData = async () => {
    try {
      const response = await axios.get(`${API_URL}/payments`, {
        params: { salon_id: salonId },
      });
      if (response.data.message === "Payments fetched successfully") {
        setPaymentData(response.data.data);
      } else {
        console.error("Failed to fetch data");
      }
    } catch (error) {
      console.error("API Error:", error);
    }
  };

  const handleViewBill = (invoiceUrl) => {
    if (!invoiceUrl) {
      toast.error("Invoice URL not available");
      return;
    }
    const fullInvoiceUrl = `${INVOICE_API_URL}${invoiceUrl}`;
    window.open(fullInvoiceUrl, "_blank");
  };

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const staffOptions = [
    "All",
    ...Array.from(new Set(paymentData.map((item) => item.staff_name || "N/A"))),
  ];

  const paymentMethodOptions = [
    "All",
    ...Array.from(
      new Set(paymentData.map((item) => item.payment_method || "N/A"))
    ),
  ];

  const filteredData = paymentData.filter((item) => {
    const matchesStaff =
      selectedStaff === "All" || (item.staff_name || "N/A") === selectedStaff;

    const matchesDate =
      !selectedDate ||
      formatDate(item.createdAt).includes(
        selectedDate.split("-").reverse().join("-")
      );

    const matchesPaymentMethod =
      selectedPaymentMethod === "All" ||
      (item.payment_method || "N/A") === selectedPaymentMethod;

    return matchesStaff && matchesDate && matchesPaymentMethod;
  });

  const handleExport = () => {
    const exportData = filteredData.map((item, index) => ({
      "Sr. No.": index + 1,
      "Booking Date": formatDate(item.createdAt),
      "Inv ID": item._id,
      "Total Service": item.service_count,
      "Total Service Amount": item.service_amount,
      Taxes: item.tax_amount,
      Tip: item.tips,
      "Payment Method": item.payment_method,
      "Total Amount": item.final_total,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");

    XLSX.writeFile(workbook, "Payment_Report.xlsx");

    toast.success("Download started");
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center top-div">
        <p className="title">Payment Reports</p>
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
                value={selectedPaymentMethod}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              >
                {paymentMethodOptions.map((method, idx) => (
                  <option key={idx} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>
            <input
              type="date"
              className="form-control custom-text-input custom-input-group-reviews"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <button
              className="btn page-btn"
              onClick={() => {
                setSelectedStaff("All");
                setSelectedDate("");
                setSelectedPaymentMethod("All"); // Reset payment method as well
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
                <th>Booking Date</th>
                <th>Inv ID</th>
                <th>Total Service</th>
                <th>Total Service Amount</th>
                <th>Taxes</th>
                <th>Tip</th>
                <th>Payment Method</th>
                <th>Total Amount</th>
                <th>Invoice</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center text-danger">
                    No payments found
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{formatDate(item.createdAt)}</td>
                    <td>{item._id}</td>
                    <td>{item.service_count}</td>
                    <td>₹ {item.service_amount}</td>
                    <td>₹ {item.tax_amount}</td>
                    <td>₹ {item.tips}</td>
                    <td>{item.payment_method}</td>
                    <td>₹ {item.final_total}</td>
                    <td className="text-center">
                      <i
                        className="bi bi-receipt icon-crayon"
                        onClick={() => handleViewBill(item.invoice_pdf_url)}
                        role="button"
                      ></i>
                    </td>
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

export default OverallBooking;
