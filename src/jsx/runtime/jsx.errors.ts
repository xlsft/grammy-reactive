/**
 * Error thrown when JSX input cannot be parsed or rendered safely.
 *
 * This is used throughout the JSX runtime and render pipeline
 * to signal invalid intrinsic usage, malformed props, unsupported
 * render states, or invalid output combinations.
 */
export class JSXParseError extends Error {
    constructor(message?: string) {
        super(message)
        this.name = "JSXParseError"
    }
}
