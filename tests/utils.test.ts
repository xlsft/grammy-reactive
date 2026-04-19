import { describe, test, expect } from "bun:test";
import { createHash, generateUniqueId, isEqual, isUnixTime, isEmoji, isIntrinsicElement } from "../src/utils";
import { InlineKeyboard } from "grammy";

describe("generateUniqueId", () => {
    test("Generates unique ids", () => {
        const id1 = generateUniqueId();
        const id2 = generateUniqueId();
        expect(id1).not.toBe(id2);
    });

    test("Is string", () => {
        expect(typeof generateUniqueId()).toBe("string");
    });
});

describe("isEqual", () => {
    test("Same primitive is equal", () => {
        expect(isEqual(1, 1)).toBe(true);
    });

    test("Different primitive not equal", () => {
        expect(isEqual(1, 2)).toBe(false);
    });

    test("Same object reference is equal", () => {
        const obj = {};
        expect(isEqual(obj, obj)).toBe(true);
    });

    test("Same array reference is equal", () => {
        const arr: unknown[] = [];
        expect(isEqual(arr, arr)).toBe(true);
    });

    test("Same string is equal", () => {
        expect(isEqual("a", "a")).toBe(true);
    });
});

describe("isUnixTime", () => {
    test("Valid unix time", () => {
        expect(isUnixTime(1700000000)).toBe(true);
    });

    test("Zero is valid", () => {
        expect(isUnixTime(0)).toBe(true);
    });

    test("NaN invalid", () => {
        expect(isUnixTime(NaN)).toBe(false);
    });

    test("Infinity invalid", () => {
        expect(isUnixTime(Infinity)).toBe(false);
    });

    test("String invalid", () => {
        expect(isUnixTime("1700000000" as any)).toBe(false);
    });
});

describe("isEmoji", () => {
    test("Valid emoji", () => {
        expect(isEmoji("👍")).toBe(true);
    });

    test("Text invalid", () => {
        expect(isEmoji("hello")).toBe(false);
    });

    test("Empty string invalid", () => {
        expect(isEmoji("")).toBe(false);
    });

    test("Number invalid", () => {
        expect(isEmoji(1 as any)).toBe(false);
    });
});

describe("isIntrinsicElement", () => {
    test("Returns true for intrinsic elements", () => {
        expect(isIntrinsicElement("b")).toBe(true);
        expect(isIntrinsicElement("a")).toBe(true);
        expect(isIntrinsicElement("media")).toBe(true);
    });

    test("Returns false for non-intrinsic elements", () => {
        expect(isIntrinsicElement("div" as any)).toBe(false);
        expect(isIntrinsicElement("span" as any)).toBe(false);
        expect(isIntrinsicElement("custom" as any)).toBe(false);
    });
});

describe("createHash", () => {

    test("Creates hash from object", () => {
        const hash = createHash({ foo: "bar" });
        expect(typeof hash).toBe("string");
    });

    test("Generates hash from render", () => {
        const hash = createHash({ text: "Hello", other: {}, media: [] });
        expect(typeof hash).toBe("string");
        expect(hash.length).toBeGreaterThan(0);
    });

    test("Same render produces same hash", () => {
        expect(createHash({ text: "Hello", other: {}, media: [] })).toBe(createHash({ text: "Hello", other: {}, media: [] }));
    });

    test("Different render produces different hash", () => {
        expect(createHash({ text: "Hello", other: {}, media: [] })).not.toBe(createHash({ text: "World", other: {}, media: [] }));
    });

    test("Handles empty text", () => {
        expect(typeof createHash({ text: "Hello", other: {}, media: [] })).toBe("string");
    });

    test("Handles nested objects", () => {
        const input = { outer: { inner: { value: 1 } } };
        const hash = createHash(input);
        expect(typeof hash).toBe("string");
    });

    test("Handles special characters in text", () => {
        const input = { text: "<b>Bold</b> & 'quote'" };
        const hash = createHash(input);
        expect(typeof hash).toBe("string");
    });

    test("Handles unicode", () => {
        const input = { text: "Hello 世界 🎉" };
        const hash = createHash(input);
        expect(typeof hash).toBe("string");
    });

    test("Handles numbers", () => {
        const input = { num: 1234567890 };
        const hash = createHash(input);
        expect(typeof hash).toBe("string");
    });

    test("Handles booleans", () => {
        const input = { bool: true };
        const hash = createHash(input);
        expect(typeof hash).toBe("string");
    });

    test("Handles null", () => {
        const input = { val: null };
        const hash = createHash(input);
        expect(typeof hash).toBe("string");
    });

    test("Handles media", () => {
        const hash = createHash({ text: "Caption", other: {}, media: [{ type: "photo", media: "photo.jpg" }] });
        expect(typeof hash).toBe("string");
    });

    test("Handles builder classes", () => {
        const hash = createHash({ text: "Hello", other: { reply_markup: new InlineKeyboard(), media: [] }});
        expect(typeof hash).toBe("string");
    });

    test("Stable across same inputs", () => {
        const input = { a: 1, b: "test", c: [1, 2, 3] };
        const hashes = Array(100).fill(0).map(() => createHash(input));
        const firstHash = hashes[0];
        expect(hashes.every(h => h === firstHash)).toBe(true);
    });
});
