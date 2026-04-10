import type { Context, Message, OtherContexted, Bot } from "./grammy.types";
import type { JSX } from "./jsx.types";

// ! Utility types

/**
 * Excludes `undefined` from a union type.
 *
 * Commonly used to normalize optional generic parameters
 * into a required variant for internal render pipelines.
 *
 * @template T
 */
export type RequiredUnion<T> = T extends undefined ? never : T;

/**
 * Represents a value that can be provided either as a single item
 * or as an array of items of the same type.
 *
 * Useful for APIs that accept both:
 * - a single value
 * - multiple values
 *
 * @template T
 *
 * @example
 * type Input = MaybeArray<string>;
 * // string | string[]
 */
export type MaybeArray<T> = T | T[]

// ! Options

/**
 * Configuration options for the reactive plugin runtime.
 *
 * Used to provide the target options for
 * middleware registration
 *
 * @template C
 *
 * @example
 * const options: PluginOptions<MyContext> = {
 *
 * };
 */
export type PluginOptions<C extends Context> = {

} | undefined;

// ! Context extensions

/**
 * Augments a Grammy context type with reactive runtime capabilities.
 *
 * This utility flavor composes the base Grammy `Context` with
 * {@link ReactiveContextExtension}, making all reactive helpers
 * available on the resulting context type.
 *
 * Useful for strongly typed middleware pipelines, plugins, and
 * custom bot context definitions.
 *
 * @template {Context} C
 */
export type ReactiveContextFlavor<C extends Context> = C & ReactiveContextExtension;

/**
 * A minimal reactive Grammy context type based on the standard `Context`.
 *
 * This is a convenience alias for:
 * `ReactiveContextFlavor<Context>`.
 *
 * Useful when no custom context extensions are required.
 */
export type ReactiveContext = ReactiveContextFlavor<Context>;

/**
 * Extends the Grammy context with JSX-based messaging helpers.
 *
 * These methods render JSX trees into Telegram-compatible HTML messages
 * and forward the result to the corresponding context or raw API method.
 */
export interface ReactiveContextExtension {
    /**
     * Context-aware alias for api.sendMessage with JSX support. Use this method to send text messages with JSX markup.
     * On success, the sent Message is returned.
     *
     * @param jsx  — JSX of the message to be sent, 1-4096 characters after entities parsing and render
     * @param other — Optional remaining parameters, confer the official reference below
     * @param signal
     * Optional AbortSignal to cancel the request
     */
    reply(
        jsx: MaybeArray<JSX.Element>,
        other?: OtherContexted<"sendMessage", "text" | "chat_id" | "parse_mode">,
        signal?: AbortSignal
    ): Promise<Message.TextMessage>;
}
