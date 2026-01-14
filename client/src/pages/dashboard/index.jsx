import React from "react";
import { Routes, Route } from "react-router-dom";

import Earnings from "./Earnings";
import Recruits from "./Recruits";
import Reports from "./Reports";
import DashboardLayout from "./Layout";
import RealtorDashboard from "./RealtorDashboard";
import AdminDashboard from "./AdminDashboard";
import ManageRealtors from "./ManageRealtors";

export default function Dashboard() {
  return (
    <DashboardLayout>
      <Routes>
        {/* Default landing based on user role */}
        <Route index element={<RoleBasedDashboard />} />
        <Route path="/realtors" element={<ManageRealtors />} />

        {/* Nested routes */}
        <Route path="earnings" element={<Earnings />} />
        <Route path="recruits" element={<Recruits />} />
        <Route path="reports" element={<Reports />} />
      </Routes>
    </DashboardLayout>
  );
}

function RoleBasedDashboard() {
  if (typeof window === "undefined") return null; // SSR safety
  const rawUser = localStorage.getItem("user");
  if (!rawUser) return <p>Loading...</p>; // wait for login redirect

  let user;
  try {
    user = JSON.parse(rawUser);
  } catch {
    return <p>Invalid user data</p>;
  }

  // Ensure role exists
  if (!user.role) return <p>Invalid user role</p>;

  return user.role === "admin" ? <AdminDashboard /> : <RealtorDashboard />;
}
