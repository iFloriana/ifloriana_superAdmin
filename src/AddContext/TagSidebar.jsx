import { useEffect, useState } from "react";
import "./context.css";
import Select from "react-select";
import axios from "axios";
import { toast } from "react-toastify";

const TagSidebar = ({ show, onClose, editingTag }) => {
  const [status, setStatus] = useState("active");
  const [name, setName] = useState("");
  const [branch, setBranch] = useState([]);
  const [selectBranches, setSelectBranches] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL;
  const salonId = localStorage.getItem("salon_id");

  useEffect(() => {
    if (show) {
      axios
        .get(`${API_URL}/branches?salon_id=${salonId}`)
        .then((res) => {
          const options = res.data.data
            .filter((b) => b.status === 1)
            .map((b) => ({
              label: b.name,
              value: b._id,
            }));
          setBranch(options);

          if (editingTag) {
            setName(editingTag.name);
            setStatus(editingTag.status === 1 ? "active" : "inactive");

            const branchIds = editingTag.branch_id.map((b) => b._id);
            const prefilledBranches = options.filter((option) =>
              branchIds.includes(option.value)
            );
            setSelectBranches(prefilledBranches);
          } else {
            setName("");
            setSelectBranches([]);
            setStatus("active");
          }
        })
        .catch((err) => console.error("Error fetching branches:", err));
    }
  }, [show, editingTag, API_URL]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || selectBranches.length === 0) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      const payload = {
        name: toTitleCase(name),
        branch_id: selectBranches.map((b) => b.value),
        status: status === "active" ? 1 : 0,
        salon_id: salonId,
      };

      if (editingTag) {
        const res = await axios.put(
          `${API_URL}/tags/${editingTag._id}`,
          payload
        );
        toast.success("Tag updated successfully!");
      } else {
        const res = await axios.post(`${API_URL}/tags`, payload);
        toast.success("Tag added successfully!");
      }

      setName("");
      setSelectBranches([]);
      setStatus("active");
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error(`Error ${editingTag ? "updating" : "adding"} tag:`, error);
      toast.error(
        `Failed to ${editingTag ? "update" : "add"} tag. Please try again.`
      );
    }
  };

  const customSelectStyles = {
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
        <div className="p-4 bg-dark text-white h-100 overflow-auto">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="sidebar-title">
              {editingTag ? "Edit Tag" : "Add New Tag"}
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
                required
                className="form-control bg-dark text-white"
                placeholder="Enter Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">
                Branch(es) <span className="text-danger">*</span>
              </label>
              <Select
                required
                options={branch}
                isMulti
                value={selectBranches}
                onChange={setSelectBranches}
                classNamePrefix="react-select"
                styles={customSelectStyles}
              />
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
            <button type="submit" className="btn page-btn me-2">
              <i className="bi bi-floppy me-2"></i>
              {editingTag ? "Update Tag" : "Add Tag"}
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

export default TagSidebar;
