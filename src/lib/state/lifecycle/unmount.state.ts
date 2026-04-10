import { globalCurrentState } from "~/utils"
import type { ReactiveContext } from "~/types/plugin.types"
import type { BotHandlerLifecycleInstance } from "~/types/lib.types";
import { cleanupEffects } from "../hooks/effect.hooks";
import { isAbortError } from "~/utils/isAbortError";

export async function createUnmountMessageState<C extends ReactiveContext>({ id, ctx, controller, state }: {
    id: string;
    ctx: C;
    controller: AbortController
    state: BotHandlerLifecycleInstance<C>
}) {
    try {
        await cleanupEffects()
        if (!globalCurrentState[id]) return
        await ctx.deleteMessage(controller.signal as any)
    } catch (e) {
        if (isAbortError(e)) return;
        console.error(e)
        await state.error(e as Error)
    }
}
