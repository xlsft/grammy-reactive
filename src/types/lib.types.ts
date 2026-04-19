import type { Message } from "grammy/types";
import type { InputMediaArrayOmitAnimation, OtherContexted } from "./grammy.types";
import type { IntrinsicElements, JSX } from "./jsx.types";
import type { ReactiveContext } from "./plugin.types";

// ! Render pipeline

/**
 * Represents the asynchronous result of the message render pipeline.
 *
 * Includes the final serialized text, Telegram API options,
 * selected render target view, generated media collection,
 * and an optional primary photo attachment.
 *
 * @template {OtherContexted<"sendMessage", "text" | "chat_id" | "parse_mode">} Other
 */
export type RenderedMessage<
    Other extends OtherContexted<"sendMessage", "text" | "chat_id" | "parse_mode">
> = Promise<{
    text: string;
    other: Other;
    view: RenderedViewType;
    media: InputMediaArrayOmitAnimation;
}>;

/**
 * Input options required to render a JSX tree into a Telegram message payload.
 *
 * This type defines the full context passed into the render pipeline,
 * including runtime context, render method metadata, unique render ID,
 * and optional intrinsic restrictions.
 *
 * @template {ReactiveContext} C
 * @template {OtherContexted<"sendMessage", "text" | "chat_id" | "parse_mode">} Other
 */
export type RenderedMessageOptions<
    C extends ReactiveContext,
    Other extends OtherContexted<"sendMessage", "text" | "chat_id" | "parse_mode">
> = {
    method: string;
    jsx: JSX.Element[] | JSX.Element;
    ctx: C;
    other: Other;
    id: string;
    unallowed?: (keyof IntrinsicElements)[];
};

/**
 * Defines the render target mode selected by the message serializer.
 *
 * - `"message"` renders the content as message text
 * - `"caption"` renders the content as media caption
 */
export type RenderedViewType = "message" | "caption";

// ! Component lifecycle

/**
 * Describes the lifecycle contract for a reactive bot handler instance.
 *
 * Lifecycle hooks are used to mount, rerender, and unmount
 * dynamic JSX-driven bot views.
 *
 * @template {ReactiveContext} C
 */
export type BotHandlerLifecycle<C extends ReactiveContext> = (ctx: C) => {
    mount: () => Promise<void>;
    rerender: () => Promise<void>;
    unmount: () => Promise<void>;
    error: (error: Error) => Promise<void>;
    controller: AbortController;
};

export type LifecycleReturn<C extends ReactiveContext> = ReturnType<BotHandlerLifecycle<C>> extends infer R
    ? R extends { controller: AbortController }
        ? {
            [K in keyof Omit<R, 'controller'>]:
                Omit<R, 'controller'>[K] extends (...args: any) => any
                    ? ReturnType<Omit<R, 'controller'>[K]>
                    : never
        }[keyof Omit<R, 'controller'>]
        : never
    : never;

/**
 * Resolves the concrete lifecycle instance returned by
 * {@link BotHandlerLifecycle}.
 *
 * @template {ReactiveContext} C
 */
export type BotHandlerLifecycleInstance<
    C extends ReactiveContext
> = ReturnType<BotHandlerLifecycle<C>>;


export type CycleState = {
    message: Message,
    render: Awaited<RenderedMessage<any>>,
    hash: string
}

// ! Message handlers

/**
 * Defines a reactive bot message render handler.
 *
 * Reactive handlers receive lifecycle controls, context,
 * and hook-based event helpers such as state management.
 *
 * @template {ReactiveContext} C
 */
export type BotMessageHandler<C extends ReactiveContext> = (
    event: { ctx: C, id: string, controller?: AbortController }
) => JSX.Element | Promise<JSX.Element>;

// ! State managment
