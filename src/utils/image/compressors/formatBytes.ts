/** Human-readable byte size (binary units). */
export function formatBytes(bytes: number, decimals = 1): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"] as const;
  const i = Math.min(
    sizes.length - 1,
    Math.floor(Math.log(bytes) / Math.log(k)),
  );
  const n = bytes / Math.pow(k, i);
  return `${n >= 10 || i === 0 ? n.toFixed(0) : n.toFixed(decimals)} ${sizes[i]}`;
}
