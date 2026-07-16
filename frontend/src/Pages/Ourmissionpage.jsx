import React, { useEffect, useRef, useState } from "react";
import {
  Menu,
  Package,
  HandHeart,
  ArrowRight,
  Calendar,
  Share2,
  Mail,
} from "lucide-react";

/* ---------------------------------------------------------------------
   Color tokens (ported 1:1 from the original tailwind.config extend)
--------------------------------------------------------------------- */
const c = {
  primary: "#384b32",
  primaryContainer: "#4f6348",
  onPrimary: "#ffffff",
  onPrimaryContainer: "#c7debc",
  primaryFixed: "#d2e9c7",
  primaryFixedDim: "#b7cdac",
  onPrimaryFixed: "#0e200a",
  onPrimaryFixedVariant: "#394c33",

  secondary: "#96481f",
  secondaryContainer: "#fe9a6a",
  onSecondary: "#ffffff",
  onSecondaryContainer: "#763007",
  secondaryFixed: "#ffdbcc",
  secondaryFixedDim: "#ffb694",
  onSecondaryFixed: "#351000",
  onSecondaryFixedVariant: "#783108",

  tertiary: "#3c4a38",
  tertiaryContainer: "#53624f",
  onTertiary: "#ffffff",
  onTertiaryContainer: "#ccddc4",
  tertiaryFixed: "#d7e7cf",
  tertiaryFixedDim: "#bbcbb3",
  onTertiaryFixed: "#121f10",
  onTertiaryFixedVariant: "#3c4b38",

  background: "#fcf9f3",
  onBackground: "#1c1c18",
  surface: "#fcf9f3",
  onSurface: "#1c1c18",
  surfaceVariant: "#e5e2dc",
  onSurfaceVariant: "#444840",
  outline: "#747870",
  outlineVariant: "#c4c8be",
  surfaceContainerLowest: "#ffffff",
  surfaceContainerLow: "#f6f3ed",
  surfaceContainer: "#f0eee8",
  surfaceContainerHigh: "#ebe8e2",
  surfaceContainerHighest: "#e5e2dc",
};

/* ---------------------------------------------------------------------
   Reveal-on-scroll wrapper (mirrors the IntersectionObserver script)
--------------------------------------------------------------------- */
function Reveal({ as: Tag = "section", className = "", children, ...rest }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      } ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}

const features = [
  {
    icon: Package,
    iconTint: c.primary,
    iconBg: `${c.primary}1A`,
    bg: c.surfaceContainer,
    title: "Smart Inventory",
    desc: "Track your pantry items with expiry alerts. Our AI-assisted logging helps you know exactly what you have before you buy more.",
    cta: "Learn More",
    ctaColor: c.primary,
    lift: false,
  },
  {
    icon: HandHeart,
    iconTint: c.secondary,
    iconBg: `${c.secondary}1A`,
    bg: c.surfaceContainerHigh,
    title: "Hyper-Local Donations",
    desc: "Connect with local food banks and community fridges instantly. One-tap surplus sharing makes giving as easy as scrolling.",
    cta: "View Map",
    ctaColor: c.secondary,
    lift: true,
  },
  {
    icon: Calendar,
    iconTint: c.tertiary,
    iconBg: `${c.tertiary}1A`,
    bg: c.surfaceContainer,
    title: "Meal Orchestration",
    desc: "Get recipe suggestions based on what's about to expire. Save money and reduce waste through intelligent meal planning.",
    cta: "Explore Recipes",
    ctaColor: c.tertiary,
    lift: false,
  },
];

const visionSteps = [
  {
    n: "1",
    title: "Education",
    desc: "Workshops on sustainable cooking and food preservation for local communities.",
  },
  {
    n: "2",
    title: "Logistics",
    desc: "Partnering with local delivery heroes to bridge the gap between donors and recipients.",
  },
  {
    n: "3",
    title: "Data",
    desc: "Providing insights to policymakers to help design more effective food security initiatives.",
  },
];

export default function OurMissionPage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div
      style={{ backgroundColor: c.surface, color: c.onSurface }}
      className="min-h-screen font-sans antialiased"
    >
      {/* Header */}
      <header
        style={{ backgroundColor: `${c.surface}CC`, borderColor: c.outlineVariant }}
        className="flex justify-between items-center h-16 px-6 sticky top-0 z-40 backdrop-blur-md border-b"
      >
        <span style={{ color: c.primary }} className="text-xl font-bold tracking-tight">
          NourishShare
        </span>
        <div className="hidden md:flex gap-10 items-center">
          <nav style={{ color: c.onSurfaceVariant }} className="flex gap-6 text-sm font-semibold tracking-wide">
            <a className="hover:opacity-70 transition-opacity" href="#">Our Story</a>
            <a className="hover:opacity-70 transition-opacity" href="#">Impact</a>
            <a className="hover:opacity-70 transition-opacity" href="#">Resources</a>
          </nav>
          <button
            style={{ backgroundColor: c.primary, color: c.onPrimary }}
            className="px-6 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Register
          </button>
        </div>
        <button onClick={() => setMobileOpen((v) => !v)} style={{ color: c.primary }} className="md:hidden">
          <Menu className="w-6 h-6" />
        </button>
        {mobileOpen && (
          <div
            style={{ backgroundColor: c.surface, borderColor: c.outlineVariant }}
            className="md:hidden absolute top-16 left-0 right-0 border-b p-6 flex flex-col gap-4 z-40"
          >
            {["Our Story", "Impact", "Resources"].map((label) => (
              <a key={label} href="#" style={{ color: c.onSurfaceVariant }} className="text-sm font-semibold">
                {label}
              </a>
            ))}
            <button
              style={{ backgroundColor: c.primary, color: c.onPrimary }}
              className="px-6 py-2 rounded-full text-sm font-semibold"
            >
              Register
            </button>
          </div>
        )}
      </header>

      <main className="max-w-[1200px] mx-auto px-5 md:px-16 py-10">
        {/* Hero: The Problem */}
        <Reveal className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start mb-10">
          <div className="md:col-span-7">
            <span style={{ color: c.secondary }} className="text-sm font-semibold uppercase tracking-widest mb-4 block">
              The Malaysian Context
            </span>
            <h1
              style={{ color: c.onBackground, letterSpacing: "-0.02em" }}
              className="text-[40px] leading-[48px] font-bold mb-6"
            >
              Every day, Malaysia discards enough food to feed{" "}
              <span style={{ color: c.secondary }}>12 million people</span> three
              times over.
            </h1>
            <p style={{ color: c.onSurfaceVariant }} className="text-lg leading-7 mb-10 max-w-2xl">
              In a nation celebrated for its culinary heritage, we face a
              silent crisis. Approximately 16,688 tonnes of food waste are
              generated daily, with nearly 4,000 tonnes still perfectly
              edible. This isn't just an environmental burden, it's a missed
              opportunity to care for our neighbors.
            </p>
            <div style={{ borderColor: c.outlineVariant }} className="grid grid-cols-2 gap-6 border-t pt-6">
              <div>
                <span style={{ color: c.primary }} className="text-2xl leading-8 font-semibold block">
                  4,000+
                </span>
                <span style={{ color: c.onSurfaceVariant }} className="text-xs font-medium">
                  Tonnes of edible food wasted daily
                </span>
              </div>
              <div>
                <span style={{ color: c.primary }} className="text-2xl leading-8 font-semibold block">
                  24%
                </span>
                <span style={{ color: c.onSurfaceVariant }} className="text-xs font-medium">
                  Increase during festive seasons
                </span>
              </div>
            </div>
          </div>

          <div className="md:col-span-5 relative">
            <div
              style={{ backgroundColor: "#ffffff", borderColor: c.outlineVariant }}
              className="aspect-[4/5] border p-4 shadow-sm transform rotate-2"
            >
              <img
                className="w-full h-full object-cover"
                alt="Rustic Malaysian kitchen table with fresh herbs and rice"
                src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=800&auto=format&fit=crop"
              />
              <div style={{ color: c.onSurfaceVariant }} className="mt-4 text-xs italic text-center">
                Fig 1.0 — The Domestic Circle
              </div>
            </div>
            <div className="absolute -bottom-8 -left-8 hidden md:block">
              <div
                style={{ backgroundColor: c.secondaryFixed, color: c.onSecondaryFixed, borderColor: c.secondary }}
                className="p-6 rounded-xl border w-48 shadow-lg transform -rotate-3"
              >
                <p className="text-sm font-semibold">
                  "Food is the common ground, a universal experience."
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Mission Statement */}
        <Reveal
          style={{ backgroundColor: c.primaryContainer, color: c.onPrimaryContainer }}
          className="p-10 rounded-xl mb-10 relative overflow-hidden"
        >
          <div className="relative z-10 max-w-3xl">
            <h2 style={{ color: c.primaryFixedDim }} className="text-sm font-semibold uppercase tracking-widest mb-4">
              Our Mission
            </h2>
            <p style={{ letterSpacing: "-0.01em" }} className="text-3xl leading-10 font-semibold mb-6">
              To digitize the Malaysian pantry, transforming surplus into
              sustainability through community-driven logistics and mindful
              consumption.
            </p>
            <p className="opacity-90 leading-relaxed">
              NourishShare was born out of a simple observation: our kitchens
              are full, yet our neighbors are hungry. We believe that by
              providing the right digital tools, every Malaysian household
              can become a node in a decentralized network of food security.
              We are building the infrastructure for a waste-free future, one
              kitchen at a time.
            </p>
          </div>
          <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
            <HandHeart className="w-[200px] h-[200px] absolute -right-10 -top-10" strokeWidth={1} />
          </div>
        </Reveal>

        {/* Core Features */}
        <Reveal className="mb-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
            <div className="max-w-xl">
              <h2 style={{ color: c.onBackground, letterSpacing: "-0.01em" }} className="text-3xl leading-10 font-semibold mb-2">
                Tools for Transformation
              </h2>
              <p style={{ color: c.onSurfaceVariant }}>
                We've reimagined the traditional ledger for the modern age,
                focusing on simplicity and community connection.
              </p>
            </div>
            <div
              style={{ borderColor: c.secondary, color: c.secondary, transform: "rotate(-2deg)" }}
              className="border-2 px-2 py-0.5 font-bold uppercase text-sm inline-block"
            >
              Pantry Approved
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  style={{ backgroundColor: f.bg, borderColor: c.outlineVariant }}
                  className={`border p-6 rounded-lg flex flex-col hover:shadow-md transition-shadow ${
                    f.lift ? "md:mt-8" : ""
                  }`}
                >
                  <div
                    style={{ backgroundColor: f.iconBg }}
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-6"
                  >
                    <Icon style={{ color: f.iconTint }} className="w-5 h-5" strokeWidth={1.75} />
                  </div>
                  <h3 style={{ color: c.onSurface }} className="text-2xl leading-8 font-semibold mb-4">
                    {f.title}
                  </h3>
                  <p style={{ color: c.onSurfaceVariant }} className="mb-6">
                    {f.desc}
                  </p>
                  <div
                    style={{ borderColor: c.outlineVariant, color: f.ctaColor }}
                    className="mt-auto border-t pt-4 flex items-center gap-1 text-sm font-semibold cursor-pointer group"
                  >
                    {f.cta}{" "}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>

        {/* Vision: Beyond the App */}
        <Reveal
          style={{ borderColor: c.outlineVariant }}
          className="grid grid-cols-1 md:grid-cols-2 gap-10 py-10 items-center border-t"
        >
          <div>
            <img
              style={{ borderColor: c.outlineVariant }}
              className="w-full h-[400px] object-cover rounded-xl shadow-sm border"
              alt="Community members gathering at an outdoor community fridge"
              src="https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?q=80&w=1000&auto=format&fit=crop"
            />
          </div>
          <div>
            <h2 style={{ color: c.onBackground }} className="text-3xl leading-10 font-semibold mb-6">
              Beyond the App
            </h2>
            <div className="space-y-6">
              {visionSteps.map((step) => (
                <div key={step.n} className="flex gap-4">
                  <div
                    style={{ borderColor: c.primary, color: c.primary }}
                    className="flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center font-bold"
                  >
                    {step.n}
                  </div>
                  <div>
                    <h4 style={{ color: c.primary }} className="text-2xl leading-8 font-semibold mb-1">
                      {step.title}
                    </h4>
                    <p style={{ color: c.onSurfaceVariant }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* CTA */}
        <Reveal
          style={{ backgroundColor: c.secondaryFixed, color: c.onSecondaryFixed, borderColor: `${c.secondary}33` }}
          className="p-10 rounded-xl text-center border my-10 relative overflow-hidden"
        >
          <div className="relative z-10">
            <h2 style={{ letterSpacing: "-0.02em" }} className="text-[40px] leading-[48px] font-bold mb-4">
              Join the Movement
            </h2>
            <p className="text-lg leading-7 mb-10 max-w-xl mx-auto">
              Be part of the solution. Start managing your pantry with
              purpose today and help us nourish Malaysia.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
              <button
                style={{ backgroundColor: c.primary, color: c.onPrimary }}
                className="px-10 py-4 rounded-full text-2xl leading-8 font-semibold hover:scale-105 transition-transform"
              >
                Create Your Account
              </button>
              <button
                style={{ borderColor: c.primary, color: c.primary }}
                className="border px-10 py-4 rounded-full text-2xl leading-8 font-semibold hover:opacity-70 transition-opacity"
              >
                Download App
              </button>
            </div>
          </div>
        </Reveal>
      </main>

      {/* Footer */}
      <footer
        style={{ backgroundColor: c.surfaceContainerHigh, borderColor: c.outlineVariant }}
        className="border-t py-10 mt-10"
      >
        <div className="max-w-[1200px] mx-auto px-5 md:px-16 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="col-span-1 md:col-span-2">
            <span style={{ color: c.primary }} className="text-2xl font-bold tracking-tight block mb-4">
              NourishShare
            </span>
            <p style={{ color: c.onSurfaceVariant }} className="max-w-xs mb-6">
              A Digital Pantry initiative committed to reducing food waste and
              fostering community care across Malaysia.
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                style={{ borderColor: c.outlineVariant, color: c.primary }}
                className="w-10 h-10 rounded-full border flex items-center justify-center hover:opacity-70 transition-opacity"
              >
                <Share2 className="w-4 h-4" />
              </a>
              <a
                href="#"
                style={{ borderColor: c.outlineVariant, color: c.primary }}
                className="w-10 h-10 rounded-full border flex items-center justify-center hover:opacity-70 transition-opacity"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>
          <div>
            <h4 style={{ color: c.primary }} className="text-sm font-semibold uppercase tracking-wide mb-6">
              Company
            </h4>
            <ul style={{ color: c.onSurfaceVariant }} className="space-y-4">
              <li><a className="hover:opacity-70 transition-opacity" href="#">Our Story</a></li>
              <li><a className="hover:opacity-70 transition-opacity" href="#">Impact Report</a></li>
              <li><a className="hover:opacity-70 transition-opacity" href="#">Careers</a></li>
              <li><a className="hover:opacity-70 transition-opacity" href="#">Newsroom</a></li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: c.primary }} className="text-sm font-semibold uppercase tracking-wide mb-6">
              Legal
            </h4>
            <ul style={{ color: c.onSurfaceVariant }} className="space-y-4">
              <li><a className="hover:opacity-70 transition-opacity" href="#">Privacy Policy</a></li>
              <li><a className="hover:opacity-70 transition-opacity" href="#">Terms of Service</a></li>
              <li><a className="hover:opacity-70 transition-opacity" href="#">Donor Guidelines</a></li>
            </ul>
          </div>
        </div>
        <div
          style={{ borderColor: c.outlineVariant, color: c.onSurfaceVariant }}
          className="max-w-[1200px] mx-auto px-5 md:px-16 mt-10 pt-6 border-t flex flex-col md:flex-row justify-between items-center gap-2 text-xs"
        >
          <p>© 2024 NourishShare Malaysia. All rights reserved.</p>
          <p>Made with Care for the Community</p>
        </div>
      </footer>
    </div>
  );
}