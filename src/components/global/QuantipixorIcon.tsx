// QuantipixorIcon.tsx
"use client";

export type QuantipixorIconProps = {
  className?: string;
  "aria-label"?: string;
};

/**
 * Quantipixor brand mark — bold, modern 'Q' letter icon.
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
      {/* Bold outer Q circle with thick stroke */}
      <path
        d="M12 2.5C6.753 2.5 2.5 6.753 2.5 12C2.5 17.247 6.753 21.5 12 21.5C16.184 21.5 19.747 18.827 20.914 15.05"
        stroke="url(#qGradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Bold Q tail */}
      <path
        d="M19 18.5L22 21.5"
        stroke="url(#qGradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Inner accent dot for extra character */}
      <circle cx="9.2" cy="9.2" r="1.3" fill="url(#qGradient)" />
      
      <defs>
        <linearGradient id="qGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1856FF" />
          <stop offset="100%" stopColor="#9333EA" />
        </linearGradient>
      </defs>
    </svg>
  );
}