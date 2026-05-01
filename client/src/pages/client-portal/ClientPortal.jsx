import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, Routes, Route, useLocation, Navigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaClipboardList,
  FaCalendarCheck,
  FaFileAlt,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import {
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  MapPin,
  Home,
  Building2,
  TrendingUp,
  BarChart3,
  ChevronRight,
  User,
  Phone,
  Mail,
  Calendar,
  FileText,
  Eye,
  Loader2,
  Search,
  Filter,
  Download,
  ExternalLink,
  RefreshCw,
  CreditCard,
  Wallet,
  ArrowDown,
  Shield,
  Star,
} from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const defaultAvatar =
  "https://ui-avatars.com/api/?name=Client&background=700CEB&color=fff";

// ── Auth helpers (mirrors realtor pattern) ─────────────────────────────────
const getClientToken = () => localStorage.getItem("clientToken");
const getClientUser = () => {
  try {
    return JSON.parse(localStorage.getItem("clientUser"));
  } catch {
    return null;
  }
};

const authFetch = (url, opts = {}) =>
  fetch(`${BASE_URL}${url}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getClientToken()}`,
      ...opts.headers,
    },
  });

// ── Status badge helpers ───────────────────────────────────────────────────
const STATUS_META = {
  pending: {
    color: "#d97706",
    bg: "rgba(217,119,6,0.1)",
    border: "rgba(217,119,6,0.25)",
    Icon: Clock,
    label: "Pending",
  },
  reviewed: {
    color: "#700CEB",
    bg: "rgba(112,12,235,0.1)",
    border: "rgba(112,12,235,0.25)",
    Icon: CheckCircle,
    label: "Reviewed",
  },
  approved: {
    color: "#059669",
    bg: "rgba(5,150,105,0.1)",
    border: "rgba(5,150,105,0.25)",
    Icon: CheckCircle,
    label: "Approved",
  },
  rejected: {
    color: "#dc2626",
    bg: "rgba(220,38,38,0.1)",
    border: "rgba(220,38,38,0.25)",
    Icon: XCircle,
    label: "Rejected",
  },
  confirmed: {
    color: "#700CEB",
    bg: "rgba(112,12,235,0.1)",
    border: "rgba(112,12,235,0.25)",
    Icon: CheckCircle,
    label: "Confirmed",
  },
  cancelled: {
    color: "#dc2626",
    bg: "rgba(220,38,38,0.1)",
    border: "rgba(220,38,38,0.25)",
    Icon: XCircle,
    label: "Cancelled",
  },
  completed: {
    color: "#059669",
    bg: "rgba(5,150,105,0.1)",
    border: "rgba(5,150,105,0.25)",
    Icon: CheckCircle,
    label: "Completed",
  },
  payment_confirmed: {
    color: "#059669",
    bg: "rgba(5,150,105,0.1)",
    border: "rgba(5,150,105,0.25)",
    Icon: CreditCard,
    label: "Payment Confirmed",
  },
  allocated: {
    color: "#700CEB",
    bg: "rgba(112,12,235,0.06)",
    border: "rgba(112,12,235,0.2)",
    Icon: Shield,
    label: "Allocated",
  },
  active: {
    color: "#059669",
    bg: "rgba(5,150,105,0.1)",
    border: "rgba(5,150,105,0.25)",
    Icon: TrendingUp,
    label: "Active",
  },
  matured: {
    color: "#d97706",
    bg: "rgba(217,119,6,0.1)",
    border: "rgba(217,119,6,0.25)",
    Icon: Star,
    label: "Matured",
  },
  paid_out: {
    color: "#059669",
    bg: "rgba(5,150,105,0.1)",
    border: "rgba(5,150,105,0.25)",
    Icon: CheckCircle,
    label: "Paid Out",
  },
};

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.pending;
  const { Icon } = meta;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
      style={{
        background: meta.bg,
        color: meta.color,
        border: `1px solid ${meta.border}`,
      }}
    >
      <Icon size={11} />
      {meta.label}
    </span>
  );
}

function formatCurrency(n) {
  return n
    ? new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        minimumFractionDigits: 0,
      }).format(n)
    : "—";
}

function formatDate(d) {
  return d
    ? new Date(d).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";
}

// ── Loading & Error screens (mirrors RealtorDashboard.jsx pattern) ─────────
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FD]">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-customPurple-100 border-t-customPurple-500 rounded-full animate-spin" />
        <p className="mt-4 text-customBlack-400 font-bold tracking-widest uppercase text-xs">
          Loading Your Portal...
        </p>
      </div>
    </div>
  );
}

function ErrorScreen({ error, onRetry }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-sm text-center">
        <div className="text-red-500 mb-4 inline-block bg-red-50 p-4 rounded-full">
          <AlertTriangle size={32} />
        </div>
        <h2 className="text-xl font-bold text-customBlack-900 mb-2">
          Access Error
        </h2>
        <p className="text-customBlack-500 text-sm mb-6">{error}</p>
        <button
          onClick={onRetry}
          className="w-full bg-customBlack-900 text-white py-3 rounded-2xl font-bold hover:bg-customBlack-800 transition-colors"
        >
          Retry Connection
        </button>
      </div>
    </div>
  );
}

// ── Stat Card (mirrors RealtorDashboard StatCard) ──────────────────────────
function StatCard({ label, value, icon: Icon, color, delay, subtext }) {
  return (
    <div
      className="bg-white rounded-3xl p-6 shadow-sm border border-customBlack-100 flex flex-col justify-between group hover:shadow-xl transition-all duration-500 animate-fadeIn"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className={`${color} bg-current/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
      >
        <Icon size={22} className="w-6 h-6" />
      </div>
      <div>
        <p className="text-customBlack-400 text-xs font-bold uppercase tracking-widest mb-1">
          {label}
        </p>
        <p className="text-3xl font-black text-customBlack-900">{value}</p>
        {subtext && (
          <p className="text-xs text-customBlack-400 mt-1">{subtext}</p>
        )}
      </div>
      <div className="mt-4 h-1 w-full bg-customBlack-50 rounded-full overflow-hidden">
        <div className="h-full bg-customPurple-500 w-0 group-hover:w-full transition-all duration-1000 ease-out" />
      </div>
    </div>
  );
}

// ── Overview Tab ───────────────────────────────────────────────────────────
function OverviewTab({ dashData }) {
  const { stats, recentSubscriptions, recentInspections } = dashData;

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          label="Total Subscriptions"
          value={stats.totalSubscriptions}
          icon={FaClipboardList}
          color="text-customPurple-600"
          delay={0}
        />
        <StatCard
          label="Approved"
          value={stats.approvedSubscriptions}
          icon={CheckCircle}
          color="text-green-600"
          delay={100}
        />
        <StatCard
          label="Pending"
          value={stats.pendingSubscriptions}
          icon={Clock}
          color="text-amber-600"
          delay={200}
          subtext="Under review"
        />
        <StatCard
          label="Inspections"
          value={stats.totalInspections}
          icon={FaCalendarCheck}
          color="text-blue-600"
          delay={300}
          subtext={`${stats.upcomingInspections} upcoming`}
        />
      </div>

      {/* Recent Subscriptions */}
      {recentSubscriptions.length > 0 && (
        <section
          className="bg-white rounded-[2rem] shadow-sm border border-customBlack-100 overflow-hidden animate-fadeIn"
          style={{ animationDelay: "400ms" }}
        >
          <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-customBlack-50">
            <div>
              <h3 className="text-2xl font-bold text-customBlack-900">
                Recent Subscriptions
              </h3>
              <p className="text-customBlack-400 font-medium">
                Your land purchase applications
              </p>
            </div>
            <Link
              to="/client/portal/subscriptions"
              className="flex items-center gap-1.5 text-customPurple-600 text-sm font-bold hover:underline"
            >
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-customBlack-50">
            {recentSubscriptions.map((sub) => (
              <div
                key={sub._id}
                className="px-6 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-customPurple-50/30 transition-colors"
              >
                <div>
                  <p className="font-bold text-customBlack-900">
                    {sub.estateName}
                  </p>
                  <p className="text-xs text-customBlack-400">
                    {sub.plotSize} · {sub.plotType} · {sub.numberOfPlots} plot
                    {sub.numberOfPlots > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="text-sm font-bold text-customPurple-700">
                    {formatCurrency(sub.totalAmount)}
                  </span>
                  <StatusBadge status={sub.status} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent Inspections */}
      {recentInspections.length > 0 && (
        <section
          className="bg-white rounded-[2rem] shadow-sm border border-customBlack-100 overflow-hidden animate-fadeIn"
          style={{ animationDelay: "500ms" }}
        >
          <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-customBlack-50">
            <div>
              <h3 className="text-2xl font-bold text-customBlack-900">
                Inspection Bookings
              </h3>
              <p className="text-customBlack-400 font-medium">
                Your site visit schedule
              </p>
            </div>
            <Link
              to="/client/portal/inspections"
              className="flex items-center gap-1.5 text-customPurple-600 text-sm font-bold hover:underline"
            >
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-customBlack-50">
            {recentInspections.map((insp) => (
              <div
                key={insp._id}
                className="px-6 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-customPurple-50/30 transition-colors"
              >
                <div>
                  <p className="font-bold text-customBlack-900">
                    {insp.estateName}
                  </p>
                  <p className="text-xs text-customBlack-400 flex items-center gap-1.5">
                    <Calendar size={11} />
                    {formatDate(insp.inspectionDate)} · {insp.persons} person
                    {insp.persons > 1 ? "s" : ""}
                  </p>
                </div>
                <StatusBadge status={insp.status} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {recentSubscriptions.length === 0 && recentInspections.length === 0 && (
        <div className="bg-white rounded-[2rem] shadow-sm border border-customBlack-100 p-16 text-center animate-fadeIn">
          <div className="w-16 h-16 bg-customPurple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Home size={28} className="text-customPurple-500" />
          </div>
          <h3 className="text-xl font-bold text-customBlack-900 mb-2">
            No activity yet
          </h3>
          <p className="text-customBlack-400 text-sm mb-6">
            Your subscription and inspection history will appear here once you
            make a booking.
          </p>
          <Link
            to="/developments"
            className="inline-flex items-center gap-2 bg-customPurple-500 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-customPurple-700 transition-colors"
          >
            Explore Estates
          </Link>
        </div>
      )}
    </div>
  );
}

// ── Subscriptions Tab ──────────────────────────────────────────────────────
function PaymentProgress({ sub }) {
  const pct = Math.min(
    100,
    Math.round(((sub.amountPaid || 0) / sub.totalAmount) * 100),
  );
  const balance = sub.totalAmount - (sub.amountPaid || 0);
  return (
    <div className="mt-3 p-3 rounded-xl bg-customPurple-50/60 border border-customPurple-100">
      <div className="flex justify-between text-xs font-bold mb-1.5">
        <span className="text-customBlack-500">Payment Progress</span>
        <span className="text-customPurple-600">{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-customPurple-100 overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(to right,#3F0C91,#700CEB)",
          }}
        />
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <p className="text-customBlack-400">Paid</p>
          <p className="font-black text-green-600">
            {formatCurrency(sub.amountPaid || 0)}
          </p>
        </div>
        <div>
          <p className="text-customBlack-400">Balance</p>
          <p className="font-black text-red-500">{formatCurrency(balance)}</p>
        </div>
        <div>
          <p className="text-customBlack-400">Total</p>
          <p className="font-black text-customPurple-700">
            {formatCurrency(sub.totalAmount)}
          </p>
        </div>
      </div>
      {sub.installmentSchedule?.length > 0 && (
        <div className="mt-2 pt-2 border-t border-customPurple-100">
          <p className="text-xs font-bold text-customBlack-400 mb-1">
            Next Due
          </p>
          {(() => {
            const next = sub.installmentSchedule.find((s) => !s.isPaid);
            return next ? (
              <p className="text-xs font-black text-amber-600">
                {formatCurrency(next.amount)} — {formatDate(next.dueDate)}
              </p>
            ) : (
              <p className="text-xs font-bold text-green-600">
                All instalments paid ✓
              </p>
            );
          })()}
        </div>
      )}
    </div>
  );
}

function SubscriptionsTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page,
          limit: 10,
          ...(status && { status }),
        });
        const res = await authFetch(`/api/subscriptions/my`);
        if (!res.ok) throw new Error("Failed to load subscriptions");
        const subs = await res.json();
        setData({ subscriptions: subs, pages: 1, total: subs.length });
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, status]);

  const STATUSES = [
    "",
    "pending",
    "reviewed",
    "approved",
    "payment_confirmed",
    "allocated",
    "rejected",
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-customBlack-900">
            My Subscriptions
          </h3>
          <p className="text-customBlack-400 font-medium text-sm mt-1">
            All your land purchase applications
          </p>
        </div>
        {/* Status filter */}
        <div className="flex items-center gap-2 flex-wrap">
          {STATUSES.map((s) => {
            const meta = s ? STATUS_META[s] : null;
            return (
              <button
                key={s || "all"}
                onClick={() => {
                  setStatus(s);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  status === s
                    ? "bg-customPurple-500 text-white shadow-md"
                    : "bg-customBlack-50 text-customBlack-500 hover:bg-customPurple-50"
                }`}
              >
                {s ? meta?.label : "All"}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-customBlack-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="text-customPurple-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="py-16 text-center text-red-500 text-sm">{error}</div>
        ) : data?.subscriptions?.length === 0 ? (
          <div className="py-20 text-center">
            <FaClipboardList
              size={40}
              className="mx-auto text-customBlack-200 mb-4"
            />
            <p className="font-bold text-customBlack-500">
              No subscriptions found
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-customBlack-50/50">
                    {[
                      "Estate",
                      "Plot Details",
                      "Amount",
                      "Payment Plan",
                      "Status",
                      "Date",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-4 text-xs font-bold text-customBlack-400 uppercase tracking-widest"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-customBlack-50">
                  {data.subscriptions.map((sub) => (
                    <>
                      <tr
                        key={sub._id}
                        className="hover:bg-customPurple-50/30 transition-colors cursor-pointer"
                        onClick={() =>
                          setExpanded((e) => ({ ...e, [sub._id]: !e[sub._id] }))
                        }
                      >
                        <td className="px-6 py-4">
                          <p className="font-bold text-customBlack-900 text-sm">
                            {sub.estateName}
                          </p>
                          <p className="text-xs text-customBlack-400 font-mono">
                            {sub.referenceNumber}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-sm text-customBlack-600">
                          {sub.numberOfPlots} × {sub.plotSize}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-customPurple-700 text-sm">
                            {formatCurrency(sub.totalAmount)}
                          </p>
                          {sub.amountPaid > 0 && (
                            <p className="text-xs text-green-600 font-bold">
                              {formatCurrency(sub.amountPaid)} paid
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-customBlack-600">
                          {sub.paymentPlan}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={sub.status} />
                        </td>
                        <td className="px-6 py-4 text-sm text-customBlack-400">
                          {formatDate(sub.createdAt)}
                        </td>
                      </tr>
                      {expanded[sub._id] && (
                        <tr key={sub._id + "-detail"}>
                          <td
                            colSpan={6}
                            className="px-6 pb-4 pt-0 bg-customPurple-50/40"
                          >
                            <PaymentProgress sub={sub} />
                            {sub.plotNumber && (
                              <div className="mt-2 p-3 rounded-xl bg-green-50 border border-green-200 flex items-center gap-2">
                                <Shield size={14} className="text-green-600" />
                                <p className="text-xs font-bold text-green-700">
                                  Plot Allocated: {sub.plotNumber}
                                </p>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-customBlack-50">
              {data.subscriptions.map((sub) => (
                <div
                  key={sub._id}
                  className="p-4 hover:bg-customPurple-50/20 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-customBlack-900 text-sm">
                        {sub.estateName}
                      </p>
                      <p className="text-xs text-customBlack-400">
                        {sub.numberOfPlots} × {sub.plotSize} · {sub.plotType}
                      </p>
                    </div>
                    <StatusBadge status={sub.status} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-customPurple-700 text-sm">
                      {formatCurrency(sub.totalAmount)}
                    </span>
                    <span className="text-xs text-customBlack-400">
                      {formatDate(sub.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {data.pages > 1 && (
              <div className="flex items-center justify-center gap-2 p-6 border-t border-customBlack-50">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-customBlack-50 text-customBlack-500 disabled:opacity-40 hover:bg-customPurple-50 transition"
                >
                  Previous
                </button>
                <span className="text-sm text-customBlack-500">
                  Page {page} of {data.pages}
                </span>
                <button
                  disabled={page === data.pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-customBlack-50 text-customBlack-500 disabled:opacity-40 hover:bg-customPurple-50 transition"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Inspections Tab ────────────────────────────────────────────────────────
function InspectionsTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page,
          limit: 10,
          ...(status && { status }),
        });
        const res = await authFetch(`/api/clients/inspections?${params}`);
        if (!res.ok) throw new Error("Failed to load inspections");
        setData(await res.json());
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, status]);

  const INSPECTION_STATUSES = [
    "",
    "pending",
    "confirmed",
    "completed",
    "cancelled",
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-customBlack-900">
            Inspection Bookings
          </h3>
          <p className="text-customBlack-400 font-medium text-sm mt-1">
            Your site visit schedule
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {INSPECTION_STATUSES.map((s) => (
            <button
              key={s || "all"}
              onClick={() => {
                setStatus(s);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                status === s
                  ? "bg-customPurple-500 text-white shadow-md"
                  : "bg-customBlack-50 text-customBlack-500 hover:bg-customPurple-50"
              }`}
            >
              {s ? STATUS_META[s]?.label || s : "All"}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-customBlack-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="text-customPurple-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="py-16 text-center text-red-500 text-sm">{error}</div>
        ) : data?.inspections?.length === 0 ? (
          <div className="py-20 text-center">
            <FaCalendarCheck
              size={40}
              className="mx-auto text-customBlack-200 mb-4"
            />
            <p className="font-bold text-customBlack-500">
              No inspections found
            </p>
          </div>
        ) : (
          <>
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-customBlack-50/50">
                    {["Estate", "Date", "Persons", "Status", "Booked On"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-6 py-4 text-xs font-bold text-customBlack-400 uppercase tracking-widest"
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-customBlack-50">
                  {data.inspections.map((insp) => (
                    <tr
                      key={insp._id}
                      className="hover:bg-customPurple-50/30 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-customBlack-900 text-sm">
                        {insp.estateName}
                      </td>
                      <td className="px-6 py-4 text-sm text-customBlack-600">
                        {new Date(insp.inspectionDate).toLocaleDateString(
                          "en-NG",
                          {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-customBlack-600">
                        {insp.persons} person{insp.persons > 1 ? "s" : ""}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={insp.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-customBlack-400">
                        {formatDate(insp.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-customBlack-50">
              {data.inspections.map((insp) => (
                <div key={insp._id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-customBlack-900 text-sm">
                      {insp.estateName}
                    </p>
                    <StatusBadge status={insp.status} />
                  </div>
                  <p className="text-xs text-customBlack-400 flex items-center gap-1.5">
                    <Calendar size={11} />
                    {new Date(insp.inspectionDate).toLocaleDateString("en-NG", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                    · {insp.persons} person{insp.persons > 1 ? "s" : ""}
                  </p>
                </div>
              ))}
            </div>

            {data.pages > 1 && (
              <div className="flex items-center justify-center gap-2 p-6 border-t border-customBlack-50">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-customBlack-50 text-customBlack-500 disabled:opacity-40 hover:bg-customPurple-50 transition"
                >
                  Previous
                </button>
                <span className="text-sm text-customBlack-500">
                  Page {page} of {data.pages}
                </span>
                <button
                  disabled={page === data.pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-customBlack-50 text-customBlack-500 disabled:opacity-40 hover:bg-customPurple-50 transition"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Documents Tab ──────────────────────────────────────────────────────────
const DOC_META = {
  acknowledgement: {
    label: "Subscription Acknowledgement",
    icon: FileText,
    color: "#700CEB",
    desc: "Confirms receipt of your application",
  },
  contract: {
    label: "Contract of Sale",
    icon: Shield,
    color: "#059669",
    desc: "Official purchase agreement — sign and return",
  },
  invoice: {
    label: "Payment Invoice",
    icon: CreditCard,
    color: "#d97706",
    desc: "Payment details and bank account",
  },
  schedule: {
    label: "Instalment Schedule",
    icon: Calendar,
    color: "#0891b2",
    desc: "Your monthly payment breakdown",
  },
  receipt: {
    label: "Payment Receipt",
    icon: CheckCircle,
    color: "#059669",
    desc: "Proof of payment received",
  },
  allocation: {
    label: "Letter of Allocation",
    icon: Star,
    color: "#700CEB",
    desc: "Official plot allocation certificate",
  },
  certificate: {
    label: "Investment Certificate",
    icon: Star,
    color: "#700CEB",
    desc: "Buy2Sell investment certificate",
  },
  agreement: {
    label: "Investment Agreement",
    icon: Shield,
    color: "#059669",
    desc: "Buy2Sell investment agreement",
  },
  payout_confirmation: {
    label: "Payout Confirmation",
    icon: Wallet,
    color: "#059669",
    desc: "Investment payout confirmation letter",
  },
};

function DocumentCard({ doc, subId, isBuy2Sell }) {
  const [downloading, setDownloading] = useState(false);
  const meta = DOC_META[doc.type] || {
    label: doc.label,
    icon: FileText,
    color: "#700CEB",
    desc: "",
  };
  const Icon = meta.icon;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const endpoint = isBuy2Sell
        ? `/api/buy2sell/leads/${subId}/documents/${doc.type}`
        : `/api/subscriptions/${subId}/documents/${doc.type}`;
      const res = await authFetch(endpoint);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${doc.label.replace(/\s+/g, "-")}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-2xl border border-customBlack-100 bg-white hover:shadow-sm transition-all">
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: `${meta.color}12`,
            border: `1px solid ${meta.color}22`,
          }}
        >
          <Icon size={17} style={{ color: meta.color }} />
        </div>
        <div>
          <p className="font-bold text-customBlack-900 text-sm">
            {doc.label || meta.label}
          </p>
          <p className="text-xs text-customBlack-400">
            {meta.desc} · {formatDate(doc.generatedAt)}
          </p>
        </div>
      </div>
      <button
        onClick={handleDownload}
        disabled={downloading}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:-translate-y-0.5 disabled:opacity-50"
        style={{
          background: `${meta.color}12`,
          color: meta.color,
          border: `1px solid ${meta.color}22`,
        }}
      >
        {downloading ? (
          <>
            <RefreshCw size={12} className="animate-spin" /> Generating…
          </>
        ) : (
          <>
            <Download size={12} /> Download PDF
          </>
        )}
      </button>
    </div>
  );
}

function DocumentsTab() {
  const [subs, setSubs] = useState([]);
  const [b2s, setB2s] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        const [subRes, b2sRes] = await Promise.all([
          authFetch("/api/subscriptions/my"),
          authFetch("/api/buy2sell/my"),
        ]);
        if (subRes.ok) setSubs(await subRes.json());
        if (b2sRes.ok) setB2s(await b2sRes.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  const allSubs = subs.filter((s) => s.documents?.length > 0);
  const allB2s = b2s.filter((s) => s.documents?.length > 0);
  const hasAny = allSubs.length > 0 || allB2s.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-customBlack-900">
          My Documents
        </h3>
        <p className="text-customBlack-400 font-medium text-sm mt-1">
          Download and print your legal documents and certificates
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="text-customPurple-500 animate-spin" />
        </div>
      ) : !hasAny ? (
        <div className="bg-white rounded-[2rem] shadow-sm border border-customBlack-100 p-16 text-center">
          <div className="w-16 h-16 bg-customPurple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText size={28} className="text-customPurple-500" />
          </div>
          <h4 className="text-xl font-bold text-customBlack-900 mb-2">
            No Documents Yet
          </h4>
          <p className="text-customBlack-400 text-sm max-w-sm mx-auto">
            Documents are generated automatically when your subscription is
            approved. Check back after your application is reviewed.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Land Subscriptions */}
          {allSubs.map((sub) => (
            <div
              key={sub._id}
              className="bg-white rounded-[2rem] shadow-sm border border-customBlack-100 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-customBlack-50 flex items-center justify-between">
                <div>
                  <p className="font-black text-customBlack-900">
                    {sub.estateName}
                  </p>
                  <p className="text-xs text-customBlack-400 font-mono mt-0.5">
                    {sub.referenceNumber}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={sub.status} />
                  <span className="text-xs text-customBlack-400 bg-customBlack-50 px-2 py-1 rounded-lg font-bold">
                    Land Purchase
                  </span>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {sub.documents.map((doc, i) => (
                  <DocumentCard
                    key={i}
                    doc={doc}
                    subId={sub._id}
                    isBuy2Sell={false}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Buy2Sell Investments */}
          {allB2s.map((lead) => (
            <div
              key={lead._id}
              className="bg-white rounded-[2rem] shadow-sm border border-customBlack-100 overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-customBlack-50 flex items-center justify-between">
                <div>
                  <p className="font-black text-customBlack-900">
                    Buy2Sell — {lead.duration} Investment
                  </p>
                  <p className="text-xs text-customBlack-400 font-mono mt-0.5">
                    {lead.referenceNumber}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={lead.status} />
                  <span className="text-xs text-customBlack-400 bg-customPurple-50 px-2 py-1 rounded-lg font-bold text-customPurple-600">
                    Investment
                  </span>
                </div>
              </div>
              {/* Investment summary strip */}
              <div className="grid grid-cols-3 gap-4 px-6 py-3 bg-customPurple-50/50 border-b border-customPurple-100">
                <div>
                  <p className="text-xs text-customBlack-400">Principal</p>
                  <p className="text-sm font-black text-customBlack-900">
                    {formatCurrency(lead.principalAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-customBlack-400">ROI Rate</p>
                  <p className="text-sm font-black text-customPurple-700">
                    {lead.roiPercent}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-customBlack-400">
                    Expected Payout
                  </p>
                  <p className="text-sm font-black text-green-600">
                    {formatCurrency(lead.expectedPayout)}
                  </p>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {lead.documents.map((doc, i) => (
                  <DocumentCard
                    key={i}
                    doc={doc}
                    subId={lead._id}
                    isBuy2Sell={true}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Profile Tab ────────────────────────────────────────────────────────────
function ProfileTab({ client }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-customBlack-900">My Profile</h3>
        <p className="text-customBlack-400 font-medium text-sm mt-1">
          Your account information
        </p>
      </div>
      <div className="bg-white rounded-[2rem] shadow-sm border border-customBlack-100 overflow-hidden">
        {/* Profile header */}
        <div className="bg-gradient-to-r from-customPurple-600 to-customPurple-800 p-8 flex items-center gap-6">
          <img
            src={client.avatar || defaultAvatar}
            className="w-20 h-20 rounded-3xl ring-4 ring-white/30 object-cover"
            alt="Profile"
          />
          <div>
            <h4 className="text-2xl font-bold text-white">
              {client.firstName} {client.lastName}
            </h4>
            <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mt-1 uppercase tracking-widest">
              Client
            </span>
          </div>
        </div>

        {/* Profile details */}
        <div className="p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            { Icon: User, label: "First Name", value: client.firstName },
            { Icon: User, label: "Last Name", value: client.lastName },
            { Icon: Mail, label: "Email Address", value: client.email },
            { Icon: Phone, label: "Phone Number", value: client.phone },
            {
              Icon: Calendar,
              label: "Member Since",
              value: formatDate(client.createdAt),
            },
          ].map(({ Icon, label, value }) => (
            <div
              key={label}
              className="flex items-start gap-4 p-4 bg-customBlack-50/50 rounded-2xl"
            >
              <div className="w-10 h-10 bg-customPurple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon size={16} className="text-customPurple-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-customBlack-400 uppercase tracking-widest mb-1">
                  {label}
                </p>
                <p className="font-bold text-customBlack-900 text-sm">
                  {value || "—"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── MAIN PORTAL COMPONENT ──────────────────────────────────────────────────
export default function ClientPortal() {
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sideOpen, setSideOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { pathname } = useLocation();

  const user = getClientUser();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getClientToken();
      if (!token) {
        window.location.href = "/client/login";
        return;
      }

      const res = await authFetch("/api/clients/dashboard");
      if (res.status === 401) {
        localStorage.removeItem("clientToken");
        localStorage.removeItem("clientUser");
        window.location.href = "/client/login";
        return;
      }
      if (!res.ok) throw new Error("Failed to load dashboard");
      setDashData(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("clientToken");
    localStorage.removeItem("clientUser");
    window.location.href = "/client/login";
  };

  const navItems = [
    { name: "Overview", path: "/client/portal", icon: <FaTachometerAlt /> },
    {
      name: "Subscriptions",
      path: "/client/portal/subscriptions",
      icon: <FaClipboardList />,
    },
    {
      name: "Inspections",
      path: "/client/portal/inspections",
      icon: <FaCalendarCheck />,
    },
    {
      name: "Documents",
      path: "/client/portal/documents",
      icon: <FaFileAlt />,
    },
  ];

  const SidebarNav = () => (
    <>
      <div>
        <h1 className="text-xl font-bold mb-8 pl-3">
          Kemchuta <span className="text-white/60">Portal</span>
        </h1>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => isMobile && setSideOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition cursor-pointer text-sm ${
                  isActive
                    ? "bg-customPurple-900/80 font-semibold"
                    : "hover:bg-customPurple-900/60"
                }`}
              >
                {item.icon}
                <span className="truncate">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="px-4 mt-6 space-y-2">
        <Link
          to="/client/portal/profile"
          onClick={() => isMobile && setSideOpen(false)}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition text-sm ${
            pathname === "/client/portal/profile"
              ? "bg-customPurple-900/80 font-semibold"
              : "hover:bg-customPurple-900/60"
          }`}
        >
          <User size={14} />
          <span>My Profile</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-customPurple-800 hover:bg-customPurple-900 transition text-sm font-semibold"
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} onRetry={loadDashboard} />;

  const client = dashData?.client || user;
  const fullName =
    `${client?.firstName || ""} ${client?.lastName || ""}`.trim();

  return (
    <div className="flex min-h-screen bg-[#fdfdfd] font-poppins relative">
      {/* Mobile hamburger */}
      <div className="absolute top-4 left-4 z-50 lg:hidden">
        <button
          onClick={() => setSideOpen(!sideOpen)}
          className="text-customPurple-300 focus:outline-none"
        >
          {sideOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      {isMobile ? (
        <motion.aside
          initial={{ x: -300 }}
          animate={{ x: sideOpen ? 0 : -300 }}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
          className="fixed top-0 left-0 h-screen w-64 bg-customPurple-600 text-white flex flex-col justify-between py-6 px-4 z-40 shadow-2xl"
        >
          <SidebarNav />
        </motion.aside>
      ) : (
        <aside className="w-64 bg-customPurple-500 text-white flex flex-col justify-between py-6 px-4 sticky top-0 h-screen">
          <SidebarNav />
        </aside>
      )}

      {/* Backdrop */}
      {isMobile && sideOpen && (
        <div
          onClick={() => setSideOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      {/* Main Content */}
      <main
        className={`flex-1 overflow-y-auto bg-[#fafafa] transition-all duration-300 ${sideOpen && isMobile ? "pointer-events-none blur-sm" : ""}`}
      >
        {/* Fixed blur shapes (mirrors RealtorDashboard) */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-customPurple-100 rounded-full blur-3xl opacity-50 animate-pulse" />
          <div className="absolute top-1/2 -left-24 w-72 h-72 bg-customPurple-50 rounded-full blur-3xl opacity-40" />
        </div>

        {/* Header */}
        <header className="sticky top-0 z-20 bg-white/70 backdrop-blur-md border-b border-customBlack-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="pl-8 lg:pl-0">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-customBlack-900">
                Client<span className="text-customPurple-500">Portal</span>
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-customBlack-900">
                  {fullName}
                </p>
                <p className="text-xs text-customPurple-600 font-medium">
                  Verified Client
                </p>
              </div>
              <img
                src={client?.avatar || defaultAvatar}
                className="w-10 h-10 rounded-full ring-2 ring-customPurple-500 ring-offset-2"
                alt="Profile"
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome banner */}
          <div className="mb-8 animate-fadeIn">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-customBlack-900">
              Welcome Back,{" "}
              <span className="text-customPurple-600">{client?.firstName}</span>
              !
            </h2>
            <p className="text-customBlack-500 mt-2 font-medium">
              Here's an overview of your property journey with Kemchuta Homes.
            </p>
          </div>

          <Routes>
            <Route index element={<OverviewTab dashData={dashData} />} />
            <Route path="subscriptions" element={<SubscriptionsTab />} />
            <Route path="inspections" element={<InspectionsTab />} />
            <Route path="documents" element={<DocumentsTab />} />
            <Route path="profile" element={<ProfileTab client={client} />} />
            <Route
              path="*"
              element={<Navigate to="/client/portal" replace />}
            />
          </Routes>
        </div>
      </main>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
