"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

import useSWR from "swr";
import { Card, CardContent } from "../../components/ui/card";

// Capitalize helper
const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

// Fetcher for SWR
const fetcher = (url, token) =>
  fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }).then(async (res) => {
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const error = new Error(errData.message || "Failed to fetch");
      throw error;
    }
    return res.json();
  });

export default function AdminDashboard() {
  const stats = [
    { label: "Total Realtors", value: 128 },
    { label: "Total Recruits", value: 642 },
    { label: "Active Campaigns", value: 12 },
  ];

  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("-createdAt");

  const { data, error, mutate } = useSWR(
    `${API_URL}/api/realtors?page=${page}&limit=${limit}&search=${encodeURIComponent(
      search
    )}&sort=${sort}`,
    (url) => fetcher(url, token),
    { revalidateOnFocus: false }
  );

  const loading = !data && !error;
  const realtors = data?.docs || [];
  const total = data?.total || 0;
  const pages = data?.pages || 1;

  const goTo = (p) => {
    if (!data) return;
    if (p < 1 || p > pages || p === page) return;
    setPage(p);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    mutate();
  };

  const handleSortChange = (field) => {
    setSort((prev) => (prev === field ? `-${field}` : field));
    setPage(1);
  };

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
            <Card className="shadow-lg border border-gray-100 rounded-2xl">
              <CardContent className="p-6 text-center">
                <p className="text-4xl font-extrabold text-customPurple-700">
                  {s.value}
                </p>
                <p className="text-gray-600 mt-2">{s.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Search & Sort */}
      <form
        onSubmit={handleSearch}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4"
      >
        <input
          type="text"
          placeholder="Search by first name, last name, email, referral code"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border rounded-md w-full sm:w-64"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 bg-customPurple-700 text-white rounded-md hover:bg-customPurple-800"
          >
            Search
          </button>
          <select
            value={sort.replace("-", "")}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-4 py-2 border rounded-md"
          >
            <option value="createdAt">Created At</option>
            <option value="name">Name</option>
            <option value="referralCode">Referral Code</option>
            <option value="recruitedBy">Recruiter</option>
          </select>
        </div>
      </form>

      {/* Realtors table */}
      <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-700">
            Registered Realtors
          </h3>
          <div className="text-sm text-gray-500">
            {loading ? "Loading..." : `${total} total`}
          </div>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded">
            {error.message}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSortChange("referralCode")}
                >
                  ID
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSortChange("name")}
                >
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSortChange("recruitedBy")}
                >
                  Recruiter
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSortChange("createdAt")}
                >
                  Created At
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan="6" className="px-4 py-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                    </td>
                  </tr>
                ))
              ) : realtors.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No realtors found.
                  </td>
                </tr>
              ) : (
                realtors.map((r) => (
                  <tr key={r._id}>
                    <td className="px-4 py-4 text-sm font-medium text-gray-700">
                      {r.referralCode || "-"}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {r.name
                        ? r.name
                            .split(" ")
                            .map((w) => capitalize(w))
                            .join(" ")
                        : "-"}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {r.phone || "-"}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {r.email || "-"}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {r.recruitedByName || "-"}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {r.createdAt
                        ? new Date(r.createdAt).toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {page} of {pages} — {total} total
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => goTo(page - 1)}
              disabled={page <= 1 || loading}
              className="px-3 py-1 rounded-md border hover:bg-gray-100 disabled:opacity-50"
            >
              Prev
            </button>
            <div className="hidden sm:flex items-center space-x-1">
              {Array.from({ length: Math.min(pages, 5) }).map((_, idx) => {
                const start = Math.max(1, Math.min(page - 2, pages - 4));
                const p = start + idx;
                return (
                  <button
                    key={p}
                    onClick={() => goTo(p)}
                    className={`px-3 py-1 rounded-md border ${
                      p === page
                        ? "bg-customPurple-700 text-white"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              {pages > 5 && <span className="px-2">…</span>}
            </div>
            <button
              onClick={() => goTo(page + 1)}
              disabled={page >= pages || loading}
              className="px-3 py-1 rounded-md border hover:bg-gray-100 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
