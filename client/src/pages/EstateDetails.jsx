import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { DetailedEstate } from "../../data.js";
import {
  MapPin,
  ArrowLeft,
  ArrowUpRight,
  X,
  ChevronLeft,
  ChevronRight,
  Building2,
  TrendingUp,
  CheckCircle2,
  Sparkles,
  Calendar,
  ZoomIn,
  LayoutGrid,
} from "lucide-react";

const generateSlug = (name) =>
  name
    ?.toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");

const purposeColor = {
  residential: { bg: "#700CEB", label: "Residential" },
  commercial: { bg: "#ea580c", label: "Commercial" },
  investment: { bg: "#059669", label: "Investment" },
};

// ── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({ images, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setCurrent((c) => (c + 1) % images.length);
      if (e.key === "ArrowLeft")
        setCurrent((c) => (c - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [images.length, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center"
      style={{
        zIndex: 9999,
        background: "rgba(8,4,20,0.96)",
        backdropFilter: "blur(12px)",
      }}
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center"
        style={{
          background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.2)",
          color: "#fff",
        }}
      >
        <X size={18} />
      </button>

      {/* Counter */}
      <div
        className="absolute top-6 left-1/2 -translate-x-1/2 text-sm font-semibold"
        style={{ color: "rgba(255,255,255,0.5)" }}
      >
        {current + 1} / {images.length}
      </div>

      {/* Prev */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setCurrent((c) => (c - 1 + images.length) % images.length);
        }}
        className="absolute left-6 w-12 h-12 rounded-full flex items-center justify-center"
        style={{
          background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.15)",
          color: "#fff",
        }}
      >
        <ChevronLeft size={22} />
      </button>

      {/* Image */}
      <AnimatePresence mode="wait">
        <motion.img
          key={current}
          src={images[current]}
          alt={`Gallery ${current + 1}`}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.25 }}
          className="max-h-[80vh] max-w-[85vw] object-contain rounded-xl"
          style={{ boxShadow: "0 40px 100px rgba(0,0,0,0.6)" }}
          onClick={(e) => e.stopPropagation()}
        />
      </AnimatePresence>

      {/* Next */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setCurrent((c) => (c + 1) % images.length);
        }}
        className="absolute right-6 w-12 h-12 rounded-full flex items-center justify-center"
        style={{
          background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.15)",
          color: "#fff",
        }}
      >
        <ChevronRight size={22} />
      </button>

      {/* Thumbnails */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              setCurrent(i);
            }}
            className="rounded-md overflow-hidden transition-all duration-200"
            style={{
              width: 52,
              height: 36,
              border:
                i === current
                  ? "2px solid #700CEB"
                  : "2px solid rgba(255,255,255,0.15)",
              opacity: i === current ? 1 : 0.55,
            }}
          >
            <img src={img} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
function EstateDetails() {
  const { estateName } = useParams();
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const estate = DetailedEstate.find(
    (e) => generateSlug(e.estate) === estateName?.trim(),
  );

  if (!estateName || !estate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Building2 size={48} style={{ color: "#700CEB" }} />
        <h2 className="text-2xl font-bold">Estate Not Found</h2>
        <Link
          to="/developments"
          className="text-customPurple-500 font-semibold hover:underline"
        >
          ← Back to Developments
        </Link>
      </div>
    );
  }

  const purposeKey = estate.purpose?.toLowerCase() || "investment";
  const pColor = purposeColor[purposeKey] || purposeColor["investment"];
  const galleryImages = [estate.img, ...(estate.gallery || [])].filter(Boolean);
  const tabs = ["overview", "amenities", "neighborhood", "payment"];

  return (
    <main className="w-full bg-white min-h-screen">
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            images={galleryImages}
            startIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
          />
        )}
      </AnimatePresence>

      {/* ── HERO ── */}
      <div
        className="relative w-full"
        style={{ height: "70vh", minHeight: 480 }}
      >
        <img
          src={estate.img}
          alt={estate.estate}
          className="w-full h-full object-cover"
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(8,4,20,0.92) 0%, rgba(8,4,20,0.4) 50%, rgba(8,4,20,0.15) 100%)",
          }}
        />

        {/* Back button */}
        <div className="absolute top-8 left-8">
          <Link
            to="/developments"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{
              background: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#fff",
            }}
          >
            <ArrowLeft size={15} /> Back
          </Link>
        </div>

        {/* Purpose badge */}
        <div className="absolute top-8 right-8">
          <div
            className="px-3 py-1.5 rounded-full text-xs font-bold text-white"
            style={{ background: pColor.bg, letterSpacing: "0.06em" }}
          >
            {estate.purpose}
          </div>
        </div>

        {/* Hero text */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 px-6 md:px-16 pb-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={14} style={{ color: "#A35FF4" }} />
            <span style={{ color: "#A35FF4", fontSize: 13, fontWeight: 600 }}>
              {estate.address}
            </span>
            <span style={{ color: "rgba(255,255,255,0.3)" }}>·</span>
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>
              {estate.location}
            </span>
          </div>
          <h1
            style={{
              color: "#fff",
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
              textShadow: "0 4px 30px rgba(0,0,0,0.4)",
            }}
          >
            {estate.estate}
          </h1>
          <div className="flex flex-wrap items-center gap-4 mt-4">
            <div>
              <p
                style={{
                  color: "rgba(255,255,255,0.45)",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Starting from
              </p>
              <p
                style={{
                  color: "#fff",
                  fontSize: 28,
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                }}
              >
                ₦{estate.price}
              </p>
            </div>
            <div
              style={{
                width: 1,
                height: 40,
                background: "rgba(255,255,255,0.2)",
              }}
            />
            <div>
              <p
                style={{
                  color: "rgba(255,255,255,0.45)",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Title
              </p>
              <p style={{ color: "#A35FF4", fontSize: 16, fontWeight: 700 }}>
                {estate.title}
              </p>
            </div>
            <div
              style={{
                width: 1,
                height: 40,
                background: "rgba(255,255,255,0.2)",
              }}
            />
            <div>
              <p
                style={{
                  color: "rgba(255,255,255,0.45)",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Size
              </p>
              <p style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>
                {estate.sqm}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── GALLERY STRIP ── */}
      {galleryImages.length > 1 && (
        <div
          className="w-full px-6 md:px-16 py-6"
          style={{ background: "#0f0a1e" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <LayoutGrid size={14} style={{ color: "#A35FF4" }} />
            <span
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Photo Gallery · {galleryImages.length} photos
            </span>
          </div>
          <div
            className="flex gap-3 overflow-x-auto pb-2"
            style={{ scrollbarWidth: "none" }}
          >
            {galleryImages.map((img, i) => (
              <motion.button
                key={i}
                onClick={() => setLightboxIndex(i)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="relative flex-shrink-0 rounded-xl overflow-hidden group"
                style={{
                  width: i === 0 ? 260 : 180,
                  height: 120,
                  border: "2px solid rgba(255,255,255,0.06)",
                }}
              >
                <img
                  src={img}
                  alt={`Gallery ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ background: "rgba(112,12,235,0.5)" }}
                >
                  <ZoomIn size={22} color="#fff" />
                </div>
                {i === 0 && (
                  <div
                    className="absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-bold"
                    style={{ background: "#700CEB", color: "#fff" }}
                  >
                    Featured
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* ── TABS + BODY ── */}
      <div className="w-full px-6 md:px-16 py-10 max-w-7xl mx-auto">
        {/* Tab nav */}
        <div
          className="flex gap-1 mb-10 border-b"
          style={{ borderColor: "rgba(0,0,0,0.08)" }}
        >
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-5 py-3 text-sm font-bold capitalize transition-all duration-200 relative"
              style={{ color: activeTab === tab ? "#700CEB" : "#6b7280" }}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ background: "#700CEB" }}
                />
              )}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* ── LEFT CONTENT ── */}
          <div className="lg:col-span-2">
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles size={16} style={{ color: "#700CEB" }} />
                  <h2
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      color: "#0f0a1e",
                      letterSpacing: "-0.03em",
                    }}
                  >
                    About This Estate
                  </h2>
                </div>
                <p
                  style={{
                    fontSize: 16,
                    color: "#4b5563",
                    lineHeight: 1.9,
                    marginBottom: 32,
                  }}
                >
                  {estate.desc}
                </p>
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {[
                    { label: "Plot Size", value: estate.sqm },
                    { label: "Title", value: estate.title },
                    {
                      label: "Deposit",
                      value: estate.depositPercentage || "30%",
                    },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="rounded-2xl p-5 text-center"
                      style={{
                        background: "rgba(112,12,235,0.04)",
                        border: "1px solid rgba(112,12,235,0.08)",
                      }}
                    >
                      <p
                        style={{
                          fontSize: 11,
                          color: "#9ca3af",
                          fontWeight: 700,
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          marginBottom: 6,
                        }}
                      >
                        {label}
                      </p>
                      <p
                        style={{
                          fontSize: 15,
                          fontWeight: 800,
                          color: "#0f0a1e",
                        }}
                      >
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* AMENITIES TAB */}
            {activeTab === "amenities" && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center gap-2 mb-8">
                  <Sparkles size={16} style={{ color: "#700CEB" }} />
                  <h2
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      color: "#0f0a1e",
                      letterSpacing: "-0.03em",
                    }}
                  >
                    Proposed Amenities
                  </h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {estate.amenities?.map((amenity, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl text-center group cursor-default"
                      style={{
                        background: "#0f0a1e",
                        border: "1px solid rgba(112,12,235,0.15)",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.border =
                          "1px solid rgba(112,12,235,0.5)";
                        e.currentTarget.style.background = "#1a0f35";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.border =
                          "1px solid rgba(112,12,235,0.15)";
                        e.currentTarget.style.background = "#0f0a1e";
                      }}
                    >
                      <span className="text-3xl" style={{ color: "#A35FF4" }}>
                        {amenity.icon
                          ? React.createElement(amenity.icon)
                          : "🏢"}
                      </span>
                      <p
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "rgba(255,255,255,0.7)",
                          lineHeight: 1.3,
                        }}
                      >
                        {amenity.name}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* NEIGHBORHOOD TAB */}
            {activeTab === "neighborhood" && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center gap-2 mb-8">
                  <MapPin size={16} style={{ color: "#700CEB" }} />
                  <h2
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      color: "#0f0a1e",
                      letterSpacing: "-0.03em",
                    }}
                  >
                    Neighborhood
                  </h2>
                </div>
                <div className="flex flex-col gap-3">
                  {estate.neighborhood?.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="flex items-center gap-4 p-4 rounded-xl"
                      style={{
                        background: "rgba(112,12,235,0.04)",
                        border: "1px solid rgba(112,12,235,0.07)",
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: "rgba(112,12,235,0.1)" }}
                      >
                        <CheckCircle2 size={16} style={{ color: "#700CEB" }} />
                      </div>
                      <p
                        style={{
                          fontSize: 15,
                          fontWeight: 600,
                          color: "#1f2937",
                        }}
                      >
                        {item.name}
                      </p>
                    </motion.div>
                  ))}
                </div>

                {estate.sytemap && (
                  <div className="mt-10">
                    <h3
                      style={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: "#0f0a1e",
                        marginBottom: 16,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {estate.estate} Layout
                    </h3>
                    <div
                      className="rounded-2xl overflow-hidden"
                      style={{
                        border: "1px solid rgba(112,12,235,0.12)",
                        boxShadow: "0 8px 40px rgba(112,12,235,0.08)",
                      }}
                    >
                      <iframe
                        src={estate.sytemap}
                        title="Estate Map"
                        className="w-full"
                        style={{ height: 400 }}
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* PAYMENT TAB */}
            {activeTab === "payment" && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center gap-2 mb-8">
                  <TrendingUp size={16} style={{ color: "#700CEB" }} />
                  <h2
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      color: "#0f0a1e",
                      letterSpacing: "-0.03em",
                    }}
                  >
                    Payment Plan
                  </h2>
                </div>
                {estate.paymentPlan?.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {estate.paymentPlan.map((plan, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="rounded-2xl p-6"
                        style={{
                          background:
                            "linear-gradient(135deg, #0f0a1e, #1a0f35)",
                          border: "1px solid rgba(112,12,235,0.2)",
                        }}
                      >
                        <div className="grid grid-cols-3 gap-6">
                          {[
                            { label: "Plot Size", value: plan.plot },
                            { label: "Outright Price", value: plan.outright },
                            {
                              label: "Initial Deposit",
                              value: plan.initialDeposit,
                            },
                          ].map(({ label, value }) => (
                            <div key={label}>
                              <p
                                style={{
                                  color: "rgba(255,255,255,0.4)",
                                  fontSize: 11,
                                  fontWeight: 700,
                                  letterSpacing: "0.1em",
                                  textTransform: "uppercase",
                                  marginBottom: 6,
                                }}
                              >
                                {label}
                              </p>
                              <p
                                style={{
                                  color: "#fff",
                                  fontSize: 20,
                                  fontWeight: 800,
                                  letterSpacing: "-0.03em",
                                }}
                              >
                                {value}
                              </p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "#9ca3af" }}>
                    No payment plans available.
                  </p>
                )}
              </motion.div>
            )}
          </div>

          {/* ── STICKY SIDEBAR ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              {/* CTA Card */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="rounded-2xl overflow-hidden mb-6"
                style={{
                  background: "linear-gradient(145deg, #3F0C91, #700CEB)",
                  boxShadow: "0 20px 60px rgba(112,12,235,0.3)",
                }}
              >
                <div className="p-6">
                  <p
                    style={{
                      color: "rgba(255,255,255,0.6)",
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      marginBottom: 4,
                    }}
                  >
                    Starting from
                  </p>
                  <p
                    style={{
                      color: "#fff",
                      fontSize: 30,
                      fontWeight: 900,
                      letterSpacing: "-0.04em",
                      marginBottom: 20,
                    }}
                  >
                    ₦{estate.price}
                  </p>

                  <button
                    className="w-full py-3.5 rounded-xl font-bold text-sm mb-3 flex items-center justify-center gap-2"
                    style={{
                      background: "#fff",
                      color: "#700CEB",
                      boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
                    }}
                  >
                    <Calendar size={15} />
                    Book Inspection
                  </button>

                  {/* ✅ UPDATED: Contact Agent → Subscribe Now */}
                  <Link
                    to={`/estate/${generateSlug(estate.estate)}`}
                    className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                    style={{
                      background: "rgba(255,255,255,0.12)",
                      color: "#fff",
                      border: "1px solid rgba(255,255,255,0.2)",
                      display: "flex",
                    }}
                  >
                    <ArrowUpRight size={15} />
                    Subscribe Now
                  </Link>
                </div>

                {/* Deposit badge */}
                <div
                  className="px-6 py-4"
                  style={{
                    background: "rgba(0,0,0,0.2)",
                    borderTop: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <p
                    style={{
                      color: "rgba(255,255,255,0.6)",
                      fontSize: 12,
                      textAlign: "center",
                    }}
                  >
                    Only{" "}
                    <span style={{ color: "#EFC2FF", fontWeight: 800 }}>
                      {estate.depositPercentage || "30% Initial Deposit"}
                    </span>{" "}
                    to get started
                  </p>
                </div>
              </motion.div>

              {/* Quick info card */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="rounded-2xl p-5"
                style={{
                  background: "#fff",
                  border: "1px solid rgba(0,0,0,0.07)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                }}
              >
                <h4
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: "#0f0a1e",
                    letterSpacing: "-0.02em",
                    marginBottom: 14,
                  }}
                >
                  Property Details
                </h4>
                {[
                  {
                    label: "Location",
                    value: estate.location || estate.address,
                  },
                  { label: "Purpose", value: estate.purpose },
                  { label: "Plot Size", value: estate.sqm },
                  { label: "Title", value: estate.title },
                  { label: "Category", value: estate.category },
                ].map(
                  ({ label, value }) =>
                    value && (
                      <div
                        key={label}
                        className="flex justify-between items-center py-2.5"
                        style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}
                      >
                        <span
                          style={{
                            fontSize: 13,
                            color: "#9ca3af",
                            fontWeight: 500,
                          }}
                        >
                          {label}
                        </span>
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#0f0a1e",
                          }}
                        >
                          {value}
                        </span>
                      </div>
                    ),
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default EstateDetails;
