import { useEffect, useState } from "react";
import Header from "../components/Header";
import "./layout.css";
import Footer from "../components/Footer";
import loadingGif from "../assets/ifloriana-gif.gif";
import Sidebar from "../components/sidebar";

const MainLayout = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="d-flex main-body">
      {isLoading && (
        <div className="loading-overlay">
          <div className="d-flex align-items-center flex-column gap-3">
            <img src={loadingGif} alt="Loading..." className="loading-gif" />
            <p className="text-white fw-bold">Fetching the latest data...</p>
          </div>
        </div>
      )}
      <div className="sidebar-wrapper">
        <Sidebar />
      </div>
      <div className="flex-grow-1">
        <Header />
        <div className="main-content-scroll">{children}</div>
        <div className="footer-wrapper">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
