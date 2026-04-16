import type {
    RawApi,
} from "grammy";
import type {
    InputMediaPhoto,
    InputMediaVideo,
    InputMediaDocument,
    InputMediaAudio,
} from "grammy/types";
import type { Other } from "node_modules/grammy/out/core/api.d.ts";
import type { Methods } from "node_modules/grammy/out/core/client.d.ts";

export type InputMediaOmitAnimation = (InputMediaAudio | InputMediaDocument | InputMediaPhoto | InputMediaVideo)
export type InputMediaArrayOmitAnimation = readonly InputMediaOmitAnimation[]

/**
 * A convenience alias for Grammy's {@link Other} utility type,
 * specialized for context-bound API helper methods.
 *
 * This type is commonly used to describe additional Telegram method options
 * while excluding parameters that are already handled internally by
 * context-aware helpers such as `replyWithJSX()` or `editMessageJSX()`.
 *
 * It is especially useful for plugin APIs that wrap standard Grammy
 * context methods and need strongly typed `other` options.
 *
 * @template {Methods<RawApi>} M - The target Grammy API method name.
 * @template {string} [X=never] - Keys to exclude from the resulting options type.
 *
 * @example
 * type ReplyOptions = OtherContexted<
 *     "sendMessage",
 *     "text" | "chat_id" | "parse_mode"
 * >;
 */
export type OtherContexted<M extends Methods<RawApi>, X extends string = never> = Other<RawApi, M, X>;
