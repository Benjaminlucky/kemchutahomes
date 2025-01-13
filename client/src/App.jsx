import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./pages/home/Home";
import Company from "./pages/company/Company";
import Developments from "./pages/developments/Developments";
import Contact from "./pages/contact/Contact";
import Header from "./components/header/Header";
import Signup from "./pages/signup/Signup";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/company" element={<Company />} />
        <Route path="/developments" element={<Developments />} />
        <Route Path="/contact" element={<Contact />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
}

export default App;
