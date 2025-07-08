import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Salon1.css";
import * as XLSX from "xlsx"
import { saveAs } from "file-saver";

const Salon1 = () => {
  const [salons, setSalons] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    axios
      .get(import.meta.env.VITE_ADD_SALON_API)
      .then((response) => {
        if (response.data.length > 0) {
          setSalons(response.data);
          setError("");
        } else {
          setError("No salons found.");
        }
      })
      .catch((error) => {
        setError("Failed to fetch salons. Please try again later.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleDelete = (id) => {
    axios
      .delete(`${import.meta.env.VITE_ADD_SALON_API}/${id}`)
      .then(() => {
        setSalons(salons.filter((salon) => salon.id !== id));
      })
      .catch(() => {
        alert("Failed to delete salon. Please try again.");
      });
  };

  // Download XLS
  const handleDownload = (format) => {
    if (salons.length === 0) {
      alert("No salon data available to download.");
      return;
    }
    if (format === "xlsx") {
      const workSheet = XLSX.utils.json_to_sheet(salons);
      const workBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workBook, workSheet, "Registered_Salon_List");
      const buffer = XLSX.write(workBook, { bookType: "xlsx", type: "array" });
      const data = new Blob([buffer], { type: "application/octet-stream" });
      saveAs(data, "Registered_Salon_List.xlsx");
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
    <div className="parent-div">
      <div className="container top my-5">
        <h1 className="text-center color">Registred Salons</h1>
        <div className="dropdown my-3 text-center">
          <button className="salon-btn dropdown-toggle" onClick={() => setShowDropdown(!showDropdown)} type="button" data-bs-toggle="dropdown" aria-expanded="false">
            Download
          </button>
          {showDropdown && (
            <ul
              className="list-group position-absolute dw-style"
              style={{left: "50%", transform: "translateX(-50%)" }}
            >
              <li
                className="list-group-item list-group-item-action"
                onClick={() => handleDownload("xlsx")}
              >
                Download as XLSX
              </li>
              <li
                className="list-group-item list-group-item-action"
                onClick={() => handleDownload("csv")}
              >
                Download as CSV
              </li>
              <li
                className="list-group-item list-group-item-action"
                onClick={() => handleDownload("pdf")}
              >
                Download as PDF
              </li>
              <li
                className="list-group-item list-group-item-action"
                onClick={() => handleDownload("docx")}
              >
                Download as Word
              </li>
            </ul>
          )}
        </div>

      </div>
      <div className="container text-center">
        {loading && (
          <div className="text-center">
            <div className="spinner-border color" role="status"></div>
            <p className="text-danger">Loading registered salons list...</p>
          </div>
        )}
        {error && !loading && <div className="alert alert-danger">{error}</div>}
        {!error && !loading && (
          <div className="table-responsive main-table-div">
            <table className="table table-bordered table-hover">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Address</th>
                  <th>Contact</th>
                  <th>Email</th>
                  <th>Opening Time</th>
                  <th>Closing Time</th>
                  <th>Category</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {salons.map((salon) => (
                  <tr key={salon.id}>
                    <td>{salon.id}</td>
                    <td>{salon.name}</td>
                    <td>{salon.description}</td>
                    <td>{salon.address}</td>
                    <td>{salon.contact_number}</td>
                    <td>{salon.contact_email}</td>
                    <td>{salon.opening_time}</td>
                    <td>{salon.closing_time}</td>
                    <td>{salon.Category}</td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(salon.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Salon1;
