import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Earnings from "./Earnings";
import Recruits from "./Recruits";
import Reports from "./Reports";
import DashboardLayout from "./Layout";
import RealtorDashboard from "./RealtorDashboard";
import AdminDashboard from "./AdminDashboard";
import ManageRealtors from "./ManageRealtors";
import ManageEstates from "./ManageEstates";

export default function Dashboard() {
  return (
    <DashboardLayout>
      <Routes>
        {/* Index — role-based landing */}
        <Route index element={<RoleBasedDashboard />} />

        {/* Admin routes */}
        <Route path="realtors" element={<ManageRealtors />} />
        <Route path="estates" element={<ManageEstates />} />
        <Route path="reports" element={<Reports />} />

        {/* Realtor routes */}
        <Route path="earnings" element={<Earnings />} />
        <Route path="recruits" element={<Recruits />} />

        {/* Catch-all inside dashboard → redirect to index */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
}

function RoleBasedDashboard() {
  if (typeof window === "undefined") return null;

  const rawUser = localStorage.getItem("user");
  if (!rawUser) return <p className="p-8 text-gray-500">Loading...</p>;

  let user;
  try {
    user = JSON.parse(rawUser);
  } catch {
    return (
      <p className="p-8 text-red-500">Invalid session. Please log in again.</p>
    );
  }

  if (!user?.role)
    return <p className="p-8 text-red-500">Invalid user role.</p>;

  return user.role === "admin" ? <AdminDashboard /> : <RealtorDashboard />;
}
