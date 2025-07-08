import React from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Allsalon from "./Allsalon";
import Salon1 from "./Salon1";
import Package from "./Package";
import RegisterSalon from "./RegisterSalon";
import AddPackage from "./AddPackage";
import EditPackage from "./EditPackage";

const AdminPanel = () => {
  return (
    <div>
      <Header />
      <div>
        <Sidebar />
        <div>
          <Routes>
            <Route path="/" element={<Allsalon />} />
            <Route path="/salon1" element={<Salon1 />} />
            <Route path="/package" element={<Package />} />
            <Route path="/add-package" element={<AddPackage />} />
            <Route path="/edit-package/:id" element={<EditPackage />} />
          </Routes>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
