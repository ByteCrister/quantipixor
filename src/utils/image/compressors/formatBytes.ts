/**
 * Formats a byte count into a human‑readable string using binary units.
 *
 * - Uses **1024‑based** units: B, KB, MB, GB.
 * - For values ≥ 10 or when the unit is "B", the number is rounded to 0 decimals.
 *   Otherwise, it shows the specified number of decimals (default 1).
 * - Invalid inputs (negative, NaN, Infinity) produce an em dash.
 *
 * @param bytes - The file size or memory amount in bytes.
 * @param decimals - Number of decimal places to show for small numbers (default 1).
 * @returns A formatted string like `"0 B"`, `"1.5 KB"`, `"10 MB"`, `"—"`.
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"] as const;

  // Determine the index of the largest unit that doesn't exceed the value.
  const i = Math.min(
    sizes.length - 1,
    Math.floor(Math.log(bytes) / Math.log(k)),
  );

  const n = bytes / Math.pow(k, i);

  // Show no decimal places for "big" numbers or when unit is bytes,
  // otherwise show the requested number of decimals.
  const fixed = n >= 10 || i === 0 ? n.toFixed(0) : n.toFixed(decimals);
  return `${fixed} ${sizes[i]}`;
}
