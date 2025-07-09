import { useEffect, useState } from "react";
import "./pages.css";
import AppointmentSidebar from "../AddContext/AppointmentSidebar";
import CustomerSidebar from "../AddContext/CustomerSidebar";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const Customers = () => {
  const [showForm, setShowForm] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [editCustomerData, setEditCustomerData] = useState(null);

  const toggleForm = () => setShowForm((prev) => !prev);
  const toggleCustomerForm = () => setShowCustomerForm((prev) => !prev);

  const API_BASE = import.meta.env.VITE_API_URL;
  const salonId = localStorage.getItem("salon_id");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/customers?salon_id=${salonId}`
      );
      setCustomers(response.data.data);
    } catch (error) {
      console.error("Failed to fetch customers", error);
      toast.error("Failed to fetch customers");
    }
  };

  const handleDelete = async (id, name) => {
    const result = await Swal.fire({
      title: `Delete <b>${name}</b>?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${API_BASE}/customers/${id}?salon_id=${salonId}`);
      setCustomers((prev) => prev.filter((c) => c._id !== id));
      toast.success("Customer deleted successfully!");
      fetchCustomers();
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast.error("Failed to delete customer.");
    }
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" && customer.status === 1) ||
      (statusFilter === "Inactive" && customer.status !== 1);

    const matchesSearch = customer.full_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const handleExport = () => {
    const exportData = filteredCustomers.map((customer) => ({
      Name: customer.full_name,
      Email: customer.email,
      Phone: customer.phone_number,
      Gender: customer.gender,
      Status: customer.status === 1 ? "Active" : "Inactive",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const fileData = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    toast.success("Download started");
    saveAs(fileData, "customers.xlsx");
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center top-div">
        <p className="title">Customers</p>
        <button className="btn apt-btn" onClick={toggleForm}>
          <i className="bi bi-plus-circle me-2"></i>Appointment
        </button>
        <AppointmentSidebar show={showForm} onClose={toggleForm} />
      </div>
      <div className="p-3 inner-div rounded">
        <div className="d-flex justify-content-between align-items-center">
          <button className="btn page-btn" onClick={handleExport}>
            <i className="bi bi-download me-2"></i>Export
          </button>
          <div className="d-flex justify-content-end align-items-center gap-3">
            <div className="dropdown">
              <select
                className="form-select custom-select-input"
                value={statusFilter}
                onChange={handleStatusChange}
              >
                <option value="All">All</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="input-group input-group-dark custom-input-group">
              <span className="input-group-text custom-input-group-text">
                <i className="bi bi-search icon-brown"></i>
              </span>
              <input
                type="text"
                className="form-control custom-text-input"
                placeholder="Search.."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <button
              className="d-flex align-items-center page-btn"
              onClick={toggleCustomerForm}
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
                <th>Customer</th>
                <th>Contact Number</th>
                <th>Gender</th>
                <th>Membership</th>
                <th>Package</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer._id}>
                  <td className="d-flex align-items-center gap-3 justify-content-center">
                    {customer.image && (
                      <img
                        src={customer.image}
                        alt="Customer"
                        className="rounded-circle object-fit-cover"
                        width="50"
                        height="50"
                      />
                    )}
                    <div>
                      <div className="fw-bold">{customer.full_name}</div>
                      <div className="small">{customer.email}</div>
                    </div>
                  </td>
                  <td className="text-capitalize">{customer.phone_number}</td>
                  <td className="text-capitalize">{customer.gender}</td>
                  <td>
                    {customer.branch_membership &&
                    Object.keys(customer.branch_membership).length > 0 ? (
                      <span className="badge bg-secondary">Yes</span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>
                    {customer.branch_package &&
                    customer.branch_package.length > 0 ? (
                      <span className="badge bg-secondary">Yes</span>
                    ) : (
                      "-"
                    )}
                  </td>

                  <td>
                    <span
                      className={`badge ${
                        customer.status === 1 ? "bg-success" : "bg-secondary"
                      }`}
                    >
                      {customer.status === 1 ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <i
                      className="bi bi-pencil-square me-3 icon-blue"
                      onClick={() => {
                        setEditCustomerData(customer);
                        setShowCustomerForm(true);
                      }}
                    ></i>
                    <i
                      className="bi bi-trash text-danger"
                      role="button"
                      onClick={() =>
                        handleDelete(customer._id, customer.full_name)
                      }
                    ></i>
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center text-danger">
                    No customers found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <CustomerSidebar
        show={showCustomerForm}
        onClose={() => {
          setShowCustomerForm(false);
          setEditCustomerData(null);
          fetchCustomers();
        }}
        editData={editCustomerData}
      />
    </>
  );
};

export default Customers;
