import type { BotHandlerLifecycleInstance, BotMessageHandler } from "~/types/lib.types"
import { globalCurrentState, globalHookRuntimeAsyncStorage, globalPreviousState } from "~/utils"
import { createMessageRender } from "~/lib/render/message.render"
import type { ReactiveContext } from "~/types/plugin.types"
import type { Message } from "~/types/grammy.types"
import { flushEffects } from "../hooks/effect.hooks"
import { isAbortError } from "~/utils/isAbortError"
import { isMessageNotFound } from "~/utils/isMessageNotFount"

export async function createRerenderMessageState<C extends ReactiveContext>({ id, ctx, handler, controller, state }: {
    id: string,
    ctx: C,
    handler: BotMessageHandler<C>,
    controller?: AbortController,
    state: BotHandlerLifecycleInstance<C>
}) {
    try {
        const runtime = globalHookRuntimeAsyncStorage.getStore()!
        const version = ++runtime.renderVersion;
        let committed = false;
        if (!globalCurrentState[id] || controller?.signal.aborted) return
        const element = await handler({ ctx, id, controller } as any)
        const data = await createMessageRender({
            id,
            method: createRerenderMessageState.name,
            jsx: element,
            ctx,
            other: {} as any,
        })
        if (version !== runtime.renderVersion) return;
        try {
            if (data.view === 'message') {
                if (globalPreviousState[id]?.text !== data.text) {
                    await ctx.api.editMessageText(
                        globalCurrentState[id].chat.id,
                        globalCurrentState[id].message_id,
                        data.text,
                        data.other,
                        controller?.signal as any
                    )
                    committed = true
                }
            } else if (data.view === 'caption') {

                /** TODO:
                 * Fix caption rerender
                 * */
                console.log(globalPreviousState[id]?.caption, data.text)
                if (globalPreviousState[id]?.caption !== data.text) await ctx.api.editMessageCaption(
                    globalCurrentState[id].chat.id,
                    globalCurrentState[id].message_id,
                    data.other,
                    controller?.signal as any
                )
                if (data.media.length > 2) {
                    ctx.deleteMessage(controller?.signal as any)

                    const messages = await ctx.replyWithMediaGroup(data.media.slice(0, 10), data.other, controller?.signal as any)
                    if (!messages || !messages[0]) throw new Error("Failed to send media group")
                    globalCurrentState[id] = messages[0]
                } else if (data.media.length === 1) {
                    if (!data.media[0]) throw new Error("No photo provided for caption view")
                    const message = await ctx.api.editMessageMedia(
                        globalCurrentState[id].chat.id,
                        globalCurrentState[id].message_id,
                        data.media[0]!,
                        { ...data.other, caption: undefined },
                        controller?.signal as any
                    ) as Message.PhotoMessage;
                    if (!message) throw new Error("Failed to send photo")
                    globalCurrentState[id] = message
                } else throw new TypeError("No media provided for caption view")
                committed = true
            }
        } catch (e) {
            if (!isMessageNotFound(e)) throw e;
        }

        if (committed && !controller?.signal.aborted) {
            await flushEffects();
        }
        if (!globalCurrentState[id]) throw new Error("No state rendered")
        globalPreviousState[id] = globalCurrentState[id]
    } catch (e) {
        if (isAbortError(e)) return;
        console.error(e)
        await state.error(e as Error)
    }
}
