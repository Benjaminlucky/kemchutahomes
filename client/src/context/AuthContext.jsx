import React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [loading, setLoading] = useState(true); // Start as true

  const logout = () => {
    const role = user?.role;

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);

    if (role === "admin") {
      window.location.href = "/admin/login";
    } else {
      window.location.href = "/login";
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (!token || savedUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const BASE_URL = import.meta.env.VITE_API_BASE_URL;
        const res = await axios.get(`${BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userData = res.data.user;
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      } catch (err) {
        console.error("Failed to fetch user:", err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []); // Remove user from dependencies

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
