import { useState, useEffect } from "react";
import Select from "react-select";
import "./context.css";
import defaultImage from "../../public/default.png";
import { toast } from "react-toastify";
import axios from "axios";
import imageCompression from "browser-image-compression";

const ProductSubCategorySidebar = ({ show, onClose, subCategoryData }) => {
  const [subName, setSubName] = useState("");
  const [photo, setPhoto] = useState(null);
  const [brands, setBrands] = useState([]);
  const [selectBrands, setSelectBrands] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectBranches, setSelectBranches] = useState([]);
  const [status, setStatus] = useState("active");
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;
  const salonId = localStorage.getItem("salon_id");

  const isEditMode = !!subCategoryData;

  useEffect(() => {
    const fetchAllData = async () => {
      if (!show) return;

      try {
        const [brandsResponse, categoriesResponse, branchesResponse] =
          await Promise.all([
            axios.get(`${API_URL}/brands?salon_id=${salonId}`),
            axios.get(`${API_URL}/productCategories?salon_id=${salonId}`),
            axios.get(`${API_URL}/branches?salon_id=${salonId}`),
          ]);

        const brandOptions = brandsResponse.data.data
          .filter((brand) => brand.status === 1)
          .map((brand) => ({
            label: brand.name,
            value: brand._id,
          }));

        const branchOptions = branchesResponse.data.data
          .filter((branch) => branch.status === 1)
          .map((branch) => ({
            label: branch.name,
            value: branch._id,
          }));

        const activeCategories = categoriesResponse.data.data.filter(
          (cat) => cat.status === 1
        );

        setBrands(brandOptions);
        setBranches(branchOptions);
        setCategories(activeCategories);

        if (isEditMode && subCategoryData) {
          setSubName(subCategoryData.name || "");
          setPhoto(
            subCategoryData.image ? `${API_URL}/${subCategoryData.image}` : null
          );
          setCategoryId(subCategoryData.product_category_id?._id || "");
          setStatus(subCategoryData.status === 1 ? "active" : "inactive");

          if (
            subCategoryData.brand_id &&
            Array.isArray(subCategoryData.brand_id)
          ) {
            const preselectedBrands = subCategoryData.brand_id
              .map((brand) => {
                const id = typeof brand === "string" ? brand : brand._id;
                return brandOptions.find((b) => b.value === id);
              })
              .filter(Boolean);
            setSelectBrands(preselectedBrands);
          }

          if (
            subCategoryData.branch_id &&
            Array.isArray(subCategoryData.branch_id)
          ) {
            const preselectedBranches = subCategoryData.branch_id
              .map((branch) => {
                const id = typeof branch === "string" ? branch : branch._id;
                return branchOptions.find((b) => b.value === id);
              })
              .filter(Boolean);
            setSelectBranches(preselectedBranches);
          }
        } else {
          setSubName("");
          setPhoto(null);
          setCategoryId("");
          setSelectBrands([]);
          setSelectBranches([]);
          setStatus("active");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data for subcategory form.");
      }
    };

    fetchAllData();
  }, [show, subCategoryData, isEditMode, API_URL]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSizeKB = 150;
    const allowedTypes = ["image/jpeg", "image/png"];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG and PNG files are allowed.");
      return;
    }

    const fileSizeKB = file.size / 1024;
    if (fileSizeKB > maxSizeKB) {
      toast.error("Image too large. Maximum size is 150KB.");
      return;
    }

    try {
      const options = {
        maxSizeMB: 0.2,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result);
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error("Compression failed:", error);
      toast.error("Image compression failed.");
    }
  };

  const removePhoto = () => {
    setPhoto(null);
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
      !subName ||
      !categoryId ||
      !selectBrands.length ||
      !selectBranches.length
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const payload = {
      name: toTitleCase(subName),
      image: photo,
      product_category_id: categoryId,
      brand_id: selectBrands.map((brand) => brand.value),
      branch_id: selectBranches.map((b) => b.value),
      status: status === "active" ? 1 : 0,
      salon_id: salonId,
    };

    try {
      if (isEditMode) {
        await axios.put(
          `${API_URL}/productSubCategories/${subCategoryData._id}`,
          payload
        );
        toast.success("Sub Category updated successfully!");
      } else {
        await axios.post(`${API_URL}/productSubCategories`, payload);
        toast.success("Sub Category added successfully!");
      }

      setSubName("");
      setPhoto("");
      setCategoryId("");
      setSelectBrands([]);
      setSelectBranches([]);
      setStatus("active");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(`Failed to ${isEditMode ? "update" : "add"} sub category.`);
    }
  };

  const styleOption = {
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

  if (!show) return null;

  return (
    <>
      <div className="overlay-blur" onClick={onClose}></div>
      <div className={`sidebar-div ${show ? "show" : ""}`}>
        <div className="bg-dark p-4 h-100 overflow-auto text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="sidebar-title">
              {isEditMode ? "Edit Sub Category" : "Add New Sub Category"}
            </h5>
            <button className="btn btn-outline-danger" onClick={onClose}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          <hr />
          <form onSubmit={handleSubmit}>
            <div className="text-center mb-4">
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
            <div className="mb-3">
              <label className="form-label">
                Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control bg-dark text-white"
                placeholder="Enter Sub Category Name"
                value={subName}
                onChange={(e) => setSubName(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">
                Select Category <span className="text-danger">*</span>
              </label>
              <select
                className="form-select bg-dark text-white"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">
                Select Brand(s) <span className="text-danger">*</span>
              </label>
              <Select
                options={brands}
                isMulti
                value={selectBrands}
                onChange={setSelectBrands}
                classNamePrefix="react-select"
                styles={styleOption}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">
                Select Branch(es) <span className="text-danger">*</span>
              </label>
              <Select
                options={branches}
                isMulti
                value={selectBranches}
                onChange={setSelectBranches}
                classNamePrefix="react-select"
                styles={styleOption}
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
              {isEditMode ? "Update Sub Category" : "Add Sub Category"}
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

export default ProductSubCategorySidebar;
