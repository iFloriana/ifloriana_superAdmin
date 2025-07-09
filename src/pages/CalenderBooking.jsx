import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./pages.css";
import AppointmentSidebar from "../AddContext/AppointmentSidebar";
import axios from "axios";
import moment from "moment";

const CalenderBooking = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [staffs, setStaffs] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedDate, setSelectedDate] = useState(moment());
  const [currentTimeIndex, setCurrentTimeIndex] = useState();
  const [prefilledData, setPrefilledData] = useState(null);

  const calendarGridWrapperRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const salonId = localStorage.getItem("salon_id");

  const toggleForm = () => setShowForm((prev) => !prev);

  const handleCellClick = (time, staff, appointment = null) => {
    if (appointment) {
      setPrefilledData({
        ...appointment,
        appointment_date: moment(appointment.appointment_date).format(
          "YYYY-MM-DD"
        ),
        branch_id: appointment.branch?._id || appointment.branch_id,
        customer_id: appointment.customer?._id,
        services: appointment.services.map((service) => ({
          service_id: service.service?._id || service.service_id,
          staff_id: service.staff?._id || service.staff_id,
          price: service.price || 0,
        })),
        products: appointment.products || [],
      });
    } else {
      setPrefilledData({
        appointment_date: selectedDate.format("YYYY-MM-DD"),
        appointment_time: time,
        branch_id: selectedBranch,
        services: [
          {
            service_id: "",
            staff_id: staff._id,
            price: 0,
          },
        ],
      });
    }
    setShowForm(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dateParam = selectedDate.format("YYYY-MM-DD");
        const [aptRes, staffRes, branchesRes] = await Promise.all([
          axios.get(
            `${API_URL}/appointments?salon_id=${salonId}&date=${dateParam}`
          ),
          axios.get(`${API_URL}/staffs?salon_id=${salonId}`),
          axios.get(`${API_URL}/branches?salon_id=${salonId}`),
        ]);

        if (selectedBranch === "" && branchesRes.data.data.length > 0) {
          setSelectedBranch(branchesRes.data.data[0]._id);
        }

        setAppointments(aptRes.data.data || []);
        setStaffs(staffRes.data.data || []);
        setBranches(branchesRes.data.data);
      } catch (err) {
        console.error("Calendar data load error", err);
      }
    };
    fetchData();
  }, [selectedDate, API_URL, salonId, selectedBranch]);

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let min = 0; min < 60; min += 15) {
        const time = `${hour.toString().padStart(2, "0")}:${min
          .toString()
          .padStart(2, "0")}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const getCurrentTimeIndex = () => {
    const now = moment();
    if (now.isSame(selectedDate, "day")) {
      const currentHour = now.hour();
      const currentMinute = now.minute();
      const roundedMinutes = Math.floor(currentMinute / 15) * 15;
      const currentTimeString = `${currentHour
        .toString()
        .padStart(2, "0")}:${roundedMinutes.toString().padStart(2, "0")}`;

      let index = timeSlots.findIndex((t) => t === currentTimeString);

      if (index !== -1) {
        const minutesIntoSlot = currentMinute % 15;
        const pxPerMinute = 40 / 15;
        return index + (minutesIntoSlot * pxPerMinute) / 40;
      }
      return undefined;
    }
    return undefined;
  };

  useEffect(() => {
    setCurrentTimeIndex(getCurrentTimeIndex());
    const interval = setInterval(() => {
      setCurrentTimeIndex(getCurrentTimeIndex());
    }, 60000);
    return () => clearInterval(interval);
  }, [selectedDate, timeSlots]);

  useEffect(() => {
    if (
      currentTimeIndex !== undefined &&
      calendarGridWrapperRef.current &&
      moment().isSame(selectedDate, "day")
    ) {
      const timeLinePosition = currentTimeIndex * 40;
      const wrapperHeight = calendarGridWrapperRef.current.clientHeight;
      const scrollNeeded = timeLinePosition - wrapperHeight / 2;

      const maxScrollTop =
        calendarGridWrapperRef.current.scrollHeight - wrapperHeight;
      const targetScrollTop = Math.max(0, Math.min(scrollNeeded, maxScrollTop));

      calendarGridWrapperRef.current.scrollTo({
        top: targetScrollTop,
        behavior: "smooth",
      });
    }
  }, [currentTimeIndex, calendarGridWrapperRef, selectedDate, staffs]);

  const formatHeaderDate = (date) => {
    return date.format("MMM D,YYYY");
  };

  const goToPreviousDay = () => {
    setSelectedDate(selectedDate.clone().subtract(1, "day"));
  };

  const goToNextDay = () => {
    setSelectedDate(selectedDate.clone().add(1, "day"));
  };

  const filteredStaffs = selectedBranch
    ? staffs.filter((staff) => staff.branch_id?._id === selectedBranch)
    : staffs;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center top-div">
        <p className="title">Bookings</p>
        <div className="d-flex justify-content-end align-items-center gap-3">
          <button className="btn apt-btn" onClick={toggleForm}>
            <i className="bi bi-plus-circle me-2"></i>Appointment
          </button>
          <AppointmentSidebar
            show={showForm}
            onClose={() => {
              toggleForm();
              setPrefilledData(null);
            }}
            onAppointmentSaved={() => {
              const dateParam = selectedDate.format("YYYY-MM-DD");
              axios
                .get(
                  `${API_URL}/appointments?salon_id=${salonId}&date=${dateParam}`
                )
                .then((res) => setAppointments(res.data.data || []));
            }}
            appointmentData={prefilledData}
          />
          <button
            className="btn page-btn"
            onClick={() => navigate("/bookings")}
          >
            <i className="bi bi-table me-2"></i>
            Datatable View
          </button>
        </div>
      </div>
      <div className="inner-div p-3 rounded">
        <div>
          <div className="d-flex justify-content-end mb-4">
            <div className="dropdown">
              <select
                className="form-select bg-dark text-light border-secondary"
                id="branch-select"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
              >
                {branches.map((branch) => (
                  <option key={branch._id} value={branch._id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="d-flex justify-content-between align-items-center mb-3 gap-3">
            <button className="btn btn-secondary" onClick={goToPreviousDay}>
              <i className="bi bi-caret-left-fill"></i>
            </button>
            <h5 className="text-white">{formatHeaderDate(selectedDate)}</h5>
            <button className="btn btn-secondary" onClick={goToNextDay}>
              <i className="bi bi-caret-right-fill"></i>
            </button>
          </div>

          <div className="calendar-grid-wrapper" ref={calendarGridWrapperRef}>
            <div className="calendar-grid">
              <div className="calendar-header">
                <div className="time-col"></div>
                {filteredStaffs.map((staff) => (
                  <div
                    key={staff._id}
                    className="staff-col d-flex justify-content-center align-items-center"
                  >
                    {staff.image && (
                      <img
                        src={staff.image}
                        alt={staff.full_name}
                        className="rounded-circle mb-1 me-2"
                        style={{
                          width: "40px",
                          height: "40px",
                          objectFit: "cover",
                        }}
                      />
                    )}
                    {staff.full_name}
                  </div>
                ))}
              </div>
              <div className="calendar-body">
                {timeSlots.map((time) => (
                  <div key={time} className="time-row">
                    <div className="time-col">{time}</div>
                    {filteredStaffs.map((staff) => {
                      const hasAppointment = appointments.some((apt) => {
                        const aptDateMoment = moment(apt.appointment_date);
                        const isSameDay = aptDateMoment.isSame(
                          selectedDate,
                          "day"
                        );
                        const isSameTime = apt.appointment_time === time;
                        const isStaffMatch = apt.services.some(
                          (s) => s.staff?._id === staff._id
                        );
                        return isSameDay && isSameTime && isStaffMatch;
                      });

                      return (
                        <div
                          key={staff._id}
                          className={`cell ${
                            hasAppointment ? "has-appointment" : ""
                          }`}
                          onClick={() => {
                            const apt = appointments.find((apt) => {
                              const aptDateMoment = moment(
                                apt.appointment_date
                              );
                              const isSameDay = aptDateMoment.isSame(
                                selectedDate,
                                "day"
                              );
                              const isSameTime = apt.appointment_time === time;
                              const isStaffMatch = apt.services.some(
                                (s) => s.staff?._id === staff._id
                              );
                              return isSameDay && isSameTime && isStaffMatch;
                            });
                            handleCellClick(time, staff, apt);
                          }}
                          style={{
                            cursor: "pointer",
                          }}
                        >
                          {appointments
                            .filter((apt) => {
                              const aptDateMoment = moment(
                                apt.appointment_date
                              );
                              const isSameDay = aptDateMoment.isSame(
                                selectedDate,
                                "day"
                              );
                              const isSameTime = apt.appointment_time === time;
                              const isStaffMatch = apt.services.some(
                                (s) => s.staff?._id === staff._id
                              );
                              return isSameDay && isSameTime && isStaffMatch;
                            })
                            .map((apt) => (
                              <div
                                className={`appointment-block ${apt.status}`}
                                key={apt.appointment_id}
                              >
                                Customer: {apt.customer?.full_name} <br />
                                Service:{" "}
                                {apt.services
                                  .map((s) => s.service?.name)
                                  .join(", ")}
                              </div>
                            ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
                {currentTimeIndex !== undefined &&
                  moment().isSame(selectedDate, "day") && (
                    <div
                      className="current-time-line"
                      style={{ top: `${currentTimeIndex * 40}px` }}
                    />
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CalenderBooking;
