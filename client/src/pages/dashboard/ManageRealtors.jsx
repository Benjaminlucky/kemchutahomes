"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { X, Eye, Edit2, Trash2, Download, ExternalLink } from "lucide-react";
import useSWR from "swr";

const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

const fetcher = (url, token) =>
  fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }).then(async (res) => {
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || "Failed to fetch");
    }
    return res.json();
  });

export default function ManageRealtors() {
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("-createdAt");

  // Modal states
  const [viewModal, setViewModal] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  // Edit form state
  const [editForm, setEditForm] = useState({});

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

  const handleSearch = () => {
    setPage(1);
    mutate();
  };

  const handleSortChange = (field) => {
    setSort((prev) => (prev === field ? `-${field}` : field));
    setPage(1);
  };

  // View realtor details
  const handleView = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/realtors/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const realtor = await res.json();
      setViewModal(realtor);
    } catch (err) {
      alert("Failed to fetch realtor details");
    }
  };

  // Open edit modal
  const handleEditOpen = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/realtors/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const realtor = await res.json();
      setEditForm(realtor);
      setEditModal(realtor);
    } catch (err) {
      alert("Failed to fetch realtor details");
    }
  };

  // Save edit
  const handleEditSave = async () => {
    try {
      const res = await fetch(`${API_URL}/api/realtors/${editModal._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      if (!res.ok) throw new Error("Failed to update");

      alert("Realtor updated successfully");
      setEditModal(null);
      mutate();
    } catch (err) {
      alert(err.message);
    }
  };

  // Delete realtor
  const handleDelete = async () => {
    try {
      const res = await fetch(`${API_URL}/api/realtors/${deleteModal._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete");

      alert("Realtor deleted successfully");
      setDeleteModal(null);
      mutate();
    } catch (err) {
      alert(err.message);
    }
  };

  // Export emails
  const handleExportEmails = () => {
    const emails = realtors.map((r) => r.email).join(", ");
    navigator.clipboard.writeText(emails);
    alert("Emails copied to clipboard!");
  };

  // Export phone numbers
  const handleExportPhones = () => {
    const phones = realtors.map((r) => r.phone).join(", ");
    navigator.clipboard.writeText(phones);
    alert("Phone numbers copied to clipboard!");
  };

  return (
    <div className="space-y-6 mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-customPurple-700">
          Manage Realtors
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handleExportEmails}
            className="px-4 py-2 bg-customPurple-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <Download size={16} />
            Export Emails
          </button>
          <button
            onClick={handleExportPhones}
            className="px-4 py-2 bg-customPurple-800 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
          >
            <Download size={16} />
            Export Phones
          </button>
        </div>
      </div>

      {/* Search & Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Search by name, email, referral code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          className="px-4 py-2 border rounded-md w-full sm:w-96"
        />
        <div className="flex gap-2">
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-customPurple-400 text-white rounded-md hover:bg-[#7a1a1a]"
          >
            Search
          </button>
          <select
            value={sort.replace("-", "")}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-4 py-2 border rounded-md"
          >
            <option value="createdAt">Created At</option>
            <option value="firstName">First Name</option>
            <option value="lastName">Last Name</option>
            <option value="referralCode">Referral Code</option>
          </select>
        </div>
      </div>

      {/* Realtors table */}
      <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-700">All Realtors</h3>
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  First Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Last Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Phone
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Bank
                </th>

                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Account No.
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan="7" className="px-4 py-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                    </td>
                  </tr>
                ))
              ) : realtors.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No realtors found.
                  </td>
                </tr>
              ) : (
                realtors.map((r) => (
                  <tr key={r._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm font-medium text-gray-700">
                      {r.referralCode || "-"}
                    </td>
                    <td>{r.name?.split(" ")[0] || "-"}</td>
                    <td>{r.name?.split(" ")[1] || "-"}</td>

                    <td className="px-4 py-4 text-sm text-gray-700">
                      {r.email || "-"}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {r.phone || "-"}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {r.bank || "-"}
                    </td>

                    <td className="px-4 py-4 text-sm text-gray-700">
                      {r.accountNumber || "-"}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(r._id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEditOpen(r._id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-md"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteModal(r)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
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

      {/* View Modal */}
      <AnimatePresence>
        {viewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setViewModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">
                  Realtor Details
                </h3>
                <button
                  onClick={() => setViewModal(null)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Avatar */}
                <div className="flex justify-center">
                  <img
                    src={
                      viewModal.avatar ||
                      "https://ui-avatars.com/api/?name=User"
                    }
                    alt="Avatar"
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                  />
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <DetailItem label="First Name" value={viewModal.firstName} />
                  <DetailItem label="Last Name" value={viewModal.lastName} />
                  <DetailItem label="Email" value={viewModal.email} />
                  <DetailItem label="Phone" value={viewModal.phone} />
                  <DetailItem
                    label="Birth Date"
                    value={
                      viewModal.birthDate
                        ? new Date(viewModal.birthDate).toLocaleDateString()
                        : "-"
                    }
                  />
                  <DetailItem label="State" value={viewModal.state} />
                  <DetailItem label="Bank" value={viewModal.bank} />
                  <DetailItem
                    label="Account Name"
                    value={viewModal.accountName}
                  />
                  <DetailItem
                    label="Account Number"
                    value={viewModal.accountNumber}
                  />
                  <DetailItem
                    label="Referral Code"
                    value={viewModal.referralCode}
                  />
                  <DetailItem
                    label="Recruited By"
                    value={viewModal.recruitedByName || "Direct"}
                  />
                  <DetailItem
                    label="Created At"
                    value={
                      viewModal.createdAt
                        ? new Date(viewModal.createdAt).toLocaleString()
                        : "-"
                    }
                  />
                </div>

                {/* Referral Link */}
                <div className="border-t pt-4">
                  <label className="text-sm font-medium text-gray-600">
                    Referral Link
                  </label>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="text"
                      value={`https://pcrg.netlify.app/sign-up?ref=${viewModal.referralCode}`}
                      readOnly
                      className="flex-1 px-3 py-2 border rounded-md bg-gray-50 text-sm"
                    />
                    <a
                      href={`https://pcrg.netlify.app/sign-up?ref=${viewModal.referralCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                    >
                      <ExternalLink size={20} />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setEditModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">
                  Edit Realtor
                </h3>
                <button
                  onClick={() => setEditModal(null)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="First Name"
                    value={editForm.firstName || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, firstName: e.target.value })
                    }
                  />
                  <FormField
                    label="Last Name"
                    value={editForm.lastName || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, lastName: e.target.value })
                    }
                  />
                  <FormField
                    label="Email"
                    type="email"
                    value={editForm.email || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                  />
                  <FormField
                    label="Phone"
                    value={editForm.phone || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, phone: e.target.value })
                    }
                  />
                  <FormField
                    label="State"
                    value={editForm.state || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, state: e.target.value })
                    }
                  />
                  <FormField
                    label="Bank"
                    value={editForm.bank || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, bank: e.target.value })
                    }
                  />
                  <FormField
                    label="Account Name"
                    value={editForm.accountName || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, accountName: e.target.value })
                    }
                  />
                  <FormField
                    label="Account Number"
                    value={editForm.accountNumber || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        accountNumber: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => setEditModal(null)}
                    className="px-4 py-2 border rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditSave}
                    className="px-4 py-2 bg-[#561010] text-white rounded-md hover:bg-[#7a1a1a]"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setDeleteModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
                  <Trash2 className="text-red-600" size={24} />
                </div>

                <h3 className="text-xl font-bold text-gray-800 text-center mt-4">
                  Delete Realtor?
                </h3>
                <p className="text-gray-600 text-center mt-2">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold">
                    {deleteModal.firstName} {deleteModal.lastName}
                  </span>
                  ? This action cannot be undone.
                </p>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setDeleteModal(null)}
                    className="flex-1 px-4 py-2 border rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper Components
const DetailItem = ({ label, value }) => (
  <div>
    <label className="text-sm font-medium text-gray-600">{label}</label>
    <p className="text-gray-800 mt-1">{value || "-"}</p>
  </div>
);

const FormField = ({ label, value, onChange, type = "text" }) => (
  <div>
    <label className="text-sm font-medium text-gray-600">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 border rounded-md mt-1 focus:outline-none focus:ring-2 focus:ring-[#561010]"
    />
  </div>
);
