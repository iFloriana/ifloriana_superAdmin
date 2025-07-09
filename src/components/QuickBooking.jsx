import { useState, useEffect } from "react";
import axios from "axios";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import "./components.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const steps = [
  {
    title: "Select Branch",
    desc: "Choose the branch nearest to your location.",
  },
  {
    title: "Select Service",
    desc: "Select the desired service from the available options.",
  },
  {
    title: "Select Staff",
    desc: "Choose your preferred staff member for the service.",
  },
  {
    title: "Select Date & Time",
    desc: "Pick a suitable date and time for your booking.",
  },
  { title: "Customer Detail", desc: "Enter your personal details." },
  { title: "Confirmation", desc: "Confirm your booking." },
];

const QuickBooking = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [branches, setBranches] = useState([]);
  const [services, setServices] = useState([]);
  const [staffs, setStaffs] = useState([]);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");

  const [formData, setFormData] = useState({
    branch: null,
    service: [],
    staff: [],
    date: "",
    time: "",
    full_name: "",
    email: "",
    phone: "",
    gender: "",
  });

  const API_BASE = import.meta.env.VITE_API_URL;
  const salonId = localStorage.getItem("salon_id");

  useEffect(() => {
    if (currentStep === 0) {
      axios
        .get(`${API_BASE}/branches?salon_id=${salonId}`)
        .then((res) => setBranches(res.data.data))
        .catch((err) => console.error("Error fetching branches:", err));
    } else if (currentStep === 1) {
      axios
        .get(`${API_BASE}/services?salon_id=${salonId}`)
        .then((res) => setServices(res.data.data))
        .catch((err) => console.error("Error fetching services:", err));
    } else if (currentStep === 2) {
      axios
        .get(`${API_BASE}/staffs?salon_id=${salonId}`)
        .then((res) => setStaffs(res.data.data))
        .catch((err) => console.error("Error fetching staffs:", err));
    }
    setSearchQuery("");
  }, [currentStep, API_BASE, salonId]);

  useEffect(() => {
    if (currentStep === 4) {
      axios
        .get(`${API_BASE}/customers?salon_id=${salonId}`)
        .then((res) => setCustomers(res.data.data || []))
        .catch((err) => console.error("Error fetching customers:", err));
    }
  }, [currentStep]);

  const validateCurrentStep = () => {
    setValidationError("");

    switch (currentStep) {
      case 0:
        if (!formData.branch) {
          setValidationError("Please select a branch to proceed.");
          return false;
        }
        break;
      case 1:
        if (!formData.service.length) {
          setValidationError("Please select at least one service.");
          return false;
        }
        break;
      case 2:
        if (!formData.staff.length) {
          setValidationError("Please select at least one staff.");
          return false;
        }
        break;
      case 3:
        if (!formData.date || !formData.time) {
          setValidationError("Please select both a date and time to proceed.");
          return false;
        }
        break;
      case 4:
        const phoneRegex = /^(\+?\d{1,3}[- ]?)?\d{10,14}$/;

        if (!formData.phone || !phoneRegex.test(formData.phone)) {
          setValidationError("Please enter a valid phone number.");
          return false;
        }
        break;
      default:
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setBookingSuccess(false);
      setValidationError("");
    }
  };

  const toTitleCase = (str) => {
    return str
      .toLowerCase()
      .split(" ")
      .filter((word) => word.trim() !== "")
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateCurrentStep()) {
      return;
    }

    setValidationError("");

    const payload = {
      branch_id: formData.branch?._id,
      service_id: formData.service.map((s) => s._id),
      staff_id: formData.staff.map((s) => s._id),
      date: formData.date,
      time: formData.time,
      salon_id: salonId,
      payment_status: "Pending",
    };

    if (selectedCustomer) {
      payload.customer_id = selectedCustomer;
      payload.customer_details = null;
    } else {
      payload.customer_id = null;
      payload.customer_details = {
        full_name: toTitleCase(formData.full_name),
        email: formData.email,
        phone_number: formData.phone,
        gender: formData.gender,
      };
    }

    try {
      const res = await axios.post(`${API_BASE}/quick-booking`, payload);
      setBookingSuccess(true);
      setCurrentStep(currentStep + 1);
    } catch (err) {
      console.error(
        "Booking failed:",
        err.response ? err.response.data : err.message
      );
      setBookingSuccess(false);
      setValidationError(
        "Booking failed. " +
          (err.response?.data?.message ||
            "Please check your details and try again.")
      );
    }
  };

  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStaffs = staffs
    .filter((staff) => staff.branch_id._id === formData.branch?._id)
    .filter((staff) =>
      staff.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const renderStepContent = () => {
    return (
      <>
        {validationError && (
          <div className="alert alert-danger" role="alert">
            {validationError}
          </div>
        )}
        {(() => {
          switch (currentStep) {
            case 0:
              return (
                <div className="row">
                  {branches.length > 0 ? (
                    branches.map((branch) => (
                      <div
                        className="col-md-6"
                        key={branch._id}
                        onClick={() => {
                          setFormData({ ...formData, branch });
                          setValidationError("");
                        }}
                      >
                        <div
                          className={`card card-custom mb-3 ${
                            formData.branch?._id === branch._id
                              ? "selected"
                              : ""
                          }`}
                        >
                          <img
                            src={branch.image}
                            className="card-img-top rounded-circle mx-auto mt-3"
                            alt={branch.name}
                            style={{
                              width: "100px",
                              height: "100px",
                              objectFit: "cover",
                            }}
                          />
                          <div className="card-body text-center">
                            <h5>{branch.name}</h5>
                            <p>
                              <i className="bi bi-telephone-fill me-2"></i>
                              {branch.contact_number}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-danger">
                      No branches available.
                    </p>
                  )}
                </div>
              );
            case 1:
              return (
                <>
                  <div className="mb-3">
                    <input
                      type="text"
                      className="form-control form-control-cstm"
                      placeholder="Search services by name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="row">
                    {filteredServices.length > 0 ? (
                      filteredServices.map((service) => (
                        <div
                          className="col-md-3"
                          key={service._id}
                          onClick={() => {
                            const alreadySelected = formData.service.find(
                              (s) => s._id === service._id
                            );
                            const newServices = alreadySelected
                              ? formData.service.filter(
                                  (s) => s._id !== service._id
                                )
                              : [...formData.service, service];

                            setFormData({ ...formData, service: newServices });
                            setValidationError("");
                          }}
                        >
                          <div
                            className={`card card-custom mb-3 ${
                              formData.service.some(
                                (s) => s._id === service._id
                              )
                                ? "selected"
                                : ""
                            }`}
                          >
                            <div className="card-body text-center">
                              <h5>{service.name}</h5>
                              <p>{service.service_duration} min</p>
                              <hr />
                              <span className="badge bg-success fs-6">
                                ₹{service.regular_price}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-danger w-100">
                        No services found.
                      </p>
                    )}
                  </div>
                </>
              );
            case 2:
              return (
                <>
                  <div className="mb-3">
                    <input
                      type="text"
                      className="form-control form-control-cstm"
                      placeholder="Search staff by name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="row">
                    {filteredStaffs.length > 0 ? (
                      filteredStaffs.map((staff) => (
                        <div
                          className="col-md-3"
                          key={staff._id}
                          onClick={() => {
                            const alreadySelected = formData.staff.find(
                              (s) => s._id === staff._id
                            );
                            const newStaffs = alreadySelected
                              ? formData.staff.filter(
                                  (s) => s._id !== staff._id
                                )
                              : [...formData.staff, staff];

                            setFormData({ ...formData, staff: newStaffs });
                            setValidationError("");
                          }}
                        >
                          <div
                            className={`card card-custom mb-3 ${
                              formData.staff.some((s) => s._id === staff._id)
                                ? "selected"
                                : ""
                            }`}
                          >
                            <img
                              src={staff.image}
                              className="card-img-top rounded-circle mx-auto mt-3"
                              alt={staff.full_name}
                              style={{
                                width: "80px",
                                height: "80px",
                                objectFit: "cover",
                              }}
                            />
                            <div className="card-body text-center">
                              <h5>{staff.full_name}</h5>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-danger w-100">
                        No staff found.
                      </p>
                    )}
                  </div>
                </>
              );
            case 3:
              const shift = formData.staff?.assign_time || {
                start_shift: "07:00",
                end_shift: "20:00",
              };
              const timeSlots = generateTimeSlots(
                shift.start_shift,
                shift.end_shift
              );
              return (
                <div className="row">
                  <div className="col-md-5 border-end pe-4">
                    <label className="me-2 fw-bold">Select Date:</label>
                    <DatePicker
                      selected={formData.date ? new Date(formData.date) : null}
                      onChange={(date) => {
                        const formattedDate = date.toISOString().split("T")[0];
                        setFormData({
                          ...formData,
                          date: formattedDate,
                          time: "",
                        });
                      }}
                      dateFormat="yyyy-MM-dd"
                      className="form-control form-control-cstm"
                      placeholderText="Select date"
                      minDate={new Date()}
                      todayButton="Today"
                    />
                  </div>

                  <div className="col-md-7 ps-4">
                    <label className="mb-2 fw-bold">Select Time:</label>
                    <div
                      style={{ maxHeight: "440px", overflowY: "auto" }}
                      className="scrollable-y"
                    >
                      <div className="d-flex flex-wrap gap-2">
                        {timeSlots.map((slot) => (
                          <button
                            key={slot.value}
                            type="button"
                            className={`btn ${
                              formData.time === slot.value
                                ? "btn-dark border border-light"
                                : "btn-outline-light"
                            }`}
                            onClick={() =>
                              setFormData({ ...formData, time: slot.value })
                            }
                          >
                            {slot.display}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            case 4:
              return (
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">
                      Select Existing Customer
                    </label>
                    <select
                      className="form-control form-control-cstm"
                      value={selectedCustomer}
                      onChange={(e) => {
                        const id = e.target.value;
                        setSelectedCustomer(id);
                        if (id) {
                          const customer = customers.find((c) => c._id === id);
                          if (customer) {
                            setFormData({
                              ...formData,
                              full_name: customer.full_name || "",
                              email: customer.email || "",
                              phone: customer.phone_number || "",
                              gender: customer.gender || "",
                            });
                          }
                        } else {
                          setFormData({
                            ...formData,
                            full_name: "",
                            email: "",
                            phone: "",
                            gender: "",
                          });
                        }
                      }}
                    >
                      <option value="">-- Select Customer --</option>
                      {customers.map((cust) => (
                        <option key={cust._id} value={cust._id}>
                          {cust.full_name} ({cust.phone_number})
                        </option>
                      ))}
                    </select>
                  </div>
                  <hr />
                  <div className="mb-2">Or create new customer</div>
                  <div className="row mb-3">
                    <div className="col-md-12">
                      <label className="form-label" htmlFor="fullName">
                        Full Name <span className="text-danger">*</span>
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="Enter full name"
                        className="form-control form-control-cstm"
                        id="fullName"
                        value={formData.full_name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            full_name: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="email">
                        Email
                      </label>
                      <input
                        type="email"
                        placeholder="Enter email address"
                        className="form-control form-control-cstm"
                        id="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="phone">
                        Contact Number <span className="text-danger">*</span>
                      </label>
                      <PhoneInput
                        country={"in"}
                        value={formData.phone}
                        onChange={(phone) =>
                          setFormData({ ...formData, phone })
                        }
                        inputProps={{
                          name: "phone",
                          required: true,
                          className: "form-control form-control-cstm",
                          style: {
                            width: "100%",
                            backgroundColor: "#333333",
                            color: "white",
                          },
                        }}
                      />
                    </div>
                  </div>
                  <label className="form-label" htmlFor="gender">
                    Gender <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-control form-control-cstm mb-3"
                    id="gender"
                    value={formData.gender}
                    required
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value })
                    }
                  >
                    <option value="" hidden>
                      Select Gender
                    </option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  <div className="mt-4 d-flex justify-content-between">
                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={handleBack}
                    >
                      <i className="bi bi-arrow-left me-1"></i>Back
                    </button>
                    <button type="submit" className="btn page-btn">
                      <i className="bi bi-check2-circle me-1"></i>Submit Booking
                    </button>
                  </div>
                </form>
              );
            case 5:
              return (
                <>
                  {bookingSuccess ? (
                    <div className="text-center">
                      <i className="bi bi-check-circle-fill text-success display-1"></i>
                      <h3 className="text-success mt-3">Booking Confirmed!</h3>
                      <p>Appointment has been successfully booked.</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <i className="bi bi-x-circle-fill text-danger display-1"></i>
                      <h3 className="text-danger mt-3">Booking Failed!</h3>
                      <p>
                        There was an issue with your booking. Please try again.
                      </p>
                    </div>
                  )}
                  <hr className="my-4" />
                  <h5 className="mb-3 text-center">Booking Summary</h5>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <div className="card h-100 bg-dark text-white border-0">
                        <div className="card-body">
                          <h5 className="card-title mb-3">Branch Details</h5>
                          <div className="d-flex align-items-center mb-2">
                            {formData.branch?.image && (
                              <img
                                src={formData.branch.image}
                                alt={formData.branch.name}
                                className="rounded-circle me-3"
                                style={{
                                  width: "60px",
                                  height: "60px",
                                  objectFit: "cover",
                                }}
                              />
                            )}
                            <div>
                              <p className="card-text mb-0">
                                <strong>
                                  {formData.branch?.name || "N/A"}
                                </strong>
                              </p>
                              <p className="card-text mb-0">
                                <i className="bi bi-telephone-fill me-2"></i>
                                {formData.branch?.contact_number || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card h-100 bg-dark text-white border-0">
                        <div className="card-body">
                          <h5 className="card-title mb-3">Service & Staff</h5>
                          <p className="card-text mb-1">
                            <strong>Service:</strong>{" "}
                            {formData.service.map((s) => s.name).join(", ") ||
                              "N/A"}
                          </p>
                          <p className="card-text mb-1">
                            <strong>Price:</strong>{" "}
                            <span className="badge bg-success">
                              ₹
                              {formData.service && formData.service.length
                                ? formData.service.reduce(
                                    (sum, s) => sum + (s.regular_price || 0),
                                    0
                                  )
                                : "N/A"}
                            </span>
                          </p>
                          <p className="card-text mb-1">
                            <strong>Duration:</strong>{" "}
                            {formData.service && formData.service.length
                              ? formData.service.reduce(
                                  (sum, s) => sum + (s.service_duration || 0),
                                  0
                                ) + " min"
                              : "N/A"}
                          </p>
                          <p className="card-text mb-1 mt-3">
                            <strong>Staff Name:</strong>{" "}
                            {formData.staff
                              .map((s) => s.full_name)
                              .join(", ") || "N/A"}
                          </p>
                          <p className="card-text mb-1">
                            <strong>Date:</strong> {formData.date || "N/A"}
                          </p>
                          <p className="card-text mb-1">
                            <strong>Time:</strong> {formData.time || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="card h-100 bg-dark text-white border-0">
                        <div className="card-body">
                          <h5 className="card-title mb-3">Customer Details</h5>
                          <p className="card-text mb-1">
                            <strong>Name:</strong> {formData.full_name || "N/A"}
                          </p>
                          <p className="card-text mb-1">
                            <strong>Email:</strong> {formData.email || "N/A"}
                          </p>
                          <p className="card-text mb-1">
                            <strong>Phone:</strong> {formData.phone || "N/A"}
                          </p>
                          <p className="card-text mb-1">
                            <strong>Gender:</strong> {formData.gender || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {bookingSuccess && (
                    <div className="mt-4 d-flex justify-content-center">
                      <button
                        className="btn apt-btn"
                        type="button"
                        onClick={() => {
                          setCurrentStep(0);
                          setBookingSuccess(false);
                          setFormData({
                            branch: null,
                            service: null,
                            staff: null,
                            date: "",
                            time: "",
                            first_name: "",
                            last_name: "",
                            email: "",
                            phone: "",
                            gender: "",
                          });
                        }}
                      >
                        Book Another Appointment
                      </button>
                    </div>
                  )}
                </>
              );
            default:
              return null;
          }
        })()}
      </>
    );
  };

  const generateTimeSlots = (start, end) => {
    const slots = [];
    let [hour, minute] = start.split(":").map(Number);
    const [endHour, endMinute] = end.split(":").map(Number);

    while (hour < endHour || (hour === endHour && minute < endMinute)) {
      const timeStr = `${String(hour).padStart(2, "0")}:${String(
        minute
      ).padStart(2, "0")}`;
      const display = new Date(`1970-01-01T${timeStr}:00`).toLocaleTimeString(
        [],
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      );
      slots.push({ value: timeStr, display });
      minute += 15;
      if (minute >= 60) {
        hour += 1;
        minute = 0;
      }
    }
    return slots;
  };

  return (
    <div className="bg-dark text-white vh-100 d-flex justify-content-center align-items-center overflow-hidden">
      <div
        className="container w-75 border rounded bg-black p-4"
        style={{ height: "70vh", overflow: "hidden" }}
      >
        <div className="row h-100">
          <div
            className="col-md-4 border-end overflow-auto"
            style={{ maxHeight: "100%" }}
          >
            {steps.map((step, index) => (
              <div key={index} className="mb-4 d-flex align-items-start">
                <div className="me-3">
                  {index < currentStep ? (
                    <i className="bi bi-check-circle-fill text-success fs-5"></i>
                  ) : index === currentStep ? (
                    <i className="bi bi-record-circle text-danger"></i>
                  ) : (
                    <i className="bi bi-circle fs-5 text-muted"></i>
                  )}
                </div>
                <div>
                  <strong>{step.title}</strong>
                  <div style={{ fontSize: "0.875rem" }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div
            className="col-md-8 d-flex flex-column"
            style={{ maxHeight: "100%" }}
          >
            <div className="flex-grow-1 scrollable-y">
              <h4>{steps[currentStep].title}</h4>
              <hr />
              {renderStepContent()}
            </div>

            {currentStep !== 4 && currentStep !== 5 && (
              <div className="mt-4 d-flex justify-content-between">
                {currentStep > 0 && (
                  <button
                    className="btn btn-secondary"
                    type="button"
                    onClick={handleBack}
                  >
                    <i className="bi bi-arrow-left me-1"></i>Back
                  </button>
                )}
                <button
                  className="btn apt-btn"
                  type="button"
                  onClick={handleNext}
                >
                  Next <i className="bi bi-arrow-right-circle ms-1"></i>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickBooking;
