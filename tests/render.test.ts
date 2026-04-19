import { describe, test, expect, vi } from "bun:test";
import { InlineKeyboard } from "grammy";
import { createIntrinsicElementRender } from "../src/lib/render/node/intrinsic.render";
import { createMessageRender } from "../src/lib/render/message.render";
import type { IntrinsicElement } from "../src/types/jsx.types";
import type { RenderedMessageOptions } from "../src/types/lib.types";
import type { ReactiveContext } from "../src/types/plugin.types";

const fn = vi.fn();
const createMockCtx = () => ({
    chat: { id: 123456789 },
    api: {
        sendMessage: fn,
        sendPhoto: fn,
        sendVideo: fn,
        sendAudio: fn,
        sendDocument: fn,
        sendMediaGroup: fn,
        editMessageText: fn,
        editMessageMedia: fn,
        editMessageCaption: fn,
        deleteMessage: fn,
    },
}) as unknown as ReactiveContext;

const createOptions = (overrides = {}): RenderedMessageOptions<ReactiveContext, any> => ({
    id: "test-id",
    method: "sendMessage",
    jsx: Promise.resolve({ type: "plain", value: "test" } as any),
    ctx: createMockCtx(),
    other: {},
    ...overrides,
});

describe("Element renders", () => {
    describe("Basic markup", () => {
        test("Line break", async () => {
            const element: IntrinsicElement = { type: "intrinsic", entity: { type: "br" }, children: [] };
            const result = await createIntrinsicElementRender(element, createOptions());
            expect(result[0]).toBe("\n");
        });

        test("Paragraph", async () => {
            const element: IntrinsicElement = { type: "intrinsic", entity: { type: "p" }, children: [{ type: "plain", value: "Hello" }] };
            const result = await createIntrinsicElementRender(element, createOptions());
            expect(result[0]).toBe("Hello\n");
        });

        test("Bold text", async () => {
            const element: IntrinsicElement = { type: "intrinsic", entity: { type: "b" }, children: [{ type: "plain", value: "bold" }] };
            const result = await createIntrinsicElementRender(element, createOptions());
            expect(result[0]).toBe("<b>bold</b>");
        });

        test("Italic text", async () => {
            const element: IntrinsicElement = { type: "intrinsic", entity: { type: "i" }, children: [{ type: "plain", value: "italic" }] };
            const result = await createIntrinsicElementRender(element, createOptions());
            expect(result[0]).toBe("<i>italic</i>");
        });

        test("Underlined text", async () => {
            const element: IntrinsicElement = { type: "intrinsic", entity: { type: "u" }, children: [{ type: "plain", value: "underline" }] };
            const result = await createIntrinsicElementRender(element, createOptions());
            expect(result[0]).toBe("<u>underline</u>");
        });

        test("Strikethrough text", async () => {
            const element: IntrinsicElement = { type: "intrinsic", entity: { type: "s" }, children: [{ type: "plain", value: "strike" }] };
            const result = await createIntrinsicElementRender(element, createOptions());
            expect(result[0]).toBe("<s>strike</s>");
        });

        test("Heading", async () => {
            const element: IntrinsicElement = { type: "intrinsic", entity: { type: "h" }, children: [{ type: "plain", value: "Heading" }] };
            const result = await createIntrinsicElementRender(element, createOptions());
            expect(result[0]).toBe("<b>Heading</b>\n\n");
        });

        test("Anchor links", async () => {
            const element: IntrinsicElement = { type: "intrinsic", entity: { type: "a", href: "https://example.com" }, children: [{ type: "plain", value: "Link" }] };
            const result = await createIntrinsicElementRender(element, createOptions());
            expect(result[0]).toBe("<a href=\"https://example.com\">Link</a>");
        });

        test("Inline code", async () => {
            const element: IntrinsicElement = { type: "intrinsic", entity: { type: "code" }, children: [{ type: "plain", value: "code" }] };
            const result = await createIntrinsicElementRender(element, createOptions());
            expect(result[0]).toBe("<code>code</code>");
        });

        test("Codeblock without language", async () => {
            const element: IntrinsicElement = { type: "intrinsic", entity: { type: "codeblock" }, children: [{ type: "plain", value: "code" }] };
            const result = await createIntrinsicElementRender(element, createOptions());
            expect(result[0]).toBe("<pre>code</pre>");
        });

        test("Codeblock with language", async () => {
            const element: IntrinsicElement = { type: "intrinsic", entity: { type: "codeblock", lang: "javascript" }, children: [{ type: "plain", value: "code" }] };
            const result = await createIntrinsicElementRender(element, createOptions());
            expect(result[0]).toBe('<pre><code class="language-javascript">code</code></pre>');
        });

        test("Spoiler", async () => {
            const element: IntrinsicElement = { type: "intrinsic", entity: { type: "spoiler" }, children: [{ type: "plain", value: "spoiler" }] };
            const result = await createIntrinsicElementRender(element, createOptions());
            expect(result[0]).toBe("<tg-spoiler>spoiler</tg-spoiler>");
        });

        test("Blockquote", async () => {
            const element: IntrinsicElement = { type: "intrinsic", entity: { type: "blockquote" }, children: [{ type: "plain", value: "quote" }] };
            const result = await createIntrinsicElementRender(element, createOptions());
            expect(result[0]).toBe("<blockquote>quote</blockquote>");
        });
    });

    describe("Special elements", () => {
        test("Mentions", async () => {
            const element: IntrinsicElement = { type: "intrinsic", entity: { type: "mention", id: 123456 }, children: [{ type: "plain", value: "User" }] };
            const result = await createIntrinsicElementRender(element, createOptions());
            expect(result[0]).toBe('<a href="tg://user?id=123456">User</a>');
        });

        test("Emoji", async () => {
            const element: IntrinsicElement = { type: "intrinsic", entity: { type: "emoji", id: "123456" }, children: [{ type: "plain", value: "👍" }] };
            const result = await createIntrinsicElementRender(element, createOptions());
            expect(result[0]).toBe('<tg-emoji emoji-id="123456">👍</tg-emoji>');
        });

        test("Time", async () => {
            const element: IntrinsicElement = { type: "intrinsic", entity: { type: "time", unix: 1700000000 }, children: [{ type: "plain", value: "Label" }] };
            const result = await createIntrinsicElementRender(element, createOptions());
            expect(result[0]).toContain("<tg-time");
            expect(result[0]).toContain("unix=\"1700000000\"");
        });
    });

    describe("Media elements", () => {
        test("Photo", async () => {
            const element: IntrinsicElement = { type: "intrinsic", entity: { type: "media", src: "photo.jpg" }, children: [] };
            const result = await createIntrinsicElementRender(element, createOptions());
            expect(result[1]).toBeDefined();
        });

        test("Video", async () => {
            const element: IntrinsicElement = { type: "intrinsic", entity: { type: "media", src: "video.mp4", variant: "video" }, children: [] };
            const result = await createIntrinsicElementRender(element, createOptions());
            expect(result[1]!.type).toBe("video");
        });

        test("Audio", async () => {
            const element: IntrinsicElement = { type: "intrinsic", entity: { type: "media", src: "audio.mp3", variant: "audio" }, children: [] };
            const result = await createIntrinsicElementRender(element, createOptions());
            expect(result[1]!.type).toBe("audio");
        });

        test("Document", async () => {
            const element: IntrinsicElement = { type: "intrinsic", entity: { type: "media", src: "doc.pdf", variant: "document" }, children: [] };
            const result = await createIntrinsicElementRender(element, createOptions());
            expect(result[1]!.type).toBe("document");
        });

        describe("Preview", () => {
            test("Sets link preview options", async () => {
                const other: any = {};
                const element: IntrinsicElement = { type: "intrinsic", entity: { type: "preview", src: "https://example.com" }, children: [] };
                await createIntrinsicElementRender(element, createOptions({ other }));
                expect(other.link_preview_options).toBeDefined();
                expect(other.link_preview_options?.url).toBe("https://example.com");
            });

            test("Throws when already set", async () => {
                const other: any = { link_preview_options: { is_disabled: false } };
                const element: IntrinsicElement = { type: "intrinsic", entity: { type: "preview", src: "https://example.com" }, children: [] };
                await expect(createIntrinsicElementRender(element, createOptions({ other }))).rejects.toThrow();
            });
        });
    });

    describe("Button elements", () => {
        test("Creates inline keyboard", async () => {
            const other: any = {};
            const element: IntrinsicElement = { type: "intrinsic", entity: { type: "button" }, children: [{ type: "plain", value: "Click" }] };
            await createIntrinsicElementRender(element, createOptions({ other }));
            expect(other.reply_markup).toBeInstanceOf(InlineKeyboard);
        });

        test("Sets text from children", async () => {
            const other: any = { reply_markup: new InlineKeyboard() };
            const element: IntrinsicElement = { type: "intrinsic", entity: { type: "button" }, children: [{ type: "plain", value: "Click" }] };
            await createIntrinsicElementRender(element, createOptions({ other }));
            expect(other.reply_markup.inline_keyboard[0][0].text).toBe("Click");
        });
    });

    describe("Combinations", () => {
        test("Nested elements", async () => {
            const element: IntrinsicElement = {
                type: "intrinsic",
                entity: { type: "b" },
                children: [
                    { type: "intrinsic", entity: { type: "i" }, children: [{ type: "plain", value: "bold italic" }] }
                ]
            };
            const result = await createIntrinsicElementRender(element, createOptions());
            expect(result[0]).toBe("<b><i>bold italic</i></b>");
        });
    });
});

describe("Message renders", () => {

    test("Basic message render", async () => {
        const result = await createMessageRender({
            id: "test",
            method: "sendMessage",
            jsx: Promise.resolve({ type: "plain", value: "Hello" } as any),
            ctx: createMockCtx(),
            other: {},
        });
        expect(result.text).toBe("Hello");
        expect(result.view).toBe("message");
    });

    test("Caption view with media", async () => {
        const result = await createMessageRender({
            id: "test",
            method: "sendMessage",
            jsx: Promise.resolve({
                type: "fragment",
                children: [
                    { type: "intrinsic", entity: { type: "media", src: "photo.jpg" }, children: [] },
                    { type: "plain", value: "Caption" }
                ]
            } as any),
            ctx: createMockCtx(),
            other: {},
        });
        expect(result.view).toBe("caption");
    });

    test("Text truncated to 4096 for message view", async () => {
        const longText = "a".repeat(5000);
        const result = await createMessageRender({
            id: "test",
            method: "sendMessage",
            jsx: Promise.resolve({ type: "plain", value: longText } as any),
            ctx: createMockCtx(),
            other: {},
        });
        expect(result.text.length).toBe(4096);
    });

    test("Media limited to 10 items", async () => {
        const mediaElements = Array(15).fill(null).map(() => ({
            type: "intrinsic",
            entity: { type: "media", src: "photo.jpg" },
            children: []
        }));
        const result = await createMessageRender({
            id: "test",
            method: "sendMessage",
            jsx: Promise.resolve({ type: "fragment", children: mediaElements } as any),
            ctx: createMockCtx(),
            other: {},
        });
        expect(result.media.length).toBe(10);
    });

    test("Media caption truncated to 1024 for caption view", async () => {
        const mediaElements = Array(15).fill(null).map(() => ({
            type: "intrinsic",
            entity: { type: "media", src: "photo.jpg" },
            children: []
        }));
        const result = await createMessageRender({
            id: "test",
            method: "sendMessage",
            jsx: Promise.resolve({ type: "fragment", children: mediaElements } as any),
            ctx: createMockCtx(),
            other: {},
        });
        expect((result.other as any).caption.length).toBe(1024);
    });
});
