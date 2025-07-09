import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "../AddContext/context.css";

const QuantityEdit = ({ show, onClose, stock, onStockUpdated }) => {
  const API_URL = import.meta.env.VITE_API_URL;

  const [currentStock, setCurrentStock] = useState(0);
  const [variantsStock, setVariantsStock] = useState([]);

  useEffect(() => {
    if (show && stock) {
      if (stock.has_variations === 1 && stock.variants) {
        setVariantsStock(
          stock.variants.map((variant) => ({
            ...variant,
            original_stock: variant.stock,
          }))
        );
        setCurrentStock(0);
      } else {
        setCurrentStock(stock.stock || 0);
        setVariantsStock([]);
      }
    } else {
      setCurrentStock(0);
      setVariantsStock([]);
    }
  }, [show, stock]);

  const handleSimpleStockChange = (e) => {
    setCurrentStock(parseInt(e.target.value) || 0);
  };

  const handleVariantStockChange = (index, e) => {
    const updatedVariants = [...variantsStock];
    updatedVariants[index].stock = parseInt(e.target.value) || 0;
    setVariantsStock(updatedVariants);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stock || !stock._id) {
      toast.error("No product selected for stock update.");
      return;
    }

    try {
      if (stock.has_variations === 1) {
        for (const variant of variantsStock) {
          if (variant.stock < 0) {
            toast.error(
              `Stock for variant ${
                variant.sku || variant._id
              } cannot be negative.`
            );
            return;
          }
          const payload = {
            variant_sku: variant.sku,
            variant_stock: variant.stock,
          };
          await axios.patch(`${API_URL}/products/${stock._id}/stock`, payload);
        }
      } else {
        if (currentStock < 0) {
          toast.error("Stock cannot be negative.");
          return;
        }
        const payload = { stock: currentStock };
        await axios.patch(`${API_URL}/products/${stock._id}/stock`, payload);
      }
      toast.success("Stock updated successfully!");
      onClose();
      if (onStockUpdated) {
        onStockUpdated();
      }
    } catch (error) {
      console.error("Error updating stock:", error);
      toast.error("Failed to update stock. Please try again.");
    }
  };

  if (!show) return null;

  return (
    <>
      <div className="overlay-blur" onClick={onClose}></div>
      <div className={`sidebar-div ${show ? "show" : ""}`}>
        <div className="p-4 bg-dark h-100 text-white overflow-auto">
          <div className="d-flex justify-content-between">
            <h5 className="sidebar-title">
              Update Stock: {stock?.product_name || "N/A"}
            </h5>
            <button onClick={onClose} className="btn btn-outline-danger">
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          <hr />
          <div className="text-start">
            <form onSubmit={handleSubmit}>
              {!stock?.has_variations ? (
                <div className="mb-3">
                  <label htmlFor="stockQuantity" className="form-label">
                    Quantity
                  </label>
                  <input
                    type="number"
                    id="stockQuantity"
                    className="form-control bg-dark text-white border"
                    value={currentStock}
                    onChange={handleSimpleStockChange}
                    min="0"
                    required
                  />
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-dark table-bordered">
                    <thead>
                      <tr>
                        <th>Variation</th>
                        <th>Current Stock</th>
                        <th>New Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                      {variantsStock.map((variant, index) => (
                        <tr key={variant._id || index}>
                          <td>
                            {variant.combination &&
                              variant.combination.map(
                                (comboItem, comboIndex) => (
                                  <span key={comboIndex}>
                                    {comboItem.variation_type}:{" "}
                                    {comboItem.variation_value}
                                    {comboIndex < variant.combination.length - 1
                                      ? ", "
                                      : ""}
                                  </span>
                                )
                              )}
                          </td>
                          <td>{variant.original_stock}</td>
                          <td>
                            <input
                              type="number"
                              className="form-control bg-dark text-white"
                              value={variant.stock}
                              onChange={(e) =>
                                handleVariantStockChange(index, e)
                              }
                              min="0"
                              required
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <button type="submit" className="btn page-btn mt-3">
                <i className="bi bi-arrow-clockwise me-2"></i>Update Stock
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary mt-3 ms-2"
                onClick={onClose}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuantityEdit;
