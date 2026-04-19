import type { CycleState } from "src/types/lib.types"
import { InternalError } from "../../../lib/render/components/Error"
import { createMessageRender } from "../../../lib/render/message.render"
import type { ReactiveContext } from "../../../types/plugin.types"
import { globalCurrentState, globalPreviousState, globalStates, createHash } from "../../../utils"
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
}): Promise<CycleState | undefined> {
    try {
        if (!globalCurrentState[id] || !globalPreviousState[id]) return
        const previous = globalPreviousState[id], current = globalCurrentState[id]
        const target = { chat: current.message.chat.id, message: current.message.message_id }

        const jsx = await InternalError<C>({ error, id, retry: async () => { await globalStates.get(id)?.rerender() } })
        const render = await createMessageRender({ id, method: createErrorMessageState.name, jsx, ctx, other: {} as any }), hash = createHash(render)

        if (hash !== previous.hash) return

        await ctx.api.deleteMessage(target.chat, target.message)
        const message = await ctx.api.sendMessage(target.chat, render.text, render.other)
        if (!message) throw new Error("Failed to send error message")
        globalCurrentState[id] = { message, render, hash }

        await flushEffects();

        if (!globalCurrentState[id]) throw new Error("No state rendered")
        globalPreviousState[id] = globalCurrentState[id]
        return globalCurrentState[id]
    } catch (e) {
        console.error(e)
    }
}
