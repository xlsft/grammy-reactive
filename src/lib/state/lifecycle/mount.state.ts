import type { BotHandlerLifecycleInstance, BotMessageHandler } from "../../../../src/types/lib.types"
import { createMessageRender } from "../../../../src/lib/render/message.render"
import { globalCurrentState, globalPreviousState } from "../../../../src/utils"
import type { ReactiveContext } from "../../../../src/types/plugin.types"
import { flushEffects } from "../hooks/effect.hooks"
import { isAbortError, safeHandler, createHash } from "../../../utils"

export async function createMountMessageState<C extends ReactiveContext>({ id, ctx, handler, controller, state }: {
    id: string,
    ctx: C,
    handler: BotMessageHandler<C>,
    controller?: AbortController,
    state: BotHandlerLifecycleInstance<C>
}) {
    try {
        const target = { chat: ctx.chat?.id }
        if (!target.chat) throw new Error("Target chat not found")
        const jsx = safeHandler({ handler, ctx, id, controller })
        const render = await createMessageRender({ id, method: createMountMessageState.name, jsx, ctx, other: {} as any }), hash = createHash(render)

        if (render.view === 'message') {
            const message = await ctx.api.sendMessage(target.chat, render.text, render.other)
            if (!message) throw new Error("Failed to send message")
            globalCurrentState[id] = { message, render, hash }
        } else if (render.view === 'caption') {
            let message; if (render.media.length > 1) message = (await ctx.api.sendMediaGroup(target.chat, render.media, render.other))[0]
            else if (render.media[0]?.type === 'photo') message = await ctx.api.sendPhoto(target.chat, render.media[0]?.media!, render.other)
            else if (render.media[0]?.type === 'video') message = await ctx.api.sendVideo(target.chat, render.media[0]?.media!, render.other)
            else if (render.media[0]?.type === 'document') message = await ctx.api.sendDocument(target.chat, render.media[0]?.media!, render.other)
            else if (render.media[0]?.type === 'audio') message = await ctx.api.sendAudio(target.chat, render.media[0]?.media!, render.other)
            else throw new Error("Unsupported media type")
            if (!message) throw new Error("Failed to send media group")
            globalCurrentState[id] = { message, render, hash }
        } else throw new TypeError(`Undefined view on mount: ${render.view}`)

        await flushEffects()

        if (!globalCurrentState[id]) throw new Error("No state rendered")
        globalPreviousState[id] = globalCurrentState[id]
    } catch (e) {
        if (isAbortError(e)) return;
        console.error(e)
        await state.error(e as Error)
    }
}
