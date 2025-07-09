import { useEffect, useState } from "react";
import "../AddContext/context.css";
import defaultImage from "../../public/default.png";
import Select from "react-select";
import axios from "axios";
import { toast } from "react-toastify";

const ProductEdit = ({ show, onClose, selectedProduct, onProductAction }) => {
  const [photo, setPhoto] = useState(null);
  const [status, setStatus] = useState("active");
  const [hasVariations, setHasVariations] = useState(false);
  const [combos, setCombos] = useState([]);
  const [brands, setBrands] = useState([]);
  const [units, setUnits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [variationList, setVariationList] = useState([]);
  const [varType, setVarType] = useState([
    { type: "", values: [], options: [] },
  ]);
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [unit, setUnit] = useState("");
  const [tag, setTag] = useState("");
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [sku, setSku] = useState("");
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("");
  const [discountDate, setDiscountDate] = useState("");
  const [discountDateEnd, setDiscountDateEnd] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [branches, setBranches] = useState([]);
  const [selectedBranches, setSelectedBranches] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL;
  const salonId = localStorage.getItem("salon_id");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          brandRes,
          unitRes,
          categoryRes,
          tagRes,
          branchRes,
          variationRes,
        ] = await Promise.all([
          axios.get(`${API_URL}/brands?salon_id=${salonId}`),
          axios.get(`${API_URL}/units?salon_id=${salonId}`),
          axios.get(`${API_URL}/productCategories?salon_id=${salonId}`),
          axios.get(`${API_URL}/tags?salon_id=${salonId}`),
          axios.get(`${API_URL}/branches?salon_id=${salonId}`),
          axios.get(`${API_URL}/variations?salon_id=${salonId}`),
        ]);
        setBrands(brandRes.data.data);
        setUnits(unitRes.data.data);
        setCategories(categoryRes.data.data);
        setTags(tagRes.data.data);
        setVariationList(variationRes.data.data);
        const branchOptions = branchRes.data.data.map((branch) => ({
          label: branch.name,
          value: branch._id,
        }));
        setBranches(branchOptions);
      } catch (error) {
        console.error("Error fetching dropdown data", error);
        toast.error("Failed to fetch dropdown data");
      }
    };
    fetchData();
  }, [API_URL]);

  useEffect(() => {
    if (show && selectedProduct) {
      setProductName(selectedProduct.product_name || "");
      setDescription(selectedProduct.description || "");
      setBrand(selectedProduct.brand_id?._id || "");
      setCategory(selectedProduct.category_id?._id || "");
      setUnit(selectedProduct.unit_id?._id || "");
      setTag(selectedProduct.tag_id?._id || "");
      setPhoto(selectedProduct.image || null);
      setStatus(selectedProduct.status === 1 ? "active" : "inactive");
      setHasVariations(selectedProduct.has_variations === 1);

      if (selectedProduct.has_variations === 1 && selectedProduct.variants) {
        setCombos(
          selectedProduct.variants.map((v) => ({
            combination: v.combination,
            price: v.price,
            stock: v.stock,
            sku: v.sku,
            code: v.code,
          }))
        );

        const initialVarTypes = selectedProduct.variation_id
          ?.map((varId) => {
            const foundVariation = variationList.find((v) => v._id === varId);
            return {
              type: foundVariation?.name || "",
              values:
                foundVariation?.value?.map((val) => ({
                  label: val,
                  value: val,
                })) || [],
              options:
                foundVariation?.value?.map((val) => ({
                  label: val,
                  value: val,
                })) || [],
            };
          })
          .filter((vt) => vt.type !== "");
        setVarType(
          initialVarTypes && initialVarTypes.length > 0
            ? initialVarTypes
            : [{ type: "", values: [], options: [] }]
        );
      } else {
        setPrice(selectedProduct.price || 0);
        setStock(selectedProduct.stock || 0);
        setSku(selectedProduct.sku || "");
        setCode(selectedProduct.code || "");
        setCombos([]);
        setVarType([{ type: "", values: [], options: [] }]);
      }

      if (selectedProduct.product_discount) {
        setDiscountType(selectedProduct.product_discount.discount_type || "");
        setDiscountAmount(
          selectedProduct.product_discount.discount_amount || 0
        );
        setDiscountDate(
          selectedProduct.product_discount.start_date
            ? new Date(selectedProduct.product_discount.start_date)
                .toISOString()
                .split("T")[0]
            : ""
        );
        setDiscountDateEnd(
          selectedProduct.product_discount.end_date
            ? new Date(selectedProduct.product_discount.end_date)
                .toISOString()
                .split("T")[0]
            : ""
        );
      } else {
        setDiscountType("");
        setDiscountAmount(0);
        setDiscountDate("");
        setDiscountDateEnd("");
      }

      setSelectedBranches(
        selectedProduct.branch_id?.map((branch) => ({
          label: branch.name,
          value: branch._id,
        })) || []
      );
    }
  }, [show, selectedProduct, variationList]);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      toast.error("Only JPG and PNG files are allowed.");
    }
  };

  const removePhoto = () => {
    setPhoto(null);
  };

  const generateCombinations = (variations) => {
    const keys = variations.map((v) => v.type);
    const values = variations.map((v) => v.values.map((val) => val.value));

    if (values.length === 0 || values.some((arr) => arr.length === 0)) {
      return [];
    }

    if (values.length === 1) {
      return values[0].map((val) => ({
        combination: [{ variation_type: keys[0], variation_value: val }],
        price: 0,
        stock: 0,
        sku: "",
        code: "",
      }));
    }

    const cartesian = values.reduce((a, b) =>
      a.flatMap((d) => b.map((e) => [].concat(d, e)))
    );

    return cartesian.map((combo) => {
      const comboArray = Array.isArray(combo) ? combo : [combo];
      const combinedVariations = comboArray.map((value, index) => ({
        variation_type: keys[index],
        variation_value: value,
      }));
      return {
        combination: combinedVariations,
        price: 0,
        stock: 0,
        sku: "",
        code: "",
      };
    });
  };

  const handleToggle = () => {
    setHasVariations(!hasVariations);
    if (hasVariations) {
      setCombos([]);
      setVarType([{ type: "", values: [], options: [] }]);
    } else {
      if (varType.length === 0 || varType[0].type === "") {
        setVarType([{ type: "", values: [], options: [] }]);
      }
    }
  };

  const updateVariation = (index, field, value) => {
    const updated = [...varType];
    if (field === "type") {
      const selectedVariation = variationList.find((v) => v.name === value);
      updated[index] = {
        type: value,
        values: [],
        options:
          selectedVariation?.value?.map((val) => ({
            label: val,
            value: val,
          })) || [],
      };
    } else if (field === "values") {
      updated[index].values = value;
    }
    setVarType(updated);

    const filledVariations = updated
      .filter((v) => v.type && v.values.length > 0)
      .map((v) => ({
        type: v.type,
        values: v.values,
      }));

    if (
      filledVariations.length > 0 &&
      !filledVariations.some((v) => v.values.length === 0)
    ) {
      const combinations = generateCombinations(filledVariations);
      const newCombos = combinations.map((newCombo) => {
        const existingCombo = combos.find((c) => {
          if (
            !c.combination ||
            !Array.isArray(c.combination) ||
            !newCombo.combination ||
            !Array.isArray(newCombo.combination)
          ) {
            return false;
          }
          if (c.combination.length !== newCombo.combination.length) {
            return false;
          }
          return c.combination.every(
            (existingVar, i) =>
              existingVar.variation_type ===
                newCombo.combination[i].variation_type &&
              existingVar.variation_value ===
                newCombo.combination[i].variation_value
          );
        });
        return existingCombo ? existingCombo : newCombo;
      });
      setCombos(newCombos);
    } else {
      setCombos([]);
    }
  };

  const removeVariation = (index) => {
    const updated = [...varType];
    updated.splice(index, 1);
    setVarType(updated);

    const filledVariations = updated
      .filter((v) => v.type && v.values.length > 0)
      .map((v) => ({
        type: v.type,
        values: v.values,
      }));

    if (
      filledVariations.length > 0 &&
      !filledVariations.some((v) => v.values.length === 0)
    ) {
      setCombos(generateCombinations(filledVariations));
    } else {
      setCombos([]);
    }
  };

  const addVariation = () => {
    setVarType([...varType, { type: "", values: [], options: [] }]);
  };

  const handleComboChange = (index, field, value) => {
    const updatedCombos = [...combos];
    updatedCombos[index][field] = value;
    setCombos(updatedCombos);
  };

  const selectStyles = {
    control: (base) => ({
      ...base,
      backgroundColor: "#212529",
      color: "#fff",
      borderColor: "#333",
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "#000",
      color: "#fff",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused || state.isSelected ? "#8f6b55" : "#000",
      color: "#fff",
      cursor: "pointer",
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: "#8f6b55",
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: "#fff",
    }),
    placeholder: (base) => ({
      ...base,
      color: "#ccc",
    }),
    singleValue: (base) => ({
      ...base,
      color: "#fff",
    }),
    input: (base) => ({
      ...base,
      color: "#fff",
    }),
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !productName ||
      !brand ||
      !category ||
      !unit ||
      !tag ||
      selectedBranches.length === 0
    ) {
      toast.error("Please fill all required fields.");
      return;
    }

    if (!hasVariations) {
      if (price === 0 || stock === 0) {
        toast.error("Price and Stock cannot be 0 for a simple product.");
        return;
      }
    } else {
      if (combos.length === 0) {
        toast.error("Please generate variations for the product.");
        return;
      }
      const hasInvalidCombo = combos.some(
        (combo) => combo.price <= 0 || combo.stock <= 0
      );
      if (hasInvalidCombo) {
        toast.error(
          "All variations must have a price and stock greater than 0."
        );
        return;
      }
    }

    const productDiscount = {
      discount_type: discountType ? discountType.toLowerCase() : undefined,
      start_date: discountDate || undefined,
      end_date: discountDateEnd || undefined,
      discount_amount: discountAmount || undefined,
    };

    const filteredProductDiscount = Object.fromEntries(
      Object.entries(productDiscount).filter(
        ([_, value]) => value !== undefined && value !== "" && value !== 0
      )
    );

    const payload = {
      product_name: toTitleCase(productName),
      description: description,
      brand_id: brand,
      category_id: category,
      unit_id: unit,
      tag_id: tag,
      image: photo,
      status: status === "active" ? 1 : 0,
      branch_id: selectedBranches.map((b) => b.value),
      product_discount:
        Object.keys(filteredProductDiscount).length > 0
          ? filteredProductDiscount
          : undefined,
      has_variations: hasVariations ? 1 : 0,
      salon_id: salonId,
    };

    if (!hasVariations) {
      payload.price = parseFloat(price);
      payload.stock = parseInt(stock);
      payload.sku = sku;
      payload.code = code;
    } else {
      payload.variation_id = varType
        .filter((v) => v.type && v.values.length > 0)
        .map((v) => {
          const selectedVariation = variationList.find(
            (item) => item.name === v.type
          );
          return selectedVariation ? selectedVariation._id : null;
        })
        .filter(Boolean);

      payload.variants = combos.map((combo) => ({
        combination: combo.combination,
        price: parseFloat(combo.price),
        stock: parseInt(combo.stock),
        sku: combo.sku,
        code: combo.code,
      }));
    }

    try {
      await axios.put(`${API_URL}/products/${selectedProduct._id}`, payload);
      toast.success("Product Updated Successfully!");
      onClose();
      if (onProductAction) {
        onProductAction();
      }
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Error updating product. Please try again.");
    }
  };

  const toTitleCase = (str) => {
    return str
      .toLowerCase()
      .split(" ")
      .filter((word) => word.trim() !== "")
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (!show) return null;
  return (
    <>
      <div className="overlay-blur" onClick={onClose}></div>
      <div className={`sidebar-div ${show ? "show" : ""}`}>
        <div className="p-4 bg-dark h-100 text-white overflow-auto">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="sidebar-title">Edit Product</h5>
            <button className="btn btn-outline-danger" onClick={onClose}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          <hr />
          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
              <div className="col-md-4 text-center mb-4">
                <img
                  src={photo || defaultImage}
                  alt="Preview"
                  className="rounded-circle"
                  style={{
                    width: "120px",
                    height: "120px",
                    objectFit: "cover",
                  }}
                />
                <div className="d-flex justify-content-center mt-3 gap-2">
                  <label className="btn btn-info btn-sm text-white mb-0">
                    Upload
                    <input
                      type="file"
                      accept="image/png, image/jpeg"
                      onChange={handleUpload}
                      hidden
                    />
                  </label>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={removePhoto}
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="col-md-8">
                <div className=" mb-3">
                  <label className="form-label">
                    Product Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control bg-dark text-white"
                    placeholder="Enter Product Name"
                    required
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                  />
                </div>
                <label className="form-lable">Description</label>
                <textarea
                  className="bg-dark form-control text-white"
                  rows="2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label mt-3">
                  Brand <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select bg-dark text-white"
                  required
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                >
                  <option value="" hidden>
                    Select Brand
                  </option>
                  {brands.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name}
                    </option>
                  ))}
                </select>

                <label className="form-label mt-3">
                  Tag <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select bg-dark text-white"
                  required
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                >
                  <option value="" hidden>
                    Select Tag
                  </option>
                  {tags.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label mt-3">
                  Category <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select bg-dark text-white"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="" hidden>
                    Select Category
                  </option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <label className="form-label mt-3">
                  Unit <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select bg-dark text-white"
                  required
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                >
                  <option value="" hidden>
                    Select Unit
                  </option>
                  {units.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <hr />
            <div className="position-relative mb-4">
              <div
                className="position-absolute translate-middle-y bg-dark px-2"
                style={{ left: "12px", zIndex: 1 }}
              >
                <small>
                  <strong>Price, SKU & Stock</strong>
                </small>
              </div>
              <div className="bg-dark p-3 text-white rounded border mt-4">
                <div className="d-flex justify-content-end">
                  <p className="me-2 mb-0">Has variations?</p>
                  <div className="form-check form-switch">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={hasVariations}
                      onChange={handleToggle}
                    />
                  </div>
                </div>
                {!hasVariations && (
                  <div className="row mt-3">
                    <div className="col-md-3">
                      <label className="form-label">
                        Price (Included Tax){" "}
                        <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className="form-control bg-dark text-white border"
                        placeholder="Enter Price"
                        required={!hasVariations}
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        min="0"
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">
                        Stock <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className="form-control bg-dark text-white border"
                        required={!hasVariations}
                        placeholder="0"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        min="0"
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">SKU</label>
                      <input
                        type="text"
                        className="form-control bg-dark text-white border"
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label">Code</label>
                      <input
                        type="text"
                        className="form-control bg-dark text-white border"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                      />
                    </div>
                  </div>
                )}
                {hasVariations && (
                  <>
                    {varType.map((v, i) => (
                      <div className="row mb-2" key={i}>
                        <div className="col-md-5">
                          <label>Variation Type</label>
                          <select
                            className="form-select bg-dark text-white"
                            value={v.type}
                            onChange={(e) =>
                              updateVariation(i, "type", e.target.value)
                            }
                          >
                            <option value="" hidden>
                              Select Variation Type
                            </option>
                            {variationList.map((variation) => (
                              <option
                                key={variation._id}
                                value={variation.name}
                              >
                                {variation.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-5">
                          <label>Variation Value</label>
                          <Select
                            isMulti
                            styles={selectStyles}
                            options={v.options}
                            value={v.values}
                            onChange={(val) =>
                              updateVariation(i, "values", val)
                            }
                            className="text-dark"
                          />
                        </div>
                        <div className="col-md-2 d-flex align-items-end">
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={() => removeVariation(i)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn page-btn mb-3"
                      onClick={addVariation}
                    >
                      + Add More Variation
                    </button>
                    {combos.length > 0 && (
                      <div className="table-responsive">
                        <table className="table table-dark table-bordered">
                          <thead>
                            <tr>
                              <th>Variations</th>
                              <th>Price (Included Tax)</th>
                              <th>Stock</th>
                              <th>SKU</th>
                              <th>Code</th>
                            </tr>
                          </thead>
                          <tbody>
                            {combos.map((c, idx) => (
                              <tr key={idx}>
                                <td>
                                  {c.combination
                                    .map(
                                      (variation) =>
                                        `${variation.variation_type}: ${variation.variation_value}`
                                    )
                                    .join(", ")}
                                </td>
                                <td>
                                  <input
                                    className="form-control bg-dark text-white"
                                    type="number"
                                    value={c.price}
                                    onChange={(e) =>
                                      handleComboChange(
                                        idx,
                                        "price",
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                    required
                                    min="0"
                                  />
                                </td>
                                <td>
                                  <input
                                    className="form-control bg-dark text-white"
                                    type="number"
                                    value={c.stock}
                                    onChange={(e) =>
                                      handleComboChange(
                                        idx,
                                        "stock",
                                        parseInt(e.target.value) || 0
                                      )
                                    }
                                    required
                                    min="0"
                                  />
                                </td>
                                <td>
                                  <input
                                    className="form-control bg-dark text-white"
                                    value={c.sku}
                                    onChange={(e) =>
                                      handleComboChange(
                                        idx,
                                        "sku",
                                        e.target.value
                                      )
                                    }
                                  />
                                </td>
                                <td>
                                  <input
                                    className="form-control bg-dark text-white"
                                    value={c.code}
                                    onChange={(e) =>
                                      handleComboChange(
                                        idx,
                                        "code",
                                        e.target.value
                                      )
                                    }
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            <hr />
            <div className="position-relative mb-4">
              <div
                className="position-absolute translate-middle-y bg-dark px-2"
                style={{ left: "12px", zIndex: 1 }}
              >
                <small>
                  <strong>Product Discount</strong>
                </small>
              </div>
              <div className="bg-dark p-3 text-white rounded border mt-4 row">
                <div className="col-md-3">
                  <label className="form-label">Type</label>
                  <select
                    className="form-select bg-dark text-white"
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                  >
                    <option value="" hidden>
                      Select type
                    </option>
                    <option value="Percentage">Percentage</option>
                    <option value="Fixed">Fixed</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Start date</label>
                  <input
                    type="Date"
                    className="form-control bg-dark text-white border"
                    value={discountDate}
                    onChange={(e) => setDiscountDate(e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">End Date</label>
                  <input
                    type="Date"
                    className="form-control bg-dark text-white border"
                    value={discountDateEnd}
                    onChange={(e) => setDiscountDateEnd(e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Discount Amount</label>
                  <input
                    type="number"
                    className="form-control bg-dark text-white border"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                    min="0"
                  />
                </div>
              </div>
            </div>
            <div className="mb-4">
              <label className="form-label d-block">Status</label>
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input custom-radio"
                  type="radio"
                  name="status"
                  id="active"
                  value="active"
                  checked={status === "active"}
                  onChange={(e) => setStatus(e.target.value)}
                />
                <label className="form-check-label" htmlFor="active">
                  Active
                </label>
              </div>
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input custom-radio"
                  type="radio"
                  name="status"
                  id="inactive"
                  value="inactive"
                  checked={status === "inactive"}
                  onChange={(e) => setStatus(e.target.value)}
                />
                <label className="form-check-label" htmlFor="inactive">
                  Inactive
                </label>
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">
                Branch(es) <span className="text-danger">*</span>
              </label>
              <Select
                required
                isMulti
                options={branches}
                className="text-dark"
                value={selectedBranches}
                onChange={setSelectedBranches}
                styles={selectStyles}
              />
            </div>
            <button type="submit" className="btn page-btn me-2 mt-2">
              <i className="bi bi-floppy me-2"></i>
              Update Product
            </button>
            <button
              type="button"
              className="btn btn-outline-danger mt-2"
              onClick={onClose}
            >
              <i className="bi bi-x-lg me-2"></i>Cancel
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ProductEdit;
