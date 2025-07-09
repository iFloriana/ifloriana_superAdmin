import { useNavigate } from "react-router-dom";
import "./ErroPage.css";

const Error = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className="container text-center custom-container">
        <h1 className="text-danger">404</h1>
        <h3>Page Not Found</h3>
        <p className="mt-2 fw-bold">
          The page you're looking for doesn't exist.
        </p>
        <button className="mt-5 btn-custom" onClick={() => navigate("/")}>
          Back to Login
        </button>
      </div>
    </>
  );
};

export default Error;
