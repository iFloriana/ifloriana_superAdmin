import { useState, useEffect } from "react";
import axios from "axios";
import "./context.css";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { toast } from "react-toastify";
import AddMembershipModal from "../popup/AddMembershipModal";
import AddPackageModal from "../popup/AddPackageModal";
import CustomerSidebar from "./CustomerSidebar";
import { useNavigate } from "react-router-dom";

const AppointmentSidebar = ({
  show,
  onClose,
  appointmentData,
  onAppointmentSaved,
}) => {
  const [branches, setBranches] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [staffs, setStaffs] = useState([]);
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedServices, setSelectedServices] = useState([
    { service_id: "", staff_id: "", price: 0 },
  ]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [formData, setFormData] = useState({
    branch_id: "",
    appointment_date: "",
    appointment_time: "",
    customer_id: "",
    notes: "",
    status: "upcoming",
  });
  const [subTotal, setSubTotal] = useState(0);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showProductSelection, setShowProductSelection] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [showAddPackageModal, setShowAddPackageModal] = useState(false);
  const [filteredStaffs, setFilteredStaffs] = useState([]);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const toggleCustomerForm = () => setShowCustomerForm((prev) => !prev);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;
  const salonId = localStorage.getItem("salon_id");

  useEffect(() => {
    if (formData.branch_id && staffs.length > 0) {
      const staffsForBranch = staffs.filter(
        (staff) => staff.branch_id._id === formData.branch_id
      );
      setFilteredStaffs(staffsForBranch);
    } else {
      setFilteredStaffs([]);
    }
    setSelectedServices((prevServices) =>
      prevServices.map((service) => ({
        ...service,
        staff_id: "",
      }))
    );
  }, [formData.branch_id, staffs]);

  const fetchInitialData = async () => {
    try {
      const [branchesRes, customersRes, staffsRes, servicesRes, productsRes] =
        await Promise.all([
          axios.get(`${API_URL}/branches?salon_id=${salonId}`),
          axios.get(`${API_URL}/customers?salon_id=${salonId}`),
          axios.get(`${API_URL}/staffs?salon_id=${salonId}`),
          axios.get(`${API_URL}/services?salon_id=${salonId}`),
          axios.get(`${API_URL}/products?salon_id=${salonId}`),
        ]);

      setBranches(branchesRes.data.data);
      setCustomers(customersRes.data.data);
      setStaffs(staffsRes.data.data);
      setServices(servicesRes.data.data);
      setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
    } catch (error) {
      console.error("Error fetching initial data:", error);
      toast.error("Failed to load necessary data. Please try again.");
    }
  };

  useEffect(() => {
    if (show) {
      fetchInitialData();
    } else {
      resetForm();
    }
  }, [show]);

  useEffect(() => {
    if (
      show &&
      appointmentData &&
      products.length > 0 &&
      services.length > 0 &&
      customers.length > 0
    ) {
      prefillForm();
    }
  }, [appointmentData, products, services, customers]);

  const prefillForm = () => {
    setIsEditMode(true);
    const formattedDate = appointmentData.appointment_date
      ? new Date(appointmentData.appointment_date).toISOString().split("T")[0]
      : "";

    setFormData({
      branch_id: appointmentData.branch?._id || appointmentData.branch_id || "",
      appointment_date: formattedDate,
      appointment_time: appointmentData.appointment_time || "",
      customer_id: appointmentData.customer?._id || "",
      notes: appointmentData.notes || "",
      status: appointmentData.status || "upcoming",
    });

    if (appointmentData.customer?._id) {
      const foundCustomer = customers.find(
        (c) => c._id === appointmentData.customer._id
      );
      setSelectedCustomer(foundCustomer || null);
    } else {
      setSelectedCustomer(null);
    }

    const prefilledProducts = [];
    if (
      Array.isArray(appointmentData.products) &&
      appointmentData.products.length > 0
    ) {
      appointmentData.products.forEach((prod) => {
        const parentProduct = products.find((p) => p._id === prod.product_id);
        let variantId = prod.variant_id || "";
        let itemPrice = 0;
        let productName = "";
        let variantLabel = "";

        productName = prod.name || (parentProduct ? parentProduct.name : "");

        if (parentProduct) {
          if (
            parentProduct.has_variations &&
            Array.isArray(parentProduct.variants) &&
            variantId
          ) {
            const matchedVariant = parentProduct.variants.find(
              (v) => v._id === variantId
            );
            itemPrice = matchedVariant ? matchedVariant.price : 0;
            variantLabel = matchedVariant ? matchedVariant.sku : "";
          } else if (!parentProduct.has_variations) {
            itemPrice = parentProduct.price || 0;
          }
        }

        if (itemPrice === 0 && prod.unit_price) {
          itemPrice = prod.unit_price;
        }

        prefilledProducts.push({
          product_id: prod.product_id,
          product_name: productName,
          variant_id: variantId,
          variant_label: variantLabel,
          quantity: prod.quantity,
          price: itemPrice * prod.quantity,
        });
      });
      setSelectedProducts(prefilledProducts);
      setShowProductSelection(true);
    } else {
      setSelectedProducts([]);
      setShowProductSelection(false);
    }

    const prefilledServices = [];
    if (
      Array.isArray(appointmentData.services) &&
      appointmentData.services.length > 0
    ) {
      appointmentData.services.forEach((serviceObj) => {
        const serviceId =
          serviceObj.service?._id || serviceObj.service_id || "";
        const staffId = serviceObj.staff?._id || serviceObj.staff_id || "";
        const matchedService = services.find((s) => s._id === serviceId);

        prefilledServices.push({
          service_id: serviceId || "",
          staff_id: staffId || "",
          price: matchedService ? matchedService.regular_price : 0,
        });
      });
    }
    setSelectedServices(
      prefilledServices.length > 0
        ? prefilledServices
        : [{ service_id: "", staff_id: "", price: 0 }]
    );
  };

  useEffect(() => {
    calculateSubTotal();
  }, [selectedServices, selectedProducts, services, products]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleServiceChange = (index, e) => {
    const { name, value } = e.target;
    const updatedServices = [...selectedServices];
    updatedServices[index][name] = value;

    if (name === "service_id") {
      const selectedService = services.find((s) => s._id === value);
      updatedServices[index].price = selectedService
        ? selectedService.regular_price
        : 0;
    }

    setSelectedServices(updatedServices);
    setTimeout(() => {
      calculateSubTotal();
    }, 0);
  };

  const handleProductChange = (index, e) => {
    const { name, value } = e.target;
    const updatedProducts = [...selectedProducts];
    updatedProducts[index][name] = value;

    let productId = updatedProducts[index].product_id;
    let variantId = updatedProducts[index].variant_id;

    if (name === "product_variant_selection") {
      const [pId, vId] = value.split("_");
      productId = pId;
      variantId = vId === "no_variant" ? "" : vId;
      updatedProducts[index].product_id = productId;
      updatedProducts[index].variant_id = variantId;
    }

    const currentProduct = products.find((p) => p._id === productId);
    let itemPrice = 0;

    if (currentProduct) {
      if (variantId && Array.isArray(currentProduct.variants)) {
        const selectedVariant = currentProduct.variants.find(
          (v) => v._id === variantId
        );
        itemPrice = selectedVariant ? selectedVariant.price : 0;
      } else if (!currentProduct.has_variations) {
        itemPrice = currentProduct.price;
      }
    }

    updatedProducts[index].price =
      itemPrice * parseInt(updatedProducts[index].quantity || 0);

    setSelectedProducts(updatedProducts);
  };

  const addMoreService = () => {
    setSelectedServices([
      ...selectedServices,
      { service_id: "", staff_id: "", price: 0 },
    ]);
  };

  const addMoreProduct = () => {
    setSelectedProducts([
      ...selectedProducts,
      { product_id: "", variant_id: "", quantity: 1, price: 0 },
    ]);
    setShowProductSelection(true);
  };

  const removeService = (index) => {
    const updatedServices = selectedServices.filter((_, i) => i !== index);
    setSelectedServices(updatedServices);
  };

  const removeProduct = (index) => {
    const updatedProducts = selectedProducts.filter((_, i) => i !== index);
    setSelectedProducts(updatedProducts);
    if (updatedProducts.length === 0) {
      setShowProductSelection(false);
    }
  };

  const calculateSubTotal = () => {
    const servicesTotal = selectedServices.reduce(
      (sum, service) => sum + (service.price || 0),
      0
    );
    const productsTotal = selectedProducts.reduce((sum, p) => {
      const selectedProd = products.find((prod) => prod._id === p.product_id);
      if (!selectedProd) return sum;

      let price = 0;
      if (selectedProd.has_variations && p.variant_id) {
        const variant = selectedProd.variants.find(
          (v) => v._id === p.variant_id
        );
        price = variant?.price || 0;
      } else if (!selectedProd.has_variations) {
        price = selectedProd.price || 0;
      }

      return sum + price * (parseInt(p.quantity) || 0);
    }, 0);
    setSubTotal(servicesTotal + productsTotal);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const appointmentPayload = {
      customer_id: formData.customer_id,
      branch_id: formData.branch_id,
      services: selectedServices
        .filter((s) => s.service_id && s.staff_id)
        .map((s) => ({
          service_id: s.service_id,
          staff_id: s.staff_id,
        })),
      products: selectedProducts
        .filter((p) => p.product_id && p.quantity > 0)
        .map((p) => {
          const selectedProd = products.find(
            (prod) => prod._id === p.product_id
          );
          const productToSend = {
            product_id: p.product_id,
            quantity: parseInt(p.quantity),
          };
          if (selectedProd?.has_variations && p.variant_id) {
            productToSend.variant_id = p.variant_id;
          }
          return productToSend;
        }),
      appointment_date: formData.appointment_date,
      appointment_time: formData.appointment_time,
      salon_id: salonId,
      notes: formData.notes,
      status: isEditMode ? formData.status : "upcoming",
    };

    if (
      !appointmentPayload.customer_id ||
      !appointmentPayload.branch_id ||
      !appointmentPayload.appointment_date ||
      !appointmentPayload.appointment_time
    ) {
      toast.error("Please fill all required fields.");
      return;
    }

    if (
      appointmentPayload.services.length === 0 &&
      appointmentPayload.products.length === 0
    ) {
      toast.error("Please select at least one service or product.");
      return;
    }

    try {
      let response;
      if (isEditMode && appointmentData && appointmentData.appointment_id) {
        response = await axios.put(
          `${API_URL}/appointments/${appointmentData.appointment_id}`,
          appointmentPayload
        );
        toast.success("Appointment updated successfully!");
      } else {
        response = await axios.post(
          `${API_URL}/appointments`,
          appointmentPayload
        );
        toast.success("Appointment booked successfully!");
      }
      onClose();
      onAppointmentSaved();
      resetForm();
    } catch (error) {
      console.error("Error booking/updating appointment:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        toast.error(
          `Failed to book/update appointment: ${
            error.response.data.message || error.response.statusText
          }`
        );
      } else if (error.request) {
        console.error("Error request:", error.request);
        toast.error(
          "Failed to book/update appointment: No response from server."
        );
      } else {
        console.error("Error message:", error.message);
        toast.error(`Failed to book/update appointment: ${error.message}`);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      branch_id: "",
      appointment_date: "",
      appointment_time: "",
      customer_id: "",
      notes: "",
      status: "upcoming",
    });
    setSelectedServices([{ service_id: "", staff_id: "", price: 0 }]);
    setSelectedProducts([]);
    setSubTotal(0);
    setShowProductSelection(false);
    setSelectedCustomer(null);
  };

  if (!show) return null;

  const statusOptions = ["upcoming", "check-in", "check-out", "cancelled"];
  const statusColors = {
    upcoming: "text-bg-purple",
    "check-in": "text-bg-warning text-warning",
    "check-out": "text-bg-success text-success",
    cancelled: "text-bg-danger text-danger",
  };

  const custonStyle = {
    control: (base) => ({
      ...base,
      backgroundColor: "#212529",
      color: "#fff",
      borderColor: "#333",
    }),
    singleValue: (base) => ({
      ...base,
      color: "#fff",
    }),
    input: (base) => ({
      ...base,
      color: "#fff",
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "#000",
      color: "#fff",
      zIndex: 99,
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
  };

  return (
    <>
      <div className="overlay-blur" onClick={onClose}></div>
      <div className={`sidebar-div bg-dark ${show ? "show" : ""}`}>
        <div className="p-4  text-white h-100">
          <div className="d-flex justify-content-between">
            <h5 className="sidebar-title">
              {isEditMode ? "Edit Appointment" : "Add New Appointment"}
            </h5>
            <button onClick={onClose} className="btn btn-outline-danger">
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          <hr />
          <form onSubmit={handleSubmit}>
            {isEditMode && (
              <>
                <div className="mb-3 d-flex justify-content-between align-items-center">
                  <div className="d-flex justify-content-start gap-2 align-items-center">
                    <div
                      className={`badge custom-circle ${
                        statusColors[formData.status] || "text-bg-secondary"
                      }`}
                    >
                      .
                    </div>
                    <span className="fs-5">Status</span>
                  </div>
                  <select
                    className="form-select bg-dark text-white w-50"
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="" hidden>
                      Select Status
                    </option>
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <hr />
              </>
            )}
            <div className="mb-3">
              <label className="form-label">Select Branch</label>
              <select
                className="form-select bg-dark text-white"
                name="branch_id"
                value={formData.branch_id}
                onChange={handleFormChange}
                required
              >
                <option value="" hidden>
                  Select Branch
                </option>
                {branches.map((branch) => (
                  <option key={branch._id} value={branch._id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Select Date</label>
                <input
                  type="date"
                  className="form-control bg-dark text-white"
                  name="appointment_date"
                  value={formData.appointment_date}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Select Time</label>
                <input
                  type="time"
                  className="form-control bg-dark text-white"
                  name="appointment_time"
                  value={formData.appointment_time}
                  onChange={handleFormChange}
                  required
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="form-label mb-0">Select Customer</label>
              <CreatableSelect
                styles={custonStyle}
                name="customer_id"
                value={selectedCustomer}
                onChange={(selectedOption) => {
                  if (selectedOption?.__isNew__) {
                    setNewCustomerName(selectedOption.value);
                    setShowCustomerForm(true);
                  } else {
                    setFormData((prev) => ({
                      ...prev,
                      customer_id: selectedOption._id,
                    }));
                    setSelectedCustomer(selectedOption || null);
                  }
                }}
                options={customers}
                getOptionLabel={(c) => c.full_name || c.label}
                getOptionValue={(c) => c._id || c.value}
                placeholder="Select Customer"
                isSearchable
                formatCreateLabel={(inputValue) =>
                  `Add "${inputValue}" as New Customer`
                }
                noOptionsMessage={({ inputValue }) =>
                  inputValue
                    ? `No customer found for "${inputValue}"`
                    : "No customers available"
                }
                getNewOptionData={(inputValue, optionLabel) => ({
                  label: optionLabel,
                  value: inputValue,
                  __isNew__: true,
                })}
              />
              {selectedCustomer && (
                <div className="card bg-black text-white mt-3 position-relative">
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm position-absolute top-0 end-0 m-2"
                    aria-label="Close"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, customer_id: "" }));
                      setSelectedCustomer(null);
                    }}
                  >
                    <i className="bi bi-x"></i>
                  </button>
                  <div className="card-body d-flex align-items-center">
                    <img
                      src={selectedCustomer.image}
                      alt="Customer"
                      className="rounded-circle me-3"
                      style={{
                        width: "50px",
                        height: "50px",
                        objectFit: "cover",
                      }}
                    />
                    <div className="me-5">
                      <h6 className="mb-1">{selectedCustomer.full_name}</h6>
                      <p className="mb-0">{selectedCustomer.phone_number}</p>
                    </div>
                    <div className="d-flex flex-column align-items-start gap-1">
                      <span
                        className={`badge px-2 py-1 ${
                          selectedCustomer.branch_membership?._id
                            ? "bg-success"
                            : "bg-danger"
                        }`}
                      >
                        Membership:{" "}
                        {selectedCustomer.branch_membership?._id
                          ? "Active"
                          : "Inactive"}
                      </span>
                      <span
                        className={`badge px-2 py-1 ${
                          selectedCustomer.branch_package?.length > 0
                            ? "bg-success"
                            : "bg-danger"
                        }`}
                      >
                        Package:{" "}
                        {selectedCustomer.branch_package?.length > 0
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="mb-3 d-flex justify-content-center">
              {selectedCustomer && !selectedCustomer.branch_membership?._id && (
                <button
                  type="button"
                  className="btn btn-outline-info btn-sm mb-3 me-3"
                  onClick={() => setShowMembershipModal(true)}
                >
                  + Add Membership
                </button>
              )}
              {selectedCustomer &&
                !(selectedCustomer.branch_package?.length > 0) && (
                  <button
                    type="button"
                    className="btn btn-outline-info btn-sm mb-3"
                    onClick={() => setShowAddPackageModal(true)} // Open AddPackageModal
                  >
                    + Add Package
                  </button>
                )}
            </div>
            {selectedServices.map((service, index) => (
              <div
                key={`service-${index}`}
                className="mb-3 p-3 border rounded service-selection-block"
              >
                <div className="d-flex justify-content-between align-items-center mb-2 service-selection-header">
                  <label className="form-label mb-0 me-2 service-label">
                    Select Service & Staff : #{index + 1}
                  </label>
                  {selectedServices.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => removeService(index)}
                    >
                      Cancel
                    </button>
                  )}
                </div>
                <div className="mb-3">
                  <Select
                    styles={custonStyle}
                    name="service_id"
                    value={
                      services.find((s) => s._id === service.service_id) || null
                    }
                    onChange={(selectedOption) => {
                      const e = {
                        target: {
                          name: "service_id",
                          value: selectedOption._id,
                        },
                      };
                      handleServiceChange(index, e);
                    }}
                    options={services}
                    getOptionLabel={(s) => `${s.name} - ₹${s.regular_price}`}
                    getOptionValue={(s) => s._id}
                    placeholder="Select Service"
                    isSearchable
                  />
                </div>
                <div className="mb-0">
                  <select
                    className="form-select bg-dark text-white"
                    name="staff_id"
                    value={service.staff_id}
                    onChange={(e) => handleServiceChange(index, e)}
                    required
                    disabled={
                      !formData.branch_id || filteredStaffs.length === 0
                    }
                  >
                    {/* Conditional rendering for the default option */}
                    {!formData.branch_id ? (
                      <option value="" hidden>
                        Select Branch First
                      </option>
                    ) : filteredStaffs.length === 0 ? (
                      <option value="" hidden>
                        No Staff Available for this Branch
                      </option>
                    ) : (
                      <option value="" hidden>
                        Select Staff
                      </option>
                    )}

                    {/* Map filtered staffs */}
                    {filteredStaffs.map((staff) => (
                      <option key={staff._id} value={staff._id}>
                        {staff.full_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
            <div className="d-flex justify-content-between">
              <button
                type="button"
                className="btn btn-outline-info btn-sm mb-3"
                onClick={addMoreService}
              >
                + Add More Service
              </button>
              <button
                type="button"
                className="btn btn-outline-info btn-sm mb-3"
                onClick={addMoreProduct}
              >
                + Add Product
              </button>
            </div>
            <div className="mb-3">
              {showProductSelection &&
                Array.isArray(selectedProducts) &&
                selectedProducts.map((product, index) => {
                  const currentProduct = products.find(
                    (p) => p._id === product.product_id
                  );

                  return (
                    <div
                      key={`product-${index}`}
                      className="mb-3 p-3 border rounded product-selection-block"
                    >
                      <div className="d-flex justify-content-between align-items-center mb-2 product-selection-header">
                        <label className="form-label mb-0 me-2 product-label">
                          Select Product & Variant : #{index + 1}
                        </label>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeProduct(index)}
                        >
                          Cancel
                        </button>
                      </div>
                      <div className="mb-3">
                        <Select
                          className="mt-2"
                          styles={custonStyle}
                          name="product_variant_selection"
                          value={{
                            value:
                              product.product_id && product.variant_id
                                ? `${product.product_id}_${product.variant_id}`
                                : product.product_id && !product.variant_id
                                ? `${product.product_id}_no_variant`
                                : "",
                            label: (() => {
                              const prod = products.find(
                                (p) => p._id === product.product_id
                              );
                              if (prod) {
                                if (
                                  prod.variants?.length > 0 &&
                                  product.variant_id
                                ) {
                                  const variant = prod.variants.find(
                                    (v) => v._id === product.variant_id
                                  );
                                  return `${prod.product_name} - ${variant?.sku} - ₹${variant?.price}`;
                                } else if (!prod.has_variations) {
                                  return `${prod.product_name} - ₹${prod.price}`;
                                }
                              }
                              return "Select Product";
                            })(),
                          }}
                          onChange={(selected) => {
                            const e = {
                              target: {
                                name: "product_variant_selection",
                                value: selected?.value || "",
                              },
                            };
                            handleProductChange(index, e);
                          }}
                          options={products.flatMap((p) => {
                            if (
                              Array.isArray(p.variants) &&
                              p.variants.length > 0
                            ) {
                              return p.variants.map((variant) => ({
                                value: `${p._id}_${variant._id}`,
                                label: `${p.product_name} - ${variant.sku} - ₹${variant.price}`,
                              }));
                            } else {
                              return [
                                {
                                  value: `${p._id}_no_variant`,
                                  label: `${p.product_name} - ₹${p.price}`,
                                },
                              ];
                            }
                          })}
                        />
                      </div>
                      <div className="mb-0">
                        <label className="form-label">Quantity</label>
                        <input
                          type="number"
                          className="form-control bg-dark text-white"
                          name="quantity"
                          value={product.quantity}
                          onChange={(e) => handleProductChange(index, e)}
                          min="1"
                          required
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
            <div className="mb-3">
              <label className="form-label">Note</label>
              <textarea
                className="bg-dark form-control text-white"
                rows="2"
                name="notes"
                value={formData.notes}
                onChange={handleFormChange}
              ></textarea>
            </div>
            <p className="fs-5">
              Sub Total: <strong>₹{subTotal.toFixed(2)}</strong>
            </p>
            <div className="my-3">
              <button type="submit" className="btn page-btn mb-5 me-3">
                {isEditMode ? "Update Appointment" : "Book Appointment"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <AddMembershipModal
        show={showMembershipModal}
        onClose={() => setShowMembershipModal(false)}
        customerId={selectedCustomer?._id}
        customerDetails={selectedCustomer}
        onSuccess={() => {
          toast.success("Customer updated with membership!");
        }}
      />
      <AddPackageModal
        show={showAddPackageModal}
        onClose={() => setShowAddPackageModal(false)}
        customerId={selectedCustomer?._id}
        customerDetails={selectedCustomer}
        onSuccess={() => {
          toast.success("Customer updated with package!");
        }}
      />
      <CustomerSidebar
        show={showCustomerForm}
        onClose={() => {
          setShowCustomerForm(false);
          setNewCustomerName("");
        }}
        prefillName={newCustomerName}
        onCustomerCreated={(newCust) => {
          setCustomers((prev) => [...prev, newCust]);
          setSelectedCustomer(newCust);
          setFormData((prev) => ({
            ...prev,
            customer_id: newCust._id,
          }));
        }}
      />
    </>
  );
};

export default AppointmentSidebar;
