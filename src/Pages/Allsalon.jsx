import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Allsalon.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Swal from "sweetalert2";

const Allsalon = () => {
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchSalons();
  }, []);

  const fetchSalons = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/admins`);
      setSalons(response.data.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch salons. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_URL}/auth/admins/${id}`);
          setSalons((prevSalons) =>
            prevSalons.filter((salon) => salon._id !== id)
          );
          Swal.fire("Deleted!", "Salon has been deleted.", "success");
        } catch (err) {
          Swal.fire("Error!", "Failed to delete salon.", "error");
        }
      }
    });
  };

  const handelExport = (format) => {
    if (salons.length === 0) {
      alert("No salon data available to download.");
      return;
    }
    if (format === "xlsx") {
      const workSheet = XLSX.utils.json_to_sheet(salons);
      const workBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workBook, workSheet, "Salon_List");
      const buffer = XLSX.write(workBook, { bookType: "xlsx", type: "array" });
      const data = new Blob([buffer], { type: "application/octet-stream" });
      saveAs(data, "Salon_List.xlsx");
    } else if (format === "csv") {
      const csv = XLSX.utils.sheet_to_csv(XLSX.utils.json_to_sheet(salons));
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, "Registered_Salon_List.csv");
    } else if (format === "pdf") {
      alert("PDF export not implemented yet.");
    } else if (format === "docx") {
      alert("Word export not implemented yet.");
    }
  };

  return (
    <div className="container mt-4 main-div">
      <div className="top my-5">
        <h1 className="text-center color">All Salon List</h1>
        <button
          className="salon-btn dropdown-toggle"
          onClick={() => {
            setShowDropdown(!showDropdown);
          }}
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          Download
        </button>
        {showDropdown && (
          <ul
            className="list-group position-absolute dw-style"
            style={{ left: "85%", top: "18%", transform: "translateX(-50%)" }}
          >
            <li
              className="list-group-item list-group-item-action"
              onClick={() => handelExport("xlsx")}
            >
              Download as XLSX
            </li>
            <li
              className="list-group-item list-group-item-action"
              onClick={() => handelExport("csv")}
            >
              Download as CSV
            </li>
            <li
              className="list-group-item list-group-item-action"
              onClick={() => handelExport("pdf")}
            >
              Download as PDF
            </li>
            <li
              className="list-group-item list-group-item-action"
              onClick={() => handelExport("docx")}
            >
              Download as Word
            </li>
          </ul>
        )}
      </div>

      {loading && (
        <div className="text-center">
          <div className="spinner-border color" role="status"></div>
          <p className="text-danger">Loading salons...</p>
        </div>
      )}

      {error && <p className="text-danger text-center">{error}</p>}

      {!loading && !error && salons.length > 0 ? (
        <div className="table-responsive mb-3">
          <table className="table table-bordered table-hover">
            <thead className="table-dark">
              <tr>
                <th>Index</th>
                <th>Full Name</th>
                <th>Phone Number</th>
                <th>Email</th>
                <th>Address</th>
                <th>Package Name</th>
                <th>Created At</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {salons.map((salon, index) => (
                <tr key={salon._id}>
                  <td>{index + 1}</td>
                  <td>{salon.full_name || "N/A"}</td>
                  <td>{salon.phone_number || "N/A"}</td>
                  <td>{salon.email || "N/A"}</td>
                  <td className="wrap-address">{salon.address || "N/A"}</td>
                  <td>{salon.package_id?.package_name || "N/A"}</td>
                  <td>{new Date(salon.createdAt).toLocaleString() || "N/A"}</td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(salon._id)}
                    >
                      Delete Salon
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !loading && (
          <p className="text-center text-muted">No salons available.</p>
        )
      )}
    </div>
  );
};

export default Allsalon;
