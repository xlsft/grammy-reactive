import { InternalError } from "~/lib/render/components/Error"
import { createMessageRender } from "~/lib/render/message.render"
import type { ReactiveContext } from "~/types/plugin.types"
import { globalCurrentState, globalPreviousState, globalStates } from "~/utils"
import { flushEffects } from "../hooks/effect.hooks"

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
