"use client";

import React from "react";
import {
  FaFacebook,
  FaGithub,
  FaInstagram,
  FaLinkedin,
} from "react-icons/fa";
import QuantipixorIcon from "@/components/global/QuantipixorIcon";
import { SOCIAL_LINKS } from "@/const/social-links";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-auto w-full overflow-hidden border-t border-white/10 bg-(--footer-bg) text-white backdrop-blur-2xl">
      {/* Top luminous accent */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-[#1856FF]/50 to-transparent"
        aria-hidden
      />
      {/* Soft glow */}
      <div
        className="pointer-events-none absolute -left-24 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-[#1856FF]/12 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 top-0 h-48 w-48 rounded-full bg-purple-500/10 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid gap-10 md:grid-cols-12 md:gap-8 lg:gap-12">
          {/* Brand */}
          <div className="flex flex-col gap-4 md:col-span-5">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] ring-1 ring-white/10">
                <QuantipixorIcon className="h-7 w-7" />
              </span>
              <div>
                <p className="bg-linear-to-r from-white via-[#c7d2fe] to-white/90 bg-clip-text text-lg font-bold tracking-tight text-transparent">
                  Quantipixor
                </p>
                <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-white/45">
                  Image tools
                </p>
              </div>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-white/65">
              Fast, reliable compression for individuals and teams — clean interface, high performance, and your files stay on your device.
            </p>
            <div className="inline-flex items-center gap-2 self-start rounded-full border border-[#07CA6B]/30 bg-[#07CA6B]/10 px-3 py-1.5 text-xs font-medium text-[#8ef0c0]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#07CA6B] shadow-[0_0_8px_#07CA6B]" aria-hidden />
              Privacy-first · WCAG-minded UI
            </div>
          </div>

          {/* Links */}
          <div className="grid gap-8 sm:grid-cols-2 md:col-span-4">
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
                Product
              </p>
              <ul className="mt-4 space-y-3 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1856FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1628] rounded-sm"
                  >
                    Batch Compressor
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1856FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1628] rounded-sm"
                  >
                    Documentation
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
                Legal
              </p>
              <ul className="mt-4 space-y-3 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1856FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1628] rounded-sm"
                    aria-label="Privacy Policy"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1856FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1628] rounded-sm"
                    aria-label="Terms of Service"
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Social */}
          <div className="flex flex-col gap-5 md:col-span-3 md:items-end md:text-right">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40 md:text-right">
              Connect
            </p>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <a
                href={SOCIAL_LINKS.GITHUB}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/4 text-white/75 transition-all hover:border-[#1856FF]/40 hover:bg-[#1856FF]/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1856FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1628]"
                aria-label="GitHub"
              >
                <FaGithub className="h-5 w-5" />
              </a>
              <a
                href={SOCIAL_LINKS.LINKEDIN}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/4 text-white/75 transition-all hover:border-[#1856FF]/40 hover:bg-[#1856FF]/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1856FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1628]"
                aria-label="LinkedIn"
              >
                <FaLinkedin className="h-5 w-5" />
              </a>
              <a
                href={SOCIAL_LINKS.FACEBOOK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/4 text-white/75 transition-all hover:border-[#1856FF]/40 hover:bg-[#1856FF]/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1856FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1628]"
                aria-label="Facebook"
              >
                <FaFacebook className="h-5 w-5" />
              </a>
              <a
                href={SOCIAL_LINKS.INSTAGRAM}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/4 text-white/75 transition-all hover:border-[#1856FF]/40 hover:bg-[#1856FF]/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1856FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1628]"
                aria-label="Instagram"
              >
                <FaInstagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/8 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-xs text-white/45">
            © {currentYear} Quantipixor. All rights reserved.
          </p>
          <p className="text-xs text-white/40">
            Built for clarity, speed, and trust — Sadiqul Islam Shakib.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
