import { useEffect, useState } from "react";
import "./pages.css";
import AppointmentSidebar from "../AddContext/AppointmentSidebar";
import CouponSidebar from "../AddContext/CouponSidebar";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import axios from "axios";
import moment from "moment";

const Coupon = () => {
  const [showForm, setShowForm] = useState(false);
  const [showCoupon, setShowCoupon] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingCoupon, setEditingCoupon] = useState(null);

  const toggleForm = () => setShowForm((prev) => !prev);
  const toggleCoupon = () => {
    setShowCoupon((prev) => !prev);
    if (showCoupon) {
      setEditingCoupon(null);
    }
  };

  const API_URL = import.meta.env.VITE_API_URL;
  const salonId = localStorage.getItem("salon_id");

  useEffect(() => {
    fetchCoupon();
  }, []);

  const fetchCoupon = async () => {
    try {
      const res = await axios.get(`${API_URL}/coupons?salon_id=${salonId}`);
      setCoupons(res.data.data);
    } catch (err) {
      toast.error("Failed to fetch coupons");
      console.error("Error fetching coupons:", err);
    }
  };

  const handleDelete = async (id, sname) => {
    const result = await Swal.fire({
      title: `Delete <b>${sname}</b> Coupon?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/coupons/${id}?salon_id=${salonId}`);
        toast.success("Coupon deleted successfully");
        fetchCoupon();
      } catch (err) {
        toast.error("Failed to delete coupon");
        console.error("Error deleting coupon:", err);
      }
    }
  };

  const handleEdit = (couponItem) => {
    setEditingCoupon(couponItem);
    setShowCoupon(true);
  };

  const filteredCoupons = coupons.filter((coupon) => {
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" && coupon.status === 1) ||
      (statusFilter === "Inactive" && coupon.status === 0);

    const matchesSearch =
      coupon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coupon.coupon_code.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <>
      <div className="d-flex justify-content-between align-items-center top-div">
        <p className="title">Coupons</p>
        <button className="btn apt-btn" onClick={toggleForm}>
          <i className="bi bi-plus-circle me-2"></i>Appointment
        </button>
        <AppointmentSidebar show={showForm} onClose={toggleForm} />
      </div>
      <div className="p-3 inner-div rounded">
        <div className="d-flex justify-content-between align-items-center">
          <div className="dropdown">
            <select
              className="form-select custom-select-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="d-flex justify-content-end align-items-center gap-3">
            <div className="input-group input-group-dark custom-input-group">
              <span className="input-group-text custom-input-group-text">
                <i className="bi bi-search icon-brown"></i>
              </span>
              <input
                type="text"
                className="form-control custom-text-input"
                placeholder="Search by name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              className="d-flex align-items-center page-btn"
              onClick={toggleCoupon}
            >
              <i className="bi bi-plus-circle-fill me-2"></i>
              New
            </button>
          </div>
        </div>
        <div className="table-responsive custom-table-container mt-4">
          <table className="table table-dark table-bordered custom-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Coupon Code</th>
                <th>Description</th>
                <th>Discount</th>
                <th>Use Limit</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Expired</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCoupons.length > 0 ? (
                filteredCoupons.map((coupon) => {
                  const endDate = moment(coupon.end_date);
                  const isExpired = endDate.isBefore(moment());
                  const discountLabel =
                    coupon.discount_type === "percent"
                      ? `${coupon.discount_amount} %`
                      : `₹ ${coupon.discount_amount}`;

                  return (
                    <tr key={coupon._id}>
                      <td>
                        {coupon.image && (
                          <img
                            className="me-3"
                            src={coupon.image}
                            alt={coupon.name}
                            style={{
                              width: "50px",
                              height: "50px",
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                        )}
                        {coupon.name}
                      </td>
                      <td>{coupon.coupon_code}</td>
                      <td
                        style={{
                          maxWidth: "200px",
                          whiteSpace: "normal",
                          wordWrap: "break-word",
                        }}
                      >
                        {coupon.description}
                      </td>

                      <td>{discountLabel}</td>
                      <td>{coupon.use_limit}</td>
                      <td>{moment(coupon.start_date).format("DD-MM-YYYY")}</td>
                      <td>{moment(coupon.end_date).format("DD-MM-YYYY")}</td>
                      <td>
                        <span
                          className={`badge ${
                            isExpired ? "bg-danger" : "bg-info text-dark"
                          }`}
                        >
                          {isExpired ? "Yes" : "No"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            coupon.status === 1 ? "bg-success" : "bg-secondary"
                          }`}
                        >
                          {coupon.status === 1 ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <i
                          className="bi bi-pencil-square me-3 icon-blue"
                          role="button"
                          onClick={() => handleEdit(coupon)}
                        ></i>
                        <i
                          className="bi bi-trash text-danger"
                          role="button"
                          onClick={() => handleDelete(coupon._id, coupon.name)}
                        ></i>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="11" className="text-center text-danger">
                    No Coupons found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <CouponSidebar
        show={showCoupon}
        onClose={toggleCoupon}
        editingCoupon={editingCoupon}
        refreshCoupons={fetchCoupon}
      />
    </>
  );
};

export default Coupon;
