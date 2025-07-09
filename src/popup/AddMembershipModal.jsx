import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "../components/components.css";

const AddMembershipModal = ({
  show,
  onClose,
  customerId,
  customerDetails,
  onSuccess,
}) => {
  const [availableMemberships, setAvailableMemberships] = useState([]);
  const [selectedMembershipId, setSelectedMembershipId] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;
  const salonId = localStorage.getItem("salon_id");

  useEffect(() => {
    const fetchMemberships = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/branch-memberships?salon_id=${salonId}`
        );
        const allMemberships = response.data?.data || [];
        setAvailableMemberships(allMemberships); // Set available memberships
      } catch (err) {
        console.error("Error fetching memberships:", err);
        toast.error("Failed to fetch memberships.");
      }
    };

    if (show) {
      fetchMemberships();
      setSelectedMembershipId(""); // Reset selected membership when modal opens
    }
  }, [show]);

  const handleAddMembership = async () => {
    if (!selectedMembershipId) {
      toast.error("Please select a membership.");
      return;
    }

    try {
      await axios.patch(
        `${API_URL}/customers/update-branch-membership/${customerId}`,
        {
          branch_membership: selectedMembershipId,
          salon_id: salonId,
        }
      );
      toast.success("Membership assigned successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to assign membership:", error);
      toast.error("Failed to assign membership.");
    }
  };

  if (!show) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="add-membership-modal">
        <h4 className="sidebar-title">Assign Membership</h4>
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
          value={selectedMembershipId} // Bind value to the new state
          onChange={(e) => setSelectedMembershipId(e.target.value)} // Update the new state
        >
          <option value="">Select Membership</option>
          {availableMemberships.map(
            (
              membership // Iterate over availableMemberships
            ) => (
              <option key={membership._id} value={membership._id}>
                {membership.membership_name} - {membership.subscription_plan}
              </option>
            )
          )}
        </select>

        <div className="mt-4 d-flex justify-content-end">
          <button className="btn btn-outline-danger me-2" onClick={onClose}>
            Cancel
          </button>
          <button className="btn page-btn" onClick={handleAddMembership}>
            Assign
          </button>
        </div>
      </div>
    </>
  );
};

export default AddMembershipModal;
