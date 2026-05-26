"use client";

import { useRef, useState } from "react";
import { motion, Variants } from "framer-motion";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import {
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  CreditCard,
  Zap,
  Lock,
  CheckCircle2,
  FlaskConical,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Toaster } from "@/components/ui/toaster";
import { plusJakarta, jetbrainsMono } from "@/styles/google-fonts";
import { toast } from "@/store/toastStore";
import { useStripeStore } from "@/store/stripeStore";
import AddCardForm from "./AddCardForm";

// ── Animation variants ────────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

export default function StripeTestCustomerPage() {
  const {
    publishableKey,
    secretKey,
    setPublishableKey,
    setSecretKey,
    clearKeys,
  } = useStripeStore();

  const [pkInput, setPkInput] = useState(publishableKey || "");
  const [skInput, setSkInput] = useState(secretKey || "");
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [showSk, setShowSk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stripePromiseRef = useRef<ReturnType<typeof loadStripe> | null>(null);

  if (publishableKey && !stripePromiseRef.current) {
    stripePromiseRef.current = loadStripe(publishableKey);
  }
  // Reset when keys are cleared
  if (!publishableKey) {
    stripePromiseRef.current = null;
  }

  const handleSaveKeys = async () => {
    setError(null);
    if (!pkInput.startsWith("pk_")) {
      setError("Publishable key must start with pk_");
      return;
    }
    if (!skInput.startsWith("sk_")) {
      setError("Secret key must start with sk_");
      return;
    }

    setLoadingKeys(true);
    try {
      const res = await fetch("/api/v1/stripe/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secretKey: skInput }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || "Invalid secret key");
      }

      setPublishableKey(pkInput);
      setSecretKey(skInput);
      toast({ variant: "success", message: "Stripe keys saved!" });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Invalid secret key – please check and try again";
      setError(message);
      toast({ variant: "error", message });
    } finally {
      setLoadingKeys(false);
    }
  };

  const handleReset = () => {
    clearKeys();
    setPkInput("");
    setSkInput("");
    setError(null);
    stripePromiseRef.current = null;
  };

  // ── Shared page shell (background + noise) ────────────────────────────────
  const Shell = ({ children }: { children: React.ReactNode }) => (
    <div
      className={`${plusJakarta.variable} ${jetbrainsMono.variable} relative min-h-screen overflow-x-clip
        bg-[radial-gradient(ellipse_at_top,#e8f0ff_0%,#f8faff_60%)]
        dark:bg-[radial-gradient(ellipse_at_top,rgba(24,86,255,0.12)_0%,#0a0d14_60%)]`}
    >
      {/* Ambient glow blobs */}
      <div
        className="pointer-events-none absolute left-0 top-0 h-80 w-80 -translate-x-1/3 rounded-full bg-[#1856FF]/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-0 top-40 h-64 w-64 translate-x-1/4 rounded-full bg-[#3A344E]/15 blur-3xl dark:bg-[#1856FF]/8"
        aria-hidden
      />
      {/* Noise */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.025] dark:opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      {children}
      <Toaster />
    </div>
  );

  // ── Hero header (shared between both screens) ─────────────────────────────
  const Hero = () => (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="relative mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
    >
      <div>
        <motion.div variants={fadeUp}>
          <Badge
            variant="secondary"
            className="font-mono text-[10px] tracking-[0.16em] gap-1.5"
          >
            <FlaskConical className="size-3" aria-hidden />
            Stripe Test Tools
          </Badge>
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="mt-3 text-3xl font-bold tracking-tight text-[#141414] dark:text-white md:text-4xl"
          style={{ fontFamily: "var(--font-plus-jakarta)" }}
        >
          Test Customer{" "}
          <span className="bg-linear-to-r from-[#1856FF] to-[#3A344E] bg-clip-text text-transparent dark:from-[#a5c4ff] dark:to-white/90">
            & Payment
          </span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="mt-2 max-w-xl text-[#141414]/65 dark:text-white/55"
          style={{ fontFamily: "var(--font-plus-jakarta)" }}
        >
          Create a Stripe test customer and securely attach a payment method
          using your own API keys. Everything stays between you and Stripe.
        </motion.p>
      </div>

      <motion.div variants={fadeUp} className="flex flex-wrap gap-2 shrink-0">
        <Badge variant="success" className="gap-1.5">
          <CheckCircle2 className="size-3" aria-hidden />
          Test mode
        </Badge>
        <Badge variant="outline" className="font-mono text-[10px] gap-1.5">
          <Lock className="size-3" aria-hidden />
          End-to-end encrypted
        </Badge>
        <Badge variant="secondary" className="gap-1.5">
          <Zap className="size-3" aria-hidden />
          Setup Intent
        </Badge>
      </motion.div>
    </motion.div>
  );

  // ── Key entry screen ──────────────────────────────────────────────────────
  if (!publishableKey || !secretKey) {
    return (
      <Shell>
        <div className="relative mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
          <Hero />

          {/* Step chips */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="mb-8 flex flex-wrap gap-3"
          >
            {[
              { icon: KeyRound, label: "Enter API keys", step: "1", active: true },
              { icon: CreditCard, label: "Create customer", step: "2", active: false },
              { icon: ShieldCheck, label: "Add payment method", step: "3", active: false },
            ].map(({ icon: Icon, label, step, active }) => (
              <motion.div
                key={step}
                variants={fadeUp}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-[12px] font-semibold border transition-all
                  ${active
                    ? "bg-[#1856FF] text-white border-[#1856FF] shadow-[0_4px_14px_rgba(24,86,255,0.35)]"
                    : "bg-white/60 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-400 dark:text-white/30"
                  }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold
                  ${active ? "bg-white/20" : "bg-gray-100 dark:bg-white/10"}`}>
                  {step}
                </span>
                <Icon className="size-3" aria-hidden />
                {label}
              </motion.div>
            ))}
          </motion.div>

          {/* Glass card */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut", delay: 0.15 }}
            className="relative rounded-2xl border border-gray-200/80 dark:border-white/10
              bg-white/80 dark:bg-white/4
              backdrop-blur-xl
              shadow-[0_8px_40px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]
              dark:shadow-[0_8px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)]
              overflow-hidden"
          >
            {/* Top accent */}
            <div className="h-0.5 w-full bg-linear-to-r from-transparent via-[#1856FF]/60 to-transparent" />

            <div className="p-8">
              {/* Header */}
              <div className="flex items-center gap-3 mb-7">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center
                  bg-[#1856FF]/10 dark:bg-[#1856FF]/20 border border-[#1856FF]/20 dark:border-[#1856FF]/30">
                  <KeyRound className="w-4 h-4 text-[#1856FF]" />
                </div>
                <div>
                  <h2
                    className="text-[15px] font-bold text-gray-900 dark:text-white tracking-tight"
                    style={{ fontFamily: "var(--font-plus-jakarta)" }}
                  >
                    Stripe API Keys
                  </h2>
                  <p className="text-[11px] text-gray-400 dark:text-white/35 font-medium mt-0.5">
                    Dashboard → Developers → API keys (test mode)
                  </p>
                </div>
              </div>

              {/* Fields */}
              <div className="space-y-4">
                {/* Publishable key */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/30">
                    Publishable Key
                  </label>
                  <input
                    type="text"
                    value={pkInput}
                    onChange={(e) => { setPkInput(e.target.value); setError(null); }}
                    className="w-full px-3.5 py-2.5 rounded-xl text-[13px]
                      border border-gray-200 dark:border-white/10
                      bg-gray-50 dark:bg-white/4
                      text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/20
                      focus:outline-none focus:border-[#1856FF]/50 focus:ring-2 focus:ring-[#1856FF]/15
                      transition-all duration-150"
                    style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                    placeholder="pk_test_..."
                    autoComplete="off"
                  />
                </div>

                {/* Secret key */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/30">
                    Secret Key
                  </label>
                  <div className="relative">
                    <input
                      type={showSk ? "text" : "password"}
                      value={skInput}
                      onChange={(e) => { setSkInput(e.target.value); setError(null); }}
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl text-[13px]
                        border border-gray-200 dark:border-white/10
                        bg-gray-50 dark:bg-white/4
                        text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/20
                        focus:outline-none focus:border-[#1856FF]/50 focus:ring-2 focus:ring-[#1856FF]/15
                        transition-all duration-150"
                      style={{ fontFamily: "var(--font-jetbrains-mono)" }}
                      placeholder="sk_test_..."
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSk((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/25 hover:text-gray-600 dark:hover:text-white/50 transition-colors"
                    >
                      {showSk ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 flex items-center gap-2 px-3.5 py-3 rounded-xl
                    bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20"
                >
                  <AlertCircle className="w-3.5 h-3.5 text-red-500 dark:text-red-400 shrink-0" />
                  <p className="text-[12px] text-red-600 dark:text-red-400">{error}</p>
                </motion.div>
              )}

              {/* Security note */}
              <div className="mt-4 flex items-center gap-2 px-3.5 py-3 rounded-xl
                bg-emerald-50/60 dark:bg-emerald-500/6 border border-emerald-200/60 dark:border-emerald-500/15">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                  Keys are stored only in your local session and never leave your browser
                </p>
              </div>

              {/* CTA */}
              <button
                onClick={handleSaveKeys}
                disabled={loadingKeys || !pkInput || !skInput}
                className="mt-6 w-full h-11 rounded-xl text-[13px] font-semibold text-white
                  bg-[#1856FF] hover:bg-[#1347e0] active:bg-[#1040cc]
                  disabled:opacity-50 disabled:cursor-not-allowed
                  shadow-[0_4px_20px_rgba(24,86,255,0.35)]
                  hover:shadow-[0_4px_28px_rgba(24,86,255,0.5)]
                  transition-all duration-150"
                style={{ fontFamily: "var(--font-plus-jakarta)" }}
              >
                {loadingKeys ? "Verifying…" : "Save & Continue →"}
              </button>
            </div>
          </motion.div>

          {/* Footer note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center text-xs text-[#141414]/45 dark:text-white/30"
            style={{ fontFamily: "var(--font-plus-jakarta)" }}
          >
            Only test-mode keys work here. Find them in{" "}
            <span className="font-semibold text-[#1856FF]/80 dark:text-[#a5c4ff]/70">
              Stripe Dashboard → Developers → API keys
            </span>
            .
          </motion.p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="relative mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
        <Hero />

        {/* Step chips — step 2 active */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="show"
          className="mb-8 flex flex-wrap gap-3"
        >
          {[
            { icon: KeyRound, label: "API keys saved", step: "1", done: true, active: false },
            { icon: CreditCard, label: "Create customer", step: "2", done: false, active: true },
            { icon: ShieldCheck, label: "Add payment method", step: "3", done: false, active: false },
          ].map(({ icon: Icon, label, step, done, active }) => (
            <motion.div
              key={step}
              variants={fadeUp}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-[12px] font-semibold border transition-all
                ${active
                  ? "bg-[#1856FF] text-white border-[#1856FF] shadow-[0_4px_14px_rgba(24,86,255,0.35)]"
                  : done
                    ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                    : "bg-white/60 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-400 dark:text-white/30"
                }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold
                ${active ? "bg-white/20" : done ? "bg-emerald-500/20 dark:bg-emerald-400/20" : "bg-gray-100 dark:bg-white/10"}`}>
                {done ? "✓" : step}
              </span>
              <Icon className="size-3" aria-hidden />
              {label}
            </motion.div>
          ))}
        </motion.div>

        {/* Change keys button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-end mb-4"
        >
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg
              text-[11px] font-semibold text-gray-500 dark:text-white/40
              border border-gray-200 dark:border-white/10
              bg-white/60 dark:bg-white/4
              hover:border-gray-300 dark:hover:border-white/20
              hover:text-gray-700 dark:hover:text-white/60
              transition-all duration-150"
            style={{ fontFamily: "var(--font-plus-jakarta)" }}
          >
            <KeyRound className="w-3 h-3" />
            Change Keys
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
        >
          <Elements stripe={stripePromiseRef.current}>
            <AddCardForm />
          </Elements>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="mt-8 text-center text-xs text-[#141414]/45 dark:text-white/30"
          style={{ fontFamily: "var(--font-plus-jakarta)" }}
        >
          Card data is processed directly by Stripe — never touches our servers.
        </motion.p>
      </div>
    </Shell>
  );
}