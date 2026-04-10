import type { BotHandlerLifecycleInstance, BotMessageHandler } from "src/types/lib.types"
import { createMessageRender } from "src/lib/render/message.render"
import { globalCurrentState, globalPreviousState } from "src/utils"
import type { ReactiveContext } from "src/types/plugin.types"
import { InternalError } from "~/lib/render/components/Error"
import { flushEffects } from "../hooks/effect.hooks"
import { isAbortError } from "~/utils/isAbortError"

export async function createMountMessageState<C extends ReactiveContext>({ id, ctx, handler, controller, state }: {
    id: string,
    ctx: C,
    handler: BotMessageHandler<C>,
    controller?: AbortController,
    state: BotHandlerLifecycleInstance<C>
}) {
    try {
        let jsx;
        try {
            jsx = await handler({ ctx, id, controller });
        } catch (e) {
            console.error(e)
            jsx = await InternalError({
                error: e as Error,
                id,
            });
        }
        const data = await createMessageRender({
            id,
            method: createMountMessageState.name,
            jsx,
            ctx,
            other: {} as any,
        })

        if (data.view === 'message') {
            const message = await ctx.reply(data.text, data.other)
            if (!message) throw new Error("Failed to send message")
            globalCurrentState[id] = message
        } else if (data.view === 'caption') {
            if (data.media.length > 2) {
                const messages = await ctx.replyWithMediaGroup(data.media.slice(0, 10), data.other)
                if (!messages || !messages[0]) throw new Error("Failed to send media group")
                globalCurrentState[id] = messages[0]
            } else if (data.media.length === 1) {
                if (!data.photo) throw new Error("No photo provided for caption view")
                const message = await ctx.replyWithPhoto(data.photo, data.other)
                if (!message) throw new Error("Failed to send photo")
                globalCurrentState[id] = message
            } else throw new TypeError("No media provided for caption view")
        }
        await flushEffects()
        if (!globalCurrentState[id]) throw new Error("No state rendered")
        globalPreviousState[id] = globalCurrentState[id]
    } catch (e) {
        if (isAbortError(e)) return;
        console.error(e)
        await state.error(e as Error)
    }
}
