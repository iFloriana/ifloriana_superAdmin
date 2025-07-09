import { useState, useEffect } from "react";
import AppointmentSidebar from "../AddContext/AppointmentSidebar";
import axios from "axios";
import "./pages.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const OrderReport = () => {
  const [showForm, setShowForm] = useState(false);
  const [orderReports, setOrderReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [searchDate, setSearchDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const toggleForm = () => setShowForm((prev) => !prev);

  const API_URL = import.meta.env.VITE_API_URL;
  const salonId = localStorage.getItem("salon_id");

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${API_URL}/order?salon_id=${salonId}`
        );
        const data = response.data.data || [];

        const transformed = data.map((order) => {
          const customer = order.customer_id;

          return {
            order_code: order.order_code,
            customer: {
              name: customer?.full_name || "N/A",
              image: customer?.image || "/default-user.png",
              phone_number: customer?.phone_number || "N/A",
            },
            order_date: order.createdAt,
            product_count: order.products?.length || 0,
            payment_status: order.payment_method,
            total_payment: order.total_price,
          };
        });

        setOrderReports(transformed);
        setFilteredReports(transformed);
      } catch (err) {
        setError("Failed to fetch order reports.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [API_URL, salonId]); // Added API_URL and salonId to dependency array

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${mm}-${dd}-${yyyy}`;
  };

  const handleSearchDateChange = (e) => {
    const selectedDate = e.target.value;
    setSearchDate(selectedDate);

    const filtered = orderReports.filter((report) => {
      return report.order_date?.slice(0, 10) === selectedDate;
    });

    setFilteredReports(filtered);
  };

  const handleExport = () => {
    if (filteredReports.length === 0) {
      toast.warning("No data available to export.");
      return;
    }

    const exportData = filteredReports.map((report, index) => ({
      "Sr. No.": index + 1,
      "Order Code": report.order_code,
      "Customer Name": report.customer.name,
      "Phone Number": report.customer.phone_number,
      "Order Date": formatDate(report.order_date),
      Items: report.product_count,
      "Payment Method": report.payment_status,
      "Total Payment": `₹ ${report.total_payment}`,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Order Reports");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `OrderReports_${new Date().toISOString().split("T")[0]}.xlsx`);

    toast.success("Download started...");
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center top-div">
        <p className="title">Order Reports</p>
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
            <input
              type="date"
              value={searchDate}
              onChange={handleSearchDateChange}
              className="form-control custom-select-input custom-input-group-reviews"
            />
            <button
              className="btn page-btn"
              onClick={() => {
                setSearchDate("");
                setFilteredReports(orderReports);
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
                <th>Order Code</th>
                <th>Customer</th>
                <th>Phone Number</th>
                <th>Order Date</th>
                <th>Items</th>
                <th>Payment Method</th>
                <th>Total Payment</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center">
                    Loading order reports...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="8" className="text-center text-danger">
                    Error: {error}
                  </td>
                </tr>
              ) : filteredReports.length > 0 ? (
                filteredReports.map((report, index) => (
                  <tr key={report.order_code || index}>
                    <td>{index + 1}</td>
                    <td>{report.order_code || "-"}</td>
                    <td>
                      {report.customer ? (
                        <div className="d-flex justify-content-center align-items-center gap-2">
                          {report.customer_id?.image && (
                            <img
                              src={report.customer.image}
                              alt="Customer"
                              style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                                objectFit: "cover",
                              }}
                            />
                          )}
                          <div>
                            <div>{report.customer.name}</div>
                          </div>
                        </div>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td>{report.customer.phone_number}</td>
                    <td>{formatDate(report.order_date)}</td>
                    <td>{report.product_count}</td>
                    <td>{report.payment_status}</td>
                    <td>₹ {report.total_payment}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center text-danger">
                    No order reports available.
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

export default OrderReport;
