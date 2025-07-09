import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "../components/components.css";

const AddPackageModal = ({
  show,
  onClose,
  customerId,
  customerDetails,
  onSuccess,
}) => {
  const [availablePackages, setAvailablePackages] = useState([]);
  const [selectedPackageId, setSelectedPackageId] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;
  const salonId = localStorage.getItem("salon_id");

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/branchPackages?salon_id=${salonId}`
        );
        const allPackages = response.data.data || [];
        setAvailablePackages(allPackages);
      } catch (err) {
        console.error("Error fetching packages:", err);
        toast.error("Failed to fetch packages.");
      }
    };

    if (show) {
      fetchPackages();
      setSelectedPackageId("");
    }
  }, [show, API_URL, salonId]);

  const handleAddPackage = async () => {
    if (!selectedPackageId) {
      toast.error("Please select a package.");
      return;
    }

    const payload = {
      salon_id: salonId,
      branch_package: selectedPackageId,
    };
    try {
      await axios.patch(`${API_URL}/customers/${customerId}`, payload);
      toast.success("Package assigned successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to assign package:", error);
      if (error.response) {
        toast.error(
          `Failed to assign package: ${
            error.response.data.message || error.response.statusText
          }`
        );
      } else {
        toast.error("Failed to assign package: Network or unknown error.");
      }
    }
  };

  if (!show) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="add-membership-modal">
        <h4 className="sidebar-title">Assign Package</h4>
        {customerDetails && (
          <div className="customer-details-card mt-3 mb-3 p-3 border rounded bg-dark text-white">
            <div className="d-flex align-items-center">
              {customerDetails.image && (
                <img
                  src={customerDetails.image}
                  alt="Customer"
                  className="rounded-circle me-3"
                  style={{ width: "60px", height: "60px", objectFit: "cover" }}
                />
              )}
              <div>
                <h5 className="mb-1">{customerDetails.full_name}</h5>
                <p className="mb-0">{customerDetails.phone_number}</p>
              </div>
            </div>
          </div>
        )}
        <select
          className="form-select bg-dark text-white mt-3"
          value={selectedPackageId}
          onChange={(e) => setSelectedPackageId(e.target.value)}
        >
          <option value="">Select Package</option>
          {availablePackages.map((pkg) => (
            <option key={pkg._id} value={pkg._id}>
              {pkg.package_name} - {pkg.package_price}
            </option>
          ))}
        </select>
        <div className="mt-4 d-flex justify-content-end">
          <button className="btn btn-outline-danger me-2" onClick={onClose}>
            Cancel
          </button>
          <button className="btn page-btn" onClick={handleAddPackage}>
            Assign
          </button>
        </div>
      </div>
    </>
  );
};

export default AddPackageModal;
