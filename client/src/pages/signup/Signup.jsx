"use client";
import React, { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ✅ JSON objects for Nigerian states and banks
const states = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT - Abuja",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

const banks = [
  "Access Bank",
  "Citibank",
  "Ecobank",
  "Fidelity Bank",
  "First Bank",
  "FCMB",
  "GTBank",
  "Heritage Bank",
  "Keystone Bank",
  "Polaris Bank",
  "Stanbic IBTC",
  "Sterling Bank",
  "Union Bank",
  "UBA",
  "Unity Bank",
  "Wema Bank",
  "Zenith Bank",
];

export default function Signup() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    state: "",
    bank: "",
    accountName: "",
    accountNumber: "",
    phone: "",
    password: "",
    confirmPassword: "",
    birthDate: "",
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Animation controls and in-view logic
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  useEffect(() => {
    if (inView) controls.start("visible");
  }, [inView, controls]);

  // ✅ Input handler
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // ✅ Validation logic
  const validateForm = () => {
    let newErrors = {};
    const phoneRegex = /^(\+234|0)[789][01]\d{8}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!emailRegex.test(formData.email))
      newErrors.email = "Valid email is required";
    if (!phoneRegex.test(formData.phone))
      newErrors.phone = "Enter a valid Nigerian phone number";
    if (!formData.state) newErrors.state = "Select your state";
    if (!formData.bank) newErrors.bank = "Select your bank";
    if (!formData.accountName.trim())
      newErrors.accountName = "Account name is required";
    if (!/^\d{10}$/.test(formData.accountNumber))
      newErrors.accountNumber = "Account number must be 10 digits";
    if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!formData.birthDate) newErrors.birthDate = "Date of birth is required";

    return newErrors;
  };

  // ✅ Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setLoading(false);
      return;
    }

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        state: formData.state,
        bank: formData.bank,
        accountName: formData.accountName,
        accountNumber: formData.accountNumber,
        password: formData.password,
        birthDate: formData.birthDate,
      };

      const urlParams = new URLSearchParams(window.location.search);
      const ref = urlParams.get("ref");
      if (ref) payload.ref = ref;

      const res = await fetch(`${BASE_URL}/api/realtors/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Signup failed");

      setSuccess("Account created successfully!");
      console.log("✅ Created Realtor:", data);

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        state: "",
        bank: "",
        accountName: "",
        accountNumber: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });

      setTimeout(() => setSuccess(""), 4000);
    } catch (error) {
      console.error("Signup Error:", error);
      setErrors({ general: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      ref={ref}
      className="py-36 px-36 flex items-center justify-center bg-gray-50 relative overflow-hidden"
    >
      {/* 🔴 Cinematic Red Sweep Overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-[rgba(255,0,0,0.1)] via-transparent to-transparent pointer-events-none z-0"
        initial={{ x: "-100%" }}
        animate={inView ? { x: ["-100%", "100%"] } : {}}
        transition={{ duration: 2, ease: "easeInOut" }}
      />

      {/* 🌫️ Soft Background Zoom/Pan (Breathe Effect) */}
      <motion.div
        className="absolute inset-0 bg-gray-100"
        initial={{ scale: 1 }}
        animate={inView ? { scale: [1, 1.03, 1], x: [0, -15, 0] } : {}}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="bg-white rounded-2xl flex flex-col md:flex-row  max-w-8/12 overflow-hidden relative z-10">
        {/* LEFT SECTION */}
        <motion.div
          className="bg-customPurple-500  text-white md:w-1/2 p-10 lg:p-24 flex flex-col justify-between"
          variants={{
            hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
            visible: {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transition: { duration: 0.8, ease: "easeOut" },
            },
          }}
          initial="hidden"
          animate={controls}
        >
          <div>
            <h2 className="text-3xl lg:text-6xl lg:leading-tight font-bold mb-4">
              Join Kemchuta Realtors and <br /> Unlock Endless Possibilities!
            </h2>
            <p className="text-sm lg:text-lg leading-relaxed text-gray-200">
              At Kemchuta Homes, we see real estate as more than property—it’s
              about vision, transformation, and lasting impact. Guided by High
              Chief Dr. Ikem O. Nwabueze, we stand for innovation, integrity,
              and growth.
            </p>
            <p className="text-sm mt-4 text-gray-200">
              We empower investors with confidence and realtors with opportunity
              — together, we’re shaping the future of real estate.
            </p>
          </div>

          {/* <motion.div
            className="mt-8 flex items-center space-x-3"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { delay: 0.4 } },
            }}
            initial="hidden"
            animate={controls}
          >
            <img
              src="https://i.pravatar.cc/50"
              alt="Lucky Benjamin"
              className="rounded-full w-10 h-10"
            />
            <div>
              <p className="font-semibold text-white text-sm">Lucky Benjamin</p>
              <p className="text-xs text-gray-300">COO Veritasi Group</p>
            </div>
          </motion.div> */}
        </motion.div>

        {/* RIGHT SECTION (Animated Form) */}
        <motion.div
          className="md:w-1/2 p-10"
          variants={{
            hidden: { opacity: 0, x: 60, filter: "blur(10px)" },
            visible: {
              opacity: 1,
              x: 0,
              filter: "blur(0px)",
              transition: { duration: 1, delay: 0.4 },
            },
          }}
          initial="hidden"
          animate={controls}
        >
          <div className="mb-8 flex flex-col justify-between">
            <h2 className="text-4xl font-bold text-gray-900">
              Sign up to{" "}
              <span className="text-primary-700 mb-5">
                Kemchuta Homes Realtors
              </span>
            </h2>
            <p className="text-gray-500 flex items-center mt-2 text-md">
              Already a member?{"  "}
              <a
                href="#"
                className="text-customPurple-700 font-semibold hover:underline"
              >
                Log in here
              </a>
            </p>
          </div>

          {success && (
            <p className="bg-green-100 text-green-700 p-2 rounded mb-4 text-sm">
              {success}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 py-8">
            {/* Names */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <input
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full border border-gray-400 rounded-sm p-3 ring-0 outline-0 focus:ring-3 focus:ring-red-500"
                />
                {errors.firstName && (
                  <p className="text-xs text-red-500">{errors.firstName}</p>
                )}
              </div>
              <div>
                <input
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full border border-gray-400 rounded-sm p-3 ring-0 outline-0 focus:ring-3 focus:ring-red-500"
                />
                {errors.lastName && (
                  <p className="text-xs text-red-500">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <input
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-400 rounded-sm p-3 ring-0 outline-0 focus:ring-3 focus:ring-red-500"
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <input
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                className="w-full border border-gray-400 rounded-sm p-3 ring-0 outline-0 focus:ring-3 focus:ring-red-500"
              />
              {errors.phone && (
                <p className="text-xs text-red-500">{errors.phone}</p>
              )}
            </div>
            {/* Birthday */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                className="w-full border border-gray-400 rounded-sm p-3 ring-0 outline-0 focus:ring-3 focus:ring-red-500"
              />
              {errors.birthDate && (
                <p className="text-xs text-red-500">{errors.birthDate}</p>
              )}
            </div>

            {/* State & Bank */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full border border-gray-400 rounded-sm p-3 ring-0 outline-0 focus:ring-3 focus:ring-red-500"
                >
                  <option value="">Select State</option>
                  {states.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
                {errors.state && (
                  <p className="text-xs text-red-500">{errors.state}</p>
                )}
              </div>

              <div>
                <select
                  name="bank"
                  value={formData.bank}
                  onChange={handleChange}
                  className="w-full border border-gray-400 rounded-sm p-3 ring-0 outline-0 focus:ring-3 focus:ring-red-500"
                >
                  <option value="">Select Bank</option>
                  {banks.map((bk) => (
                    <option key={bk} value={bk}>
                      {bk}
                    </option>
                  ))}
                </select>
                {errors.bank && (
                  <p className="text-xs text-red-500">{errors.bank}</p>
                )}
              </div>
            </div>

            {/* Account Info */}
            <div>
              <input
                name="accountName"
                placeholder="Account Name"
                value={formData.accountName}
                onChange={handleChange}
                className="w-full border border-gray-400 rounded-sm p-3 ring-0 outline-0 focus:ring-3 focus:ring-red-500"
              />
              {errors.accountName && (
                <p className="text-xs text-red-500">{errors.accountName}</p>
              )}
            </div>

            <div>
              <input
                name="accountNumber"
                placeholder="Account Number"
                value={formData.accountNumber}
                onChange={handleChange}
                className="w-full border border-gray-400 rounded-sm p-3 ring-0 outline-0 focus:ring-3 focus:ring-red-500"
              />
              {errors.accountNumber && (
                <p className="text-xs text-red-500">{errors.accountNumber}</p>
              )}
            </div>

            {/* Passwords */}
            <div>
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border border-gray-400 rounded-sm p-3 ring-0 outline-0 focus:ring-3 focus:ring-red-500"
              />
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            <div>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full border border-gray-400 rounded-sm p-3 ring-0 outline-0 focus:ring-3 focus:ring-red-500"
              />
              {errors.confirmPassword && (
                <p className="text-xs text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-center space-x-2 text-sm">
              <input type="checkbox" required />
              <label>
                By signing up, you agree to our{" "}
                <a href="#" className="text-customPurple-500 font-semibold">
                  Terms
                </a>{" "}
                and{" "}
                <a href="#" className="text-customPurple-500 font-semibold">
                  Privacy Policy
                </a>
                .
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center items-center gap-2 py-3 rounded-md text-white transition ${
                loading
                  ? "bg-customPurple-400 cursor-not-allowed"
                  : "bg-customPurple-500 hover:bg-customPurple-700 hover:shadow-[0_0_20px_rgba(192,132,252,0.6)]"
              }`}
            >
              {loading && (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              )}
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
}
