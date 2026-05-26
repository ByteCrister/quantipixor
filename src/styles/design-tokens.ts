// ─── src/styles/design-tokens.ts ───────────────────────────────────────────────────────
// Glassmorphism Design System – Full Token Set

export const COLORS = {
    // Core palette (exact match to skill)
    primary: "#1856FF",
    secondary: "#3A344E",
    success: "#07CA6B",
    warning: "#E89558",
    danger: "#EA2143",
    info: "#2D9CDB", // recommended addition
    surface: "#FFFFFF",
    text: "#141414",

    // Neutral scale
    neutral0: "#FFFFFF",
    neutral50: "#F8F9FC",
    neutral100: "#EEF2F6",
    neutral200: "#E2E8F0",
    neutral300: "#CBD5E1",
    neutral400: "#94A3B8",
    neutral500: "#64748B",
    neutral600: "#475569",
    neutral700: "#334155",
    neutral800: "#1E293B",
    neutral900: "#141414",
} as const;

// Subtle & glass layers (alpha variants)
export const ALPHA_LAYERS = {
    surfaceGlass: "rgba(255, 255, 255, 0.7)",
    surfaceSubtle: "rgba(0, 0, 0, 0.02)",
    surfaceElevated: "rgba(255, 255, 255, 0.9)",
    primarySubtle: "rgba(24, 86, 255, 0.12)",
    primaryGlass: "rgba(24, 86, 255, 0.2)",
    secondarySubtle: "rgba(58, 52, 78, 0.1)",
    successSubtle: "rgba(7, 202, 107, 0.08)",
    warningSubtle: "rgba(232, 149, 88, 0.08)",
    dangerSubtle: "rgba(234, 33, 67, 0.08)",
    infoSubtle: "rgba(45, 156, 219, 0.08)",
} as const;

// Semantic aliases (for component consumption)
export const SEMANTIC = {
    textBase: COLORS.text,
    textMuted: COLORS.neutral500,
    border: COLORS.neutral100,
    focusRing: "rgba(24, 86, 255, 0.4)",
    disabled: COLORS.neutral200,
} as const;

export const GRADIENTS = {
    brand: "linear-gradient(135deg, #1856FF 0%, #7C3AED 100%)",
    brandSubtle:
        "linear-gradient(135deg, rgba(24,86,255,0.12), rgba(147,51,234,0.08))",
    brandInfo:
        "linear-gradient(135deg, rgba(24,86,255,0.06), rgba(147,51,234,0.04))",
    brandInfoStrong:
        "linear-gradient(135deg, rgba(24,86,255,0.18), rgba(147,51,234,0.12))",
    successSubtle:
        "linear-gradient(135deg, rgba(7,202,107,0.06), rgba(7,202,107,0.02))",
    exportInfo:
        "linear-gradient(135deg, rgba(24,86,255,0.05), rgba(147,51,234,0.03))",
    radialBlue:
        "radial-gradient(ellipse 80% 50% at 20% 20%, rgba(24,86,255,0.08) 0%, transparent 60%)",
    radialPurple:
        "radial-gradient(ellipse 60% 40% at 80% 80%, rgba(147,51,234,0.06) 0%, transparent 60%)",
    glassSurface:
        "linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 50%, rgba(255,255,255,0.04) 100%)",
    progressBar: "linear-gradient(90deg, #1856FF, #9333EA)",
} as const;

export const SHADOWS = {
    brand: "0 8px 32px rgba(24,86,255,0.35), 0 1px 0 rgba(255,255,255,0.2) inset",
    brandGlow:
        "0 0 20px rgba(24,86,255,0.2), inset 0 1px 0 rgba(255,255,255,0.15)",
    successButton:
        "0 4px 16px rgba(7,202,107,0.12), inset 0 1px 0 rgba(255,255,255,0.1)",
    blueButton:
        "0 4px 16px rgba(24,86,255,0.12), inset 0 1px 0 rgba(255,255,255,0.1)",
    progressGlow: "0 0 8px rgba(24,86,255,0.4)",
    progressTrack: "inset 0 1px 3px rgba(0,0,0,0.1)",
    uploadIcon:
        "0 4px 16px rgba(24,86,255,0.15), inset 0 1px 0 rgba(255,255,255,0.5)",
    fitModeActive:
        "0 2px 12px rgba(24,86,255,0.18), inset 0 1px 0 rgba(255,255,255,0.12)",
    lockActive:
        "0 0 20px rgba(24,86,255,0.2), inset 0 1px 0 rgba(255,255,255,0.15)",
} as const;

export const BORDERS = {
    brand: "rgba(24,86,255,0.35)",
    success: "rgba(7,202,107,0.3)",
    blue: "rgba(24,86,255,0.3)",
    glass: "rgba(255,255,255,0.25)",
} as const;

// Predefined inline style objects for common UI patterns
export const INLINE_STYLES = {
    resizeButtonActive: {
        background: GRADIENTS.brand,
        boxShadow: SHADOWS.brand,
        color: COLORS.surface,
    },
    resizeButtonDisabled: {
        background: "rgba(148,163,184,0.12)",
        backdropFilter: "blur(8px)",
        border: `1px solid ${COLORS.neutral300}`,
        color: COLORS.neutral400,
        cursor: "not-allowed",
    },
    downloadIndividualButton: {
        background: ALPHA_LAYERS.successSubtle,
        borderColor: BORDERS.success,
        color: COLORS.success,
        boxShadow: SHADOWS.successButton,
    },
    downloadZipButton: {
        background: ALPHA_LAYERS.primarySubtle,
        borderColor: BORDERS.blue,
        color: COLORS.primary,
        boxShadow: SHADOWS.blueButton,
    },
    progressTrack: {
        background: ALPHA_LAYERS.surfaceSubtle,
        boxShadow: SHADOWS.progressTrack,
    },
    progressFill: {
        background: GRADIENTS.progressBar,
        boxShadow: SHADOWS.progressGlow,
    },
    uploadIconBox: {
        background: GRADIENTS.brandSubtle,
        backdropFilter: "blur(8px)",
        boxShadow: SHADOWS.uploadIcon,
    },
    glassPanelOverlay: {
        background: GRADIENTS.glassSurface,
    },
    lockButtonActive: {
        background: GRADIENTS.brandInfoStrong,
        borderColor: BORDERS.brand,
        boxShadow: SHADOWS.lockActive,
    },
    fitModeActive: {
        background: GRADIENTS.brandInfoStrong,
        boxShadow: SHADOWS.fitModeActive,
        color: COLORS.primary,
    },
    fitModeInactive: {
        color: COLORS.neutral400,
    },
    presetActive: {
        background: GRADIENTS.brandSubtle,
        backdropFilter: "blur(16px)",
    },
    infoBox: {
        background: GRADIENTS.brandInfo,
        backdropFilter: "blur(8px)",
    },
    exportInfoBox: {
        background: GRADIENTS.exportInfo,
    },
    statsSuccessRow: {
        background: GRADIENTS.successSubtle,
    },
    backgroundOverlay: {
        background: `${GRADIENTS.radialBlue}, ${GRADIENTS.radialPurple}`,
        zIndex: 0,
    },
    pageBg: {
        zIndex: -1,
    },
} as const;
