import { type BotMessageHandler } from "~/types/lib.types";
import { reactive } from "./plugin";
import { generateUniqueId } from "~/utils";
import { createMessageState } from "./state/create.state";
import type { ReactiveContext } from "~/types/plugin.types";
import { isAbortError } from "~/utils/isAbortError";

export function defineMessageHandler<C extends ReactiveContext>(
    handler: BotMessageHandler<C>
) {
    return async (ctx: C) => {
        const id = generateUniqueId()
        const state = createMessageState({ id, ctx, handler })
        try {
            await state.mount()
        } catch (e) {
            if (isAbortError(e)) return;
            await state.error(e as Error)
        }
    }
}

export { reactive }
export { createMessageRender } from "./render/message.render"
export * from "./state/hooks"
export * from "./helpers"
export type { JSX } from "../jsx/runtime/jsx.runtime"
export type {
    PluginOptions as Options,
    ReactiveContextFlavor as ReactiveFlavor
} from "../types/plugin.types"
export type {
    BotMessageHandler as MessageHandler
} from '../types/lib.types'
