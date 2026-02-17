import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import "./App.css";

// Context
import { AuthProvider } from "./context/AuthContext";

// Pages
import Home from "./pages/home/Home";
import Company from "./pages/company/Company";
import Developments from "./pages/developments/Developments";
import Contact from "./pages/contact/Contact";
import EstateDetails from "./pages/EstateDetails";
import Signup from "./pages/signup/Signup";
import Login from "./pages/login/Login";
import AdminSignup from "./pages/admin/AdminSignup";
import AdminLogin from "./pages/admin/AdminLogin";
import Dashboard from "./pages/dashboard";

// Layout
import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";
import ProtectedRoute from "./components/ProtectedRoutes";
import NotFound from "./pages/notfound/NotFound";
import ForgotPassword from "./pages/forgot-password/ForgotPassword";
import ResetPassword from "./pages/reset-password/resetPassword";
import AdminForgotPassword from "./pages/admin-forgot-password/AdminForgotPassword";
import AdminResetPassword from "./pages/admin-reset-password/AdminResetPassword";

// ============================
// Layout wrapper for dynamic header/footer
// ============================
function AppWrapper() {
  const location = useLocation();

  // Hide header + footer on dashboard routes
  const hideLayout = location.pathname.startsWith("/dashboard");

  return (
    <>
      {/* Show Header on public pages */}
      {!hideLayout && <Header />}

      <main
        className={`${
          hideLayout ? "" : "pt-0"
        } relative overflow-x-hidden bg-white min-h-screen`}
      >
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/company" element={<Company />} />
          <Route path="/developments" element={<Developments />} />
          <Route path="/estate/:estateName" element={<EstateDetails />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/signup" element={<AdminSignup />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/admin/forgot-password"
            element={<AdminForgotPassword />}
          />
          <Route
            path="/admin/reset-password"
            element={<AdminResetPassword />}
          />

          {/* Protected Dashboard */}
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* 404 Not Found - Must be last */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        {/* Show Footer on public pages */}
        {!hideLayout && <Footer />}
      </main>
    </>
  );
}

// ============================
// Root App - WRAP WITH AuthProvider
// ============================
export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppWrapper />
      </AuthProvider>
    </Router>
  );
}
