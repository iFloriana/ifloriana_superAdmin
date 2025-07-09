import { useEffect, useState } from "react";
import AppointmentSidebar from "../AddContext/AppointmentSidebar";
import ServiceSidebar from "../AddContext/ServiceSidebar";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";

const List = () => {
  const [showForm, setShowForm] = useState(false);
  const [showServiceForm, setServiceForm] = useState(false);
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryList, setCategoryList] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [selectedService, setSelectedService] = useState(null);

  const toggleForm = () => setShowForm((prev) => !prev);

  const toggleServiceForm = () => {
    setServiceForm((prev) => !prev);
    if (!showServiceForm) {
      setSelectedService(null);
    }
  };

  const salonId = localStorage.getItem("salon_id");
  const API_URL = import.meta.env.VITE_API_URL;

  const fetchServices = async () => {
    try {
      const res = await axios.get(`${API_URL}/services?salon_id=${salonId}`);
      setServices(res.data.data);
      setFilteredServices(
        applyFilters(res.data.data, statusFilter, searchTerm, categoryFilter)
      );
      const categories = [
        ...new Set(
          res.data.data.map((s) => s.category_id?.name).filter(Boolean)
        ),
      ];
      setCategoryList(categories);
    } catch (error) {
      toast.error("Failed to fetch services");
    }
  };

  const deleteService = async (id, serv) => {
    const confirm = await Swal.fire({
      title: `Delete <b>${serv}</b> Service?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/services/${id}?salon_id=${salonId}`);
        toast.success("Service deleted successfully");
        fetchServices();
      } catch (err) {
        toast.error("Failed to delete service");
      }
    }
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredServices.map((s) => ({
        Name: s.name,
        Price: s.regular_price,
        Duration: `${s.service_duration} min`,
        Category: s.category_id?.name || "-",
        Branches: s.branch_count,
        Status: s.status === 1 ? "Active" : "Inactive",
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Services");
    XLSX.writeFile(wb, "services.xlsx");
    toast.success("Download started");
  };

  const applyFilters = (data, statusF, searchT, categoryF) => {
    return data.filter((s) => {
      const matchesStatus =
        statusF === "All" ||
        (statusF === "Active" && s.status === 1) ||
        (statusF === "Inactive" && s.status === 0);
      const matchesSearch = s.name
        .toLowerCase()
        .includes(searchT.toLowerCase());
      const matchesCategory =
        categoryF === "All" || s.category_id?.name === categoryF;
      return matchesStatus && matchesSearch && matchesCategory;
    });
  };

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    setFilteredServices(
      applyFilters(services, statusFilter, searchTerm, categoryFilter)
    );
  }, [statusFilter, searchTerm, categoryFilter, services]);

  const handleEdit = (service) => {
    setSelectedService(service);
    setServiceForm(true);
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center top-div">
        <p className="title">Services</p>
        <button className="btn apt-btn" onClick={toggleForm}>
          <i className="bi bi-plus-circle me-2"></i>Appointment
        </button>
        <AppointmentSidebar show={showForm} onClose={toggleForm} />
      </div>
      <div className="p-3 inner-div rounded">
        <div className="d-flex justify-content-between align-items-center">
          <button className="btn page-btn" onClick={exportToExcel}>
            <i className="bi bi-download me-2"></i>Export
          </button>
          <div className="d-flex justify-content-end align-items-center gap-3">
            <div className="dropdown">
              <select
                className="form-select custom-select-input"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="All">All Categories</option>
                {categoryList.map((cat, index) => (
                  <option key={index} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="dropdown">
              <select
                className="form-select custom-select-input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
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
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              className="d-flex align-items-center page-btn"
              onClick={toggleServiceForm}
            >
              <i className="bi bi-plus-circle-fill me-2"></i>New
            </button>
          </div>
        </div>
        <div className="table-responsive custom-table-container mt-4">
          <table className="table table-dark table-bordered custom-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Duration</th>
                <th>Category</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.length > 0 ? (
                filteredServices.map((service) => (
                  <tr key={service._id}>
                    <td>
                      <div className="d-flex align-items-center justify-content-center gap-2">
                        {service.image && (
                          <img
                            src={service.image}
                            alt={service.name}
                            style={{
                              width: "40px",
                              height: "40px",
                              objectFit: "cover",
                              borderRadius: "50%",
                            }}
                          />
                        )}
                        <span>{service.name}</span>
                      </div>
                    </td>
                    <td>₹ {service.regular_price}</td>
                    <td>{service.service_duration} min</td>
                    <td>{service.category_id?.name || "-"}</td>
                    <td>
                      <span
                        className={`badge ${
                          service.status === 1 ? "bg-success" : "bg-secondary"
                        }`}
                      >
                        {service.status === 1 ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <i
                        className="bi bi-pencil-square me-3 icon-blue"
                        role="button"
                        onClick={() => handleEdit(service)}
                      ></i>
                      <i
                        className="bi bi-trash text-danger"
                        role="button"
                        onClick={() => deleteService(service._id, service.name)}
                      ></i>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center text-danger">
                    No services found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <ServiceSidebar
        show={showServiceForm}
        onClose={toggleServiceForm}
        initialData={selectedService}
        onServiceSaved={fetchServices}
      />
    </>
  );
};

export default List;
