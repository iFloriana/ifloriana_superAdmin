import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import "./context.css";
import { toast } from "react-toastify";

const BuyProducts = ({ show, onClose }) => {
  const [branches, setBranches] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [loading, setLoading] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([
    { productId: "", variantId: null, quantity: 1 },
  ]);

  const API_URL = import.meta.env.VITE_API_URL;
  const salonId = localStorage.getItem("salon_id");

  useEffect(() => {
    if (show) {
      axios
        .get(`${API_URL}/branches?salon_id=${salonId}`)
        .then((res) => {
          const options = res.data.data
            .filter((b) => b.status === 1)
            .map((b) => ({ label: b.name, value: b._id }));
          setBranches(options);
        })
        .catch((err) => toast.error("Error fetching branches"));

      axios
        .get(`${API_URL}/customers?salon_id=${salonId}`)
        .then((res) => {
          const options = res.data.data.map((c) => ({
            label: c.full_name,
            value: c._id,
          }));
          setCustomers(options);
        })
        .catch((err) => toast.error("Error fetching customers"));

      axios
        .get(`${API_URL}/products?salon_id=${salonId}`)
        .then((res) => {
          const formattedProducts = res.data.flatMap((p) => {
            if (p.has_variations && p.variants.length > 0) {
              return p.variants.map((v) => {
                const combinationName = v.combination
                  .map((c) => c.variation_value)
                  .join(" - ");
                return {
                  label: `${p.product_name} - ${combinationName}`,
                  value: p._id,
                  variantId: v._id,
                  price: v.price,
                  stock: v.stock,
                };
              });
            } else {
              return [
                {
                  label: p.product_name,
                  value: p._id,
                  variantId: null,
                  price: p.price,
                  stock: p.stock,
                },
              ];
            }
          });
          setProducts(formattedProducts);
        })
        .catch((err) => toast.error("Error fetching products"));
    }
  }, [show, salonId, API_URL]);

  const handleProductSelectionChange = (index, value) => {
    const [productId, variantId] = value.split("-");
    const newSelectedProducts = [...selectedProducts];
    newSelectedProducts[index] = {
      ...newSelectedProducts[index],
      productId,
      variantId: variantId === "null" ? null : variantId,
    };
    setSelectedProducts(newSelectedProducts);
  };

  const handleQuantityChange = (index, value) => {
    const newSelectedProducts = [...selectedProducts];
    newSelectedProducts[index].quantity = Number(value);
    setSelectedProducts(newSelectedProducts);
  };

  const handleAddProduct = () => {
    setSelectedProducts([
      ...selectedProducts,
      { productId: "", variantId: null, quantity: 1 },
    ]);
  };

  const handleRemoveProduct = (index) => {
    const newSelectedProducts = selectedProducts.filter((_, i) => i !== index);
    setSelectedProducts(newSelectedProducts);
  };

  const getProductDetails = (productId, variantId) => {
    return products.find(
      (p) => p.value === productId && p.variantId === variantId
    );
  };

  const totalAmount = useMemo(() => {
    return selectedProducts.reduce((total, item) => {
      const productDetails = getProductDetails(item.productId, item.variantId);
      if (productDetails) {
        return total + productDetails.price * item.quantity;
      }
      return total;
    }, 0);
  }, [selectedProducts, products]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !selectedBranch ||
      !selectedCustomer ||
      selectedProducts.some((p) => !p.productId) ||
      !paymentMethod
    ) {
      toast.error("Please fill all fields");
      return;
    }

    const productsToOrder = selectedProducts.map((p) => {
      const productObj = {
        product_id: p.productId,
        quantity: Number(p.quantity),
      };
      if (p.variantId) {
        productObj.variant_id = p.variantId;
      }
      return productObj;
    });

    const orderPayload = {
      salon_id: salonId,
      branch_id: selectedBranch,
      customer_id: selectedCustomer,
      payment_method: paymentMethod,
      products: productsToOrder,
    };

    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/order`, orderPayload);
      toast.success("Order placed successfully");
      onClose();
    } catch (err) {
      toast.error("Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <>
      <div className="overlay-blur" onClick={onClose}></div>
      <div className={`sidebar-div ${show ? "show" : ""}`}>
        <div className="p-4 bg-dark h-100 text-white overflow-auto">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="sidebar-title">Buy Product</h5>
            <button className="btn btn-outline-danger" onClick={onClose}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          <hr />
          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">
                  Select Branch <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select bg-dark text-white"
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  required
                >
                  <option value="">Select Branch</option>
                  {branches.map((b) => (
                    <option key={b.value} value={b.value}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">
                  Select Customer <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select bg-dark text-white"
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  required
                >
                  <option value="">Select Customer</option>
                  {customers.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedProducts.map((product, index) => (
              <div className="row mb-3" key={index}>
                <div className="col-md-5">
                  <label className="form-label">
                    Select Product <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select bg-dark text-white"
                    value={`${product.productId}-${product.variantId}`}
                    onChange={(e) =>
                      handleProductSelectionChange(index, e.target.value)
                    }
                    required
                  >
                    <option value="">Select Product</option>
                    {products.map((p) => (
                      <option
                        key={`${p.value}-${p.variantId}`}
                        value={`${p.value}-${p.variantId}`}
                      >
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-5">
                  <label className="form-label">
                    Quantity <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="form-control bg-dark text-white"
                    value={product.quantity}
                    onChange={(e) =>
                      handleQuantityChange(index, e.target.value)
                    }
                    required
                  />
                </div>
                <div className="col-md-2 d-flex align-items-end">
                  {selectedProducts.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-outline-danger w-100"
                      onClick={() => handleRemoveProduct(index)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  )}
                </div>
              </div>
            ))}

            <div className="mb-3">
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={handleAddProduct}
              >
                <i className="bi bi-plus-lg me-2"></i>Add Another Product
              </button>
            </div>

            {selectedProducts.some((p) => p.productId) && (
              <div className="mb-4 mt-4">
                <h6 className="text-white mb-3">Selected Products</h6>
                {selectedProducts.map((item, index) => {
                  const productDetails = getProductDetails(
                    item.productId,
                    item.variantId
                  );
                  if (!productDetails) return null;

                  return (
                    <div className="card bg-black text-white mb-2" key={index}>
                      <div className="card-body p-3 d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-0">{productDetails.label}</h6>
                          <small className="text-light">
                            {item.quantity} x ₹{productDetails.price}
                          </small>
                        </div>
                        <div className="text-end">
                          <h6 className="mb-0">
                            ₹{productDetails.price * item.quantity}
                          </h6>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div className="d-flex justify-content-between mt-3 fw-bold">
                  <span>Total Amount:</span>
                  <span>₹{totalAmount}</span>
                </div>
              </div>
            )}

            <div className="mb-3">
              <label className="form-label">
                Payment Method <span className="text-danger">*</span>
              </label>
              <div className="d-flex gap-4">
                {["cash", "card", "upi"].map((method) => (
                  <label key={method} className="form-check-label mb-1">
                    <input
                      type="radio"
                      className="form-check-input me-2"
                      name="payment"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    {method.charAt(0).toUpperCase() + method.slice(1)}
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="btn page-btn me-2"
              disabled={loading}
            >
              <i
                className={`bi bi-${
                  loading ? "arrow-clockwise" : "floppy"
                } me-2`}
              ></i>
              {loading ? "Processing..." : "Place Order"}
            </button>
            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={onClose}
              disabled={loading}
            >
              <i className="bi bi-x-lg me-2"></i>Cancel
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default BuyProducts;
