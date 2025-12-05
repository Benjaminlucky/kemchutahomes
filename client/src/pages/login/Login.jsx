import React, { useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ToastContainer, toast } from "react-toastify";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  // Animation controls
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.3 });

  React.useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [inView, controls]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const res = await fetch(`${BASE_URL}/api/realtors/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      // ✅ Store both token and user info
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.realtor));

      toast.success("Login successful!");

      // ✅ Redirect both roles to /dashboard
      window.location.href = "/dashboard";
    } catch (error) {
      toast.error(error.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      ref={ref}
      className="flex flex-col md:flex-row min-h-screen bg-[#e9f6f6] font-poppins overflow-hidden relative"
      variants={{
        hidden: { opacity: 0, filter: "blur(15px)" },
        visible: {
          opacity: 1,
          filter: "blur(0px)",
          transition: { duration: 1.2, ease: "easeOut" },
        },
      }}
      initial="hidden"
      animate={controls}
    >
      {/* Soft background zoom/pan breathe effect */}
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,0,0,0.08),_transparent_70%)] pointer-events-none"
        animate={{
          scale: [1, 1.05, 1],
          x: [0, 10, -10, 0],
          y: [0, -10, 10, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Cinematic red sweep overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-customPurple-500/30 via-transparent to-customPurple-700/30 pointer-events-none"
        initial={{ x: "-100%" }}
        animate={inView ? { x: ["-100%", "100%"] } : {}}
        transition={{ duration: 2.8, ease: "easeInOut" }}
      />

      {/* Left Panel */}
      <motion.div
        className="md:w-2/3 bg-customPurple-500 text-white flex flex-col justify-center px-10 py-16 relative overflow-hidden"
        variants={{
          hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
          visible: {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            transition: { duration: 1.2 },
          },
        }}
      >
        <div className="relative z-10 lg:ml-36 mt-auto mb-10">
          <motion.h1
            className="text-5xl font-semibold leading-tight mb-4"
            variants={{
              hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
              visible: {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                transition: { duration: 0.8, delay: 0.3 },
              },
            }}
          >
            Get <br /> Everything <br /> You want
          </motion.h1>
          <motion.p
            className="text-sm md:text-base text-gray-200 max-w-md"
            variants={{
              hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
              visible: {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                transition: { duration: 0.9, delay: 0.5 },
              },
            }}
          >
            You can get everything you want if you work hard, trust the process,
            and stick to the plan.
          </motion.p>
        </div>
      </motion.div>

      {/* Right Form */}
      <motion.div
        className="md:w-1/2 flex items-center justify-center px-8 py-12 relative"
        variants={{
          hidden: { opacity: 0, x: 60, filter: "blur(10px)" },
          visible: {
            opacity: 1,
            x: 0,
            filter: "blur(0px)",
            transition: { duration: 1.2, delay: 0.4 },
          },
        }}
      >
        <div className="w-full max-w-md">
          <ToastContainer
            position="top-center"
            autoClose={3000}
            hideProgressBar
            newestOnTop
            closeOnClick
            pauseOnHover
            theme="colored"
          />

          <motion.div
            className="text-center mb-8"
            variants={{
              hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
              visible: {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                transition: { duration: 1, delay: 0.6 },
              },
            }}
          >
            <h2 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900">
              Welcome Back!
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              Enter your email and password to access your account and see your
              progress.
            </p>
          </motion.div>

          {/* Staggered Form Animation */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-5"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.15,
                  delayChildren: 0.7,
                },
              },
            }}
          >
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 25 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
            >
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Enter Your Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter Your Email Address"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-customPurple-600 focus:outline-none"
              />
            </motion.div>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 25 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
            >
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Enter Your Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter Your Password"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-customPurple-600 focus:outline-none"
              />
            </motion.div>

            <div className="flex justify-end">
              <a
                href="#"
                className="text-customPurple-600 text-sm font-medium hover:underline"
              >
                Forgot Password?
              </a>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full bg-customPurple text-white py-3 rounded-lg font-semibold text-base hover:bg-customPurple-700 transition flex items-center justify-center shadow-lg hover:shadow-[0_0_25px_var(--color-primary-500)]"
              variants={{
                hidden: { opacity: 0, y: 25 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
              }}
            >
              {loading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
              ) : (
                "Login to Dashboard"
              )}
            </motion.button>
          </motion.form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Login;
