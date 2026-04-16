import type { ReactiveContext } from "../../../types/plugin.types"

/**
 * Renders the internal fallback error UI for failed lifecycle sessions.
 *
 * This diagnostic component is used by the lifecycle error boundary
 * to replace a failed reactive message with a developer-friendly
 * formatted error report.
 *
 * The rendered output includes:
 * - exception type
 * - error message
 * - stack trace
 * - lifecycle request ID
 *
 * The request ID helps correlate the rendered fallback message
 * with the owning lifecycle session and callback flow.
 *
 * @param {{ error: Error; id: string }} props - Error display payload.
 * @returns {JSX.Element} The formatted internal error message view.
 */
export function InternalError<C extends ReactiveContext>({ error, id, retry }: { error: Error, id?: string, retry?: () => Promise<void>; }) {
    const stack = error.stack || `${error.name}: ${error.message}\n    at unknown`
    return <>
        <h>⚠️ Internal Error</h>
        <blockquote expandable>
            <b>Exception:</b> <code>{error.name || "Error"}</code>
            <br />
            <b>Message:</b> <i>{error.message || "Unknown error"}</i>
        </blockquote><br/><br/>
        <h>📍 Stack Trace</h>
        <codeblock lang="ts">
            {stack}
        </codeblock><br/><br/>
        {id ? <>
            <i>Request ID: <code>{id}</code></i>
        </> : <>
            <i>
                It looks like there is no request ID available. This is usually a sign of Error in runtime itself.<br />
                It is a bug. Please report it to the developer with the stack trace above.
            </i>
        </>}
        {retry ? <button onClick={retry}>Retry</button> : null}
    </>
}
