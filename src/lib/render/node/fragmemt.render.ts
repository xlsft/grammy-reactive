import type { RenderedMessageOptions } from "src/types/lib.types";
import type { IntrinsicElements, JSX } from "src/types/jsx.types";
import { createIntrinsicElementRender } from "./intrinsic.render";
import { createPlainElementRender } from "./plain.render";
import type { MaybeArray, ReactiveContext } from "~/types/plugin.types";
import type { OtherContexted } from "~/types/grammy.types";

/**
 * Recursively renders a JSX fragment tree into Telegram-compatible HTML string output.
 *
 * This renderer walks the provided JSX subtree, concatenates rendered
 * text output, delegates intrinsic node rendering, and bubbles collected
 * media attachments upward through the render pipeline.
 *
 * Supported node handling:
 * - plain text nodes
 * - fragment recursion
 * - intrinsic host node rendering
 *
 * Media extraction can optionally be suppressed for nested render
 * branches when only text output is required.
 *
 * @template {ReactiveContext} C
 * @template {OtherContexted<"sendMessage", "text" | "chat_id" | "parse_mode">} Other
 * @param {MaybeArray<JSX.Element>} elements - The JSX subtree to render.
 * @param {RenderedMessageOptions<C, Other>} options - Active render context.
 * @param {boolean} [noMedia]
 * When `true`, extracted media is ignored for this render branch.
 * @returns {Promise<[string, IntrinsicElements["img"][]] | [string]>}
 * The rendered HTML text and optional bubbled media attachments.
 */
export async function createFragmentElementRender<
    C extends ReactiveContext,
    Other extends OtherContexted<"sendMessage", "text" | "chat_id" | "parse_mode">
>(
    elements: MaybeArray<JSX.Element>,
    options: RenderedMessageOptions<C, Other>,
    noMedia?: boolean
    /** TODO:
     * Uncomment this when caption rerender is fixed
     * */
//): Promise<[string, IntrinsicElements["img"][]] | [string]> {
): Promise<[string, any[]] | [string]> {
    const array = Array.isArray(elements) ? elements : [elements];
    const media: any[] = [];
    /** TODO:
     * Uncomment this when caption rerender is fixed
     * */
    // const media: IntrinsicElements["img"][] = [];

    let out = ""; for (let i = 0; i < array.length; i++) {
        const current = array[i]; if (current == null) continue;
        const element = await current, type = element.type;

        if (type === "plain") { out += createPlainElementRender(element); continue }
        const rendered = type === "fragment"
            ? await createFragmentElementRender(element.children, options)
            : await createIntrinsicElementRender(element, options);

        out += rendered[0]
        if (noMedia) continue
        const _media = rendered[1];
        if (_media) for (let j = 0; j < _media.length; j++) {
            const item = _media[j];
            if (item) media.push(item);
        }
    }

    return [out, media];
}
