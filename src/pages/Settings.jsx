import { useState } from "react";
import "./pages.css";
import AppointmentSidebar from "../AddContext/AppointmentSidebar";
import { toast } from "react-toastify";

const Settings = () => {
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("quickBooking");

  const toggleForm = () => setShowForm((prev) => !prev);

  const url_quick_booking = "http://localhost:5173/quickbooking";

  const handleCopy = () => {
    navigator.clipboard
      .writeText(url_quick_booking)
      .then(() => {
        toast.success("Link copied to clipboard!");
      })
      .catch((err) => {
        toast.error("Failed to copy link.");
        console.error("Failed to copy: ", err);
      });
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center top-div">
        <p className="title">Settings</p>
        <button className="btn apt-btn" onClick={toggleForm}>
          <i className="bi bi-plus-circle me-2"></i>Appointment
        </button>
        <AppointmentSidebar show={showForm} onClose={toggleForm} />
      </div>

      <div className="row inner-div rounded p-2 gap-5">
        <div className="col-md-2 bg-dark rounded text-white p-2">
          {/* Quick Booking */}
          <div
            className={`mb-2 p-2 rounded sidebar-item-setting ${
              activeTab === "quickBooking" ? "active" : ""
            }`}
            onClick={() => setActiveTab("quickBooking")}
          >
            <i className="bi-lightning-charge me-2 text-danger"></i>
            <span>Quick Booking</span>
          </div>
          {/* Footer */}
          {/* <div
            className={`my-2 p-2 rounded sidebar-item-setting ${
              activeTab === "footer" ? "active" : ""
            }`}
            onClick={() => setActiveTab("footer")}
          >
            <i className="bi bi-border-bottom me-2 icon-blue"></i>
            <span>Footer</span>
          </div>

          <div
            className={`my-2 p-2 rounded sidebar-item-setting ${
              activeTab === "logo" ? "active" : ""
            }`}
            onClick={() => setActiveTab("logo")}
          >
            <i className="bi bi-images me-2 icon-purple"></i>
            <span>Logo</span>
          </div> */}
        </div>
        <div className="col-md-9 bg-dark rounded text-white p-3">
          {activeTab === "quickBooking" && (
            <div className="container">
              <h5>Quick Booking Link</h5>
              <div className="my-3">
                <div
                  style={{ userSelect: "none" }}
                  onCopy={(e) => e.preventDefault()}
                >
                  {url_quick_booking}
                </div>
                <button className="btn page-btn mt-2" onClick={handleCopy}>
                  Copy Link
                </button>
              </div>
            </div>
          )}

          {activeTab === "footer" && (
            <div className="container">
              <h5>Footer Setting</h5>
              <div className="my-3">{/* fotter setting k liye code */}</div>
            </div>
          )}

          {activeTab === "logo" && (
            <div className="container">
              <h5>Update Logo</h5>
              <div className="my-3">{/* Logo setting k liye code */}</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Settings;
