import { useEffect, useState } from "react";
import "./context.css";
import Select from "react-select";
import axios from "axios";
import { toast } from "react-toastify";

const VariationSidebar = ({
  show,
  onClose,
  editingVariation,
  setEditingVariation,
}) => {
  const [status, setStatus] = useState("active");
  const [branches, setBranches] = useState([]);
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [variationType, setVariationType] = useState("");
  const [values, setValues] = useState([""]);
  const [name, setName] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;
  const salonId = localStorage.getItem("salon_id");

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
    }
  }, [show, API_URL]);

  useEffect(() => {
    if (editingVariation) {
      setName(editingVariation.name);
      setVariationType(editingVariation.type);
      setValues(editingVariation.value);
      setStatus(editingVariation.status === 1 ? "active" : "inactive");
    } else {
      setName("");
      setVariationType("");
      setValues([""]);
      setSelectedBranches([]);
      setStatus("active");
    }
  }, [editingVariation]);

  useEffect(() => {
    if (editingVariation && editingVariation.branch_id && branches.length > 0) {
      const branchIds = editingVariation.branch_id.map((b) =>
        typeof b === "object" ? b._id : b
      );

      const preselected = branches.filter((branch) =>
        branchIds.includes(branch.value)
      );
      setSelectedBranches(preselected);
    }
  }, [branches, editingVariation]);

  const handleTypeChange = (e) => {
    setVariationType(e.target.value);
    setValues([""]);
  };

  const handleValueChange = (index, newValue) => {
    const updated = [...values];
    updated[index] = newValue;
    setValues(updated);
  };

  const handleAddValue = () => {
    setValues([...values, ""]);
  };

  const handleRemoveValue = (index) => {
    const updated = values.filter((_, i) => i !== index);
    setValues(updated);
  };

  const toTitleCase = (str) => {
    return str
      .toLowerCase()
      .split(" ")
      .filter((word) => word.trim() !== "")
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !name ||
      !variationType ||
      values.some((v) => !v) ||
      selectedBranches.length === 0
    ) {
      toast.error("Please fill all required fields.");
      return;
    }

    const payload = {
      branch_id: selectedBranches.map((b) => b.value),
      name: toTitleCase(name),
      type: variationType,
      value: values.map(toTitleCase),
      status: status === "active" ? 1 : 0,
      salon_id: salonId,
    };

    try {
      if (editingVariation) {
        const res = await axios.put(
          `${API_URL}/variations/${editingVariation._id}`,
          payload
        );
        toast.success(res.data.message || "Variation updated successfully");
      } else {
        const res = await axios.post(`${API_URL}/variations`, payload);
        toast.success(res.data.message || "Variation created successfully");
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
      console.error(err);
    }
  };

  if (!show) return null;

  const sidebarTitle = editingVariation
    ? "Edit Variation"
    : "Add New Variation";
  const submitButtonText = editingVariation
    ? "Update Variation"
    : "Add Variation";

  return (
    <>
      <div className="overlay-blur" onClick={onClose}></div>
      <div className={`sidebar-div ${show ? "show" : ""}`}>
        <div className="p-4 bg-dark text-white h-100 overflow-auto">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="sidebar-title">{sidebarTitle}</h5>
            <button onClick={onClose} className="btn btn-outline-danger">
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          <hr />
          <form onSubmit={handleSubmit}>
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
            <div className="mb-3">
              <label className="form-label">
                Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                required
                className="form-control bg-dark text-white"
                placeholder="Enter Variation Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">
                Type <span className="text-danger">*</span>
              </label>
              <select
                className="form-select bg-dark text-white"
                required
                value={variationType}
                onChange={handleTypeChange}
              >
                <option hidden>Select Type</option>
                <option value="Text">Text</option>
                <option value="Color">Color</option>
              </select>
            </div>
            {variationType && (
              <div className="mb-3">
                <label className="form-label">
                  {variationType} Values <span className="text-danger">*</span>
                </label>
                {values.map((val, idx) => (
                  <div key={idx} className="d-flex mb-2">
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => handleValueChange(idx, e.target.value)}
                      className="form-control bg-dark text-white me-2"
                      placeholder={`Enter ${variationType} value`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveValue(idx)}
                      className="btn btn-sm btn-outline-danger"
                    >
                      <i className="bi bi-x-lg"></i>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-sm page-btn mt-2"
                  onClick={handleAddValue}
                >
                  + Add Value
                </button>
              </div>
            )}
            <div className="mb-4">
              <label className="form-label d-block">
                Status <span className="text-danger">*</span>
              </label>
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
            <button type="submit" className="btn page-btn me-2">
              <i className="bi bi-floppy me-2"></i>
              {submitButtonText}
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

export default VariationSidebar;
