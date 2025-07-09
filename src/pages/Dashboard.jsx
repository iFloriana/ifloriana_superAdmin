import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ComposedChart,
  Bar,
  Legend,
  Line as ChartLine,
} from "recharts";
import "./pages.css";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { DateRange } from "react-date-range";

const Dashboard = () => {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  const salonId = localStorage.getItem("salon_id");

  const today = new Date();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(today.getDate() - 7);

  const [dateRange, setDateRange] = useState({
    startDate: oneWeekAgo.toISOString().split("T")[0],
    endDate: today.toISOString().split("T")[0],
  });

  const [showCalendar, setShowCalendar] = useState(false);
  const [selectionRange, setSelectionRange] = useState({
    startDate: oneWeekAgo,
    endDate: today,
    key: "selection",
  });

  const [dashboardData, setDashboardData] = useState({
    appointmentCount: 0,
    totalCommission: 0,
    customerCount: 0,
    orderCount: 0,
    productSales: 0,
    topServices: [],
    upcomingAppointments: [],
    lineChart: [],
    barChart: [],
  });

  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);

  const fetchBranches = async () => {
    try {
      const response = await fetch(
        `${API_URL}/branches/names?salon_id=${salonId}`
      );
      const data = await response.json();
      setBranches(
        data.data.map((branch) => ({
          value: branch._id,
          label: branch.name,
        }))
      );
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  useEffect(() => {
    if (salonId) {
      fetchBranches();
      fetchDashboardData();
    }
  }, [salonId]);

  const fetchDashboardData = async () => {
    try {
      const branchParam = selectedBranch
        ? `&branch_id=${selectedBranch.value}`
        : "";
      const response = await fetch(
        `${API_URL}/dashboard?salon_id=${salonId}${branchParam}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
      );
      const data = await response.json();
      setDashboardData((prev) => ({ ...prev, ...data }));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const fetchChartData = async () => {
    try {
      const branchParam = selectedBranch
        ? `&branch_id=${selectedBranch.value}`
        : "";
      const res = await fetch(
        `${API_URL}/dashboard/dashboard-summary?salon_id=${salonId}${branchParam}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
      );
      const result = await res.json();
      setDashboardData((prev) => ({
        ...prev,
        lineChart: result.data.lineChart,
        barChart: result.data.barChart,
      }));
    } catch (err) {
      console.error("Chart data fetch error:", err);
    }
  };

  useEffect(() => {
    if (salonId) {
      fetchDashboardData();
      fetchChartData();
    }
  }, [salonId, dateRange]);

  useEffect(() => {
    if (salonId && selectedBranch) {
      fetchDashboardData();
      fetchChartData();
    }
  }, [selectedBranch]);

  const formatDateTime = (iso, time) => {
    const date = new Date(iso);
    const d = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const [h, m] = time.split(":");
    const t = new Date();
    t.setHours(h);
    t.setMinutes(m);
    const formattedTime = t.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    return `${d} | ${formattedTime}`;
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center p-3">
        <p className="title">Performance</p>
        <div className="d-flex gap-2 justify-content-center align-items-center">
          <div className="dropdown me-2">
            <Select
              options={branches}
              value={selectedBranch}
              onChange={(option) => setSelectedBranch(option)}
              placeholder="Select Branch"
              classNamePrefix="react-select"
              className="react-select-container"
            />
          </div>
          <div>
            <div className="position-relative">
              <div className="input-group date-range-input-group">
                <span className="input-group-text border-0">
                  <i className="bi bi-calendar-event"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-0"
                  readOnly
                  onClick={() => setShowCalendar(!showCalendar)}
                  value={`${dateRange.startDate} to ${dateRange.endDate}`}
                  style={{ width: "220px" }}
                />
              </div>
              {showCalendar && (
                <div
                  className="position-absolute z-3 picker-wrapper"
                  style={{ top: "110%", left: -90 }}
                >
                  <DateRange
                    editableDateInputs={true}
                    onChange={(ranges) => {
                      const start = ranges.selection.startDate
                        .toISOString()
                        .split("T")[0];
                      const end = ranges.selection.endDate
                        .toISOString()
                        .split("T")[0];
                      setDateRange({ startDate: start, endDate: end });
                      setSelectionRange(ranges.selection);
                      setShowCalendar(false);
                    }}
                    moveRangeOnFirstSelection={false}
                    ranges={[selectionRange]}
                    rangeColors={["#a1764c"]}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex flex-wrap justify-content-around align-items-center dashboard-cards mt-3 gap-3">
        {[
          {
            value: dashboardData.appointmentCount,
            title: "Appointments",
            navigateTo: "/bookings",
          },
          {
            value: `₹ ${dashboardData.totalCommission}`,
            title: "Sales Commissions",
            navigateTo: "/commission",
          },
          {
            value: dashboardData.customerCount,
            title: "New Customers",
            navigateTo: "/customers",
          },
          {
            value: dashboardData.orderCount,
            title: "Orders",
            navigateTo: "/orders",
          },
          {
            value: `₹ ${dashboardData.productSales}`,
            title: "Product Sales",
            navigateTo: "/order-report",
          },
        ].map((item, index) => (
          <div
            key={index}
            className="dashboard-card p-3"
            style={{ cursor: "pointer" }}
            onClick={() => navigate(item.navigateTo)}
          >
            <div className="d-flex justify-content-end">
              <i className="bi bi-info-circle-fill icon-brown"></i>
            </div>
            <p className="card-value">{item.value}</p>
            <p className="card-title">{item.title}</p>
          </div>
        ))}
      </div>

      <div className="row g-3 mt-3 p-3">
        <div className="col-md-8">
          <div className="card themed-card p-2" style={{ height: "600px" }}>
            <h4>Sales Performance</h4>
            <hr />
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardData.lineChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="var(--text-color-dark)" />
                <YAxis stroke="var(--text-color-dark)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card-background)",
                    border: "1px solid var(--border-color-dark)",
                    color: "var(--text-color-dark)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="#c4a484"
                  strokeWidth={2}
                  dot={{ fill: "var(--text-color-dark)", r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-md-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h4 className="themed-text-color">Upcoming Appointments</h4>
            <p className="custom-link" onClick={() => navigate("/bookings")}>
              View All
            </p>
          </div>
          <div
            className="card themed-card"
            style={{ height: "552px", overflowY: "auto" }}
          >
            <div className="card-body p-0">
              {dashboardData.upcomingAppointments.length > 0 ? (
                <table className="table custom-table table-striped table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Service</th>
                      <th>Date & Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.upcomingAppointments.map((a, i) => (
                      <tr key={i}>
                        <td className="d-flex align-items-center">
                          <div className="customer-table-avatar me-2">
                            {a.customer_image ? (
                              <img
                                src={a.customer_image}
                                alt="Customer"
                                className="rounded-circle"
                                style={{
                                  width: "30px",
                                  height: "30px",
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              <div className="avatar-placeholder-small">
                                <i className="bi bi-person-fill"></i>
                              </div>
                            )}
                          </div>
                          <span>{a.customer_name}</span>
                        </td>
                        <td>{a.service_name || "N/A"}</td>
                        <td>
                          {formatDateTime(
                            a.appointment_date,
                            a.appointment_time
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="d-flex align-items-center justify-content-center h-100">
                  <p className="text-secondary">No upcoming appointments.</p>{" "}
                  {/* Changed text-white-50 to text-secondary */}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mt-3 p-3">
        <div className="col-md-7">
          <div
            className="card themed-card p-2" // Added themed-card
            style={{ height: "400px" }}
          >
            <h4>Appointments / Revenue</h4>
            <hr />
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={dashboardData.barChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="var(--text-color-dark)" />{" "}
                {/* Used theme variable */}
                <YAxis yAxisId="left" stroke="var(--text-color-dark)" />{" "}
                {/* Used theme variable */}
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="var(--text-color-dark)"
                />{" "}
                {/* Used theme variable */}
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card-background)",
                    border: "1px solid var(--border-color-dark)",
                    color: "var(--text-color-dark)",
                  }}
                />{" "}
                {/* Used theme variable */}
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="sales"
                  barSize={40}
                  fill="#a1764c"
                  name="Sales"
                />
                <ChartLine
                  yAxisId="right"
                  type="monotone"
                  dataKey="appointments"
                  stroke="#547df5"
                  strokeWidth={2}
                  name="Total Appointments"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="col-md-5">
          <div className="card themed-card" style={{ height: "400px" }}>
            {" "}
            {/* Added themed-card */}
            <div className="card-body">
              <h4 className="card-title">Top Services</h4>
              <table className="table custom-table table-bordered mt-3">
                {" "}
                {/* Replaced table-dark with custom-table */}
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Count</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.topServices.map((service, i) => (
                    <tr key={i}>
                      <td>{service.service_name}</td>
                      <td>{service.count}</td>
                      <td>₹ {service.totalAmount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
