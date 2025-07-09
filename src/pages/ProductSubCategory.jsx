import { useState, useEffect } from "react";
import "./pages.css";
import ProductSubCategorySidebar from "../AddContext/ProductSubCategorySidebar";
import axios from "axios";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import moment from "moment";

const ProductSubCategory = () => {
  const [showSubCategorySidebar, setShowSubCategorySidebar] = useState(false);
  const [subCategories, setSubCategories] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const salonId = localStorage.getItem("salon_id");

  const openSubCategorySidebar = (subCategory = null) => {
    setSelectedSubCategory(subCategory);
    setShowSubCategorySidebar(true);
  };

  const closeSubCategorySidebar = () => {
    setShowSubCategorySidebar(false);
    setSelectedSubCategory(null);
    fetchSubCategories();
  };

  useEffect(() => {
    fetchSubCategories();
  }, []);

  useEffect(() => {
    filterData();
  }, [search, statusFilter, subCategories]);

  const fetchSubCategories = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/productSubCategories?salon_id=${salonId}`
      );
      setSubCategories(response.data.data);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  };

  const handleDelete = async (id, subCatName) => {
    const confirm = await Swal.fire({
      title: `Delete <b>${subCatName}</b> Sub Category?`,
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(
          `${API_URL}/productSubCategories/${id}?salon_id=${salonId}`
        );
        setSubCategories((prev) => prev.filter((item) => item._id !== id));
        toast.success("Subcategory deleted successfully!");
      } catch (error) {
        console.error("Delete failed:", error);
        toast.error("Failed to delete subcategory.");
      }
    }
  };

  const filterData = () => {
    let filtered = [...subCategories];

    if (statusFilter !== "All") {
      filtered = filtered.filter((item) =>
        statusFilter === "Active" ? item.status === 1 : item.status === 0
      );
    }

    if (search.trim() !== "") {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredData(filtered);
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center top-div">
        <p className="title">Sub Categories</p>
      </div>

      <div className="p-3 inner-div rounded">
        <div className="d-flex justify-content-between align-items-center">
          <div className="dropdown">
            <select
              className="form-select custom-select-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="d-flex justify-content-end align-items-center gap-3">
            <div className="input-group input-group-dark custom-input-group">
              <span className="input-group-text custom-input-group-text">
                <i className="bi bi-search icon-brown"></i>
              </span>
              <input
                type="text"
                className="form-control custom-text-input"
                placeholder="Search.."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              className="d-flex align-items-center page-btn"
              onClick={() => openSubCategorySidebar()}
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
                <th>Category</th>
                <th>Created At</th>
                <th>Updated At</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item._id}>
                    <td className="d-flex align-items-center justify-content-center gap-3">
                      {item.image && (
                        <img
                          src={
                            item.image.startsWith("data:image/")
                              ? item.image
                              : `${API_URL}/${item.image}`
                          }
                          alt={item.name}
                          width={40}
                          height={40}
                          className="rounded-circle object-fit-cover"
                        />
                      )}
                      <span>{item.name}</span>
                    </td>
                    <td>{item.product_category_id?.name || "N/A"}</td>
                    <td>{new Date(item.createdAt).toLocaleDateString()}</td>
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
                        onClick={() => openSubCategorySidebar(item)}
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
      <ProductSubCategorySidebar
        show={showSubCategorySidebar}
        onClose={closeSubCategorySidebar}
        subCategoryData={selectedSubCategory}
      />
    </>
  );
};

export default ProductSubCategory;
