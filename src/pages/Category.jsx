import { useEffect, useState } from "react";
import AppointmentSidebar from "../AddContext/AppointmentSidebar";
import ServiceCategorySidebar from "../AddContext/ServiceCategorySidebar";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import axios from "axios";
import moment from "moment";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const Category = () => {
  const [showForm, setShowForm] = useState(false);
  const [showServiceCategoryForm, setShowServiceCategoryForm] = useState(false);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const salonId = localStorage.getItem("salon_id");

  const toggleForm = () => setShowForm((prev) => !prev);

  const toggleCategoryForm = () => {
    setShowServiceCategoryForm((prev) => !prev);
    if (!showServiceCategoryForm) {
      setSelectedCategory(null);
    }
  };

  const fetchCategory = async () => {
    try {
      const data = await axios.get(`${API_URL}/categories?salon_id=${salonId}`);
      setCategories(data.data.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch categories");
    }
  };

  useEffect(() => {
    fetchCategory();
  }, []);

  const filterCategory = categories.filter((category) => {
    const matchSearch = category.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All"
        ? true
        : statusFilter === "Active"
        ? category.status === 1
        : category.status !== 1;

    return matchSearch && matchesStatus;
  });

  const handleDelete = async (id, cName) => {
    const confirm = await Swal.fire({
      title: `Delete <b>"${cName}"</b> Category?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/categories/${id}?salon_id=${salonId}`);
        toast.success("Category deleted successfully");
        fetchCategory();
      } catch (error) {
        console.error(error);
        toast.error("Failed to delete category");
      }
    }
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setShowServiceCategoryForm(true);
  };

  const handleExport = () => {
    if (filterCategory.length === 0) {
      toast.warn("No data to export");
      return;
    }

    const exportData = filterCategory.map((category) => ({
      Name: category.name,
      "Created At": moment(category.createdAt).format("DD-MM-YYYY"),
      "Updated At": moment(category.updatedAt).format("DD-MM-YYYY"),
      Status: category.status === 1 ? "Active" : "Inactive",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Categories");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const dataBlob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(dataBlob, "categories.xlsx");
    toast.success("Download started");
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center top-div">
        <p className="title">Categories</p>
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
              onClick={() => {
                setSelectedCategory(null);
                toggleCategoryForm();
              }}
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
                <th>Created at</th>
                <th>Updated at</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filterCategory.length > 0 ? (
                filterCategory.map((category) => (
                  <tr key={category._id}>
                    <td className="d-flex align-items-center justify-content-center gap-3">
                      {category.image && (
                        <img
                          src={category.image}
                          alt={category.name}
                          style={{
                            width: "55px",
                            height: "55px",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                      )}
                      {category.name}
                    </td>
                    <td>{moment(category.createdAt).format("DD-MM-YYYY")}</td>
                    <td>{moment(category.updatedAt).fromNow()}</td>
                    <td>
                      <span
                        className={`badge rounded-pill px-3 ${
                          category.status === 1 ? "bg-success" : "bg-secondary"
                        }`}
                      >
                        {category.status === 1 ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <i
                        className="bi bi-pencil-square me-3 icon-blue"
                        role="button"
                        onClick={() => handleEdit(category)}
                      ></i>
                      <i
                        className="bi bi-trash text-danger"
                        role="button"
                        onClick={() =>
                          handleDelete(category._id, category.name)
                        }
                      ></i>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-danger">
                    No Data Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <ServiceCategorySidebar
        show={showServiceCategoryForm}
        onClose={toggleCategoryForm}
        initialData={selectedCategory}
        onCategorySaved={fetchCategory}
      />
    </>
  );
};

export default Category;
