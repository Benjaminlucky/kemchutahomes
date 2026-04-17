import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSWR from "swr";
import {
  TrendingUp,
  Save,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2,
  ChevronDown,
  X,
} from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const PURPLE = "#700CEB";
const PURPLE_DARK = "#3F0C91";

// ── Auth fetcher ──────────────────────────────────────────────────────────────
const token = () => localStorage.getItem("token");
const fetcher = async (url) => {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token()}` },
  });
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
const fmtNGN = (n) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(n);

const STATUS_COLORS = {
  new: { bg: "rgba(59,130,246,0.1)", color: "#2563eb" },
  contacted: { bg: "rgba(245,158,11,0.1)", color: "#d97706" },
  converted: { bg: "rgba(34,197,94,0.1)", color: "#16a34a" },
  closed: { bg: "rgba(107,114,128,0.1)", color: "#6b7280" },
};

function StatusPill({ status }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.new;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold capitalize"
      style={{ background: s.bg, color: s.color }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: s.color }}
      />
      {status}
    </span>
  );
}

function Skeleton({ className = "" }) {
  return (
    <div className={`bg-gray-100 animate-pulse rounded-xl ${className}`} />
  );
}

// ── ROI Settings Panel ────────────────────────────────────────────────────────
function ROIPanel() {
  const {
    data: roi,
    error,
    isLoading,
    mutate,
  } = useSWR(`${BASE_URL}/api/buy2sell/roi`, fetcher, {
    revalidateOnFocus: false,
  });

  const [fields, setFields] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");

  // Initialise editable fields from API data
  const roiData = fields || roi;

  const setField = (k, v) => {
    setFields((prev) => ({ ...(prev || roi), [k]: v }));
    setSaved(false);
    setErr("");
  };

  const handleSave = async () => {
    setSaving(true);
    setErr("");
    try {
      const res = await fetch(`${BASE_URL}/api/buy2sell/roi`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({
          roiPercent6Months: Number(roiData.roiPercent6Months),
          roiPercent1Year: Number(roiData.roiPercent1Year),
          roiPercent18Months: Number(roiData.roiPercent18Months),
          minInvestment: Number(roiData.minInvestment),
          description: roiData.description || "",
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.message);
      mutate(d.settings, false);
      setFields(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading)
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    );

  if (error)
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-600 text-sm">
        Failed to load ROI settings. Check your connection.
      </div>
    );

  const roiFields = [
    { key: "roiPercent6Months", label: "6 Months ROI", icon: "6M" },
    { key: "roiPercent1Year", label: "1 Year ROI", icon: "1Y" },
    { key: "roiPercent18Months", label: "18 Months ROI", icon: "18M" },
  ];

  return (
    <div className="space-y-5">
      {/* ROI % inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {roiFields.map(({ key, label, icon }) => (
          <div
            key={key}
            className="bg-white rounded-2xl p-5 border border-gray-100"
            style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {label}
              </span>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white"
                style={{
                  background: `linear-gradient(135deg,${PURPLE_DARK},${PURPLE})`,
                }}
              >
                {icon}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="500"
                step="0.5"
                value={roiData?.[key] ?? ""}
                onChange={(e) => setField(key, e.target.value)}
                className="w-full text-2xl font-black text-gray-900 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-customPurple-400 transition-colors"
                style={{ fontFamily: "inherit" }}
              />
              <span className="text-2xl font-black text-gray-400">%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Min investment */}
      <div
        className="bg-white rounded-2xl p-5 border border-gray-100"
        style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
      >
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
          Minimum Investment (NGN)
        </label>
        <input
          type="number"
          min="0"
          step="50000"
          value={roiData?.minInvestment ?? ""}
          onChange={(e) => setField("minInvestment", e.target.value)}
          className="w-full text-xl font-bold text-gray-900 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-customPurple-400 transition-colors"
          style={{ fontFamily: "inherit" }}
        />
        <p className="text-xs text-gray-400 mt-1">
          Currently:{" "}
          {roiData?.minInvestment ? fmtNGN(roiData.minInvestment) : "—"}
        </p>
      </div>

      {/* Notes */}
      <div
        className="bg-white rounded-2xl p-5 border border-gray-100"
        style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
      >
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
          Admin Notes (internal only)
        </label>
        <textarea
          rows={3}
          value={roiData?.description ?? ""}
          onChange={(e) => setField("description", e.target.value)}
          placeholder="e.g. Rates updated for Q2 2025 due to market appreciation..."
          className="w-full text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-customPurple-400 transition-colors resize-none"
          style={{ fontFamily: "inherit" }}
        />
      </div>

      {/* Last updated */}
      {roi?.updatedAt && (
        <p className="text-xs text-gray-400">
          Last updated: {fmtDate(roi.updatedAt)} by {roi.updatedBy || "admin"}
        </p>
      )}

      {err && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600 font-medium">{err}</p>
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60"
        style={{
          background: `linear-gradient(135deg,${PURPLE_DARK},${PURPLE})`,
          boxShadow: "0 4px 12px rgba(112,12,235,0.3)",
        }}
      >
        {saving ? (
          <>
            <Loader2 size={15} className="animate-spin" /> Saving...
          </>
        ) : saved ? (
          <>
            <CheckCircle size={15} /> Saved!
          </>
        ) : (
          <>
            <Save size={15} /> Save ROI Settings
          </>
        )}
      </button>
    </div>
  );
}

// ── Lead row status updater ────────────────────────────────────────────────────
function LeadStatusDropdown({ lead, onUpdate }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const update = async (status) => {
    setSaving(true);
    setOpen(false);
    try {
      const res = await fetch(
        `${BASE_URL}/api/buy2sell/leads/${lead._id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token()}`,
          },
          body: JSON.stringify({ status }),
        },
      );
      if (!res.ok) throw new Error();
      onUpdate(lead._id, status);
    } catch {
      /* silent */
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={saving}
        className="flex items-center gap-1"
      >
        <StatusPill status={lead.status} />
        {saving ? (
          <Loader2 size={11} className="animate-spin text-gray-400" />
        ) : (
          <ChevronDown size={11} className="text-gray-400" />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute left-0 top-8 z-20 bg-white rounded-xl shadow-xl border border-gray-100 py-1 min-w-[130px]"
            >
              {["new", "contacted", "converted", "closed"].map((s) => (
                <button
                  key={s}
                  onClick={() => update(s)}
                  className="w-full text-left px-3 py-2 text-xs font-bold hover:bg-gray-50 capitalize transition-colors"
                  style={{ color: STATUS_COLORS[s]?.color || "#374151" }}
                >
                  {s}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Leads Table ───────────────────────────────────────────────────────────────
function LeadsTable() {
  const [page, setPage] = useState(1);
  const [statusFilter, setFilter] = useState("");
  const [leads, setLeads] = useState([]);

  const { data, error, isLoading } = useSWR(
    `${BASE_URL}/api/buy2sell/leads?page=${page}&limit=15${statusFilter ? `&status=${statusFilter}` : ""}`,
    fetcher,
    { revalidateOnFocus: false },
  );

  // Merge SWR data into local state for optimistic updates
  React.useEffect(() => {
    if (data?.leads) setLeads(data.leads);
  }, [data]);

  const onUpdate = useCallback((id, status) => {
    setLeads((prev) => prev.map((l) => (l._id === id ? { ...l, status } : l)));
  }, []);

  const pages = data?.pages || 1;

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
      style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
    >
      {/* Filter bar */}
      <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-black text-gray-900">Leads</h4>
          <p className="text-xs text-gray-400 mt-0.5">
            {data?.total ?? "—"} total enquiries
          </p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setFilter(e.target.value);
            setPage(1);
          }}
          className="text-xs font-bold border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-customPurple-400 bg-white"
          style={{ fontFamily: "inherit" }}
        >
          <option value="">All Statuses</option>
          {["new", "contacted", "converted", "closed"].map((s) => (
            <option key={s} value={s} className="capitalize">
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50/80">
              {[
                "Name",
                "Email",
                "Phone",
                "Duration",
                "ROI",
                "Status",
                "Date",
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={7} className="px-4 py-3">
                    <div className="h-4 bg-gray-100 animate-pulse rounded-lg" />
                  </td>
                </tr>
              ))
            ) : error ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-12 text-center text-sm text-red-500"
                >
                  Failed to load leads
                </td>
              </tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center">
                  <Users size={32} className="mx-auto text-gray-200 mb-3" />
                  <p className="text-sm font-bold text-gray-400">
                    No leads yet
                  </p>
                </td>
              </tr>
            ) : (
              leads.map((lead, i) => (
                <motion.tr
                  key={lead._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="hover:bg-purple-50/20 transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-semibold text-gray-800 whitespace-nowrap">
                    {lead.fullName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                    {lead.email}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                    {lead.phone}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <Clock size={11} className="text-gray-400" />
                      <span className="text-xs font-bold text-gray-600">
                        {lead.duration}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className="text-sm font-black"
                      style={{ color: PURPLE }}
                    >
                      {lead.roiPercent}%
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <LeadStatusDropdown lead={lead} onUpdate={onUpdate} />
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                    {fmtDate(lead.createdAt)}
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            Page {page} of {pages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-xs font-bold border border-gray-200 rounded-lg disabled:opacity-40 transition-all"
            >
              ← Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="px-3 py-1.5 text-xs font-bold border border-gray-200 rounded-lg disabled:opacity-40 transition-all"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ManageBuy2Sell() {
  const [tab, setTab] = useState("roi"); // "roi" | "leads"

  return (
    <div className="space-y-6 mt-4 sm:mt-8 pb-10">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div
          className="w-1 h-7 rounded-full"
          style={{
            background: `linear-gradient(to bottom,${PURPLE_DARK},${PURPLE})`,
          }}
        />
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Buy2Sell Scheme
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Manage ROI settings and investor leads
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-0">
        {[
          { key: "roi", label: "ROI Settings", icon: TrendingUp },
          { key: "leads", label: "Leads", icon: Users },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="flex items-center gap-2 px-4 py-3 text-sm font-bold transition-all border-b-2 -mb-px"
            style={{
              borderColor: tab === key ? PURPLE : "transparent",
              color: tab === key ? PURPLE : "#6b7280",
            }}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {tab === "roi" && <ROIPanel />}
          {tab === "leads" && <LeadsTable />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
