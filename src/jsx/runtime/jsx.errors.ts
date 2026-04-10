export class JSXParseError extends Error {
    constructor(message?: string) {
        super(message)
        this.name = "JSXParseError"
    }
}
