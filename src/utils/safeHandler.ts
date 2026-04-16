import type { ReactiveContext } from "../types/plugin.types";
import { InternalError } from "../lib/render/components/Error";
import type { BotMessageHandler } from "../types/lib.types";

/**
 * Executes a message handler with built-in error fallback rendering.
 *
 * This utility wraps the provided handler in a try/catch block,
 * ensuring that any runtime errors are intercepted and replaced
 * with an internal error component. This prevents the rendering
 * pipeline from breaking and guarantees a valid JSX result.
 *
 * If the handler throws, the error is logged and a fallback view
 * is generated via the internal error renderer.
 *
 * @template C
 * @param {{
 *     id: string,
 *     ctx: C,
 *     handler: BotMessageHandler<C>,
 *     controller?: AbortController
 * }} options
 * Handler execution options, including context, identifier,
 * and optional abort controller for cancellation support.
 *
 * @returns {Promise<JSX.Element>}
 * A JSX element returned either from the handler or the error fallback.
 */
export async function safeHandler<C extends ReactiveContext>({ id, ctx, handler, controller }: {
    id: string,
    ctx: C,
    handler: BotMessageHandler<C>,
    controller?: AbortController
}) {
    let jsx; try {
        jsx = await handler({ ctx, id, controller });
    } catch (e) {
        console.error(e)
        jsx = await InternalError({ error: e as Error, id });
    }
    return jsx
}
