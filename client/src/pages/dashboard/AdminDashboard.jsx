"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import useSWR from "swr";
import { Card, CardContent } from "../../components/ui/card";

// Helpers
const capitalize = (str = "") =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

// Fetcher
const fetcher = async (url, token) => {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to load dashboard data");
  }

  return res.json();
};

export default function AdminDashboard() {
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [page, setPage] = useState(1);
  const limit = 10;
  const [search, setSearch] = useState("");

  const { data, error, isLoading } = useSWR(
    token
      ? `${API_URL}/api/realtors?page=${page}&limit=${limit}&search=${encodeURIComponent(
          search
        )}`
      : null,
    (url) => fetcher(url, token),
    { revalidateOnFocus: false }
  );

  const realtors = data?.docs || [];
  const total = data?.total || 0;
  const pages = data?.pages || 1;

  const goTo = (p) => {
    if (p < 1 || p > pages) return;
    setPage(p);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const stats = [
    { label: "Total Realtors", value: total },
    {
      label: "Total Recruits",
      value: realtors.reduce((acc, r) => acc + (r.recruitCount || 0), 0),
    },
    { label: "Active Campaigns", value: 0 },
  ];

  return (
    <div className="space-y-6 mt-8">
      <h2 className="text-3xl font-bold text-customPurple-800">
        Admin Overview
      </h2>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="rounded-2xl shadow">
              <CardContent className="p-6 text-center">
                <p className="text-4xl font-bold text-customPurple-700">
                  {s.value}
                </p>
                <p className="text-gray-600 mt-2">{s.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Search name, email, referral code"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border rounded-md w-full sm:w-64"
        />
        <button className="px-4 py-2 bg-customPurple-700 text-white rounded-md">
          Search
        </button>
      </form>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow p-6">
        <div className="flex justify-between mb-4">
          <h3 className="text-xl font-semibold">Registered Realtors</h3>
          <span className="text-sm text-gray-500">
            {isLoading ? "Loading..." : `${total} total`}
          </span>
        </div>

        {error && (
          <div className="mb-4 text-red-600 bg-red-50 p-3 rounded">
            {error.message}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Referral Code</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Recruiter</th>
                <th className="px-4 py-3 text-left">Created</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan="6" className="px-4 py-4">
                      <div className="h-4 bg-gray-200 animate-pulse rounded" />
                    </td>
                  </tr>
                ))
              ) : realtors.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    No realtors found
                  </td>
                </tr>
              ) : (
                realtors.map((r) => (
                  <tr key={r._id}>
                    <td className="px-4 py-3">{r.referralCode}</td>
                    <td className="px-4 py-3">
                      {capitalize(r.firstName)} {capitalize(r.lastName)}
                    </td>
                    <td className="px-4 py-3">{r.phone || "-"}</td>
                    <td className="px-4 py-3">{r.email}</td>
                    <td className="px-4 py-3">
                      {r.recruitedBy
                        ? `${capitalize(r.recruitedBy.firstName)} ${capitalize(
                            r.recruitedBy.lastName
                          )}`
                        : "-"}
                    </td>
                    <td className="px-4 py-3">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex justify-between items-center">
          <span className="text-sm">
            Page {page} of {pages}
          </span>
          <div className="space-x-2">
            <button
              onClick={() => goTo(page - 1)}
              disabled={page === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>
            <button
              onClick={() => goTo(page + 1)}
              disabled={page === pages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
