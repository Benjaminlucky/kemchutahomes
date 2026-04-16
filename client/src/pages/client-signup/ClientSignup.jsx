import React, { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Eye, EyeOff, Home } from "lucide-react";
import { Link } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function ClientSignup() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  useEffect(() => {
    if (inView) controls.start("visible");
  }, [inView, controls]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const validateForm = () => {
    const newErrors = {};
    const phoneRegex = /^(\+234|0)[789][01]\d{8}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!emailRegex.test(formData.email))
      newErrors.email = "Valid email is required";
    if (!phoneRegex.test(formData.phone))
      newErrors.phone = "Enter a valid Nigerian phone number";
    if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    return newErrors;
  };

  const handleSubmit = async () => {
    setLoading(true);
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setLoading(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/clients/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      setSuccess("Account created! Redirecting to your portal...");
      setShowSuccess(true);

      // Store token and user immediately (auto-login after register)
      if (data.token && data.user) {
        localStorage.setItem("clientToken", data.token);
        localStorage.setItem("clientUser", JSON.stringify(data.user));
      }

      setTimeout(() => setShowSuccess(false), 3000);
      setTimeout(() => {
        window.location.href = "/client/portal";
      }, 3200);
    } catch (error) {
      setErrors({
        general: error.message || "An error occurred. Please try again.",
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  // Password strength
  const strength = (() => {
    if (!formData.password) return null;
    let score = 0;
    if (formData.password.length >= 8) score++;
    if (/[A-Z]/.test(formData.password)) score++;
    if (/[0-9]/.test(formData.password)) score++;
    if (/[^A-Za-z0-9]/.test(formData.password)) score++;
    if (score <= 1) return { label: "Weak", color: "bg-red-400", width: "25%" };
    if (score === 2)
      return { label: "Fair", color: "bg-yellow-400", width: "50%" };
    if (score === 3)
      return { label: "Good", color: "bg-blue-400", width: "75%" };
    return { label: "Strong", color: "bg-green-500", width: "100%" };
  })();

  const inputCls =
    "w-full border border-gray-400 rounded-sm p-2 sm:p-2.5 text-xs sm:text-sm md:text-base outline-0 focus:ring-2 focus:ring-customPurple-500";
  const errCls = "text-xs text-red-500 mt-1";

  return (
    <motion.div
      ref={ref}
      className="py-6 sm:py-10 md:py-16 px-3 sm:px-4 md:px-6 flex items-center justify-center bg-gray-50 relative overflow-hidden min-h-screen"
    >
      {/* Animated background — same as Signup.jsx */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-customPurple-500/10 via-transparent to-transparent pointer-events-none z-0"
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

      <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg flex flex-col md:flex-row w-full max-w-4xl overflow-hidden relative z-10">
        {/* Left Panel */}
        <motion.div
          className="bg-customPurple-500 text-white md:w-1/2 p-5 sm:p-6 md:p-8 lg:p-12 flex flex-col justify-between"
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
          {/* Back link */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-semibold transition-colors w-fit"
          >
            <Home size={16} />
            Back to Homepage
          </Link>
          <div className="mt-8">
            <div className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5">
              Client Portal
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-4 leading-tight">
              Create Your Kemchuta Homes Client Account
            </h2>
            <p className="text-xs sm:text-sm md:text-base leading-relaxed text-gray-200">
              Get a secure portal to track your land subscriptions, view your
              documents, and stay updated on every step of your property
              journey.
            </p>

            <div className="mt-8 space-y-3">
              {[
                "Track subscription & approval status",
                "View and download documents",
                "Monitor inspection schedules",
                "Secure, personal account",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 text-sm text-gray-200"
                >
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div /> {/* spacer */}
        </motion.div>

        {/* Right Form */}
        <motion.div
          className="md:w-1/2 p-5 sm:p-6 md:p-8 lg:p-10"
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
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
              Create your{" "}
              <span className="text-customPurple-600">Client Account</span>
            </h2>
            <p className="text-gray-500 flex flex-wrap items-center mt-2 text-xs sm:text-sm gap-1">
              Already have an account?
              <Link
                to="/client/login"
                className="text-customPurple-700 font-semibold hover:underline ml-1"
              >
                Log in here
              </Link>
            </p>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {/* Name row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={inputCls}
                />
                {errors.firstName && (
                  <p className={errCls}>{errors.firstName}</p>
                )}
              </div>
              <div>
                <input
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={inputCls}
                />
                {errors.lastName && <p className={errCls}>{errors.lastName}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className={inputCls}
              />
              {errors.email && <p className={errCls}>{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <input
                name="phone"
                placeholder="Phone Number (e.g. 08012345678)"
                value={formData.phone}
                onChange={handleChange}
                className={inputCls}
              />
              {errors.phone && <p className={errCls}>{errors.phone}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`${inputCls} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-customPurple-700"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {/* Strength bar */}
              {strength && (
                <div className="mt-2">
                  <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                      style={{ width: strength.width }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{strength.label}</p>
                </div>
              )}
              {errors.password && <p className={errCls}>{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`${inputCls} pr-10 ${
                    formData.confirmPassword &&
                    formData.confirmPassword !== formData.password
                      ? "border-red-400 bg-red-50"
                      : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-customPurple-700"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className={errCls}>{errors.confirmPassword}</p>
              )}
            </div>

            {/* Errors & Success */}
            {errors.general && (
              <div className="bg-red-100 border border-red-400 text-red-700 p-2 sm:p-2.5 rounded text-xs sm:text-sm">
                {errors.general}
              </div>
            )}
            {success && (
              <div
                className={`bg-green-100 border border-green-400 text-green-700 p-2 sm:p-2.5 rounded text-xs sm:text-sm transition-all duration-500 ${
                  showSuccess
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 -translate-y-2"
                }`}
              >
                {success}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full flex justify-center items-center gap-2 py-2 sm:py-2.5 md:py-3 rounded-md text-white text-xs sm:text-sm md:text-base font-medium transition ${
                loading
                  ? "bg-customPurple-400 cursor-not-allowed"
                  : "bg-customPurple-500 hover:bg-customPurple-700 hover:shadow-lg hover:shadow-customPurple-500/30"
              }`}
            >
              {loading && (
                <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {loading ? "Creating Account..." : "Create Client Account"}
            </button>

            <p className="text-center text-xs text-gray-400">
              By creating an account, you agree to our{" "}
              <a href="#" className="text-customPurple-600 font-semibold">
                Terms
              </a>{" "}
              and{" "}
              <a href="#" className="text-customPurple-600 font-semibold">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
