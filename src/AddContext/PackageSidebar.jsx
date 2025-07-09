import React, { useEffect, useState } from "react";
import "./context.css";
import Select from "react-select";
import axios from "axios";
import { toast } from "react-toastify";

const PackageSidebar = ({ show, onClose, packageData, onSaveSuccess }) => {
  const [services, setServices] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [fetchedServiceOptions, setFetchedServiceOptions] = useState([]);
  const [packageName, setPackageName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("active");

  const API_URL = import.meta.env.VITE_API_URL;
  const salonId = localStorage.getItem("salon_id");

  useEffect(() => {
    if (show && packageData) {
      setPackageName(packageData.package_name || "");
      setDescription(packageData.description || "");
      setStatus(packageData.status === 1 ? "active" : "inactive");
      setStartDate(
        packageData.start_date
          ? new Date(packageData.start_date).toISOString().split("T")[0]
          : ""
      );
      setEndDate(
        packageData.end_date
          ? new Date(packageData.end_date).toISOString().split("T")[0]
          : ""
      );

      if (packageData.branch_id && branches.length > 0) {
        const preSelectedBranches = packageData.branch_id.map((branch) => ({
          label: branch.name,
          value: branch._id,
        }));
        setSelectedBranches(preSelectedBranches);
      }

      if (
        packageData.package_details &&
        packageData.package_details.length > 0
      ) {
        const mappedServices = packageData.package_details.map((detail) => ({
          id: detail._id || Date.now() + Math.random(),
          serviceId: detail.service_id?._id || "",
          price: detail.discounted_price,
          quantity: detail.quantity,
          total: (detail.discounted_price * detail.quantity).toFixed(2),
        }));
        setServices(mappedServices);
      }
    } else if (show && !packageData) {
      setServices([]);
      setSelectedBranches([]);
      setPackageName("");
      setDescription("");
      setStartDate("");
      setEndDate("");
      setStatus("active");
    }
  }, [show, packageData, branches]);

  useEffect(() => {
    if (show) {
      axios
        .get(`${API_URL}/branches?salon_id=${salonId}`)
        .then((res) => {
          const options = res.data.data
            .filter((branch) => branch.status === 1)
            .map((branch) => ({
              label: branch.name,
              value: branch._id,
            }));
          setBranches(options);
        })
        .catch((err) => console.error("Error fetching branches:", err));

      axios
        .get(`${API_URL}/services?salon_id=${salonId}`)
        .then((res) => {
          const options = res.data.data
            .filter((service) => service.status === 1)
            .map((service) => ({
              id: service._id,
              name: service.name,
            }));
          setFetchedServiceOptions(options);
        })
        .catch((err) => console.error("Error fetching services:", err));
    }
  }, [show, API_URL]);

  const handleAddService = () => {
    setServices([
      ...services,
      { id: Date.now(), serviceId: "", price: "", quantity: "", total: "" },
    ]);
  };

  const handleServiceChange = (index, field, value) => {
    const updated = [...services];
    updated[index][field] = value;

    if (field === "price" || field === "quantity") {
      const price = parseFloat(updated[index].price || 0);
      const quantity = parseFloat(updated[index].quantity || 0);
      updated[index].total = (price * quantity).toFixed(2);
    } else if (field === "serviceId") {
      const selectedService = fetchedServiceOptions.find((s) => s.id === value);
      if (selectedService) {
      }
    }

    setServices(updated);
  };

  const handleRemoveService = (id) => {
    setServices(services.filter((item) => item.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !packageName ||
      selectedBranches.length === 0 ||
      !startDate ||
      !endDate ||
      services.length === 0
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const branchIds = selectedBranches.map((branch) => branch.value);
    const packageDetails = services.map((service) => ({
      service_id: service.serviceId,
      discounted_price: parseFloat(service.price),
      quantity: parseInt(service.quantity, 10),
    }));

    const totalPackagePrice = services.reduce(
      (sum, item) => sum + parseFloat(item.total || 0),
      0
    );

    const payload = {
      branch_id: branchIds,
      package_name: toTitleCase(packageName),
      description: toTitleCase(description),
      start_date: startDate,
      end_date: endDate,
      status: status === "active" ? 1 : 0,
      package_details: packageDetails,
      salon_id: salonId,
      package_price: parseFloat(totalPackagePrice.toFixed(2)),
    };

    try {
      if (packageData) {
        const response = await axios.put(
          `${API_URL}/branchPackages/${packageData._id}?salon_id=${salonId}`,
          payload
        );
        toast.success("Package updated successfully!");
        // console.log("Package updated:", response.data);
      } else {
        const response = await axios.post(`${API_URL}/branchPackages`, payload);
        toast.success("Package added successfully!");
        // console.log("Package added:", response.data);
      }
      onSaveSuccess();
      onClose();
    } catch (error) {
      console.error(
        `Error ${packageData ? "updating" : "adding"} package:`,
        error
      );
      toast.error(`Failed to ${packageData ? "update" : "add"} package.`);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      }
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
        <div
          className="p-4 bg-dark h-100 text-white"
          style={{ maxHeight: "100vh", overflowY: "auto" }}
        >
          <div className="d-flex justify-content-between">
            <h5 className="sidebar-title">
              {packageData ? "Edit Package" : "Add New Package"}
            </h5>
            <button onClick={onClose} className="btn btn-outline-danger">
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          <hr />
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">
                Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control bg-dark text-white"
                placeholder="Enter package name"
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">
                Description <span className="text-danger">*</span>
              </label>
              <textarea
                className="form-control bg-dark text-white"
                rows="2"
                placeholder="Enter description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
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
                styles={{
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
                    backgroundColor:
                      state.isFocused || state.isSelected ? "#8f6b55" : "#000",
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
                }}
              />
            </div>
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">
                  Select Package Start Date{" "}
                  <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  className="form-control bg-dark text-white"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">
                  Select Package End Date <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  className="form-control bg-dark text-white"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="mb-3">
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
            <div className="position-relative mb-4">
              <div
                className="position-absolute translate-middle-y bg-dark px-2"
                style={{ left: "12px" }}
              >
                <span>
                  <strong>
                    Services <span className="text-danger">*</span>
                  </strong>
                </span>
              </div>
              <div className="bg-dark p-3 text-white rounded border mt-4 row">
                <table className="table table-dark table-bordered text-white">
                  <thead>
                    <tr>
                      <th>Service</th>
                      <th>Discounted Price</th>
                      <th>Quantity</th>
                      <th>Total Price</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((item, index) => (
                      <tr key={item.id}>
                        <td>
                          <select
                            className="form-select bg-dark text-white"
                            value={item.serviceId}
                            onChange={(e) =>
                              handleServiceChange(
                                index,
                                "serviceId",
                                e.target.value
                              )
                            }
                            required
                          >
                            <option value="">Select Service</option>
                            {fetchedServiceOptions.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control bg-dark text-white"
                            value={item.price}
                            onChange={(e) =>
                              handleServiceChange(
                                index,
                                "price",
                                e.target.value
                              )
                            }
                            required
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control bg-dark text-white"
                            value={item.quantity}
                            onChange={(e) =>
                              handleServiceChange(
                                index,
                                "quantity",
                                e.target.value
                              )
                            }
                            required
                          />
                        </td>
                        <td>{item.total}</td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleRemoveService(item.id)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  type="button"
                  className="btn btn-outline-info mt-2 w-50"
                  onClick={handleAddService}
                >
                  <i className="bi bi-plus-circle me-1"></i>Add Service
                </button>
              </div>
            </div>
            <hr />
            <div className="mb-3">
              <h5>
                Service Package Price:{" "}
                <span className="text-success">
                  ₹{" "}
                  {services
                    .reduce((sum, item) => sum + parseFloat(item.total || 0), 0)
                    .toFixed(2)}
                </span>
              </h5>
            </div>
            <hr />
            <button type="submit" className="btn page-btn me-2">
              <i className="bi bi-floppy me-2"></i>
              {packageData ? "Update Package" : "Add Package"}
            </button>
            <button
              type="button"
              className="btn btn-outline-danger"
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

export default PackageSidebar;
