import { useEffect, useState } from "react";
import "./context.css";
import axios from "axios";
import { toast } from "react-toastify";
import Select from "react-select";

const TaxSidebar = ({ show, onClose, editingTax, refreshTaxes }) => {
  const [status, setStatus] = useState("active");
  const [branches, setBranches] = useState([]);
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [type, setType] = useState("");
  const [moduleType, setModuleType] = useState("");

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

          if (editingTax) {
            setTitle(editingTax.title);
            setValue(editingTax.value);
            setType(editingTax.type.toLowerCase());
            setModuleType(editingTax.tax_type);
            setStatus(editingTax.status === 1 ? "active" : "inactive");

            const selected = options.filter((option) =>
              editingTax.branch_id.map((b) => b._id).includes(option.value)
            );
            setSelectedBranches(selected);
          } else {
            setTitle("");
            setValue("");
            setType("");
            setModuleType("services");
            setStatus("active");
            setSelectedBranches([]);
          }
        })
        .catch((err) => console.error("Error fetching branches:", err));
    }
  }, [show, editingTax]);

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
      !title ||
      !value ||
      !type ||
      !moduleType ||
      selectedBranches.length === 0
    ) {
      toast.error("Please fill all required fields.");
      return;
    }

    const payload = {
      title: toTitleCase(title.trim()),
      value: Number(value),
      type: type,
      tax_type: moduleType,
      status: status === "active" ? 1 : 0,
      branch_id: selectedBranches.map((b) => b.value),
      salon_id: salonId,
    };

    try {
      if (editingTax) {
        await axios.put(`${API_URL}/taxes/${editingTax._id}`, payload);
        toast.success("Tax updated successfully!");
      } else {
        await axios.post(`${API_URL}/taxes`, payload);
        toast.success("Tax added successfully!");
      }
      onClose();
      refreshTaxes();
    } catch (err) {
      toast.error(
        `Failed to ${editingTax ? "update" : "add"} tax. Please try again.`
      );
      console.error(`Error ${editingTax ? "updating" : "adding"} tax:`, err);
    }
  };

  if (!show) return null;

  return (
    <>
      <div className="overlay-blur" onClick={onClose}></div>
      <div className={`sidebar-div ${show ? "show" : ""}`}>
        <div className="bg-dark p-4 h-100 overflow-auto text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="sidebar-title">
              {editingTax ? "Edit Tax" : "Add New Tax"}
            </h5>
            <button className="btn btn-outline-danger" onClick={onClose}>
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
                Title <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control bg-dark text-white"
                placeholder="Enter Title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">
                Value <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                className="form-control bg-dark text-white"
                placeholder="Enter Value"
                required
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">
                Select Type <span className="text-danger">*</span>
              </label>
              <select
                className="form-select bg-dark text-white"
                required
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option hidden>Select Type</option>
                <option value="percent">Percent</option>
                <option value="fixed">Fixed</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">
                Module Type <span className="text-danger">*</span>
              </label>
              <select
                className="form-select bg-dark text-white"
                required
                value={moduleType}
                onChange={(e) => setModuleType(e.target.value)}
              >
                <option>Select Module Type</option>
                <option value="services">services</option>
              </select>
            </div>
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
              {editingTax ? "Update Tax" : "Add Tax"}
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

export default TaxSidebar;
