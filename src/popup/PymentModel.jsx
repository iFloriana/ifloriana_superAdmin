import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "../components/components.css";

const PymentModel = ({ appointment, onClose, onPaymentSuccess }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const salonId = localStorage.getItem("salon_id");
  const INVOICE_API_URL = import.meta.env.VITE_INVOICE_URL;

  const [taxes, setTaxes] = useState([]);
  const [taxId, setTaxId] = useState("");
  const [tips, setTips] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponId, setCouponId] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [grandTotal, setGrandTotal] = useState(0);
  const [showAdditionalDiscount, setShowAdditionalDiscount] = useState(false);

  useEffect(() => {
    const fetchTaxes = async () => {
      try {
        const res = await axios.get(`${API_URL}/taxes?salon_id=${salonId}`);
        setTaxes(res.data.data);
      } catch (err) {
        console.error("Failed to load taxes", err);
      }
    };
    fetchTaxes();
  }, [API_URL, salonId]);

  const handleApplyCoupon = async () => {
    try {
      const res = await axios.get(`${API_URL}/coupons?salon_id=${salonId}`);
      const allCoupons = res.data.data || [];
      const now = new Date();

      const matchedCoupon = allCoupons.find((c) => {
        const start = new Date(c.start_date);
        const end = new Date(c.end_date);
        return (
          c.coupon_code.toLowerCase() === couponCode.toLowerCase() &&
          c.status === 1 &&
          now >= start &&
          now <= end
        );
      });

      if (matchedCoupon) {
        setCouponId(matchedCoupon._id);
        setCouponApplied(true);
        setAppliedCoupon(matchedCoupon);
        toast.success("Coupon applied successfully!");
      } else {
        setCouponId("");
        setCouponApplied(false);
        setAppliedCoupon(null);
        toast.error("Invalid or expired coupon code.");
      }
    } catch (err) {
      console.error("Coupon validation error:", err);
      toast.error("Error checking coupon.");
    }
  };

  const handleGenerateBill = async () => {
    if (!paymentMethod) {
      toast.error("Please select a payment method.");
      return;
    }

    const payload = {
      salon_id: salonId,
      appointment_id: appointment.appointment_id,
      tax_id: taxId,
      tips: parseFloat(tips),
      payment_method: paymentMethod,
      coupon_id: couponId,
      additional_discount_type: discountType,
      additional_discount_value: parseFloat(discountValue),
    };

    try {
      const response = await axios.post(`${API_URL}/payments`, payload);
      toast.success("Bill generated successfully!");

      if (response.data.invoice_pdf_url) {
        const fullInvoiceUrl = `${INVOICE_API_URL}${response.data.invoice_pdf_url}`;
        window.open(fullInvoiceUrl, "_blank");
      }

      onClose();
      if (onPaymentSuccess) onPaymentSuccess();
    } catch (error) {
      console.error("Failed to generate bill", error);
      toast.error("Failed to generate bill");
    }
  };

  const calculateGrandTotal = () => {
    const baseAmount = parseFloat(appointment.total_payment) || 0;
    const tipsAmount = parseFloat(tips) || 0;

    const selectedTax = taxes.find((t) => t._id === taxId);
    let taxAmount = 0;
    if (selectedTax) {
      taxAmount =
        selectedTax.type === "percent"
          ? (selectedTax.value / 100) * baseAmount
          : selectedTax.value;
    }

    let additionalDiscount = 0;
    if (discountType === "percentage") {
      additionalDiscount = (parseFloat(discountValue) / 100) * baseAmount;
    } else {
      additionalDiscount = parseFloat(discountValue) || 0;
    }

    let couponDiscount = 0;
    if (appliedCoupon) {
      if (appliedCoupon.discount_type === "percent") {
        couponDiscount = (appliedCoupon.discount_amount / 100) * baseAmount;
      } else {
        couponDiscount = appliedCoupon.discount_amount;
      }
    }

    let membershipDiscount = 0;
    if (appointment.customer?.branch_membership) {
      const member = appointment.customer.branch_membership;
      if (member.discount_type === "percentage") {
        membershipDiscount = (member.discount / 100) * baseAmount;
      } else {
        membershipDiscount = member.discount;
      }
    }

    const total =
      baseAmount +
      taxAmount +
      tipsAmount -
      couponDiscount -
      additionalDiscount -
      membershipDiscount;

    setGrandTotal(total >= 0 ? total.toFixed(2) : 0);
  };

  useEffect(() => {
    calculateGrandTotal();
  }, [
    taxId,
    tips,
    discountType,
    discountValue,
    appointment,
    appliedCoupon,
    taxes,
  ]);

  if (!appointment) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="add-payment-modal p-4">
        <h4 className="sidebar-title mb-3">Payment Summary</h4>
        <hr />
        <div className="row">
          <div className="col-md-6">
            <p>
              <strong>Date:</strong>{" "}
              {new Date(appointment.appointment_date).toLocaleDateString()}
            </p>
          </div>
          <div className="col-md-6">
            <p>
              <strong>Customer:</strong> {appointment.customer?.full_name} -{" "}
              {appointment.customer?.phone_number}
            </p>
          </div>
          <div className="col-md-12">
            <p>
              <strong>Service Amount:</strong> ₹{" "}
              {appointment.service_total_amount}
            </p>
          </div>
        </div>
        {appointment.products && appointment.products.length > 0 && (
          <>
            <hr className="my-3" />
            <h5 className="mb-3">🧴 Product Details</h5>
            <div className="table-responsive">
              <table className="table table-dark table-bordered">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Price (₹)</th>
                    <th>Total (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {appointment.products.map((prod, idx) => (
                    <tr key={idx}>
                      <td>{prod.name}</td>
                      <td>{prod.quantity}</td>
                      <td>{prod.unit_price}</td>
                      <td>{prod.quantity * prod.unit_price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <hr className="my-3" />
        <h5 className="mb-3">🧾 Billing Details</h5>
        <div className="row">
          <div className="col-md-4 mb-3">
            <label className="form-label">Tax</label>
            <select
              className="form-select form-control-cstm"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
            >
              <option value="">Select Tax</option>
              {taxes.map((tax) => (
                <option key={tax._id} value={tax._id}>
                  {tax.title} (
                  {tax.type === "percent" ? `${tax.value}%` : `₹${tax.value}`})
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-4 mb-3">
            <label className="form-label">Tips</label>
            <input
              type="number"
              className="form-control form-control-cstm"
              value={tips}
              onChange={(e) => setTips(e.target.value)}
              min="0"
            />
          </div>
          <div className="col-md-4 mb-3">
            <label className="form-label">
              Payment Method <span className="text-danger">*</span>
            </label>
            <select
              className="form-select form-control-cstm"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="">Select Payment Method</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="UPI">UPI</option>
            </select>
          </div>
        </div>
        <hr className="my-3" />
        <h5 className="mb-3">🏷️ Discounts</h5>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Coupon Code</label>
            <div className="input-group">
              <input
                type="text"
                className="form-control form-control-cstm"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value);
                  setCouponApplied(false);
                  setAppliedCoupon(null);
                }}
              />
              <button
                className="btn btn-outline-info"
                onClick={handleApplyCoupon}
              >
                Apply
              </button>
            </div>
            {couponApplied && appliedCoupon && (
              <span className="text-success mt-1 d-block">
                Applied –{" "}
                {appliedCoupon.discount_type === "percent"
                  ? `${appliedCoupon.discount_amount}%`
                  : `₹${appliedCoupon.discount_amount}`}
              </span>
            )}
          </div>
          <div className="col-md-6 mb-3 d-flex align-items-center justify-content-center">
            {appointment.customer?.branch_membership ? (
              <div style={{ fontSize: "1.2rem" }}>
                Membership Discount:&nbsp;
                <span className="text-success fw-bold">
                  {appointment.customer.branch_membership.discount_type ===
                  "percentage"
                    ? `${appointment.customer.branch_membership.discount}%`
                    : `₹${appointment.customer.branch_membership.discount}`}
                </span>
              </div>
            ) : (
              <div
                className="text-warning fw-semibold"
                style={{ fontSize: "1.05rem" }}
              >
                Customer has no membership
              </div>
            )}
          </div>
          <div className="col-md-6 mb-3">
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="additionalDiscountCheck"
                checked={showAdditionalDiscount}
                onChange={() =>
                  setShowAdditionalDiscount(!showAdditionalDiscount)
                }
              />
              <label
                className="form-check-label mb-3"
                htmlFor="additionalDiscountCheck"
              >
                Want to add additional discount?
              </label>
            </div>
            {showAdditionalDiscount && (
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Discount Type</label>
                  <select
                    className="form-select bg-dark text-white"
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat (₹)</option>
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Discount Value</label>
                  <input
                    type="number"
                    className="form-control bg-dark text-white"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    min="0"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        <hr className="my-3" />
        <div className="d-flex justify-content-between align-items-center">
          <h5>Grand Total</h5>
          <h4 className="text-success">₹ {grandTotal}</h4>
        </div>

        <div className="modal-actions d-flex justify-content-end gap-3 mt-4">
          <button className="btn btn-outline-danger" onClick={onClose}>
            Cancel
          </button>
          <button className="btn apt-btn" onClick={handleGenerateBill}>
            Generate Bill
          </button>
        </div>
      </div>
    </>
  );
};

export default PymentModel;
