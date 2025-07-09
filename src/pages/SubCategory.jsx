import { useEffect, useState } from "react";
import AppointmentSidebar from "../AddContext/AppointmentSidebar";
import ServiceSubCategorySidebar from "../AddContext/ServiceSubCategorySidebar";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import axios from "axios";
import moment from "moment";

const SubCategory = () => {
  const [showForm, setShowForm] = useState(false);
  const [showServiceSubCategoryForm, setShowServiceSubCategoryForm] =
    useState(false);
  const [subCategories, setSubCategories] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const salonId = localStorage.getItem("salon_id");

  const toggleForm = () => setShowForm((prev) => !prev);

  const toggleServiceSubCategoryForm = () => {
    setShowServiceSubCategoryForm((prev) => !prev);
    if (!showServiceSubCategoryForm) {
      setSelectedSubCategory(null);
    }
  };

  const fetchSubCategory = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/subcategories?salon_id=${salonId}`
      );
      setSubCategories(response.data.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch sub categories");
      setSubCategories([]);
    }
  };

  useEffect(() => {
    fetchSubCategory();
  }, []);

  const handleDelete = async (id, sCName) => {
    const confirm = await Swal.fire({
      title: `Delete <b>${sCName}</b> Sub Category?`,
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(
          `${API_URL}/subcategories/${id}?salon_id=${salonId}`
        );
        toast.success("Subcategory deleted successfully");
        fetchSubCategory();
      } catch (error) {
        console.error(error);
        toast.error("Failed to delete subcategory");
      }
    }
  };

  const handleEdit = (subCategory) => {
    setSelectedSubCategory(subCategory);
    setShowServiceSubCategoryForm(true);
  };

  const uniqueCategories = [
    ...new Set(subCategories.map((item) => item.category_id?.name || "-")),
  ];

  const filteredSubCategories = subCategories.filter((item) => {
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "1" && item.status === 1) ||
      (statusFilter === "0" && item.status === 0);

    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchText.toLowerCase());

    const categoryName = item.category_id?.name || "-";

    const matchesCategory =
      categoryFilter === "All" || categoryName === categoryFilter;

    return matchesStatus && matchesSearch && matchesCategory;
  });

  return (
    <>
      <div className="d-flex justify-content-between align-items-center top-div">
        <p className="title">Sub Categories</p>
        <button className="btn apt-btn" onClick={toggleForm}>
          <i className="bi bi-plus-circle me-2"></i>Appointment
        </button>
        <AppointmentSidebar show={showForm} onClose={toggleForm} />
      </div>
      <div className="p-3 inner-div rounded">
        <div className="d-flex justify-content-between align-items-center">
          <button className="btn page-btn">
            <i className="bi bi-download me-2"></i>Export
          </button>
          <div className="d-flex justify-content-end align-items-center gap-3">
            <div className="dropdown">
              <select
                className="form-select custom-select-input"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="All">All Category</option>
                {uniqueCategories.map((cat) => (
                  <option key={cat} value={cat}>
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
                <option value="1">Active</option>
                <option value="0">Inactive</option>
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
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            <button
              className="d-flex align-items-center page-btn"
              onClick={() => {
                setSelectedSubCategory(null);
                toggleServiceSubCategoryForm();
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
                <th>Category</th>
                <th>Created at</th>
                <th>Updated at</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubCategories.length > 0 ? (
                filteredSubCategories.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div className="d-flex align-items-center justify-content-center gap-2">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{
                              width: "40px",
                              height: "40px",
                              objectFit: "cover",
                              borderRadius: "50%",
                            }}
                          />
                        )}
                        {item.name}
                      </div>
                    </td>
                    <td>{item.category_id?.name || "-"}</td>
                    <td>{moment(item.createdAt).format("DD-MM-YYYY")}</td>
                    <td>{moment(item.updatedAt).fromNow()}</td>
                    <td>
                      <span
                        className={`badge rounded-pill ${
                          item.status === 1 ? "bg-success" : "bg-secondary"
                        }`}
                      >
                        {item.status === 1 ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <i
                        className="bi bi-pencil-square me-3 icon-blue"
                        role="button"
                        onClick={() => handleEdit(item)}
                      ></i>
                      <i
                        className="bi bi-trash text-danger"
                        role="button"
                        onClick={() => handleDelete(item._id, item.name)}
                      ></i>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-danger">
                    No sub categories found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <ServiceSubCategorySidebar
        show={showServiceSubCategoryForm}
        onClose={toggleServiceSubCategoryForm}
        initialData={selectedSubCategory}
        onSubCategorySaved={fetchSubCategory}
      />
    </>
  );
};

export default SubCategory;
