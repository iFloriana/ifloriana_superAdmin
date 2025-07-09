import { useEffect, useState } from "react";
import "./pages.css";
import AppointmentSidebar from "../AddContext/AppointmentSidebar";
import axios from "axios";
import moment from "moment";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

const Reviews = () => {
  const [showForm, setShowForm] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const toggleForm = () => setShowForm((prev) => !prev);

  const API_URL = import.meta.env.VITE_API_URL;
  const salonId = localStorage.getItem("salon_id");

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${API_URL}/reviews?salon_id=${salonId}`);
      if (Array.isArray(res.data.data)) {
        setReviews(res.data.data);
      } else {
        setReviews([]);
      }
    } catch (error) {
      toast.error("Failed to fetch reviews");
      setReviews([]);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/reviews/${id}?salon_id=${salonId}`);
        toast.success("Review deleted successfully");
        fetchReviews();
      } catch (error) {
        toast.error("Error deleting review");
      }
    }
  };

  const filteredReviews = reviews.filter((review) =>
    review?.customer_id?.full_name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="d-flex justify-content-between align-items-center top-div">
        <p className="title">Reviews</p>
        <button className="btn apt-btn" onClick={toggleForm}>
          <i className="bi bi-plus-circle me-2"></i>Appointment
        </button>
        <AppointmentSidebar show={showForm} onClose={toggleForm} />
      </div>
      <div className="inner-div p-3 rounded">
        <div className="d-flex justify-content-between align-items-center">
          <button className="btn page-btn">
            <i className="bi bi-download me-2"></i>Export
          </button>
          <div className="input-group input-group-dark custom-input-group-reviews">
            <span className="input-group-text custom-input-group-text">
              <i className="bi bi-search icon-brown"></i>
            </span>
            <input
              type="text"
              className="form-control custom-text-input"
              placeholder="Search by customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="table-responsive custom-table-container mt-4">
          <table className="table table-dark table-bordered custom-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Message</th>
                <th>Staff</th>
                <th>Rating</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.length > 0 ? (
                filteredReviews.map((review) => (
                  <tr key={review._id}>
                    <td className="d-flex justify-content-center align-items-center gap-2">
                      {review.customer_id?.image && (
                        <img
                          src={review.customer_id?.image}
                          alt="Customer"
                          className="rounded-circle"
                          width="40"
                          height="40"
                        />
                      )}
                      <div>
                        <div>{review.customer_id?.full_name}</div>
                        <div style={{ fontSize: "12px" }}>
                          {review.customer_id?.phone_number}
                        </div>
                      </div>
                    </td>
                    <td>{review.message}</td>
                    <td className="d-flex justify-content-center align-items-center gap-2">
                      {review.staff_id?.image && (
                        <img
                          src={review.staff_id?.image}
                          alt="Staff"
                          className="rounded-circle"
                          width="40"
                          height="40"
                        />
                      )}
                      <div>{review.staff_id?.full_name}</div>
                    </td>
                    <td>
                      <span className="bg-success px-2 py-1 rounded text-white">
                        {review.rating}
                      </span>
                    </td>
                    <td>{moment(review.updatedAt).fromNow()}</td>
                    <td>
                      <i
                        className="bi bi-trash text-danger"
                        role="button"
                        onClick={() => handleDelete(review._id)}
                      ></i>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-danger">
                    No reviews found
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

export default Reviews;
