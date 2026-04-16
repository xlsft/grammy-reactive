import { InternalError } from "~/lib/render/components/Error"
import { createMessageRender } from "~/lib/render/message.render"
import type { ReactiveContext } from "~/types/plugin.types"
import { globalCurrentState, globalPreviousState, globalStates } from "~/utils"
import { flushEffects } from "../hooks/effect.hooks"

/**
 * Replaces the current rendered message with an internal error fallback.
 *
 * This lifecycle recovery handler removes the active message,
 * renders the built-in error component, and sends it as a new
 * message while preserving reactive state tracking.
 *
 * The fallback view also includes a retry action that triggers
 * a rerender of the failed handler instance.
 *
 * @template C
 * @param {{
 *     id: string,
 *     ctx: C,
 *     error: Error
 * }} options
 * Error recovery lifecycle options.
 * @returns {Promise<void>}
 */
export async function createErrorMessageState<C extends ReactiveContext>({ id, ctx, error }: {
    id: string,
    ctx: C,
    error: Error,
}) {
    try {
        if (!globalCurrentState[id]) return
        await ctx.api.deleteMessage(globalCurrentState[id]?.chat.id, globalCurrentState[id]?.message_id)
        const data = await createMessageRender({
            id,
            method: createErrorMessageState.name,
            jsx: await InternalError<C>({
                error,
                id,
                retry: async () => {
                    const state = globalStates.get(id);
                    await state?.rerender();
                },
            }),
            ctx,
            other: {} as any,
        })
        const message = await ctx.api.sendMessage(globalCurrentState[id]?.chat.id, data.text, data.other)
        if (!message) throw new Error("Failed to send error message")
        globalCurrentState[id] = message
        await flushEffects();
        if (!globalCurrentState[id]) throw new Error("No state rendered")
        globalPreviousState[id] = globalCurrentState[id]
    } catch (e) {
        console.error(e)
    }
}
