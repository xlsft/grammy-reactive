import type { MiddlewareFn, NextFunction } from "~/types/grammy.types";
import type { PluginOptions, ReactiveContext, ReactiveContextFlavor, RequiredUnion } from "~/types/plugin.types";
import { createOnClickEvent } from "../state/events/onclick.event";
import { generateUniqueId } from "~/utils";
import { createMessageRender } from "../render/message.render";
import { JSXParseError } from "~/jsx/runtime/jsx.errors";
import { Composer } from "grammy";

export function reactive<C extends ReactiveContext>(options?: PluginOptions<C>): MiddlewareFn<ReactiveContextFlavor<C>> {

    const composer = new Composer<ReactiveContextFlavor<C>>()
    composer.on("callback_query:data", createOnClickEvent)

    const createComposerMiddleware = composer.middleware();
    const createMiddleware: MiddlewareFn<ReactiveContextFlavor<C>> = async (
        ctx: ReactiveContextFlavor<C>,
        next: NextFunction
    ) => {
        ctx.reply = async function reply(content, other, signal) {
            const dispatch = async (content: string) => {
                if (!ctx.chat) throw new Error("Cannot reply to a message without a chat")
                return await ctx.api.sendMessage(ctx.chat.id, content, {
                    business_connection_id: ctx.businessConnectionId,
                    ...(ctx.msg?.is_topic_message
                        ? { message_thread_id: ctx.msg.message_thread_id }
                        : {}),
                    direct_messages_topic_id: ctx.msg?.direct_messages_topic?.topic_id,
                    ...other,
                }, signal as any)
            }
            if (typeof content === "string") {
                return await dispatch(content)
            } else {
                const id = generateUniqueId()
                const message = await createMessageRender<
                    typeof ctx, RequiredUnion<typeof other>
                >({
                    method: "repl", id,
                    jsx: content, ctx, other: {},
                    unallowed: ['img']
                })
                other = message.other
                if (!message) throw new JSXParseError("No message rendered")
                return await dispatch(message.text)
            }
        };
        return await createComposerMiddleware(ctx, next)
    }

    return createMiddleware;
}
