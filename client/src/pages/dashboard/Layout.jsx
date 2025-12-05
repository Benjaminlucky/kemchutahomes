import React from "react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaSignOutAlt,
  FaTachometerAlt,
  FaUsers,
  FaBuilding,
  FaChartLine,
  FaBars,
  FaTimes,
} from "react-icons/fa";

import { useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/button";

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect screen size on mount and resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sidebarItems =
    user?.role === "admin"
      ? [
          {
            name: "Dashboard",
            path: "/dashboard",
            icon: <FaTachometerAlt />,
          },
          {
            name: "Manage Realtors",
            path: "/dashboard/realtors",
            icon: <FaUsers />,
          },
          { name: "Reports", path: "/admin/reports", icon: <FaChartLine /> },
        ]
      : [
          {
            name: "Dashboard",
            path: "/realtor/dashboard",
            icon: <FaTachometerAlt />,
          },
          { name: "My Recruits", path: "/realtor/recruits", icon: <FaUsers /> },
          { name: "Earnings", path: "/realtor/earnings", icon: <FaBuilding /> },
        ];

  const handleItemClick = () => {
    if (isMobile) setIsOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-[#fdfdfd] font-poppins relative">
      {/* Mobile/Tablet Menu Toggle Button */}
      <div className="absolute top-4 left-4 z-50 lg:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-300 focus:outline-none"
        >
          {isOpen ? (
            <FaTimes size={24} className="text-customPurple-300" />
          ) : (
            <FaBars size={24} className="text-customPurple-300" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      {isMobile ? (
        <motion.aside
          initial={{ x: -300 }}
          animate={{ x: isOpen ? 0 : -300 }}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
          className="fixed top-0 left-0 h-[100vh] w-64 bg-customPurple-600 text-white flex flex-col justify-between py-6 px-4
                     z-40 shadow-2xl lg:hidden"
        >
          <div>
            <h1 className="text-2xl font-bold mb-8 pl-4">Kemchuta Dashboard</h1>
            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    to={item.path}
                    key={item.name}
                    onClick={handleItemClick}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition cursor-pointer ${
                      isActive
                        ? "bg-customPurple-900/80 font-semibold"
                        : "hover:bg-customPurple-900"
                    }`}
                  >
                    {item.icon}
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="px-4 mt-6">
            <Button
              onClick={logout}
              className="w-full bg-customPurple-800 hover:bg-customPurple-900 text-white flex items-center justify-center gap-2"
            >
              <FaSignOutAlt /> Logout
            </Button>
          </div>
        </motion.aside>
      ) : (
        // Static Sidebar for Desktop
        <aside className="h-[100vh] w-64 bg-customPurple-500 text-white flex flex-col justify-between py-6 px-4 sticky top-0">
          <div>
            <h1 className="text-2xl font-bold mb-8 pl-4">Kemchuta Dashboard</h1>
            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    to={item.path}
                    key={item.name}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition cursor-pointer ${
                      isActive
                        ? "bg-customPurple-900/80 font-semibold"
                        : "hover:bg-customPurple-900"
                    }`}
                  >
                    {item.icon}
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="px-4 mt-6">
            <Button
              onClick={logout}
              className="w-full bg-customPurple-800 hover:bg-customPurple-900 text-white flex items-center justify-center gap-2"
            >
              <FaSignOutAlt /> Logout
            </Button>
          </div>
        </aside>
      )}

      {/* Overlay for mobile/tablet */}
      {isMobile && isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 transition-opacity lg:hidden"
        ></div>
      )}

      {/* Main Content */}
      <main
        className={`flex-1 p-6 sm:p-8 bg-[#fafafa] overflow-y-auto transition-all duration-300 ${
          isOpen ? "pointer-events-none blur-sm" : ""
        }`}
      >
        {children}
      </main>
    </div>
  );
}
