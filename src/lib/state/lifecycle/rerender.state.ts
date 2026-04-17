import type { BotHandlerLifecycleInstance, BotMessageHandler } from "../../../types/lib.types"
import { globalCurrentState, globalHookRuntimeAsyncStorage, globalPreviousState, isMessageNotFound } from "../../../utils"
import { createMessageRender } from "../../../lib/render/message.render"
import type { ReactiveContext } from "../../../types/plugin.types"
import { flushEffects } from "../hooks/effect.hooks"
import { isAbortError, safeHandler, createHash } from "../../../utils"

export async function createRerenderMessageState<C extends ReactiveContext>({ id, ctx, handler, controller, state }: {
    id: string,
    ctx: C,
    handler: BotMessageHandler<C>,
    controller?: AbortController,
    state: BotHandlerLifecycleInstance<C>
}) {
    try {
        let committed = false; if (!globalCurrentState[id] || !globalPreviousState[id] || controller?.signal.aborted) return
        const previous = globalPreviousState[id], current = globalCurrentState[id]
        const target = { chat: current.message.chat.id, message: current.message.message_id }
        const runtime = globalHookRuntimeAsyncStorage.getStore()!, version = ++runtime.renderVersion;

        const jsx = safeHandler({ handler, ctx, id, controller }); if (version !== runtime.renderVersion) return
        const render = await createMessageRender({ id, method: createRerenderMessageState.name, jsx, ctx, other: previous.render.other ?? {} }), hash = createHash(render)

        if (hash === previous.hash) return

        if (render.view === 'message') {
            if (previous.render.text !== render.text)
                await ctx.api.editMessageText(target.chat, target.message, render.text, render.other, controller?.signal as any)
        } else if (render.view === 'caption') {
            if (previous.render.media.length > 1 || render.media.length > 1) {
                await ctx.api.deleteMessage(target.chat, target.message, controller?.signal as any)
                let message; if (render.media.length > 1) message = (await ctx.api.sendMediaGroup(target.chat, render.media, render.other, controller?.signal as any))[0]
                else if (render.media[0]?.type === 'photo') message = await ctx.api.sendPhoto(target.chat, render.media[0]?.media!, render.other)
                else if (render.media[0]?.type === 'video') message = await ctx.api.sendVideo(target.chat, render.media[0]?.media!, render.other)
                else if (render.media[0]?.type === 'document') message = await ctx.api.sendDocument(target.chat, render.media[0]?.media!, render.other)
                else if (render.media[0]?.type === 'audio') message = await ctx.api.sendAudio(target.chat, render.media[0]?.media!, render.other)
                else throw new Error("Unsupported media type")
                if (!message) throw new Error("Failed to rerender media group")
                globalCurrentState[id] = { message, render, hash }
            } else if (render.media[0] && (previous.render.media[0]?.media !== render.media[0]?.media || previous.render.media[0]?.type !== render.media[0]?.type)) {
                const message = await ctx.api.editMessageMedia(target.chat, target.message, render.media[0]!, controller?.signal as any)
                if (!message || message === true) throw new Error("Failed to edit message media")
                globalCurrentState[id] = { message, render, hash }
            } else if (previous.render.text !== render.text) {
                const message = await ctx.api.editMessageCaption(target.chat, target.message, render.other, controller?.signal as any)
                if (!message || message === true) throw new Error("Failed to edit message media")
                globalCurrentState[id] = { message, render, hash }
            }
        } else throw new TypeError(`Undefined view on rerender: ${render.view}`); committed = true

        if (committed && !controller?.signal.aborted) await flushEffects();

        if (!globalCurrentState[id]) throw new Error("No state rendered")
        globalPreviousState[id] = globalCurrentState[id]
    } catch (e) {
        if (isAbortError(e) && isMessageNotFound(e)) return;
        console.error(e)
        await state.error(e as Error)
    }
}
