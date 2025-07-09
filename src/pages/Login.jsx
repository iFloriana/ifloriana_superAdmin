import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const apiUrl = import.meta.env.VITE_API_URL;

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    const rememberedPassword = localStorage.getItem("rememberedPassword");

    if (rememberedEmail && rememberedPassword) {
      setEmail(rememberedEmail);
      setPassword(rememberedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if ((response.status === 200 || response.status === 201) && data.token) {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("authToken", data.token);

        if (data.admin_id) {
          localStorage.setItem("admin_id", data.admin_id);
        }
        if (data.package_id) {
          localStorage.setItem("package_id", data.package_id);
        }

        if (rememberMe) {
          localStorage.setItem("rememberedEmail", email);
          localStorage.setItem("rememberedPassword", password);
        } else {
          localStorage.removeItem("rememberedEmail");
          localStorage.removeItem("rememberedPassword");
        }

        if (data.salon_id) {
          localStorage.setItem("salon_id", data.salon_id);
        }

        if (data.salon_id || localStorage.getItem("salon_id")) {
          navigate("/dashboard");
        }
      } else {
        setError(data.message || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
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

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <div className="pass-container">
              <input
                type={showPassword ? "text" : "password"}
                className="form-control input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="eye-button"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div className="mb-3">
            <input
              type="checkbox"
              id="rememberMe"
              className="check-boxx"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="rememberMe" className="remember-me-label">
              Remember Me
            </label>
          </div>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className="d-flex gap-3 justify-content-center mt-4">
            <a
              href="/forgot-password"
              rel="noopener noreferrer"
              style={{ color: "#8f6b55", textDecoration: "none" }}
              className="login-link"
            >
              Forgot Password ?
            </a>
            |
            <a
              href="https://superadmin.ifloriana.com/subscribe"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#8f6b55", textDecoration: "none" }}
              className="login-link"
            >
              Register New Salon
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

// Static login credential code

// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";

// const Login = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [rememberMe, setRememberMe] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   const handleLogin = (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     setTimeout(() => {
//       if (email === "admin@ifloriana.com" && password === "admin123") {
//         localStorage.setItem("isAuthenticated", true);
//         navigate("/dashboard");
//       } else {
//         setError("Invalid email or password");
//       }
//       setLoading(false);
//     }, 1000);
//   };

//   const togglePasswordVisibility = () => {
//     setShowPassword((prev) => !prev);
//   };

//   return (
//     <div className="login-container">
//       <div className="login-box">
//         <div className="logo-container">
//           <a
//             href="https://www.ifloriana.com"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <img
//               src="./public/ifloriana_logo.png"
//               alt="Company Logo"
//               className="logo-img"
//             />
//           </a>
//         </div>

//         <form onSubmit={handleLogin}>
//           <div className="mb-3">
//             <label className="form-label">Email</label>
//             <input
//               type="email"
//               className="form-control input-field"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//           </div>

//           <div className="mb-3">
//             <label className="form-label">Password</label>
//             <div className="pass-container">
//               <input
//                 type={showPassword ? "text" : "password"}
//                 className="form-control input-field"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//               />
//               <button
//                 type="button"
//                 className="eye-button"
//                 onClick={togglePasswordVisibility}
//               >
//                 {showPassword ? "🙈" : "👁️"}
//               </button>
//             </div>
//           </div>

//           <div className="mb-3">
//             <input
//               type="checkbox"
//               id="rememberMe"
//               className="check-boxx"
//               checked={rememberMe}
//               onChange={(e) => setRememberMe(e.target.checked)}
//             />
//             <label htmlFor="rememberMe" className="remember-me-label">
//               Remember Me
//             </label>
//           </div>

//           {error && <p className="error-text">{error}</p>}

//           <button type="submit" className="login-btn" disabled={loading}>
//             {loading ? "Logging in..." : "Login"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Login;
