import { useState, useEffect } from "react";
import "./pages.css";
import AppointmentSidebar from "../AddContext/AppointmentSidebar";
import ProductSidebar from "../AddContext/ProductSidebar";
import ProductEdit from "../EditContext/ProductEdit";
import QuantityEdit from "../EditContext/QuantityEdit";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import axios from "axios";

const AllProducts = () => {
  const [showForm, setShowForm] = useState(false);
  const [showStock, setShowStock] = useState(false);
  const [stockData, setStockData] = useState(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showEditProduct, setShowEditProduct] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [products, setProducts] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const API_BASE = import.meta.env.VITE_API_URL;
  const salonId = localStorage.getItem("salon_id");

  const toggleForm = () => setShowForm((prev) => !prev);
  const toggleStock = () => setShowStock((prev) => !prev);

  const toggleAddProduct = () => {
    setShowAddProduct((prev) => !prev);
  };

  const toggleEditProduct = (product = null) => {
    setSelectedProduct(product);
    setShowEditProduct((prev) => !prev);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/products?salon_id=${salonId}`);
      setProducts(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch products");
    }
  };

  const handleDelete = async (id, Name) => {
    const result = await Swal.fire({
      title: `Delete <b>${Name}</b> Product?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_BASE}/products/${id}?salon_id=${salonId}`);
        toast.success("Product deleted successfully");
        fetchProducts();
      } catch (err) {
        console.error(err);
        toast.error("Failed to delete product");
      }
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" && product.status === 1) ||
      (statusFilter === "Inactive" && product.status === 0);

    const matchesSearch = product.product_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <>
      <div className="d-flex justify-content-between align-items-center top-div">
        <p className="title">Products</p>
        <button className="btn apt-btn" onClick={toggleForm}>
          <i className="bi bi-plus-circle me-2"></i>Appointment
        </button>
        <AppointmentSidebar show={showForm} onClose={toggleForm} />
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              className="d-flex align-items-center page-btn"
              onClick={toggleAddProduct}
            >
              <i className="bi bi-plus-circle-fill me-2"></i> New
            </button>
          </div>
        </div>

        <div className="table-responsive custom-table-container mt-4">
          <table className="table table-dark table-bordered custom-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Brand</th>
                <th>Category</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product._id}>
                  <td>
                    <div className="d-flex align-items-center justify-content-center">
                      {product.image && (
                        <img
                          src={product.image || "/default.png"}
                          alt="product"
                          className="rounded-circle me-3"
                          width="55"
                          height="55"
                          style={{ objectFit: "cover" }}
                        />
                      )}
                      <span>{product.product_name}</span>
                    </div>
                  </td>
                  <td>{product.brand_id?.name || "N/A"}</td>
                  <td>{product.category_id?.name || "N/A"}</td>
                  <td>
                    {typeof product.price !== "number"
                      ? (() => {
                          if (product.variants && product.variants.length > 0) {
                            const prices = product.variants.map(
                              (v) => v.price || 0
                            );
                            const minPrice = Math.min(...prices);
                            const maxPrice = Math.max(...prices);

                            return `₹ ${minPrice} - ₹ ${maxPrice}`;
                          }
                          return "N/A";
                        })()
                      : `₹ ${product.price}`}
                  </td>
                  <td>
                    {typeof product.stock !== "number"
                      ? (() => {
                          if (product.variants && product.variants.length > 0) {
                            const totalStock = product.variants.reduce(
                              (sum, variant) => sum + (variant.stock || 0),
                              0
                            );
                            return totalStock;
                          }
                          return "N/A";
                        })()
                      : product.stock}
                  </td>
                  <td>
                    {product.status === 1 ? (
                      <span className="badge bg-success">Active</span>
                    ) : (
                      <span className="badge bg-secondary">Inactive</span>
                    )}
                  </td>
                  <td>
                    <span
                      className="icon-box bg-light-red me-3"
                      role="button"
                      onClick={() => {
                        setStockData(product);
                        toggleStock();
                      }}
                    >
                      <i className="bi bi-plus-lg icon-yellow me-1"></i>
                      Stock
                    </span>
                    <i
                      className="bi bi-pencil-square me-3 icon-blue"
                      role="button"
                      onClick={() => toggleEditProduct(product)}
                    ></i>
                    <i
                      className="bi bi-trash text-danger"
                      role="button"
                      onClick={() =>
                        handleDelete(product._id, product.product_name)
                      }
                    ></i>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center text-danger">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <QuantityEdit
        show={showStock}
        onClose={toggleStock}
        stock={stockData}
        onStockUpdated={fetchProducts}
      />
      <ProductSidebar
        show={showAddProduct}
        onClose={toggleAddProduct}
        onProductAction={fetchProducts}
      />
      <ProductEdit
        show={showEditProduct}
        onClose={toggleEditProduct}
        selectedProduct={selectedProduct}
        onProductAction={fetchProducts}
      />
    </>
  );
};

export default AllProducts;
