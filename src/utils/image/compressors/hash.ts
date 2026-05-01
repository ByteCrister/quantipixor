/**
 * Computes the SHA‑256 hash of a `File` object using the Web Crypto API.
 *
 * The result is a lowercase hexadecimal string (64 characters).
 * Useful for generating a unique content‑based identifier for an image file.
 *
 * @param file - The file to hash (the entire content is read).
 * @returns A Promise resolving to the hex digest.
 */
export async function computeFileHash(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();                     // read all bytes
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));   // each byte as a number
    return hashArray
        .map(b => b.toString(16).padStart(2, '0'))             // byte → 2‑digit hex
        .join('');
}