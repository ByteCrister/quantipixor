"use client";

import { generateDocx } from "@/utils/image/ocr/docx-generator";
import { LanguageCode } from "@/const/languages";
import { toast } from "@/store/toastStore";
import { useState, useCallback, useEffect } from "react";
import { UploadZone } from "./UploadZone";
import { PreviewPanel } from "./PreviewPanel";
import { LanguageSelector } from "./LanguageSelector";
import { OutputPanel } from "./OutputPanel";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiPlay,
  FiCopy,
  FiDownload,
  FiCode,
  FiFileText,
  FiLoader,
} from "react-icons/fi";
import { HiOutlineDocumentText } from "react-icons/hi2";
import { TbFileTypeCsv } from "react-icons/tb";

export default function OcrDocFormatterPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<LanguageCode[]>(["eng"]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<{
    current: number;
    total: number;
    status: string;
  }>({ current: 0, total: 0, status: "" });
  const [formattedHtml, setFormattedHtml] = useState("");
  const [rawText, setRawText] = useState("");
  const [activeTab, setActiveTab] = useState<"formatted" | "raw">("formatted");

  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  const handleFilesAccepted = useCallback(
    (acceptedFiles: File[]) => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
      const previews = acceptedFiles.map((file) => URL.createObjectURL(file));
      setFiles(acceptedFiles);
      setImagePreviews(previews);
      setFormattedHtml("");
      setRawText("");
    },
    [imagePreviews]
  );

  const handleProcess = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setProgress({ current: 0, total: files.length, status: "Initializing OCR…" });

    try {
      const htmlParts: string[] = [];
      const rawParts: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgress({
          current: i + 1,
          total: files.length,
          status: `Uploading image ${i + 1}/${files.length}…`,
        });

        const formData = new FormData();
        formData.append("file", file);
        formData.append("langs", selectedLanguages.join("+"));

        const response = await fetch("/api/v1/ocr/genai", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          let message = "OCR request failed";
          try {
            const data = (await response.json()) as {
              error?: string;
              code?: string;
              retryAfterSeconds?: number;
            };
            if (typeof data.error === "string") message = data.error;
            if (data.code === "RATE_LIMITED") {
              const wait =
                typeof data.retryAfterSeconds === "number" && data.retryAfterSeconds > 0
                  ? ` Try again in ~${Math.ceil(data.retryAfterSeconds)}s.`
                  : "";
              message = `Cloudflare rate limit exceeded.${wait}`;
            }
          } catch {
            // ignore
          }
          throw new Error(message);
        }

        const data = (await response.json()) as
          | { success: true; html: string; plainText: string }
          | { success: false; error: string };

        if (!data.success) {
          throw new Error(data.error || "OCR failed");
        }

        htmlParts.push(
          files.length > 1
            ? `<h2>Page ${i + 1}</h2>\n${data.html}`
            : data.html,
        );
        rawParts.push(data.plainText);
      }

      setFormattedHtml(htmlParts.join("\n<hr />\n"));
      setRawText(rawParts.join("\n\n").trim());
    } catch (error) {
      console.error("OCR processing failed:", error);
      setProgress({ current: 0, total: files.length, status: "Error processing images" });
      toast({
        variant: "error",
        title: "OCR failed",
        message: error instanceof Error ? error.message : "Could not process images.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportDocx = async () => {
    if (!formattedHtml) return;
    try {
      const blob = await generateDocx(formattedHtml, rawText);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "ocr-document.docx";
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("DOCX export failed:", error);
      toast({ variant: "error", title: "Export failed", message: "Could not create DOCX file." });
    }
  };

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(formattedHtml);
    toast({ variant: "success", title: "Copied", message: "HTML copied to clipboard." });
  };

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(rawText);
    toast({ variant: "success", title: "Copied", message: "Raw text copied to clipboard." });
  };

  const handleDownloadHtml = () => {
    const blob = new Blob([formattedHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ocr-output.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  const progressPct =
    progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <main
      className="relative min-h-screen overflow-hidden font-[\'Plus_Jakarta_Sans\',system-ui,sans-serif] text-[#141414]"
      style={{
        background: "linear-gradient(135deg, #e8eeff 0%, #f0f4ff 30%, #e6f9f0 70%, #f5f0ff 100%)",
      }}
    >
      {/* ── Ambient background blobs ── */}
      <div
        aria-hidden
        className="pointer-events-none fixed -top-24 -left-24 h-125 w-125 rounded-full"
        style={{ background: "rgba(24,86,255,0.12)", filter: "blur(80px)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed -bottom-20 -right-20 h-100 w-100 rounded-full"
        style={{ background: "rgba(7,202,107,0.08)", filter: "blur(80px)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed left-1/2 top-1/2 h-87.5 w-87.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: "rgba(139,92,246,0.08)", filter: "blur(80px)" }}
      />

      <div className="relative z-10 mx-auto max-w-275 px-5 py-8">
        {/* ── Header ── */}
        <motion.header
          className="mb-10 text-center"
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-[rgba(24,86,255,0.25)] bg-[rgba(24,86,255,0.12)] px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.07em] text-[#1856FF]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#1856FF] shadow-[0_0_6px_#1856FF]" />
            AI-Powered OCR
          </span>
          <h1
            className="mb-2.5 bg-linear-to-br from-[#1856FF] via-[#6a3dff] to-[#07CA6B] bg-clip-text text-[clamp(1.8rem,4vw,2.6rem)] font-extrabold leading-tight text-transparent"
          >
            Smart OCR Formatter
          </h1>
          <p className="text-[15px] font-normal text-[rgba(20,20,20,0.55)]">
            Extract text with layout reconstruction, table detection &amp; DOCX export
          </p>
        </motion.header>

        {/* ── Two-column grid ── */}
        <div className="grid grid-cols-1 items-start gap-5 md:grid-cols-2">

          {/* ── LEFT: Upload + Settings ── */}
          <div className="flex flex-col gap-5">

            {/* Upload card */}
            <motion.div
              className="glass-card relative overflow-hidden rounded-2xl border border-white/90 bg-white/72 p-6 shadow-[0_16px_48px_rgba(24,86,255,0.1),0_4px_16px_rgba(0,0,0,0.06)] backdrop-blur-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            >
              {/* glass sheen */}
              <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-linear-to-br from-white/25 to-transparent" />
              <SectionHeader color="blue" label="Upload Images" />
              <UploadZone onFilesAccepted={handleFilesAccepted} />
              <AnimatePresence>
                {imagePreviews.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4"
                  >
                    <PreviewPanel previews={imagePreviews} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* OCR Settings card */}
            <motion.div
              className="relative overflow-hidden rounded-2xl border border-white/90 bg-white/72 p-6 shadow-[0_16px_48px_rgba(24,86,255,0.1),0_4px_16px_rgba(0,0,0,0.06)] backdrop-blur-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.5 }}
            >
              <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-linear-to-br from-white/25 to-transparent" />
              <SectionHeader color="green" label="OCR Settings" />

              <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.07em] text-[rgba(20,20,20,0.35)]">
                Language
              </p>
              <LanguageSelector
                selectedLanguages={selectedLanguages}
                onChange={setSelectedLanguages}
              />

              <div className="my-4 h-px bg-white/90" />

              <motion.button
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] border-none bg-linear-to-br from-[#1856FF] to-[#6a3dff] px-6 py-3.5 text-sm font-bold text-white shadow-[0_4px_16px_rgba(24,86,255,0.25)] transition-shadow duration-200 disabled:cursor-not-allowed disabled:border disabled:border-white/90 disabled:bg-none disabled:bg-white/45 disabled:text-[rgba(20,20,20,0.35)] disabled:shadow-none"
                onClick={handleProcess}
                disabled={isProcessing || files.length === 0}
                whileHover={{ scale: isProcessing || files.length === 0 ? 1 : 1.015 }}
                whileTap={{ scale: isProcessing || files.length === 0 ? 1 : 0.975 }}
              >
                {isProcessing ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                      className="inline-flex"
                    >
                      <FiLoader size={16} />
                    </motion.span>
                    {progress.status}
                  </>
                ) : (
                  <>
                    <FiPlay size={15} />
                    Run OCR &amp; Reconstruct Layout
                  </>
                )}
              </motion.button>

              <AnimatePresence>
                {isProcessing && (
                  <motion.div
                    className="mt-4 overflow-hidden"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="mb-1.5 h-1.5 overflow-hidden rounded-[3px] border border-white/90 bg-white/45">
                      <motion.div
                        className="h-full rounded-[3px] bg-linear-to-r from-[#1856FF] to-[#07CA6B]"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPct}%` }}
                        transition={{ ease: "easeOut", duration: 0.4 }}
                      />
                    </div>
                    <p className="text-center font-mono text-[11px] text-[rgba(20,20,20,0.35)]">
                      {progress.current} / {progress.total} images
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* ── RIGHT: Output ── */}
          <motion.div
            className="relative flex flex-col overflow-hidden rounded-2xl border border-white/90 bg-white/72 p-6 shadow-[0_16px_48px_rgba(24,86,255,0.1),0_4px_16px_rgba(0,0,0,0.06)] backdrop-blur-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24, duration: 0.5 }}
          >
            <div className="pointer-events-none absolute inset-0 rounded-[inherit] bg-linear-to-br from-white/25 to-transparent" />

            {/* Output header */}
            <div className="mb-4 flex items-center justify-between">
              <SectionHeader color="purple" label="Extracted Document" />
              <AnimatePresence>
                {formattedHtml && (
                  <motion.div
                    className="flex flex-wrap gap-2"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <StatPill color="#1856FF" label={`${files.length} pages`} />
                    <StatPill color="#07CA6B" label="Ready" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Tab row */}
            <div className="mb-4 flex gap-1 rounded-[10px] border border-white/90 bg-white/45 p-1">
              <TabButton
                icon={<HiOutlineDocumentText size={13} />}
                label="Formatted"
                active={activeTab === "formatted"}
                onClick={() => setActiveTab("formatted")}
              />
              <TabButton
                icon={<FiCode size={13} />}
                label="Raw Text"
                active={activeTab === "raw"}
                onClick={() => setActiveTab("raw")}
              />
            </div>

            {/* Output panel */}
            <div className="min-h-55 max-h-85 flex-1 overflow-y-auto rounded-[10px] border border-white/90 bg-white/45 p-4 font-mono text-xs leading-7 text-[rgba(20,20,20,0.55)]">
              <OutputPanel
                html={formattedHtml}
                rawText={rawText}
                activeTab={activeTab}
              />
            </div>

            {/* Action bar */}
            <AnimatePresence>
              {formattedHtml && (
                <motion.div
                  className="mt-4 flex flex-wrap gap-2 border-t border-white/90 pt-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  <GhostButton icon={<FiCopy size={13} />} label="Copy HTML" onClick={handleCopyHtml} />
                  <GhostButton icon={<FiFileText size={13} />} label="Copy Raw" onClick={handleCopyRaw} />
                  <GhostButton icon={<FiDownload size={13} />} label="Download HTML" onClick={handleDownloadHtml} />
                  <motion.button
                    className="flex cursor-pointer items-center gap-1.5 rounded-[10px] border-none bg-linear-to-br from-[#07CA6B] to-[#05a558] px-3.5 py-1.75 text-xs font-bold text-white shadow-[0_2px_10px_rgba(7,202,107,0.12)] transition-shadow duration-200 hover:shadow-[0_4px_16px_rgba(7,202,107,0.3)]"
                    onClick={handleExportDocx}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <TbFileTypeCsv size={14} />
                    Export DOCX
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </main>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ color, label }: { color: "blue" | "green" | "purple"; label: string }) {
  const dotStyles: Record<string, string> = {
    blue: "bg-[#1856FF] shadow-[0_0_8px_#1856FF]",
    green: "bg-[#07CA6B] shadow-[0_0_8px_#07CA6B]",
    purple: "bg-[#8b5cf6] shadow-[0_0_8px_#8b5cf6]",
  };
  return (
    <div className="mb-5 flex items-center gap-2.5">
      <span className={`h-2 w-2 shrink-0 rounded-full ${dotStyles[color]}`} />
      <span className="text-[15px] font-bold text-[#141414]">{label}</span>
    </div>
  );
}

function StatPill({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-white/90 bg-white/45 px-3 py-1 text-[11px] font-semibold text-[rgba(20,20,20,0.55)]">
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {label}
    </div>
  );
}

function TabButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[7px] border-none px-3 py-1.75 text-xs font-semibold transition-all duration-180 ${active
        ? "bg-white/72 text-[#141414] shadow-[0_2px_8px_rgba(0,0,0,0.08)]"
        : "bg-transparent text-[rgba(20,20,20,0.55)] hover:text-[#1856FF]"
        }`}
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  );
}

function GhostButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      className="flex cursor-pointer items-center gap-1.5 rounded-[10px] border border-white/90 bg-white/45 px-3.5 py-1.75 text-xs font-semibold text-[rgba(20,20,20,0.55)] transition-all duration-180 hover:border-[rgba(24,86,255,0.25)] hover:bg-[rgba(24,86,255,0.12)] hover:text-[#1856FF]"
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      {icon}
      {label}
    </motion.button>
  );
}