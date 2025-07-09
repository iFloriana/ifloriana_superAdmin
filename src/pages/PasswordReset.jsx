import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate, useSearchParams } from "react-router-dom";

const PasswordReset = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const urlToken = searchParams.get("token");
    const urlEmail = searchParams.get("email");

    if (urlToken) setToken(urlToken);
    if (urlEmail) {
      const decodedEmail = decodeURIComponent(urlEmail);
      setEmail(decodedEmail);
    }
  }, [searchParams]);

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);

    if (!value.includes("@") || !value.includes(".")) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);

    if (value.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
    } else {
      setPasswordError("");
    }

    if (confirmPassword && value !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError("");
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);

    if (password !== value) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    let isValid = true;

    if (!email.includes("@") || !email.includes(".")) {
      setEmailError("Please enter a valid email address");
      isValid = false;
    }

    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      isValid = false;
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      isValid = false;
    }

    if (!isValid) {
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          email,
          new_password: password,
          confirm_password: confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Password reset successfully!");
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        toast.error(data.message || "Failed to reset password");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      console.error("Password reset error:", error);
    } finally {
      setIsSubmitting(false);
    }
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
          <form onSubmit={handleSubmit}>
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
                readOnly={!!searchParams.get("email")}
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

            <div className="mb-3">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className={`form-control input-field ${
                  passwordError ? "is-invalid" : ""
                }`}
                required
                value={password}
                onChange={handlePasswordChange}
              />
              {passwordError && (
                <div
                  className="invalid-feedback"
                  style={{ color: "red", fontSize: "0.8rem" }}
                >
                  {passwordError}
                </div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                className={`form-control input-field ${
                  confirmPasswordError ? "is-invalid" : ""
                }`}
                required
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
              />
              {confirmPasswordError && (
                <div
                  className="invalid-feedback"
                  style={{ color: "red", fontSize: "0.8rem" }}
                >
                  {confirmPasswordError}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="login-btn"
              disabled={
                isSubmitting ||
                emailError ||
                passwordError ||
                confirmPasswordError
              }
            >
              {isSubmitting ? "Updating..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default PasswordReset;
