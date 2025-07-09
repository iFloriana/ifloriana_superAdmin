import { useState, useEffect } from "react";
import "./pages.css";
import AppointmentSidebar from "../AddContext/AppointmentSidebar";
import axios from "axios";
import { useLocation } from "react-router-dom";

const InvoiceDetail = () => {
  const [showForm, setShowForm] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const toggleForm = () => setShowForm((prev) => !prev);

  const location = useLocation();
  const { orderId } = location.state || {};

  const API_BASE = import.meta.env.VITE_API_URL;
  const INVOICE_URL = import.meta.env.VITE_INVOICE_URL;
  const salonId = localStorage.getItem("salon_id");

  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      if (!orderId) return;
      try {
        const res = await axios.get(
          `${API_BASE}/order/${orderId}?salon_id=${salonId}`
        );
        if (res.data && res.data.invoice) {
          setInvoiceData({
            ...res.data.invoice,
            invoice_pdf_url: res.data.invoice_pdf_url,
          });
        } else {
          console.warn("Invoice data not found in response:", res.data);
          setInvoiceData(null);
        }
      } catch (error) {
        console.error("Error fetching invoice details:", error);
        setInvoiceData(null);
      }
    };

    fetchInvoiceDetails();
  }, [orderId, API_BASE, salonId]);

  const handleDownloadInvoice = () => {
    if (invoiceData?.invoice_pdf_url) {
      const fullInvoiceURL = `${INVOICE_URL}${invoiceData.invoice_pdf_url}`;
      console.log("Opening Invoice URL:", fullInvoiceURL);
      window.open(fullInvoiceURL, "_blank");
    } else {
      console.warn("No invoice PDF URL available.");
    }
  };

  if (!invoiceData) {
    return (
      <>
        <div className="d-flex justify-content-between align-items-center top-div">
          <p className="title">Orders</p>
          <button className="btn apt-btn" onClick={toggleForm}>
            <i className="bi bi-plus-circle me-2"></i>Appointment
          </button>
          <AppointmentSidebar show={showForm} onClose={toggleForm} />
        </div>
        <div className="p-3 inner-div rounded text-center text-light">
          NO invoice Found...
        </div>
      </>
    );
  }

  return (
    <>
      <div className="d-flex justify-content-between align-items-center top-div">
        <p className="title">Orders</p>
        <button className="btn apt-btn" onClick={toggleForm}>
          <i className="bi bi-plus-circle me-2"></i>Appointment
        </button>
        <AppointmentSidebar show={showForm} onClose={toggleForm} />
      </div>
      <div className="p-3 inner-div rounded">
        <div className="bg-dark rounded p-3 d-flex justify-content-between align-items-center">
          <button className="btn page-btn" onClick={handleDownloadInvoice}>
            <i className="bi bi-download me-2"></i>Download Invoice
          </button>
          <span className="text-light">
            Order Code: {invoiceData.order_code}
          </span>
        </div>

        <div className="invoice-container bg-dark p-4 mt-3 rounded shadow-sm text-white">
          <div className="text-center mb-4">
            <h2 className="fw-bold">{invoiceData.salon?.salon_name}</h2>
            <p className="mb-0">{invoiceData.branch?.name}</p>
            <p className="mb-0">{invoiceData.branch?.address}</p>
            <p className="mb-0">Phone: {invoiceData.branch?.contact_number}</p>
            <p className="mb-0">Email: {invoiceData.branch?.contact_email}</p>
            <h3 className="mt-3">Invoice</h3>
          </div>

          <div className="customer-details mb-4 border-top border-bottom py-2">
            <p className="mb-0">
              <strong>Order Code:</strong> {invoiceData.order_code}
            </p>
            <p className="mb-0">
              <strong>Customer:</strong> {invoiceData.customer?.full_name}
            </p>
            <p className="mb-0">
              <strong>Phone:</strong> {invoiceData.customer?.phone_number}
            </p>
            <p className="mb-0">
              <strong>Date:</strong>
              {new Date(invoiceData.createdAt).toLocaleString()}
            </p>
          </div>

          <h4 className="mb-3">Products</h4>
          <table className="table table-bordered table-dark mb-4">
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.products && invoiceData.products.length > 0 ? (
                invoiceData.products.map((item, index) => (
                  <tr key={index}>
                    <td>{item.product?.product_name || "N/A"}</td>
                    <td>{item.quantity}</td>
                    <td>{item.unit_price?.toFixed(2) || "N/A"}</td>
                    <td>{item.total_price?.toFixed(2) || "N/A"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="summary text-end border-top pt-3">
            <p className="mb-0">
              <strong>Subtotal:</strong> ₹{invoiceData.total_price?.toFixed(2)}
            </p>
            <p className="mb-0">
              <strong>Tax:</strong> ₹0.00
            </p>{" "}
            <h5 className="mt-2">
              <strong>Total Payable:</strong> ₹
              {invoiceData.total_price?.toFixed(2)}
            </h5>
          </div>

          <div className="text-center mt-5">
            <p className="mb-0">Thank you for choosing us!</p>
            <p className="mb-0 fst-italic">
              This is a system-generated invoice.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default InvoiceDetail;
