import { useEffect, useState } from "react";
import "./pages.css";
import AppointmentSidebar from "../AddContext/AppointmentSidebar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BuyProducts from "../AddContext/BuyProducts";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

const Orders = () => {
  const [showForm, setShowForm] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orders, setOrders] = useState([]);
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [searchFilter, setSearchFilter] = useState("");

  const toggleForm = () => setShowForm((prev) => !prev);
  const toggleOrderForm = () => setShowOrderForm((prev) => !prev);

  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_URL;
  const salonId = localStorage.getItem("salon_id");

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_BASE}/order?salon_id=${salonId}`);
      setOrders(res.data.data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [API_BASE]);

  const handleDeleteOrder = async (orderId) => {
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
          await axios.delete(`${API_BASE}/order/${orderId}`);
          fetchOrders();
          toast.success("Order deleted successfully!");
        } catch (error) {
          console.error("Error deleting order:", error);
          toast.error("Failed to delete order. Please try again.");
        }
      }
    });
  };

  const filteredOrders = orders.filter((order) => {
    const paymentMatch =
      paymentFilter === "All" || order.payment_method === paymentFilter;

    const nameMatch = order.customer_id?.full_name
      ?.toLowerCase()
      .includes(searchFilter.toLowerCase());

    return paymentMatch && nameMatch;
  });

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center top-div">
        <p className="title">Orders</p>
        <div>
          <button className="btn apt-btn me-3" onClick={toggleForm}>
            <i className="bi bi-plus-circle me-2"></i>Appointment
          </button>
          <button className="btn page-btn" onClick={toggleOrderForm}>
            <i className="bi bi-cart-check-fill me-2"></i>Buy Product
          </button>
          <AppointmentSidebar show={showForm} onClose={toggleForm} />
          <BuyProducts show={showOrderForm} onClose={toggleOrderForm} />
        </div>
      </div>

      <div className="p-3 inner-div rounded">
        <div className="d-flex justify-content-end align-items-center gap-3 flex-wrap">
          <div className="dropdown">
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="form-select custom-select-input"
            >
              <option value="All">All Payment Methods</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
            </select>
          </div>

          <div className="input-group input-group-dark custom-input-group-reviews">
            <span className="input-group-text custom-input-group-text">
              <i className="bi bi-search icon-brown"></i>
            </span>
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="form-control custom-text-input"
              placeholder="Search by customer name..."
            />
          </div>
        </div>

        <div className="table-responsive custom-table-container mt-4">
          <table className="table table-dark table-bordered custom-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Contact Number</th>
                <th>Placed On</th>
                <th>Items</th>
                <th>Total Price</th>
                <th>Payment Method</th>
                <th>View</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order, index) => (
                  <tr key={index}>
                    <td>
                      {order.customer_id ? (
                        <div className="d-flex justify-content-center align-items-center gap-2">
                          {order.customer_id.image && (
                            <img
                              src={order.customer_id.image}
                              alt="Customer"
                              style={{
                                width: "50px",
                                height: "50px",
                                objectFit: "cover",
                                borderRadius: "50%",
                              }}
                            />
                          )}
                          <span>{order.customer_id?.full_name}</span>
                        </div>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td>{order.customer_id?.phone_number || "N/A"}</td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>{order.products?.length || 0}</td>
                    <td>₹{order.total_price || "N/A"}</td>
                    <td>{order.payment_method || "N/A"}</td>
                    <td>
                      <i
                        className="bi bi-eye-fill icon-yellow me-2"
                        role="button"
                        onClick={() =>
                          navigate("/orders/invoicedetails", {
                            state: { orderId: order._id },
                          })
                        }
                      ></i>
                      <i
                        className="bi bi-trash text-danger"
                        role="button"
                        onClick={() => handleDeleteOrder(order._id)}
                      ></i>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center text-danger">
                    No data found
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

export default Orders;
