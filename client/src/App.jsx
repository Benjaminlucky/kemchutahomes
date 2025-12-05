import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./pages/home/Home";
import Company from "./pages/company/Company";
import Developments from "./pages/developments/Developments";
import Contact from "./pages/contact/Contact";
import Header from "./components/header/Header";
import Signup from "./pages/signup/Signup";
import Footer from "./components/footer/Footer";
import EstateDetails from "./pages/EstateDetails";
import Login from "./pages/login/Login";
import AdminSignup from "./pages/admin/AdminSignup";
import AdminLogin from "./pages/admin/AdminLogin";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/company" element={<Company />} />
        <Route path="/developments" element={<Developments />} />
        <Route path="/estate/:estateName" element={<EstateDetails />} />
        <Route Path="/contact" element={<Contact />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/signup" element={<AdminSignup />} />
        <Route path="/admin/login" element={<AdminLogin />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
