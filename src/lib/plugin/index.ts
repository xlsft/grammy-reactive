import type { MiddlewareFn, NextFunction } from "grammy";
import type { ReactiveContext, ReactiveContextFlavor } from "../../types/plugin.types";
import { createOnClickEvent } from "../state/events/onclick.event";
import { globalCurrentState } from "../../utils";
import { Composer } from "grammy";
import { createMessageState } from "../state/create.state";
import type { Message } from "grammy/types";

/**
 * Creates the reactive middleware plugin.
 *
 * This middleware extends the Grammy context with support for:
 * - JSX-based message rendering
 * - reactive component lifecycle handling
 * - inline button callback dispatch
 * - custom `ctx.reply()` JSX support
 *
 * It also installs internal callback query listeners required
 * for interactive button components and reactive rerender flows.
 *
 * @template C
 * @param {PluginOptions<C>} [options]
 * Optional plugin configuration.
 * @returns {MiddlewareFn<ReactiveContextFlavor<C>>}
 * A Grammy middleware that enables the reactive JSX runtime.
 *
 * @example
 * ```ts
 * bot.use(reactive())
 * ```
 *
 * @example
 * ```tsx
 * await ctx.reply(() => (
 *   <b>Hello from JSX</b>
 * ))
 * ```
 */
export function reactive<C extends ReactiveContext>(): MiddlewareFn<ReactiveContextFlavor<C>> {
    const composer = new Composer<ReactiveContextFlavor<C>>()
    composer.on("callback_query:data", createOnClickEvent)

    const createComposerMiddleware = composer.middleware();
    const createMiddleware: MiddlewareFn<ReactiveContextFlavor<C>> = async (
        ctx: ReactiveContextFlavor<C>,
        next: NextFunction
    ) => {
        ctx.reply = async function reply(content, other, signal) {
            if (!ctx.chat) throw new Error("Cannot reply to a message without a chat")
            if (typeof content === "string") {
                return await ctx.api.sendMessage(ctx.chat.id, content, {
                    business_connection_id: ctx.businessConnectionId, ...(ctx.msg?.is_topic_message ? { message_thread_id: ctx.msg.message_thread_id } : {}),
                    direct_messages_topic_id: ctx.msg?.direct_messages_topic?.topic_id,
                    ...other,
                }, signal as any)
            } else if (typeof content === "function") {
                const state = createMessageState({ ctx, handler: () => content(ctx) }); await state.mount()
                const current = globalCurrentState[state.id]; if (!current) throw new Error("Failed to render message")
                return current.message as Message.TextMessage
            } else throw new Error("Invalid content type")
        };
        return await createComposerMiddleware(ctx, next)
    }

    return createMiddleware;
}
