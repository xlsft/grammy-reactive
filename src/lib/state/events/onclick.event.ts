import { globalButtonCallbacks, globalStates } from "~/utils"
import { createErrorMessageState } from "../lifecycle/error.state"
import type { ReactiveContext } from "~/types/plugin.types"
import type { NextFunction } from "~/types/grammy.types"
import { isAbortError } from "~/utils/isAbortError"

/**
 * Dispatches registered reactive button callbacks for callback queries.
 *
 * This internal middleware resolves callback payloads against the
 * button callback registry and executes the matching handler within
 * its owning lifecycle session.
 *
 * If no registered callback exists, middleware control is delegated
 * directly to the next handler.
 *
 * On handler failure, the owning lifecycle session is transitioned
 * into its error fallback state.
 *
 * @param {ReactiveContext} ctx - The reactive Telegram context.
 * @param {NextFunction} next - The next middleware in the pipeline.
 * @returns {Promise<void>}
 */
export async function createOnClickEvent(ctx: ReactiveContext, next: NextFunction): Promise<void> {
    if (ctx.callbackQuery?.data === undefined || !globalButtonCallbacks[ctx.callbackQuery.data]) return await next()
    const id = ctx.callbackQuery.data.match(/^::(.*?)::/)?.[1] ?? null
    if (!id) return await next()
    const state = globalStates.get(id)
    if (!state) return await next()
    try {
        await globalButtonCallbacks[ctx.callbackQuery.data]!(ctx)
        await ctx.answerCallbackQuery()
        await next()
    } catch (e) {
        if (isAbortError(e)) return;
        console.error(e)
        await state.error(e as Error)
    }
}
