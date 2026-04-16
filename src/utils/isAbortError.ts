/**
 * Checks whether an unknown error is an abort-related cancellation error.
 *
 * This is primarily used to silently ignore expected cancellation flows,
 * such as aborted requests, interrupted rerenders, or disposed async tasks.
 *
 * Only native `DOMException` errors with the `"AbortError"` name
 * are treated as valid abort signals.
 *
 * @param {unknown} error - The runtime error to inspect.
 * @returns {boolean}
 * `true` if the error represents an intentional abort/cancellation.
 */
export function isAbortError(error: unknown): boolean {
    return (
        error instanceof DOMException &&
        error.name === "AbortError"
    );
}
