import { InlineKeyboard, InputMediaBuilder, Keyboard } from "grammy";
import { createFragmentElementRender } from "./fragmemt.render";
import { generateUniqueId, isEmoji, isUnixTime, getEmoji, getPlainText, globalButtonCallbacks } from "../../../utils";
import { createTagRender as t } from "../tag.render";
import { JSXParseError } from "../../../jsx/runtime/jsx.errors";
import type { ExactInlineButtonProps, IntrinsicElement } from "../../../types/jsx.types";
import type { ReactiveContext } from "../../../types/plugin.types";
import type { RenderedMessageOptions } from "../../../types/lib.types";
import type { OtherContexted, InputMediaOmitAnimation } from "../../../types/grammy.types";

/**
 * Renders a single intrinsic JSX node into its Telegram-compatible HTML string output.
 *
 * This is the host renderer responsible for translating framework
 * intrinsic elements into Telegram HTML, media attachments, preview
 * metadata, and interactive reply markup mutations.
 *
 * Supported responsibilities include:
 * - Telegram HTML tag rendering
 * - media attachment extraction
 * - link preview configuration
 * - inline keyboard construction
 * - callback button registration
 * - intrinsic runtime validation
 *
 * Some intrinsic elements mutate the provided render options directly,
 * such as:
 * - `reply_markup`
 * - `link_preview_options`
 * - callback registry bindings
 *
 * Unsupported elements for the current render method are rejected
 * through runtime JSX parse errors.
 *
 * @template {ReactiveContext} C
 * @template {OtherContexted<"sendMessage", "text" | "chat_id" | "parse_mode">} Other
 * @param {IntrinsicElement} element - The intrinsic node to render.
 * @param {RenderedMessageOptions<C, Other>} options - Active render context.
 * @returns {Promise<[string, InputMediaOmitAnimation] | [string]>}
 * The rendered HTML fragment and optional extracted media.
 */
export async function createIntrinsicElementRender<C extends ReactiveContext, Other extends OtherContexted<"sendMessage", "text" | "chat_id" | "parse_mode">>(
    element: IntrinsicElement,
    options: RenderedMessageOptions<C, Other>
): Promise<[string, InputMediaOmitAnimation] | [string]> {
    if (options.unallowed && options.unallowed.includes(element.entity.type)) {
        throw new JSXParseError(`Elements: ${options.unallowed.join(', ')} is not allowed in "${options.method}" method`)
    }
    switch (element.entity.type) {
        case "br": return ['\n']
        case 'p': return [`${(await createFragmentElementRender(element.children, options, true))[0]}\n`]
        case 'b': return [
            t('b', (await createFragmentElementRender(element.children, options, true))[0])
        ]
        case 'i': return [
            t('i', (await createFragmentElementRender(element.children, options, true))[0])
        ]
        case 'u': return [
            t('u', (await createFragmentElementRender(element.children, options, true))[0])
        ]
        case 's': return [
            t('s', (await createFragmentElementRender(element.children, options, true))[0])
        ]
        case 'h': return [
            t('b', (await createFragmentElementRender(element.children, options, true))[0]) + '\n\n'
        ]
        case 'a': return [
            t('a', (await createFragmentElementRender(element.children, options, true))[0], {
                href: encodeURI(element.entity.href)
            })
        ]
        case 'blockquote': return [
            t('blockquote', (await createFragmentElementRender(element.children, options, true))[0])
        ]
        case 'code': return [
            t('code', (await createFragmentElementRender(element.children, options, true))[0])
        ]
        case 'codeblock': return [element.entity.lang ?
            t('pre', t('code', (await createFragmentElementRender(element.children, options, true))[0], {
                class: `language-${element.entity.lang}`
            })) : t('pre', (await createFragmentElementRender(element.children, options, true))[0])
        ]
        case 'spoiler': return [
            t('tg-spoiler', (await createFragmentElementRender(element.children, options, true))[0])
        ]
        case "mention": return [
            t('a', (await createFragmentElementRender(element.children, options, true))[0], {
                href: `tg://user?id=${element.entity.id}`
            })
        ]
        case 'emoji': {
            const alt = getPlainText(element) || '👍'
            if (!isEmoji(alt)) throw new JSXParseError(`Emoji alt property is not a valid emoji: ${alt}`);
            return [
                t('tg-emoji', alt, { "emoji-id": element.entity.id })
            ]
        }
        case 'time': {
            if (!isUnixTime(element.entity.unix)) throw new JSXParseError(`Time property is not a valid unix timestamp: ${element.entity.unix}`);
            return [
                t('tg-time', (await createFragmentElementRender(element.children, options, true))[0], {
                    unix: element.entity.unix,
                    format: element.entity.format
                })
            ]
        }
        case "media": {
            const builder = InputMediaBuilder
            const entity = element.entity
            let media: InputMediaOmitAnimation
            switch (entity.variant) {
                case undefined: media = builder.photo(entity.src, {
                    has_spoiler: entity.spoiler,
                    show_caption_above_media: entity.position === 'bottom',
                }); break
                case 'video': media = builder.video(entity.src, {
                    has_spoiler: entity.spoiler,
                    show_caption_above_media: entity.position === 'bottom',
                    cover: entity.cover,
                    thumbnail: entity.thumbnail,
                    width: entity.width,
                    height: entity.height,
                    start_timestamp: entity.start,
                    duration: entity.duration,
                    supports_streaming: entity.stream
                }); break
                case 'audio': media = builder.audio(entity.src, {
                    thumbnail: entity.thumbnail,
                    duration: entity.duration,
                    performer: entity.performer,
                    title: entity.title
                }); break
                case 'document': media = builder.document(entity.src, {
                    thumbnail: entity.thumbnail,
                    disable_content_type_detection: entity.disableContentTypeDetection
                }); break
                default: throw new JSXParseError(`Unsupported media variant: ${(entity as any).variant}`)
            }

            if (!media) throw new JSXParseError(`Media builder returned undefined for variant: ${entity.variant}`)

            return ['', media]
        }
        case "preview": {
            if (options.other.link_preview_options) throw new JSXParseError("Preview in this state are already set")
            options.other.link_preview_options = {
                is_disabled: false,
                url: element.entity.src,
                show_above_text: element.entity.position !== 'bottom',
                ...(element.entity.size === 'small' ? { prefer_small_media: true } : { prefer_large_media: true }),
            }
            return [
                t('a', '\u00A0', { href: encodeURI(element.entity.src) })
            ]
        }
        case "button": {
            if (options.other.reply_markup instanceof Keyboard) throw new JSXParseError("Inline keyboard cannot be used with custom keyboards")
            if (!options.other.reply_markup) options.other.reply_markup = new InlineKeyboard()

            const entity = element.entity
            const id = `::${options.id}::${(entity as ExactInlineButtonProps<'callback'>).event || generateUniqueId()}`
            const keyboard = options.other.reply_markup as InlineKeyboard
            const emoji = getEmoji(element); if (emoji) keyboard.icon(emoji.id)
            const text = getPlainText(element); if (!text) throw new JSXParseError("Inline button must have a text child")

            switch (entity.variant) {
                case undefined: keyboard.text(text, id); break
                case 'url': keyboard.url(text, entity.url); break
                case 'login': keyboard.login(text, entity.data); break
                case 'switch_inline': keyboard.switchInline(text, entity.query); break
                case 'switch_inline_chosen': keyboard.switchInlineChosen(text, entity.data); break
                case 'copy': keyboard.copyText(text, entity.value.slice(0, 255)); break
                case 'game': keyboard.game(text); break
                case 'pay': keyboard.pay(text); break
                default: keyboard.text(text, id); break
            }

            if (entity.color) keyboard.style(entity.color)
            if (entity.row) keyboard.row()
            if ((entity.variant === undefined || !entity.variant) && (entity as ExactInlineButtonProps<'callback'>).onClick) {
                globalButtonCallbacks[id] = (entity as ExactInlineButtonProps<'callback'>).onClick!
            }
            return ['']
        }
        default: return ['']
    }
}
