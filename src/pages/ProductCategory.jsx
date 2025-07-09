import { useState, useEffect } from "react";
import "./pages.css";
import AppointmentSidebar from "../AddContext/AppointmentSidebar";
import ProductCategorySidebar from "../AddContext/ProductCategorySidebar";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

const ProductCategory = () => {
  const [showForm, setShowForm] = useState(false);
  const [showProductCate, setShowProductCate] = useState(false);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editCategory, setEditCategory] = useState(null);

  const toggleForm = () => setShowForm((prev) => !prev);
  const toggleProductCategegory = () => setShowProductCate((prev) => !prev);

  const API_URL = import.meta.env.VITE_API_URL;
  const salonId = localStorage.getItem("salon_id");

  const fetchProductCategories = async () => {
    try {
      const response = await fetch(
        `${API_URL}/productCategories?salon_id=${salonId}`
      );
      const res = await response.json();
      setCategories(res.data);
    } catch (error) {
      console.error("Error fetching product categories:", error);
    }
  };

  useEffect(() => {
    fetchProductCategories();
  }, [API_URL, salonId]);

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id, countryName) => {
    const confirm = await Swal.fire({
      title: `Delete <b>${countryName}</b> Category?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        const response = await fetch(
          `${API_URL}/productCategories/${id}?salon_id=${salonId}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          setCategories((prev) => prev.filter((cat) => cat._id !== id));
          toast.success("Category deleted successfully!");
        } else {
          toast.error("Failed to delete the category.");
        }
      } catch (error) {
        console.error("Delete error:", error);
        toast.error("Something went wrong.");
      }
    }
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
        <div className="d-flex justify-content-end align-items-center gap-3">
          <div className="input-group input-group-dark custom-input-group-reviews">
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
            onClick={toggleProductCategegory}
          >
            <i className="bi bi-plus-circle-fill me-2"></i>
            New
          </button>
        </div>
        <div className="table-responsive custom-table-container mt-4">
          <table className="table table-dark table-bordered custom-table">
            <thead>
              <tr>
                <th>Sr. No.</th>
                <th>Name</th>
                <th>Brand</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category, index) => (
                  <tr key={category._id}>
                    <td>{index + 1}</td>
                    <td className="d-flex align-items-center justify-content-center gap-3">
                      {category.image && (
                        <img
                          src={category.image}
                          alt={category.name}
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                            borderRadius: "50%",
                          }}
                        />
                      )}
                      <span>{category.name}</span>
                    </td>
                    <td>
                      {category.brand_id.map((brand, idx) => (
                        <span key={idx}>
                          {brand.name}
                          {idx < category.brand_id.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </td>
                    <td>
                      <span
                        className={`badge ${
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
                        onClick={() => {
                          setEditCategory(category);
                          setShowProductCate(true);
                        }}
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
                    No category found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <ProductCategorySidebar
        show={showProductCate}
        onClose={() => {
          setShowProductCate(false);
          setEditCategory(null);
        }}
        editData={editCategory}
        setEditData={setEditCategory}
        onProductCategorySaved={fetchProductCategories}
      />
    </>
  );
};

export default ProductCategory;
