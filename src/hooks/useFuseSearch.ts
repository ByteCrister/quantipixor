import { useMemo } from "react";
import { useDebounce } from "use-debounce";
import Fuse, { IFuseOptions } from "fuse.js";

/**
 * Recursively collect all primitive values from any JSON‑like structure,
 * lower‑case them, and join into a single searchable string.
 */
function flattenToSearchString(value: unknown): string {
    if (value == null) return "";
    if (typeof value === "string") return value.toLowerCase();
    if (typeof value === "number" || typeof value === "boolean")
        return String(value);
    if (Array.isArray(value))
        return value.map(flattenToSearchString).join(" ");
    if (typeof value === "object")
        return Object.values(value as Record<string, unknown>)
            .map(flattenToSearchString)
            .join(" ");
    return "";
}

export function useFuseSearch<T>(
    items: T[],
    searchTerm: string,
    options?: IFuseOptions<{ item: T; _search: string }>, // internal shape
    debounceDelay = 300
): T[] {
    const [debouncedTerm] = useDebounce(searchTerm, debounceDelay);

    // 1. Wrap every item with its flattened representation
    const searchableItems = useMemo(
        () =>
            items.map((item) => ({
                item,
                _search: flattenToSearchString(item),
            })),
        [items]
    );

    // 2. Build Fuse – always searches only the _search field
    const fuse = useMemo(() => {
        if (!searchableItems.length) return null;
        return new Fuse(searchableItems, {
            keys: ["_search"],
            ...options,       // still allow customisation
            isCaseSensitive: false,
        });
    }, [searchableItems, options]);

    // 3. Perform the search and unwrap back to the original items
    const filtered = useMemo(() => {
        if (!debouncedTerm.trim() || !fuse) return items;
        return fuse.search(debouncedTerm).map((result) => result.item.item);
    }, [fuse, debouncedTerm, items]);

    return filtered;
}