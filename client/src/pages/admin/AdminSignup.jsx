"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function AdminSignup() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`${BASE_URL}/api/admin/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");

      setMessage("✅ Admin account created successfully!");
      setFormData({ email: "", password: "" });
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gray-50 relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Red sweep animation */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-customPurple-500/50 via-transparent to-transparent z-0"
        initial={{ x: "-100%" }}
        animate={{ x: ["-100%", "100%"] }}
        transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
      />

      <motion.div
        className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-md relative z-10"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          Admin Signup
        </h2>

        {message && (
          <p
            className={`p-3 rounded mb-4 text-sm ${
              message.startsWith("✅")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input
              name="email"
              type="email"
              placeholder="Admin Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-400 rounded-sm p-3 outline-none focus:ring-2 focus:ring-customPurple-500"
            />
          </div>

          <div>
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full border border-gray-400 rounded-sm p-3 outline-none focus:ring-2 focus:ring-customPurple-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-md text-white transition ${
              loading
                ? "bg-customPurple-400 cursor-not-allowed"
                : "bg-customPurple-500 hover:bg-customPurple-700 hover:shadow-customerPurple-500/20"
            }`}
          >
            {loading ? "Creating..." : "Create Admin Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-500 text-sm">
          Already an admin?{" "}
          <a
            href="/admin/login"
            className="text-customPurple-700 font-semibold hover:underline"
          >
            Login here
          </a>
        </p>
      </motion.div>
    </motion.div>
  );
}
