import { createFragmentElementRender } from "./node/fragmemt.render";
import type { ReactiveContext } from "../../types/plugin.types";
import type { RenderedMessage, RenderedMessageOptions } from "../../types/lib.types";
import type { OtherContexted } from "../../types/grammy.types";
import { InternalError } from "./components/Error";

/**
 * Renders a JSX message tree into a Telegram-compatible payload.
 *
 * This is the root render pipeline entry responsible for converting
 * a resolved JSX tree into:
 * - HTML text
 * - Telegram send options
 * - optional media attachments
 * - resolved render view mode
 *
 * The renderer automatically enforces `parse_mode: "HTML"` and
 * converts collected image attachments into Telegram photo media.
 *
 * If at least one media attachment is present, the resulting
 * render view is resolved as `"caption"`. Otherwise, it is
 * rendered as a plain `"message"`.
 *
 * The final text output is automatically trimmed to Telegram's character message limit.
 * If view is `"message"`, the text is trimmed to 4096 characters.
 * If view is `"caption"`, the text is trimmed to 1024 characters.
 *
 * @template {ReactiveContext} C
 * @template {OtherContexted<"sendMessage", "text" | "chat_id" | "parse_mode">} Other
 * @param {RenderedMessageOptions<C, Other>} options - Root render options.
 * @returns {RenderedMessage<Other>} The fully rendered Telegram payload.
 *
 * @example
 * const result = await createMessageRender({
 *     id,
 *     method: "replyWithJSX",
 *     jsx: <b>Hello</b>,
 *     ctx,
 *     other: {},
 * });
 */
export async function createMessageRender<C extends ReactiveContext, Other extends OtherContexted<"sendMessage", "text" | "chat_id" | "parse_mode">>(
    options: RenderedMessageOptions<C, Other>
): RenderedMessage<Other> {
    try {
        options.other ??= {} as Other; (options.other as any).parse_mode = "HTML"; options.other.reply_markup = undefined
        const tree = await options.jsx;

        const [text, media] = await createFragmentElementRender(tree, options);
        if (media?.length) {
            (options.other as any).caption = text.slice(0, 1024);
            if (media.length > 1 && options.other.reply_markup) throw new Error('Reply markup not supported for media groups');
        }
        return {
            text: text.slice(0, 4096),
            other: options.other,
            view: media?.length ? 'caption' : 'message',
            media: (media ?? []).slice(0, 10).map(v => ({ ...v, ...options.other, caption: text.slice(0, 1024) }))
        };
    } catch (e) {
        const message = await createMessageRender({
            ...options,
            jsx: await InternalError({ error: e as Error, id: options.id })
        })
        return message
    }
}
