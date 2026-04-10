import { globalIdSet } from "./global"

/**
 * Generates a cryptographically strong unique identifier string.
 *
 * The identifier is built from 16 cryptographically secure random bytes
 * using `crypto.getRandomValues()` and encoded as a fixed-length base36
 * string.
 *
 * To guarantee uniqueness within the current runtime instance, generated
 * identifiers are checked against a global in-memory registry and regenerated
 * until a non-colliding value is produced.
 *
 * This makes the function suitable for stable runtime IDs such as:
 * - reactive node identifiers
 * - subscription keys
 * - render instance tracking
 * - component lifecycle registries
 *
 * @returns {string} A unique 16-character base36 identifier.
 *
 * @remarks
 * Uniqueness is guaranteed only within the current process lifetime
 * while `globalIdSet` is preserved.
 *
 * @example
 * const id = generateUniqueId();
 * // "a8k2x4p1m9z0q7rs"
 */
export function generateUniqueId(): string {
    const generate = () => {
        const bytes = new Uint8Array(16); crypto.getRandomValues(bytes);
        return Array.from(bytes, byte => (byte % 36).toString(36) ).join("");
    }
    let id = generate();
    while (globalIdSet.has(id)) id = generate()
    globalIdSet.add(id)
    return id;
}
