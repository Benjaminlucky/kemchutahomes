import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

const defaultAvatar =
  "https://ui-avatars.com/api/?name=Realtor&background=random&color=fff";

export default function RealtorDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          window.location.href = "/login";
          return;
        }

        const BASE_URL = import.meta.env.VITE_API_BASE_URL;
        const res = await axios.get(`${BASE_URL}/api/realtors/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setData(res.data);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
        if (err.response?.status === 401) {
          localStorage.clear();
          window.location.href = "/login";
        } else {
          setError(
            err.response?.data?.message || "Failed to load dashboard data"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const handleCopy = () => {
    if (!data?.referralLink) return;
    navigator.clipboard.writeText(data.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const onFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Not authenticated");
      return;
    }

    try {
      setUploading(true);
      const BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await axios.put(`${BASE_URL}/api/realtors/avatar`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const newAvatar = res.data?.avatar;
      if (newAvatar) {
        setData((prev) => ({ ...prev, avatar: newAvatar }));

        const savedUserRaw = localStorage.getItem("user");
        if (savedUserRaw) {
          try {
            const savedUser = JSON.parse(savedUserRaw);
            savedUser.avatar = newAvatar;
            localStorage.setItem("user", JSON.stringify(savedUser));
          } catch (err) {
            console.error("Failed to update user in localStorage:", err);
          }
        }
      }
    } catch (err) {
      console.error("Upload failed:", err);
      alert(
        err.response?.data?.message || "Failed to upload avatar. Try again."
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const triggerFile = () => {
    fileInputRef.current?.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600 text-center">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">No dashboard data found</p>
      </div>
    );
  }

  const fullName = `${data.firstName || ""} ${data.lastName || ""}`.trim();

  return (
    <div className="w-full p-5 md:p-10 min-h-screen">
      <h1 className="text-2xl md:text-3xl font-medium mb-6">
        Welcome,{" "}
        <span className="font-semibold text-black uppercase">{fullName}</span>
      </h1>

      <div className="cards grid grid-cols-1 md:grid-cols-4 pt-8 gap-5">
        <div className="bg-[#d8e8e8] rounded-xl h-[250px] w-full overflow-hidden flex items-center justify-center relative">
          <img
            src={data.avatar || defaultAvatar}
            alt="Avatar"
            className="w-full h-full object-cover"
          />

          <div
            className="absolute top-2 right-2 bg-white/90 rounded-md px-2 py-1 text-xs cursor-pointer hover:opacity-90 flex items-center gap-2"
            onClick={triggerFile}
            title="Change profile image"
            role="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M4 13v3a1 1 0 001 1h3l9-9-4-4-9 9z" />
            </svg>
            <span>{uploading ? "Uploading..." : "Change"}</span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={onFileSelect}
            className="hidden"
            name="avatar"
          />
        </div>

        <Stat value={data.downlines || 0} label="Downlines" />
        <Stat value={data.recruitedBy || "Not Assigned"} label="Recruited By" />

        <div
          className="bg-[#0f1f1f] text-white rounded-xl p-6 h-[250px] flex flex-col items-center justify-center cursor-pointer hover:bg-[#0b1515] transition relative"
          onClick={handleCopy}
        >
          <p className="text-sm text-center font-medium truncate w-full px-2">
            {data.referralLink || "Not Available"}
          </p>
          <p className="text-xs mt-2 opacity-90">Referral Link</p>

          {copied && (
            <span className="absolute bottom-3 bg-white text-black px-2 py-1 rounded text-xs font-semibold">
              ✅ Copied!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div className="bg-[#0f1f1f] text-white rounded-xl p-6 h-[250px] flex flex-col items-center justify-center">
      <p className="text-2xl font-bold text-center">{value}</p>
      <p className="text-sm mt-2 opacity-80 text-center">{label}</p>
    </div>
  );
}
