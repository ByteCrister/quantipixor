"use client";

import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import {
  Shield,
  User,
  Mail,
  Copy,
  Check,
  CreditCard,
  AlertCircle,
  KeyRound,
  ArrowLeft,
  Sparkles,
  UserPlus,
  Fingerprint,
  ChevronRight,
  BadgeCheck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/store/toastStore";
import { useStripeStore } from "@/store/stripeStore";

interface SuccessData {
  customerId: string;
  email: string;
  name: string;
  paymentMethodId: string;
  setupIntentId: string;
  cardDetails?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
}

// ── Animation presets ─────────────────────────────────────────────────────────
const panelVariants: Variants = {
  enter: { opacity: 0, x: 18, scale: 0.98 },
  center: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, x: -18, scale: 0.98, transition: { duration: 0.22, ease: "easeIn" } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

// ── Shared input style ────────────────────────────────────────────────────────
const inputCls = `w-full px-3.5 py-2.5 rounded-xl text-[13px]
  border border-gray-200 dark:border-white/10
  bg-gray-50 dark:bg-white/[0.04]
  text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/20
  focus:outline-none focus:border-[#1856FF]/50 focus:ring-2 focus:ring-[#1856FF]/15
  transition-all duration-150`;

// ── Field label ───────────────────────────────────────────────────────────────
function FieldLabel({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <label
      className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/30"
      style={{ fontFamily: "var(--font-plus-jakarta)" }}
    >
      <Icon className="w-3 h-3" />
      {children}
    </label>
  );
}

// ── Error banner ──────────────────────────────────────────────────────────────
function ErrorBanner({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 px-3.5 py-3 rounded-xl
        bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20"
    >
      <AlertCircle className="w-3.5 h-3.5 text-red-500 dark:text-red-400 shrink-0" />
      <p className="text-[12px] text-red-600 dark:text-red-400">{message}</p>
    </motion.div>
  );
}

// ── Primary button ────────────────────────────────────────────────────────────
function PrimaryButton({
  children,
  disabled,
  onClick,
  type = "button",
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="w-full h-11 rounded-xl text-[13px] font-semibold text-white
        bg-[#1856FF] hover:bg-[#1347e0] active:bg-[#1040cc]
        disabled:opacity-50 disabled:cursor-not-allowed
        shadow-[0_4px_20px_rgba(24,86,255,0.35)]
        hover:shadow-[0_4px_28px_rgba(24,86,255,0.5)]
        transition-all duration-150 flex items-center justify-center gap-2"
      style={{ fontFamily: "var(--font-plus-jakarta)" }}
    >
      {children}
    </button>
  );
}

// ── Step indicator dot ────────────────────────────────────────────────────────
function StepDot({ label, active, done }: { label: string; active: boolean; done: boolean }) {
  return (
    <div className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-[11px] font-semibold tracking-wide transition-all duration-200
      ${active ? "text-[#1856FF] border-b-2 border-[#1856FF] -mb-px" : done ? "text-emerald-500 dark:text-emerald-400" : "text-gray-400 dark:text-white/25"}`}
      style={{ fontFamily: "var(--font-plus-jakarta)" }}
    >
      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold
        ${active ? "bg-[#1856FF] text-white" : done ? "bg-emerald-500 text-white" : "bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-white/30"}`}>
        {done ? <Check className="w-2.5 h-2.5" /> : active ? "●" : "○"}
      </div>
      {label}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function AddCardForm() {
  const stripe = useStripe();
  const elements = useElements();
  const { secretKey, clearKeys } = useStripeStore();

  const [step, setStep] = useState<"customer" | "card">("customer");
  const [loading, setLoading] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [showDialog, setShowDialog] = useState(false);
  const [successData, setSuccessData] = useState<SuccessData | null>(null);
  const [copied, setCopied] = useState(false);

  if (!secretKey) {
    return (
      <div className="relative rounded-2xl border border-gray-200/80 dark:border-white/10
        bg-white/80 dark:bg-white/4 backdrop-blur-xl
        shadow-[0_8px_40px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]
        dark:shadow-[0_8px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)]
        p-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
            <KeyRound className="w-4 h-4 text-red-500 dark:text-red-400" />
          </div>
          <div>
            <h2 className="text-[14px] font-bold text-gray-900 dark:text-white">Missing Secret Key</h2>
            <p className="text-[11px] text-gray-400 dark:text-white/35 mt-0.5">Please go back and enter your Stripe secret key.</p>
          </div>
        </div>
        <button
          onClick={() => clearKeys()}
          className="flex items-center gap-2 text-[12px] font-semibold text-gray-500 dark:text-white/40
            px-3.5 py-2 rounded-lg border border-gray-200 dark:border-white/10
            hover:text-gray-700 dark:hover:text-white/60 hover:border-gray-300 dark:hover:border-white/20
            transition-all duration-150"
          style={{ fontFamily: "var(--font-plus-jakarta)" }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Reset Keys
        </button>
      </div>
    );
  }

  // ── Step 1: Create customer ────────────────────────────────────────────────
  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !name) { setError("Email and name are required"); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/v1/stripe/create-customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, secretKey }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.message || "Failed to create customer");
      const id = body?.data?.customerId;
      if (!id) throw new Error("No customerId returned");

      setCustomerId(id);
      setStep("card");
      toast({ variant: "success", message: "Customer created! Now add your card." });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      toast({ variant: "error", message });
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Add card ──────────────────────────────────────────────────────
  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!stripe || !elements) { setError("Stripe is not initialized"); return; }
    if (!customerId) { setError("No customer found. Please go back."); return; }

    setLoading(true);
    try {
      const siRes = await fetch("/api/v1/stripe/create-setup-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId, secretKey }),
      });
      const siBody = await siRes.json();
      if (!siRes.ok) throw new Error(siBody?.message || "Failed to create setup intent");
      const clientSecret = siBody?.data?.clientSecret;
      if (!clientSecret) throw new Error("No clientSecret returned");

      const setupIntentId = clientSecret.split("_secret_")[0];
      const result = await stripe.confirmCardSetup(clientSecret, {
        payment_method: { card: elements.getElement(CardElement)! },
      });
      if (result.error) throw new Error(result.error.message || "Card setup failed");

      const paymentMethodId = result.setupIntent?.payment_method as string;
      if (!paymentMethodId) throw new Error("No payment method returned");

      let cardDetails: SuccessData["cardDetails"];
      try {
        const pmRes = await fetch("/api/v1/stripe/get-payment-method-details", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentMethodId, secretKey }),
        });
        const pmBody = await pmRes.json();
        if (pmRes.ok && pmBody?.data) cardDetails = pmBody.data;
      } catch (err) {
        console.warn("Could not fetch card details", err);
      }

      setSuccessData({ customerId, email, name, paymentMethodId, setupIntentId, cardDetails });
      setShowDialog(true);

      // Reset for next
      setCustomerId(null);
      setEmail("");
      setName("");
      setStep("customer");
      elements.getElement(CardElement)?.clear();
      toast({ variant: "success", message: "Card added successfully!" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      toast({ variant: "error", message });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyJson = async () => {
    if (!successData) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(successData, null, 2));
      setCopied(true);
      toast({ variant: "success", message: "JSON copied!" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ variant: "error", message: "Failed to copy" });
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="relative rounded-2xl border border-gray-200/80 dark:border-white/10
        bg-white/80 dark:bg-white/4 backdrop-blur-xl
        shadow-[0_8px_40px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.9)]
        dark:shadow-[0_8px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)]
        overflow-hidden">

        {/* Accent bar */}
        <div className="h-0.5 w-full bg-linear-to-r from-transparent via-[#1856FF]/60 to-transparent" />

        {/* Step tabs */}
        <div className="flex items-center border-b border-gray-100 dark:border-white/6">
          <StepDot label="Customer" active={step === "customer"} done={step === "card"} />
          <div className="w-px h-6 bg-gray-100 dark:bg-white/6" />
          <StepDot label="Payment" active={step === "card"} done={false} />
        </div>

        {/* Animated panel */}
        <AnimatePresence mode="wait">
          {step === "customer" ? (
            <motion.div
              key="customer"
              variants={panelVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="p-7"
            >
              <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5">
                {/* Header */}
                <motion.div variants={fadeUp} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center
                    bg-[#1856FF]/10 dark:bg-[#1856FF]/20 border border-[#1856FF]/20 dark:border-[#1856FF]/30">
                    <UserPlus className="w-4 h-4 text-[#1856FF]" />
                  </div>
                  <div>
                    <h2
                      className="text-[15px] font-bold text-gray-900 dark:text-white tracking-tight"
                      style={{ fontFamily: "var(--font-plus-jakarta)" }}
                    >
                      Create a test customer
                    </h2>
                    <p className="text-[11px] text-gray-400 dark:text-white/35 mt-0.5">
                      This creates a{" "}
                      <code className="rounded bg-black/6 px-1 py-0.5 font-mono text-[10px] dark:bg-white/10">
                        cus_…
                      </code>{" "}
                      object in Stripe
                    </p>
                  </div>
                </motion.div>

                <form onSubmit={handleCreateCustomer} className="space-y-4">
                  <motion.div variants={fadeUp} className="space-y-1.5">
                    <FieldLabel icon={User}>Full Name</FieldLabel>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => { setName(e.target.value); setError(null); }}
                      className={inputCls}
                      placeholder="John Doe"
                      style={{ fontFamily: "var(--font-plus-jakarta)" }}
                      required
                    />
                  </motion.div>

                  <motion.div variants={fadeUp} className="space-y-1.5">
                    <FieldLabel icon={Mail}>Email</FieldLabel>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(null); }}
                      className={inputCls}
                      placeholder="test@example.com"
                      style={{ fontFamily: "var(--font-plus-jakarta)" }}
                      required
                    />
                  </motion.div>

                  {error && (
                    <motion.div variants={fadeUp}>
                      <ErrorBanner message={error} />
                    </motion.div>
                  )}

                  <motion.div variants={fadeUp}>
                    <PrimaryButton type="submit" disabled={loading}>
                      {loading ? (
                        "Creating…"
                      ) : (
                        <>
                          Create Customer
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </PrimaryButton>
                  </motion.div>
                </form>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="card"
              variants={panelVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="p-7"
            >
              <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5">
                {/* Header */}
                <motion.div variants={fadeUp} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center
                    bg-[#1856FF]/10 dark:bg-[#1856FF]/20 border border-[#1856FF]/20 dark:border-[#1856FF]/30">
                    <Fingerprint className="w-4 h-4 text-[#1856FF]" />
                  </div>
                  <div>
                    <h2
                      className="text-[15px] font-bold text-gray-900 dark:text-white tracking-tight"
                      style={{ fontFamily: "var(--font-plus-jakarta)" }}
                    >
                      Add Payment Method
                    </h2>
                    <p className="text-[11px] text-gray-400 dark:text-white/35 mt-0.5">
                      For{" "}
                      <span className="text-gray-600 dark:text-white/50 font-medium">{email}</span>
                    </p>
                  </div>
                </motion.div>

                {/* Customer ID badge */}
                <motion.div variants={fadeUp}>
                  <Badge variant="secondary" className="gap-1.5 font-mono text-[10px]">
                    <BadgeCheck className="size-3 text-emerald-500" aria-hidden />
                    {customerId}
                  </Badge>
                </motion.div>

                <form onSubmit={handleCardSubmit} className="space-y-5">
                  <motion.div variants={fadeUp} className="space-y-1.5">
                    <FieldLabel icon={CreditCard}>Card Information</FieldLabel>
                    <div className="px-4 py-3.5 rounded-xl border border-gray-200 dark:border-white/10
                      bg-gray-50 dark:bg-white/4
                      focus-within:border-[#1856FF]/50 focus-within:ring-2 focus-within:ring-[#1856FF]/15
                      transition-all duration-150">
                      <CardElement
                        options={{
                          style: {
                            base: {
                              fontSize: "14px",
                              fontFamily: "var(--font-jetbrains-mono), monospace",
                              color: "#1e293b",
                              "::placeholder": { color: "#94a3b8" },
                            },
                            invalid: { color: "#ef4444" },
                          },
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 dark:text-white/25 mt-1">
                      Try{" "}
                      <code className="rounded bg-black/6 px-1 py-0.5 font-mono dark:bg-white/10">
                        4242 4242 4242 4242
                      </code>{" "}
                      · any future date · any CVC
                    </p>
                  </motion.div>

                  {/* Security badge */}
                  <motion.div
                    variants={fadeUp}
                    className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl
                      bg-emerald-50/60 dark:bg-emerald-500/6 border border-emerald-200/60 dark:border-emerald-500/15"
                  >
                    <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                      Card data is encrypted and processed directly by Stripe
                    </p>
                  </motion.div>

                  {error && (
                    <motion.div variants={fadeUp}>
                      <ErrorBanner message={error} />
                    </motion.div>
                  )}

                  <motion.div variants={fadeUp} className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => { setStep("customer"); setError(null); }}
                      className="flex items-center gap-1.5 px-4 h-11 rounded-xl text-[12px] font-semibold
                        text-gray-500 dark:text-white/40 border border-gray-200 dark:border-white/10
                        hover:text-gray-700 dark:hover:text-white/60 hover:border-gray-300 dark:hover:border-white/20
                        transition-all duration-150"
                      style={{ fontFamily: "var(--font-plus-jakarta)" }}
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Back
                    </button>
                    <div className="flex-1">
                      <PrimaryButton type="submit" disabled={!stripe || loading}>
                        {loading ? (
                          "Adding card…"
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4" />
                            Add Card
                          </>
                        )}
                      </PrimaryButton>
                    </div>
                  </motion.div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Success dialog ── */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl border border-gray-200/80 dark:border-white/10
          bg-white/95 dark:bg-[#0d1117]/95 backdrop-blur-xl
          shadow-[0_20px_60px_rgba(0,0,0,0.12)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
          <DialogHeader>
            <DialogTitle
              className="flex items-center gap-2.5 text-[15px] font-bold text-gray-900 dark:text-white"
              style={{ fontFamily: "var(--font-plus-jakarta)" }}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-emerald-100 dark:bg-emerald-500/15">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              Card Added Successfully
            </DialogTitle>
            <DialogDescription className="text-[12px] text-gray-400 dark:text-white/35">
              Here&apos;s all the information about the new payment method.
            </DialogDescription>
          </DialogHeader>

          {/* Card details summary chips */}
          {successData?.cardDetails && (
            <div className="flex flex-wrap gap-2 mt-1">
              <Badge variant="secondary" className="font-mono text-[10px] gap-1.5">
                <CreditCard className="size-3" />
                {successData.cardDetails.brand?.toUpperCase()} ···· {successData.cardDetails.last4}
              </Badge>
              <Badge variant="outline" className="font-mono text-[10px]">
                {successData.cardDetails.expMonth}/{successData.cardDetails.expYear}
              </Badge>
              <Badge variant="success" className="gap-1.5">
                <Check className="size-3" />
                Attached
              </Badge>
            </div>
          )}

          <div className="mt-2 rounded-xl border border-gray-100 dark:border-white/8
            bg-gray-50 dark:bg-white/3 overflow-auto max-h-64 p-4">
            <pre
              className="text-[11px] text-gray-700 dark:text-white/60 whitespace-pre-wrap wrap-break-word"
              style={{ fontFamily: "var(--font-jetbrains-mono), monospace" }}
            >
              {JSON.stringify(successData, null, 2)}
            </pre>
          </div>

          <div className="flex justify-end gap-2.5 mt-1">
            <button
              onClick={() => setShowDialog(false)}
              className="px-4 h-9 rounded-lg text-[12px] font-semibold
                text-gray-500 dark:text-white/40 border border-gray-200 dark:border-white/10
                hover:text-gray-700 dark:hover:text-white/60 hover:border-gray-300 dark:hover:border-white/20
                transition-all duration-150"
              style={{ fontFamily: "var(--font-plus-jakarta)" }}
            >
              Close
            </button>
            <button
              onClick={handleCopyJson}
              className="flex items-center gap-1.5 px-4 h-9 rounded-lg text-[12px] font-semibold
                text-white bg-[#1856FF] hover:bg-[#1347e0] active:bg-[#1040cc]
                shadow-[0_2px_12px_rgba(24,86,255,0.35)] hover:shadow-[0_2px_18px_rgba(24,86,255,0.5)]
                transition-all duration-150"
              style={{ fontFamily: "var(--font-plus-jakarta)" }}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy JSON"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}