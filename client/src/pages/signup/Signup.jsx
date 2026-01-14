"use client";
import React, { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Eye, EyeOff } from "lucide-react"; // Standard icons for visibility toggle

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Toggle states for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  useEffect(() => {
    if (inView) controls.start("visible");
  }, [inView, controls]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

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
    if (!termsAccepted) newErrors.terms = "You must accept the terms";

    return newErrors;
  };

  const handleSubmit = async () => {
    setLoading(true);
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setLoading(false);
      return;
    }

    try {
      const payload = { ...formData };
      const urlParams = new URLSearchParams(window.location.search);
      const refCode = urlParams.get("ref");
      if (refCode) payload.ref = refCode;

      const res = await fetch(`${BASE_URL}/api/realtors/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Signup failed");

      setSuccess("Account created successfully!");
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
        birthDate: "",
      });
      setTermsAccepted(false);
      setTimeout(() => setSuccess(""), 4000);
    } catch (error) {
      setErrors({ general: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      ref={ref}
      className="py-8 sm:py-16 md:py-24 lg:py-36 px-4 sm:px-6 md:px-12 lg:px-24 xl:px-36 flex items-center justify-center bg-gray-50 relative overflow-hidden min-h-screen"
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-[rgba(255,0,0,0.1)] via-transparent to-transparent pointer-events-none z-0"
        initial={{ x: "-100%" }}
        animate={inView ? { x: ["-100%", "100%"] } : {}}
        transition={{ duration: 2, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute inset-0 bg-gray-100"
        initial={{ scale: 1 }}
        animate={inView ? { scale: [1, 1.03, 1], x: [0, -15, 0] } : {}}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg flex flex-col md:flex-row w-full max-w-8xl overflow-hidden relative z-10">
        <motion.div
          className="bg-purple-600 text-white md:w-1/2 p-6 sm:p-8 md:p-10 lg:p-16 xl:p-24 flex flex-col justify-between"
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
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 leading-tight">
              Join Kemchuta Realtors and Unlock Endless Possibilities!
            </h2>
            <p className="text-sm sm:text-base lg:text-lg leading-relaxed text-gray-200 mt-4">
              At Kemchuta Homes, we see real estate as more than property—it's
              about vision, transformation, and lasting impact. Guided by High
              Chief Dr. Ikem O. Nwabueze, we stand for innovation, integrity,
              and growth.
            </p>
            <p className="text-sm sm:text-base mt-3 sm:mt-4 text-gray-200">
              We empower investors with confidence and realtors with opportunity
              — together, we're shaping the future of real estate.
            </p>
          </div>
        </motion.div>

        <motion.div
          className="md:w-1/2 p-6 sm:p-8 md:p-10"
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
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
              Sign up to{" "}
              <span className="text-purple-700">Kemchuta Homes Realtors</span>
            </h2>
            <p className="text-gray-500 flex flex-wrap items-center mt-2 text-sm sm:text-base gap-1">
              Already a member?
              <a
                href="#"
                className="text-purple-700 font-semibold hover:underline ml-1"
              >
                Log in here
              </a>
            </p>
          </div>

          {success && (
            <p className="bg-green-100 text-green-700 p-2 sm:p-3 rounded mb-4 text-sm">
              {success}
            </p>
          )}
          {errors.general && (
            <p className="bg-red-100 text-red-700 p-2 sm:p-3 rounded mb-4 text-sm">
              {errors.general}
            </p>
          )}

          <div className="space-y-4 sm:space-y-5 py-4 sm:py-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <input
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full border border-gray-400 rounded-sm p-2.5 sm:p-3 text-sm sm:text-base outline-0 focus:ring-2 focus:ring-purple-500"
                />
                {errors.firstName && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.firstName}
                  </p>
                )}
              </div>
              <div>
                <input
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full border border-gray-400 rounded-sm p-2.5 sm:p-3 text-sm sm:text-base outline-0 focus:ring-2 focus:ring-purple-500"
                />
                {errors.lastName && (
                  <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            <input
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className="w-full border border-gray-400 rounded-sm p-2.5 sm:p-3 text-sm sm:text-base outline-0 focus:ring-2 focus:ring-purple-500"
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email}</p>
            )}

            <input
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border border-gray-400 rounded-sm p-2.5 sm:p-3 text-sm sm:text-base outline-0 focus:ring-2 focus:ring-purple-500"
            />
            {errors.phone && (
              <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
            )}

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                className="w-full border border-gray-400 rounded-sm p-2.5 sm:p-3 text-sm sm:text-base outline-0 focus:ring-2 focus:ring-purple-500"
              />
              {errors.birthDate && (
                <p className="text-xs text-red-500 mt-1">{errors.birthDate}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full border border-gray-400 rounded-sm p-2.5 sm:p-3 text-sm sm:text-base outline-0 focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select State</option>
                {states.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              <select
                name="bank"
                value={formData.bank}
                onChange={handleChange}
                className="w-full border border-gray-400 rounded-sm p-2.5 sm:p-3 text-sm sm:text-base outline-0 focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select Bank</option>
                {banks.map((bk) => (
                  <option key={bk} value={bk}>
                    {bk}
                  </option>
                ))}
              </select>
            </div>

            <input
              name="accountName"
              placeholder="Account Name"
              value={formData.accountName}
              onChange={handleChange}
              className="w-full border border-gray-400 rounded-sm p-2.5 sm:p-3 text-sm sm:text-base outline-0 focus:ring-2 focus:ring-purple-500"
            />
            {errors.accountName && (
              <p className="text-xs text-red-500 mt-1">{errors.accountName}</p>
            )}

            <input
              name="accountNumber"
              placeholder="Account Number"
              value={formData.accountNumber}
              onChange={handleChange}
              className="w-full border border-gray-400 rounded-sm p-2.5 sm:p-3 text-sm sm:text-base outline-0 focus:ring-2 focus:ring-purple-500"
            />
            {errors.accountNumber && (
              <p className="text-xs text-red-500 mt-1">
                {errors.accountNumber}
              </p>
            )}

            {/* Password Field with Toggle */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border border-gray-400 rounded-sm p-2.5 sm:p-3 pr-10 text-sm sm:text-base outline-0 focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field with Toggle */}
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full border border-gray-400 rounded-sm p-2.5 sm:p-3 pr-10 text-sm sm:text-base outline-0 focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-700"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              {errors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <div className="flex items-start space-x-2 text-xs sm:text-sm">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-1"
              />
              <label>
                By signing up, you agree to our{" "}
                <a href="#" className="text-purple-600 font-semibold">
                  Terms
                </a>{" "}
                and{" "}
                <a href="#" className="text-purple-600 font-semibold">
                  Privacy Policy
                </a>
                .
              </label>
            </div>
            {errors.terms && (
              <p className="text-xs text-red-500">{errors.terms}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full flex justify-center items-center gap-2 py-2.5 sm:py-3 rounded-md text-white text-sm sm:text-base font-medium transition ${
                loading
                  ? "bg-purple-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700 hover:shadow-lg"
              }`}
            >
              {loading && (
                <span className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              )}
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
