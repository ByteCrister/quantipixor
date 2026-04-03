import React from "react";

export type QuantipixorIconProps = {
  className?: string;
  /** If set, the icon is exposed to assistive tech; otherwise it is decorative. */
  "aria-label"?: string;
};

/**
 * Quantipixor brand mark — magic-wand / pixel motif used in header and footer.
 */
export default function QuantipixorIcon({
  className = "h-6 w-6",
  "aria-label": ariaLabel,
}: QuantipixorIconProps) {
  const decorative = !ariaLabel;

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={decorative ? true : undefined}
      aria-label={ariaLabel}
      role={decorative ? undefined : "img"}
    >
      <path
        d="M12 4L13.5 8.5L18 10L13.5 11.5L12 16L10.5 11.5L6 10L10.5 8.5L12 4Z"
        fill="#1856FF"
        fillOpacity="0.9"
        stroke="#4F46E5"
        strokeWidth="0.8"
      />
      <path
        d="M18.5 7L19.5 9.5L22 10.5L19.5 11.5L18.5 14L17.5 11.5L15 10.5L17.5 9.5L18.5 7Z"
        fill="#9333EA"
        stroke="#7C3AED"
        strokeWidth="0.6"
      />
      <path
        d="M6.5 17L7.2 18.8L9 19.5L7.2 20.2L6.5 22L5.8 20.2L4 19.5L5.8 18.8L6.5 17Z"
        fill="#1856FF"
        fillOpacity="0.8"
      />
      <path
        d="M15 17L15.8 18.2L17 19L15.8 19.8L15 21L14.2 19.8L13 19L14.2 18.2L15 17Z"
        fill="#E89558"
      />
    </svg>
  );
}
