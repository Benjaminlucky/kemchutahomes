import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  User,
  Mail,
  Phone,
  Users,
  Building2,
  CheckCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { bookInspection } from "../../services/estateServices.js";

const PERSONS_OPTIONS = [
  { value: 1, label: "1 Person", desc: "Just me" },
  { value: 2, label: "2 Persons", desc: "Me + 1 guest" },
  { value: 5, label: "5 Persons", desc: "Group visit" },
];

// ── Minimum date: tomorrow ────────────────────────────────────────────────────
const getMinDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
};

// ── Input component ───────────────────────────────────────────────────────────
function Field({ label, icon: Icon, error, children }) {
  return (
    <div>
      <label
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "#6b7280",
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          display: "block",
          marginBottom: 8,
        }}
      >
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon size={15} style={{ color: error ? "#dc2626" : "#700CEB" }} />
          </div>
        )}
        {children}
      </div>
      {error && (
        <p
          style={{
            fontSize: 11,
            color: "#dc2626",
            marginTop: 4,
            fontWeight: 500,
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

// ── Success screen ────────────────────────────────────────────────────────────
function SuccessScreen({ booking, onClose }) {
  const dateStr = new Date(booking.inspectionDate).toLocaleDateString("en-NG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center text-center p-8"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
        style={{
          background: "linear-gradient(135deg, #059669, #047857)",
          boxShadow: "0 12px 40px rgba(5,150,105,0.35)",
        }}
      >
        <CheckCircle size={36} color="#fff" strokeWidth={2.5} />
      </motion.div>

      <h3
        style={{
          fontSize: 22,
          fontWeight: 900,
          color: "#0f0a1e",
          letterSpacing: "-0.04em",
          marginBottom: 8,
        }}
      >
        Booking Confirmed!
      </h3>
      <p
        style={{
          fontSize: 14,
          color: "#6b7280",
          lineHeight: 1.7,
          marginBottom: 24,
          maxWidth: 320,
        }}
      >
        Your inspection has been booked. We'll contact you shortly to confirm
        the details.
      </p>

      {/* Summary */}
      <div
        className="w-full rounded-2xl p-5 mb-6 text-left"
        style={{
          background: "rgba(112,12,235,0.04)",
          border: "1px solid rgba(112,12,235,0.1)",
        }}
      >
        {[
          { label: "Estate", value: booking.estateName },
          { label: "Date", value: dateStr },
          {
            label: "Persons",
            value: `${booking.persons} person${booking.persons > 1 ? "s" : ""}`,
          },
          { label: "Name", value: `${booking.firstName} ${booking.lastName}` },
          { label: "Contact", value: booking.phone },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="flex justify-between items-center py-2"
            style={{ borderBottom: "1px solid rgba(112,12,235,0.06)" }}
          >
            <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600 }}>
              {label}
            </span>
            <span style={{ fontSize: 13, color: "#0f0a1e", fontWeight: 700 }}>
              {value}
            </span>
          </div>
        ))}
      </div>

      <button
        onClick={onClose}
        className="w-full py-3.5 rounded-xl font-bold text-sm"
        style={{
          background: "linear-gradient(135deg,#700CEB,#8A2FF0)",
          color: "#fff",
          boxShadow: "0 8px 24px rgba(112,12,235,0.35)",
        }}
      >
        Done
      </button>
    </motion.div>
  );
}

// ── Main Modal ────────────────────────────────────────────────────────────────
export default function BookInspectionModal({
  isOpen,
  onClose,
  estateName = "",
  estateId = null,
}) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    inspectionDate: "",
    persons: 1,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [booking, setBooking] = useState(null); // success state

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        inspectionDate: "",
        persons: 1,
      });
      setErrors({});
      setApiError("");
      setBooking(null);
    }
  }, [isOpen]);

  // Lock scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "First name is required";
    if (!form.lastName.trim()) e.lastName = "Last name is required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Valid email is required";
    if (!form.phone.trim() || form.phone.trim().length < 7)
      e.phone = "Valid phone number is required";
    if (!form.inspectionDate) e.inspectionDate = "Please select a date";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setApiError("");
    try {
      const result = await bookInspection({
        estateName,
        estateId,
        ...form,
      });
      setBooking(result.inspection);
    } catch (err) {
      setApiError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (hasError) => ({
    width: "100%",
    padding: "11px 14px 11px 40px",
    borderRadius: 12,
    fontSize: 14,
    border: `1.5px solid ${hasError ? "#dc2626" : "rgba(112,12,235,0.15)"}`,
    background: hasError ? "rgba(220,38,38,0.03)" : "#fafafa",
    outline: "none",
    color: "#0f0a1e",
    fontWeight: 500,
    transition: "border-color 0.2s",
  });

  const noIconInputStyle = (hasError) => ({
    ...inputStyle(hasError),
    paddingLeft: 14,
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9990] flex items-center justify-center p-4"
          style={{
            background: "rgba(8,4,20,0.75)",
            backdropFilter: "blur(12px)",
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
            style={{
              background: "#fff",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow:
                "0 40px 100px rgba(112,12,235,0.2), 0 0 0 1px rgba(112,12,235,0.08)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="relative px-8 py-7 overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #3F0C91, #700CEB)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -30,
                  right: -30,
                  width: 140,
                  height: 140,
                  background: "rgba(255,255,255,0.06)",
                  borderRadius: "50%",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: -40,
                  left: "30%",
                  width: 100,
                  height: 100,
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: "50%",
                }}
              />
              <div className="relative flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Building2
                      size={14}
                      style={{ color: "rgba(255,255,255,0.7)" }}
                    />
                    <span
                      style={{
                        fontSize: 11,
                        color: "rgba(255,255,255,0.6)",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                      }}
                    >
                      Book Inspection
                    </span>
                  </div>
                  <h2
                    style={{
                      color: "#fff",
                      fontSize: 20,
                      fontWeight: 900,
                      letterSpacing: "-0.03em",
                      maxWidth: 280,
                    }}
                    className="truncate"
                  >
                    {estateName || "Estate Inspection"}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-2xl flex items-center justify-center transition-all hover:scale-110"
                  style={{
                    background: "rgba(255,255,255,0.15)",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            {/* Body */}
            {booking ? (
              <SuccessScreen booking={booking} onClose={onClose} />
            ) : (
              <form onSubmit={handleSubmit} className="p-8 space-y-5">
                {/* API Error */}
                {apiError && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl"
                    style={{
                      background: "rgba(220,38,38,0.08)",
                      border: "1px solid rgba(220,38,38,0.2)",
                    }}
                  >
                    <AlertTriangle
                      size={15}
                      style={{ color: "#dc2626", flexShrink: 0 }}
                    />
                    <p
                      style={{
                        fontSize: 13,
                        color: "#dc2626",
                        fontWeight: 500,
                      }}
                    >
                      {apiError}
                    </p>
                  </motion.div>
                )}

                {/* Estate name — read-only display */}
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{
                    background: "rgba(112,12,235,0.05)",
                    border: "1px solid rgba(112,12,235,0.12)",
                  }}
                >
                  <Building2
                    size={15}
                    style={{ color: "#700CEB", flexShrink: 0 }}
                  />
                  <div>
                    <p
                      style={{
                        fontSize: 10,
                        color: "#9ca3af",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                      }}
                    >
                      Estate
                    </p>
                    <p
                      style={{
                        fontSize: 14,
                        color: "#0f0a1e",
                        fontWeight: 800,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {estateName}
                    </p>
                  </div>
                </div>

                {/* Name row */}
                <div className="grid grid-cols-2 gap-4">
                  <Field
                    label="First Name"
                    icon={User}
                    error={errors.firstName}
                  >
                    <input
                      value={form.firstName}
                      onChange={(e) => set("firstName", e.target.value)}
                      placeholder="John"
                      style={inputStyle(errors.firstName)}
                      onFocus={(e) => {
                        if (!errors.firstName)
                          e.target.style.borderColor = "rgba(112,12,235,0.45)";
                      }}
                      onBlur={(e) => {
                        if (!errors.firstName)
                          e.target.style.borderColor = "rgba(112,12,235,0.15)";
                      }}
                    />
                  </Field>
                  <Field label="Last Name" icon={User} error={errors.lastName}>
                    <input
                      value={form.lastName}
                      onChange={(e) => set("lastName", e.target.value)}
                      placeholder="Doe"
                      style={inputStyle(errors.lastName)}
                      onFocus={(e) => {
                        if (!errors.lastName)
                          e.target.style.borderColor = "rgba(112,12,235,0.45)";
                      }}
                      onBlur={(e) => {
                        if (!errors.lastName)
                          e.target.style.borderColor = "rgba(112,12,235,0.15)";
                      }}
                    />
                  </Field>
                </div>

                {/* Email */}
                <Field label="Email Address" icon={Mail} error={errors.email}>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="john@example.com"
                    style={inputStyle(errors.email)}
                    onFocus={(e) => {
                      if (!errors.email)
                        e.target.style.borderColor = "rgba(112,12,235,0.45)";
                    }}
                    onBlur={(e) => {
                      if (!errors.email)
                        e.target.style.borderColor = "rgba(112,12,235,0.15)";
                    }}
                  />
                </Field>

                {/* Phone */}
                <Field label="Phone Number" icon={Phone} error={errors.phone}>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="+234 800 000 0000"
                    style={inputStyle(errors.phone)}
                    onFocus={(e) => {
                      if (!errors.phone)
                        e.target.style.borderColor = "rgba(112,12,235,0.45)";
                    }}
                    onBlur={(e) => {
                      if (!errors.phone)
                        e.target.style.borderColor = "rgba(112,12,235,0.15)";
                    }}
                  />
                </Field>

                {/* Date */}
                <Field
                  label="Preferred Inspection Date"
                  icon={Calendar}
                  error={errors.inspectionDate}
                >
                  <input
                    type="date"
                    value={form.inspectionDate}
                    onChange={(e) => set("inspectionDate", e.target.value)}
                    min={getMinDate()}
                    style={inputStyle(errors.inspectionDate)}
                    onFocus={(e) => {
                      if (!errors.inspectionDate)
                        e.target.style.borderColor = "rgba(112,12,235,0.45)";
                    }}
                    onBlur={(e) => {
                      if (!errors.inspectionDate)
                        e.target.style.borderColor = "rgba(112,12,235,0.15)";
                    }}
                  />
                </Field>

                {/* Persons */}
                <div>
                  <label
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#6b7280",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 10,
                    }}
                  >
                    <Users size={13} style={{ color: "#700CEB" }} />
                    Number of Persons
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {PERSONS_OPTIONS.map((opt) => (
                      <motion.button
                        key={opt.value}
                        type="button"
                        whileTap={{ scale: 0.96 }}
                        onClick={() => set("persons", opt.value)}
                        className="flex flex-col items-center py-3.5 px-2 rounded-2xl text-center transition-all"
                        style={{
                          border:
                            form.persons === opt.value
                              ? "2px solid #700CEB"
                              : "1.5px solid rgba(112,12,235,0.12)",
                          background:
                            form.persons === opt.value
                              ? "rgba(112,12,235,0.06)"
                              : "#fafafa",
                          boxShadow:
                            form.persons === opt.value
                              ? "0 4px 16px rgba(112,12,235,0.15)"
                              : "none",
                        }}
                      >
                        <span style={{ fontSize: 22, marginBottom: 3 }}>
                          {opt.value === 1
                            ? "👤"
                            : opt.value === 2
                              ? "👥"
                              : "👨‍👩‍👧‍👦"}
                        </span>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 800,
                            color:
                              form.persons === opt.value
                                ? "#700CEB"
                                : "#0f0a1e",
                            letterSpacing: "-0.02em",
                          }}
                        >
                          {opt.label}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            color: "#9ca3af",
                            marginTop: 1,
                            fontWeight: 500,
                          }}
                        >
                          {opt.desc}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 mt-2"
                  style={{
                    background: loading
                      ? "rgba(112,12,235,0.5)"
                      : "linear-gradient(135deg,#700CEB,#8A2FF0)",
                    color: "#fff",
                    boxShadow: loading
                      ? "none"
                      : "0 8px 28px rgba(112,12,235,0.38)",
                    fontSize: 15,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={17} className="animate-spin" /> Booking...
                    </>
                  ) : (
                    <>
                      <Calendar size={17} /> Confirm Inspection
                    </>
                  )}
                </motion.button>

                <p
                  style={{
                    fontSize: 11,
                    color: "#9ca3af",
                    textAlign: "center",
                    marginTop: -4,
                  }}
                >
                  Our team will reach out to confirm your booking within 24
                  hours
                </p>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
