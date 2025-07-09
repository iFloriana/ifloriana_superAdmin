import { useEffect, useState } from "react";
import "./pages.css";
import AppointmentSidebar from "../AddContext/AppointmentSidebar";
import PackageSidebar from "../AddContext/PackageSidebar";
import PackageServiceDetails from "../AddContext/PackageServiceDetails";
import { toast } from "react-toastify";
import axios from "axios";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const Packages = () => {
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [packages, setPackages] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchText, setSearchText] = useState("");
  const [showServiceSidebar, setShowServiceSidebar] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const [currentPackageName, setCurrentPackageName] = useState("");
  const [packageToEdit, setPackageToEdit] = useState(null);

  const toggleAppointmentForm = () => setShowAppointmentForm((prev) => !prev);
  const toggleServiceDetails = () => setShowServiceSidebar((prev) => !prev);

  const openAddPackageForm = () => {
    setPackageToEdit(null);
    setShowPackageForm(true);
  };

  const openEditPackageForm = (pkg) => {
    setPackageToEdit(pkg);
    setShowPackageForm(true);
  };

  const closePackageForm = () => {
    setShowPackageForm(false);
    setPackageToEdit(null);
    fetchPackages();
  };

  const API_BASE = import.meta.env.VITE_API_URL;
  const salonId = localStorage.getItem("salon_id");

  const fetchPackages = () => {
    axios
      .get(`${API_BASE}/branchPackages?salon_id=${salonId}`)
      .then((res) => {
        if (Array.isArray(res.data.data)) {
          setPackages(res.data.data);
        } else {
          console.warn(
            "API response 'data' property was not an array:",
            res.data
          );
          setPackages([]);
        }
      })
      .catch((err) => {
        toast.error("Failed to fetch packages");
        console.error(err);
        setPackages([]);
      });
  };

  useEffect(() => {
    fetchPackages();
  }, [API_BASE]);

  const handleDelete = (id, Name) => {
    Swal.fire({
      title: `Delete <b>${Name}</b> Package?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`${API_BASE}/branchPackages/${id}?salon_id=${salonId}`)
          .then(() => {
            toast.success("Package deleted successfully");
            fetchPackages();
          })
          .catch(() => toast.error("Failed to delete package"));
      }
    });
  };

  const handleExport = () => {
    toast.success("Download started");
    const filteredData = filteredPackages.map((pkg) => ({
      Name: pkg.package_name,
      Branch: pkg.branch_id?.[0]?.name || "N/A",
      "Total Services": pkg.package_details?.length || 0,
      "Package Price": pkg.package_price,
      Status: pkg.status === 1 ? "Active" : "Inactive",
    }));

    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Packages");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "Packages.xlsx");
  };

  const filteredPackages = packages.filter((pkg) => {
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" && pkg.status === 1) ||
      (statusFilter === "Inactive" && pkg.status === 0);
    const matchesSearch = pkg.package_name
      ?.toLowerCase()
      .includes(searchText.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleServiceDetails = (services, packageName) => {
    setSelectedServices(services || []);
    setCurrentPackageName(packageName);
    setShowServiceSidebar(true);
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center top-div">
        <p className="title">Packages</p>
        <button className="btn apt-btn" onClick={toggleAppointmentForm}>
          <i className="bi bi-plus-circle me-2"></i>Appointment
        </button>
        <AppointmentSidebar
          show={showAppointmentForm}
          onClose={toggleAppointmentForm}
        />
      </div>
      <div className="inner-div p-3 rounded">
        <div className="d-flex justify-content-between align-items-center">
          <button className="btn page-btn" onClick={handleExport}>
            <i className="bi bi-download me-2"></i>Export
          </button>
          <div className="d-flex justify-content-end align-items-center gap-3">
            <div className="dropdown">
              <select
                className="form-select custom-select-input"
                onChange={(e) => setStatusFilter(e.target.value)}
                value={statusFilter}
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
                placeholder="Search by name.."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            <button
              className="d-flex align-items-center page-btn"
              onClick={openAddPackageForm}
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
                <th>Branch</th>
                <th>Total Services</th>
                <th>Package Price</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredPackages.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center text-danger">
                    No packages found
                  </td>
                </tr>
              ) : (
                filteredPackages.map((pkg) => (
                  <tr key={pkg._id}>
                    <td>{pkg.package_name}</td>
                    <td>
                      {pkg.branch_id && pkg.branch_id.length > 0
                        ? pkg.branch_id.map((branch) => branch.name).join(", ")
                        : "N/A"}
                    </td>
                    <td>
                      <span
                        className="bg-secondary text-white p-1 rounded"
                        role="button"
                        onClick={() => {
                          handleServiceDetails(
                            pkg.package_details,
                            pkg.package_name
                          );
                        }}
                      >
                        {pkg.package_details?.length || 0}
                      </span>
                    </td>
                    <td>₹ {pkg.package_price}</td>
                    <td>{new Date(pkg.start_date).toLocaleDateString()}</td>
                    <td>
                      <span
                        className={`badge ${
                          new Date(pkg.end_date) < new Date()
                            ? "bg-danger p-2"
                            : "bg-secondary p-2"
                        }`}
                      >
                        {new Date(pkg.end_date).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          pkg.status === 1
                            ? "bg-success p-2"
                            : "bg-secondary p-2"
                        }`}
                      >
                        {pkg.status === 1 ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <i
                        className="bi bi-pencil-square me-3 icon-blue"
                        role="button"
                        title="Edit"
                        onClick={() => openEditPackageForm(pkg)}
                      ></i>
                      <i
                        className="bi bi-trash text-danger"
                        role="button"
                        title="Delete"
                        onClick={() => handleDelete(pkg._id, pkg.package_name)}
                      ></i>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <PackageSidebar
        show={showPackageForm}
        onClose={closePackageForm}
        packageData={packageToEdit}
        onSaveSuccess={fetchPackages}
      />
      {showServiceSidebar && (
        <PackageServiceDetails
          show={showServiceSidebar}
          onClose={toggleServiceDetails}
          services={selectedServices}
          packageName={currentPackageName}
        />
      )}
    </>
  );
};

export default Packages;
