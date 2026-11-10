import React, { useState, useEffect, useRef } from "react";
import {
  Menu,
  X,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Shield,
  TrendingUp,
  Award,
  ChevronDown,
  Play,
  Pause,
  CheckCircle2,
  Building2,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Layers,
  Compass,
  Briefcase,
} from "lucide-react";
import type {
  LandingWebConfig,
  ForgeLuxuryAtelierTemplateConfig,
} from "./TimedCardsOpeningLanding";
import { DEFAULT_FORGE_LUXURY_ATELIER_CONFIG } from "./TimedCardsOpeningLanding";
import { resolveMediaUrl } from "@/lib/api-client";
import { toast } from "sonner";

interface ForgeLuxuryAtelierLandingProps {
  config: LandingWebConfig;
  onNavigateSubScreen?: (screenId: string) => void;
}

export function ForgeLuxuryAtelierLanding({
  config,
}: ForgeLuxuryAtelierLandingProps) {
  const [navOpen, setNavOpen] = useState(false);
  const [enquireModalOpen, setEnquireModalOpen] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState<number>(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [selectedStockCode, setSelectedStockCode] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Form registration state
  const [regForm, setRegForm] = useState({
    fullName: "",
    phone: "",
    company: "",
    position: "",
    need: "Bespoke Trade / Xúc Tiến B2B",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  // Configuration with fallback
  const cfg: ForgeLuxuryAtelierTemplateConfig =
    config.forgeAtelierConfig || DEFAULT_FORGE_LUXURY_ATELIER_CONFIG;

  const handleVideoToggle = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsVideoPlaying(true);
    } else {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    }
  };

  const handleEnquireSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success("Hồ sơ kết nối của bạn đã được gửi tới Ban Thư Ký CLB CEO 1983!");
    setTimeout(() => {
      setEnquireModalOpen(false);
      setSubmitted(false);
      setRegForm({
        fullName: "",
        phone: "",
        company: "",
        position: "",
        need: "Bespoke Trade / Xúc Tiến B2B",
        message: "",
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#070707] text-[#F3F4F6] font-sans selection:bg-[#C5A880] selection:text-black overflow-x-hidden antialiased">
      {/* ── STYLES CHO HIỆU ỨNG SOTD LUXURY ── */}
      <style>{`
        @keyframes slowZoom {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .text-outline {
          -webkit-text-stroke: 1.5px rgba(255, 255, 255, 0.2);
          color: transparent;
        }
        .text-outline-gold {
          -webkit-text-stroke: 1.5px rgba(197, 168, 128, 0.4);
          color: transparent;
        }
        .bg-grid-pattern {
          background-size: 60px 60px;
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
        }
      `}</style>

      {/* ── 1. STICKY LUXURY NAVIGATION HEADER (CHIP NAVIGATE + BRAND + ENQUIRE) ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#070707]/80 backdrop-blur-xl border-b border-white/10 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Left: Navigate Trigger */}
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            className="group flex items-center gap-2.5 px-4 py-2 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30 text-white text-xs font-bold uppercase tracking-[0.2em] transition cursor-pointer"
          >
            <div className="size-2 rounded-full bg-[#C5A880] group-hover:scale-125 transition-transform" />
            <span>Navigate</span>
          </button>

          {/* Center: Brand Wordmark */}
          <a href="#hero" className="flex items-center gap-3 group">
            <div className="size-9 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 flex items-center justify-center p-1.5 shadow-lg group-hover:border-[#C5A880] transition">
              <img
                src="/ceo1983-emblem-8.png"
                alt="CEO 1983 Emblem"
                className="size-full object-contain filter drop-shadow-md"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                }}
              />
            </div>
            <div className="text-left">
              <span className="text-base sm:text-lg font-black tracking-[0.25em] text-white uppercase block leading-none">
                CEO 1983
              </span>
              <span className="text-[9px] font-mono tracking-[0.3em] text-[#C5A880] uppercase block mt-1">
                Bespoke Atelier
              </span>
            </div>
          </a>

          {/* Right: Enquire Pill */}
          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="hidden md:inline-flex px-4 py-2 text-xs font-bold text-neutral-400 hover:text-white uppercase tracking-wider transition"
            >
              CRM Login
            </a>
            <button
              type="button"
              onClick={() => setEnquireModalOpen(true)}
              className="px-5 py-2 rounded-full bg-white hover:bg-neutral-200 text-black text-xs font-extrabold uppercase tracking-wider transition shadow-lg hover:shadow-white/10 active:scale-95 cursor-pointer"
            >
              Gia Nhập
            </button>
          </div>
        </div>
      </header>

      {/* ── FULL-SCREEN LUXURY OVERLAY MENU ── */}
      {navOpen && (
        <div className="fixed inset-0 z-50 bg-[#070707]/95 backdrop-blur-2xl flex flex-col justify-between p-6 sm:p-12 animate-in fade-in duration-300">
          <div className="flex items-center justify-between border-b border-white/10 pb-6">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-[#C5A880]" />
              <span className="text-xs uppercase tracking-[0.3em] text-neutral-400 font-mono">
                Menu Danh Mục
              </span>
            </div>
            <button
              type="button"
              onClick={() => setNavOpen(false)}
              className="p-2.5 rounded-full border border-white/20 hover:bg-white/10 text-white transition cursor-pointer"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="my-auto max-w-4xl space-y-4">
            {[
              { label: "01. Giới Thiệu Atelier", href: "#hero" },
              { label: "02. Triết Lý Chế Tác", href: "#approach" },
              { label: "03. Phân Hệ Tinh Hoa", href: "#specialties" },
              { label: "04. Dự Án & Hội Viên Tiêu Biểu", href: "#previous-builds" },
              { label: "05. Cơ Hội Giao Thương Đang Mở", href: "#available-stock" },
              { label: "06. Liên Hệ & Đăng Ký", href: "#enquire" },
            ].map((item, idx) => (
              <a
                key={idx}
                href={item.href}
                onClick={() => setNavOpen(false)}
                className="group flex items-center justify-between text-2xl sm:text-4xl md:text-5xl font-black text-neutral-300 hover:text-white uppercase tracking-tight py-2 transition"
              >
                <span className="group-hover:translate-x-4 transition-transform duration-300">
                  {item.label}
                </span>
                <ArrowUpRight className="size-6 text-[#C5A880] opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}
          </div>

          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400 font-mono">
            <span>CLB DOANH NHÂN CEO 1983 · HANOIBA COHORT</span>
            <span>HOTLINE: 0983.1983.83 · ATELIER@CEO1983.COM</span>
          </div>
        </div>
      )}

      {/* ── 2. CINEMATIC HERO SECTION WITH REAL MP4 VIDEO BACKGROUND (FORGE SOTD) ── */}
      <section id="hero" className="relative min-h-screen pt-28 pb-16 flex flex-col justify-between overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            poster={cfg.hero.heroPosterUrl}
            className="w-full h-full object-cover filter brightness-70 contrast-110"
            style={{ animation: "slowZoom 25s ease-in-out infinite" }}
          >
            <source src={resolveMediaUrl(cfg.hero.heroMediaUrl) || cfg.hero.heroMediaUrl} type="video/mp4" />
          </video>
          {/* Multi-layer Gradient Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#070707] via-[#070707]/60 to-[#070707]/70" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(7,7,7,0.85)_100%)]" />
        </div>

        {/* Video Control Pill */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 flex justify-end">
          <button
            type="button"
            onClick={handleVideoToggle}
            className="px-3 py-1.5 rounded-full bg-black/60 border border-white/15 text-neutral-300 hover:text-white text-[11px] font-mono flex items-center gap-1.5 backdrop-blur-md transition cursor-pointer"
          >
            {isVideoPlaying ? <Pause className="size-3" /> : <Play className="size-3" />}
            <span>{isVideoPlaying ? "Tạm dừng video" : "Phát video"}</span>
          </button>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 my-auto py-12">
          <div className="max-w-4xl space-y-6">
            {/* Top Micro-badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C5A880]/15 border border-[#C5A880]/30 text-[#C5A880] text-[11px] font-mono tracking-[0.2em] uppercase">
              <Sparkles className="size-3" />
              <span>{cfg.hero.badge}</span>
            </div>

            {/* Giant Hero Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08] uppercase">
              {cfg.hero.headline.split("\n").map((line, idx) => (
                <span key={idx} className="block">
                  {idx === 1 ? (
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-200 to-[#C5A880]">
                      {line}
                    </span>
                  ) : (
                    line
                  )}
                </span>
              ))}
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg text-neutral-300 max-w-2xl leading-relaxed font-normal">
              {cfg.hero.subheadline}
            </p>

            {/* Action Bar */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => setEnquireModalOpen(true)}
                className="px-8 py-4 rounded-full bg-[#C5A880] hover:bg-[#d8be99] text-black font-extrabold text-xs uppercase tracking-[0.2em] shadow-2xl shadow-[#C5A880]/20 flex items-center gap-2 active:scale-95 transition cursor-pointer"
              >
                <span>{cfg.hero.ctaPrimaryText}</span>
                <ArrowRight className="size-4" />
              </button>

              <a
                href={cfg.hero.ctaSecondaryLink || "#specialties"}
                className="px-8 py-4 rounded-full border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-[0.2em] backdrop-blur-sm transition flex items-center gap-2"
              >
                <span>{cfg.hero.ctaSecondaryText}</span>
                <ChevronDown className="size-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Coordinates & Metadata Bar */}
        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 border-t border-white/10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-neutral-400">
          <span>{cfg.hero.coordinatesText}</span>
          <span className="text-[#C5A880]">SOTD INSPIRATION · BESPOKE EDITION 2026</span>
        </div>
      </section>

      {/* ── 3. SECTION: OUR APPROACH TO EVERY BUILD ("TRIẾT LÝ CHẾ TÁC") ── */}
      <section id="approach" className="py-24 bg-[#0a0a0a] border-t border-white/10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-[11px] font-mono tracking-[0.3em] uppercase text-[#C5A880]">
                {cfg.approach.title}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight leading-tight">
                {cfg.approach.quote}
              </h2>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {cfg.approach.pillars.map((p, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#C5A880]/50 hover:bg-white/[0.06] transition duration-300 space-y-3 group"
                >
                  <span className="text-3xl font-black font-mono text-[#C5A880] group-hover:scale-110 transition-transform block">
                    {p.number}
                  </span>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    {p.title}
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. SECTION: THE ATELIER SPECIALTIES (6 PHÂN HỆ CHẾ TÁC TINH HOA) ── */}
      <section id="specialties" className="py-28 bg-[#070707] border-t border-white/10 relative bg-grid-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 border-b border-white/10 pb-8">
            <div className="space-y-2">
              <span className="text-[11px] font-mono tracking-[0.3em] uppercase text-[#C5A880]">
                Atelier Specialties
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
                6 Phân Hệ Tinh Hoa
              </h2>
            </div>
            <p className="text-sm text-neutral-400 max-w-md font-normal leading-relaxed">
              Từng phân hệ được thiết kế như một atelier chuyên biệt, trao quyền và bảo trợ toàn diện cho các thương vụ của doanh nhân CEO 1983.
            </p>
          </div>

          {/* Grid Cards with Hover Reveal */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cfg.specialties.map((spec, sIdx) => {
              const isSelected = selectedSpecialty === sIdx;
              return (
                <div
                  key={sIdx}
                  onClick={() => setSelectedSpecialty(sIdx)}
                  className="group relative rounded-3xl overflow-hidden bg-neutral-900 border border-white/10 hover:border-[#C5A880]/60 transition-all duration-300 flex flex-col justify-between cursor-pointer shadow-2xl"
                >
                  {/* Image container */}
                  <div className="h-64 w-full overflow-hidden relative">
                    <img
                      src={resolveMediaUrl(spec.image) || spec.image}
                      alt={spec.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-90 contrast-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />
                    <div className="absolute top-4 left-4 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-[10px] font-mono tracking-widest text-white uppercase">
                      {spec.number} · {spec.category}
                    </div>
                    <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-[#C5A880]/20 border border-[#C5A880]/40 text-[#C5A880] text-[10px] font-mono tracking-wider font-bold">
                      {spec.tag}
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-6 space-y-3 bg-neutral-950 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-black text-white group-hover:text-[#C5A880] transition leading-snug">
                        {spec.title}
                      </h3>
                      <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                        {spec.desc}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-neutral-300 group-hover:text-white">
                      <span>Khám phá phân hệ</span>
                      <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform text-[#C5A880]" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 5. SECTION: PREVIOUS BUILDS / DỰ ÁN TIÊU BIỂU ── */}
      <section id="previous-builds" className="py-24 bg-[#0a0a0a] border-t border-white/10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-[11px] font-mono tracking-[0.3em] uppercase text-[#C5A880]">
                Previous Builds & Portfolio
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight mt-1">
                Dự Án & Doanh Nghiệp Tiêu Biểu
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setEnquireModalOpen(true)}
              className="px-6 py-2.5 rounded-full border border-white/20 hover:border-white/40 text-xs font-bold uppercase tracking-wider text-white transition self-start md:self-auto cursor-pointer"
            >
              Đăng Ký Hồ Sơ Dự Án Mới
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cfg.previousBuilds.map((build) => (
              <div
                key={build.id}
                className="group rounded-2xl overflow-hidden bg-neutral-900 border border-white/10 hover:border-white/30 transition duration-300 flex flex-col justify-between"
              >
                <div className="h-56 overflow-hidden relative">
                  <img
                    src={resolveMediaUrl(build.image) || build.image}
                    alt={build.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <span className="px-2.5 py-1 rounded-md bg-[#C5A880] text-black font-extrabold text-[10px] tracking-wider uppercase">
                      {build.valuation}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-2 bg-neutral-950 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                      {build.category} · {build.year}
                    </span>
                    <h3 className="text-sm font-black text-white mt-1 group-hover:text-[#C5A880] transition line-clamp-1">
                      {build.title}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1 line-clamp-1">
                      Chủ quản: {build.client}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-neutral-400">
                    <span>Trạng thái: Hoàn tất</span>
                    <ArrowUpRight className="size-4 text-[#C5A880]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. SECTION: AVAILABLE STOCK / CƠ HỘI GIAO THƯƠNG ĐANG MỞ ── */}
      <section id="available-stock" className="py-24 bg-[#070707] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-2 mb-12">
            <span className="text-[11px] font-mono tracking-[0.3em] uppercase text-[#C5A880]">
              Available Stock & Deals
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
              Cơ Hội Hợp Tác Sẵn Có Trong Kỳ
            </h2>
          </div>

          <div className="space-y-3">
            {cfg.availableStock.map((deal) => (
              <div
                key={deal.code}
                onClick={() => {
                  setSelectedStockCode(deal.code);
                  setRegForm((prev) => ({
                    ...prev,
                    message: `Tôi quan tâm cơ hội: [${deal.code}] ${deal.title}`,
                  }));
                  setEnquireModalOpen(true);
                }}
                className="p-5 sm:p-6 rounded-2xl bg-neutral-900/60 border border-white/10 hover:border-[#C5A880]/60 hover:bg-neutral-900 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer group"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white font-mono text-[10px] tracking-wider uppercase">
                      {deal.code}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-mono text-[10px] font-bold">
                      {deal.status}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      Ngành: {deal.industry}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-white group-hover:text-[#C5A880] transition truncate">
                    {deal.title}
                  </h3>
                </div>

                <div className="flex items-center gap-4 sm:text-right shrink-0 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-white/10">
                  <div>
                    <p className="text-base sm:text-lg font-black text-[#C5A880]">
                      {deal.value}
                    </p>
                    <p className="text-[10px] text-neutral-400 font-mono">
                      Còn lại: {deal.slots}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="size-10 rounded-full bg-white/10 group-hover:bg-[#C5A880] group-hover:text-black text-white grid place-items-center transition"
                  >
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. MASSIVE MARQUEE STATEMENT: "REFUSE ORDINARY" ── */}
      <section className="py-16 bg-[#050505] border-y border-white/10 overflow-hidden select-none">
        <div className="flex whitespace-nowrap" style={{ animation: "marquee 22s linear infinite" }}>
          <div className="flex items-center gap-8 text-6xl sm:text-8xl lg:text-9xl font-black uppercase tracking-tighter text-outline px-4">
            <span>{cfg.statement.largeText}</span>
            <span className="text-[#C5A880]">•</span>
            <span className="text-white">{cfg.statement.largeText}</span>
            <span className="text-[#C5A880]">•</span>
            <span>{cfg.statement.largeText}</span>
            <span className="text-[#C5A880]">•</span>
          </div>
          <div className="flex items-center gap-8 text-6xl sm:text-8xl lg:text-9xl font-black uppercase tracking-tighter text-outline px-4">
            <span>{cfg.statement.largeText}</span>
            <span className="text-[#C5A880]">•</span>
            <span className="text-white">{cfg.statement.largeText}</span>
            <span className="text-[#C5A880]">•</span>
            <span>{cfg.statement.largeText}</span>
            <span className="text-[#C5A880]">•</span>
          </div>
        </div>
        <div className="text-center mt-4">
          <p className="text-xs sm:text-sm font-mono text-[#C5A880] tracking-[0.25em] uppercase">
            {cfg.statement.subText}
          </p>
        </div>
      </section>

      {/* ── 8. SECTION: ENQUIRE & REGISTRATION CTA ── */}
      <section id="enquire" className="py-28 bg-[#0a0a0a] relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="space-y-3">
            <span className="text-[11px] font-mono tracking-[0.3em] uppercase text-[#C5A880]">
              Start Your Atelier Journey
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
              Bắt Đầu Hành Trình Cùng CEO 1983
            </h2>
            <p className="text-sm text-neutral-400 max-w-xl mx-auto leading-relaxed">
              Gửi yêu cầu gia nhập hoặc kết nối trực tiếp với Ban Điều Hành để được thẩm định và trao quyền tiếp cận toàn bộ đặc quyền độc bản.
            </p>
          </div>

          <div className="p-8 sm:p-10 rounded-3xl bg-neutral-950 border border-white/10 text-left shadow-2xl">
            <form onSubmit={handleEnquireSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-2">
                    Họ Và Tên Doanh Nhân *
                  </label>
                  <input
                    type="text"
                    required
                    value={regForm.fullName}
                    onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
                    placeholder="VD: Trần Tuấn Anh"
                    className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-white/10 text-white text-sm focus:border-[#C5A880] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-2">
                    Số Điện Thoại Liên Hệ *
                  </label>
                  <input
                    type="tel"
                    required
                    value={regForm.phone}
                    onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                    placeholder="VD: 0983 1983 83"
                    className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-white/10 text-white text-sm focus:border-[#C5A880] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-2">
                    Doanh Nghiệp / Pháp Nhân *
                  </label>
                  <input
                    type="text"
                    required
                    value={regForm.company}
                    onChange={(e) => setRegForm({ ...regForm, company: e.target.value })}
                    placeholder="VD: Tập đoàn ViConnect Group"
                    className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-white/10 text-white text-sm focus:border-[#C5A880] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-2">
                    Chức Vụ Lãnh Đạo *
                  </label>
                  <input
                    type="text"
                    required
                    value={regForm.position}
                    onChange={(e) => setRegForm({ ...regForm, position: e.target.value })}
                    placeholder="VD: Chủ Tịch HĐQT / CEO"
                    className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-white/10 text-white text-sm focus:border-[#C5A880] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-2">
                  Mục Tiêu Kết Nối Trọng Tâm
                </label>
                <select
                  value={regForm.need}
                  onChange={(e) => setRegForm({ ...regForm, need: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-white/10 text-white text-sm focus:border-[#C5A880] focus:outline-none"
                >
                  <option value="Bespoke Trade / Xúc Tiến B2B">Bespoke Trade — Xúc Tiến Giao Thương B2B</option>
                  <option value="Capital & Fund / Quỹ Đầu Tư">Capital & Growth — Dòng Tiền & Quỹ Đầu Tư</option>
                  <option value="Executive Atelier / Quản Trị AI">Executive Atelier — Quản Trị Tinh Gọn & AI</option>
                  <option value="Exclusive Stock / Gói Đầu Tư Có Sẵn">Tham Gia Cơ Hội Hợp Tác Sẵn Có</option>
                  <option value="Full Membership / Hội Viên Chính Thức">Gia Nhập Hội Viên Chính Thức CEO 1983</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-2">
                  Ghi Chú Hoặc Thông Điệp Gửi Ban Thư Ký
                </label>
                <textarea
                  rows={3}
                  value={regForm.message}
                  onChange={(e) => setRegForm({ ...regForm, message: e.target.value })}
                  placeholder="Mô tả ngắn gọn về quy mô doanh nghiệp và kỳ vọng kết nối..."
                  className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-white/10 text-white text-sm focus:border-[#C5A880] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitted}
                className="w-full py-4 rounded-xl bg-[#C5A880] hover:bg-[#d8be99] text-black text-xs font-black uppercase tracking-[0.2em] transition shadow-xl active:scale-95 cursor-pointer text-center"
              >
                {submitted ? "Đang Gửi Hồ Sơ..." : "Gửi Hồ Sơ Thẩm Định Ngay"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── 9. MINIMAL LUXURY FOOTER ── */}
      <footer className="py-14 bg-[#050505] border-t border-white/10 text-xs font-mono text-neutral-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-white/10 border border-white/20 p-1 flex items-center justify-center">
                  <img src="/ceo1983-emblem-8.png" alt="Emblem" className="size-full object-contain" />
                </div>
                <span className="text-sm font-black text-white uppercase tracking-widest">
                  {cfg.footer.headline}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 max-w-md leading-relaxed font-sans">
                {cfg.footer.description}
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-widest text-[#C5A880] block font-bold">
                Tài Nguyên
              </span>
              <p><a href="/login" className="hover:text-white transition">Cổng Quản Trị CRM</a></p>
              <p><a href="/landing/web-v1" className="hover:text-white transition">Mẫu 1: Timed Cards</a></p>
              <p><a href="/landing/web-v2" className="hover:text-white transition">Mẫu 2: Startup Mobile</a></p>
              <p><a href="https://hanoiba.org.vn" target="_blank" rel="noreferrer" className="hover:text-white transition">Hội DNT Hà Nội (HanoiBA)</a></p>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase tracking-widest text-[#C5A880] block font-bold">
                Trụ Sở & Hotline
              </span>
              <p className="leading-relaxed">{cfg.footer.address}</p>
              <p className="text-white">{cfg.footer.contactPhone}</p>
              <p>{cfg.footer.contactEmail}</p>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px]">
            <span>© 2026 CLB DOANH NHÂN CEO 1983. TẤT CẢ QUYỀN ĐƯỢC BẢO LƯU.</span>
            <span>DESIGNED WITH SOTD ATELIER ARCHITECTURE</span>
          </div>
        </div>
      </footer>

      {/* ── ENQUIRE MODAL POPUP ── */}
      {enquireModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setEnquireModalOpen(false)}
        >
          <div
            className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-neutral-950 border border-white/15 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setEnquireModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-white rounded-full bg-white/5"
            >
              <X className="size-5" />
            </button>

            <div className="space-y-2 mb-6">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C5A880]">
                Bespoke Application
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                Gia Nhập CEO 1983 Atelier
              </h3>
            </div>

            <form onSubmit={handleEnquireSubmit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                  Họ Và Tên Doanh Nhân *
                </label>
                <input
                  type="text"
                  required
                  value={regForm.fullName}
                  onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
                  placeholder="VD: Trần Tuấn Anh"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-white/10 text-white text-xs focus:border-[#C5A880] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                    Số Điện Thoại *
                  </label>
                  <input
                    type="tel"
                    required
                    value={regForm.phone}
                    onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                    placeholder="VD: 0983 1983 83"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-white/10 text-white text-xs focus:border-[#C5A880] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                    Chức Vụ *
                  </label>
                  <input
                    type="text"
                    required
                    value={regForm.position}
                    onChange={(e) => setRegForm({ ...regForm, position: e.target.value })}
                    placeholder="VD: Chủ Tịch / CEO"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-white/10 text-white text-xs focus:border-[#C5A880] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                  Doanh Nghiệp / Đơn Vị *
                </label>
                <input
                  type="text"
                  required
                  value={regForm.company}
                  onChange={(e) => setRegForm({ ...regForm, company: e.target.value })}
                  placeholder="VD: ViConnect Group"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-white/10 text-white text-xs focus:border-[#C5A880] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-wider text-neutral-400 mb-1">
                  Thông Điệp / Nhu Cầu
                </label>
                <textarea
                  rows={2}
                  value={regForm.message}
                  onChange={(e) => setRegForm({ ...regForm, message: e.target.value })}
                  placeholder="Ghi chú về nhu cầu kết nối hoặc gói đầu tư quan tâm..."
                  className="w-full px-3.5 py-2 rounded-xl bg-neutral-900 border border-white/10 text-white text-xs focus:border-[#C5A880] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitted}
                className="w-full py-3 rounded-xl bg-[#C5A880] hover:bg-[#d8be99] text-black text-xs font-black uppercase tracking-[0.2em] transition shadow-lg active:scale-95 cursor-pointer text-center mt-2"
              >
                {submitted ? "Đang Gửi Hồ Sơ..." : "Gửi Đăng Ký"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

