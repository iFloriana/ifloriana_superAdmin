import { useEffect, useState } from "react";
import "./pages.css";
import AppointmentSidebar from "../AddContext/AppointmentSidebar";
import StaffSidebar from "../AddContext/StaffSidebar";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import StaffServiceDetail from "../AddContext/StaffServiceDetail";

const Staff = () => {
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [showServiceSidebar, setShowServiceSidebar] = useState(false);
  const [showStaffSidebar, setShowStaffSidebar] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [staffToEdit, setStaffToEdit] = useState(null);
  const [selectedStaffServices, setSelectedStaffServices] = useState([]);
  const [selectedStaffName, setSelectedStaffName] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [searchText, setSearchText] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;
  const salonId = localStorage.getItem("salon_id");

  const toggleAppointmentForm = () => setShowAppointmentForm((prev) => !prev);
  const toggleServiceDetails = (services = [], name = "") => {
    setSelectedStaffServices(services);
    setSelectedStaffName(name);
    setShowServiceSidebar((prev) => !prev);
  };

  const toggleStaffSidebar = (staff = null) => {
    setStaffToEdit(staff);
    setShowStaffSidebar((prev) => !prev);
  };

  useEffect(() => {
    fetchStaffs();
  }, []);

  const fetchStaffs = async () => {
    try {
      const res = await axios.get(`${API_URL}/staffs?salon_id=${salonId}`);
      if (res.data && res.data.data) {
        setStaffList(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch staff data");
    }
  };

  const handleDelete = async (id, sname) => {
    const confirm = await Swal.fire({
      title: `Delete <b>${sname}</b> Staff?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/staffs/${id}?salon_id=${salonId}`);
        setStaffList((prev) => prev.filter((staff) => staff._id !== id));
        toast.success("Staff deleted successfully");
      } catch (error) {
        toast.error("Failed to delete staff");
      }
    }
  };

  const handleExport = () => {
    const dataToExport = staffList.map((staff) => ({
      Staff_Name: staff.full_name,
      Email: staff.email,
      Contact_Number: staff.phone_number,
      Total_Services: staff.service_id?.length || 0,
      Branch: staff.branch_id?.name || "N/A",
      Status: staff.status === 1 ? "Active" : "Inactive",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Staffs");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    saveAs(data, "staff_list.xlsx");
    toast.success("Staff data exported to Excel!");
  };

  const filteredStaffList = staffList.filter((staff) => {
    const branchMatch = selectedBranch
      ? staff.branch_id?.name === selectedBranch
      : true;
    const nameMatch = staff.full_name.toLowerCase().includes(searchText);
    return branchMatch && nameMatch;
  });

  return (
    <>
      <div className="d-flex justify-content-between align-items-center top-div">
        <p className="title">Staffs</p>
        <button className="btn apt-btn" onClick={toggleAppointmentForm}>
          <i className="bi bi-plus-circle me-2"></i>Appointment
        </button>
        <AppointmentSidebar
          show={showAppointmentForm}
          onClose={toggleAppointmentForm}
        />
      </div>
      <div className="p-3 inner-div rounded">
        <div className="d-flex justify-content-between align-items-center">
          <button className="btn page-btn" onClick={handleExport}>
            <i className="bi bi-download me-2"></i>Export
          </button>
          <div className="d-flex justify-content-end align-items-center gap-3">
            <div className="dropdown">
              <select
                className="form-select custom-text-input"
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
              >
                <option value="">Select Branch</option>
                {[...new Set(staffList.map((s) => s.branch_id?.name))].map(
                  (branch, idx) => (
                    <option key={idx} value={branch}>
                      {branch}
                    </option>
                  )
                )}
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
                value={searchText}
                onChange={(e) => setSearchText(e.target.value.toLowerCase())}
              />
            </div>
            <button
              className="d-flex align-items-center page-btn"
              onClick={() => toggleStaffSidebar(null)}
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
                <th>Staff</th>
                <th>Contact Number</th>
                <th>Total Services</th>
                <th>Branch</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaffList.length > 0 ? (
                filteredStaffList.map((staff) => (
                  <tr key={staff._id}>
                    <td>
                      <div className="d-flex justify-content-center align-items-center gap-2">
                        {staff.image && (
                          <img
                            src={staff.image}
                            alt="staff"
                            width="40"
                            height="40"
                            className="rounded-circle object-fit-cover"
                          />
                        )}
                        <div>
                          <div>{staff.full_name}</div>
                          <small>{staff.email}</small>
                        </div>
                      </div>
                    </td>
                    <td>{staff.phone_number}</td>
                    <td>
                      <span
                        className="bg-secondary text-white p-1 rounded"
                        role="button"
                        onClick={() => {
                          toggleServiceDetails(
                            staff.service_id,
                            staff.full_name
                          );
                        }}
                      >
                        {staff.service_id?.length || 0}
                      </span>
                    </td>
                    <td>{staff.branch_id?.name}</td>
                    <td>
                      <span
                        className={`badge ${
                          staff.status === 1 ? "bg-success" : "bg-secondary"
                        }`}
                      >
                        {staff.status === 1 ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <i
                        className="bi bi-pencil-square me-3 icon-blue"
                        role="button"
                        onClick={() => toggleStaffSidebar(staff)}
                      ></i>
                      <i
                        className="bi bi-trash text-danger"
                        role="button"
                        onClick={() => handleDelete(staff._id, staff.full_name)}
                      ></i>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-danger">
                    No staff data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {showServiceSidebar && (
        <StaffServiceDetail
          show={showServiceSidebar}
          onClose={() => toggleServiceDetails()}
          staffServices={selectedStaffServices}
          staffName={selectedStaffName}
        />
      )}
      <StaffSidebar
        show={showStaffSidebar}
        onClose={() => toggleStaffSidebar(null)}
        staffToEdit={staffToEdit}
        onSaveSuccess={fetchStaffs}
      />
    </>
  );
};

export default Staff;
