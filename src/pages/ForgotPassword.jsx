import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);

    if (value && !validateEmail(value)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiUrl}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Password reset link sent to your email");
        setIsSuccess(true);
        setEmail("");
        setEmailError("");
      } else {
        toast.error(data.message || "Something went wrong");
      }
    } catch (error) {
      toast.error("Failed to connect to the server");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/");
  };

  return (
    <>
      <div className="login-container">
        <div className="login-box">
          <div className="logo-container">
            <a
              href="https://www.ifloriana.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="./public/ifloriana_logo.png"
                alt="Company Logo"
                className="logo-img"
              />
            </a>
          </div>

          {!isSuccess ? (
            <form onSubmit={handleSubmit}>
              <p className="p-text">
                Please provide your registered email address to receive a
                password reset link.
              </p>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className={`form-control input-field ${
                    emailError ? "is-invalid" : ""
                  }`}
                  required
                  value={email}
                  onChange={handleEmailChange}
                />
                {emailError && (
                  <div
                    className="invalid-feedback"
                    style={{ color: "red", fontSize: "0.8rem" }}
                  >
                    {emailError}
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="login-btn"
                disabled={isSubmitting || emailError}
              >
                {isSubmitting ? "Sending..." : "Submit"}
              </button>
            </form>
          ) : (
            <div className="success-message">
              <p className="p-text success-text">
                A password reset link has been sent to your email. Please check
                your inbox (or spam folder) and follow the instructions to reset
                your password.
              </p>
              <button
                onClick={handleBackToLogin}
                className="login-btn"
                style={{ marginTop: "20px" }}
              >
                Go back to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
