import { describe, test, expect, vi, afterEach } from "bun:test";
import { createMessageState } from "../src/lib/state/create.state";
import { createHookRuntime, globalHookRuntimeAsyncStorage, globalStates, globalAbortControllers, generateUniqueId } from "../src/utils";
import type { ReactiveContext } from "../src/types/plugin.types";
import type { BotMessageHandler } from "../src/types/lib.types";

const createMockCtx = () => ({
    chat: { id: 123456789 },
    api: {
        sendMessage: vi.fn().mockResolvedValue({ message_id: 1, chat: { id: 123456789 } }),
    },
}) as unknown as ReactiveContext;

const ctx = createMockCtx()
const id = "test-id";
const state = { id, mount: vi.fn(), rerender: vi.fn(), unmount: vi.fn(), error: vi.fn() } as any
const handler: BotMessageHandler<ReactiveContext> = async () => ({ type: "plain", value: "Hello" } as any);

describe("Runtime and state management", () => {
    test("Creates hook runtime", () => {
        const runtime = createHookRuntime({ id, ctx, state });
        expect(runtime).toBeDefined();
        expect(runtime.id).toBe(id);
        expect(runtime.status).toBeDefined();
    });

    test("Has hook runtime version", () => {
        const runtime = createHookRuntime({ id, ctx, state });
        const version = runtime.version;
        expect(typeof version).toBe("number");
    });

    test("Manages hooks map", () => {
        const runtime = createHookRuntime({ id, ctx, state });
        expect(runtime.hooks).toBeDefined();
        expect(typeof runtime.hooks.map).toBe("object");
    });

    test("Has effects queue", () => {
        const runtime = createHookRuntime({ id, ctx, state });
        expect(Array.isArray(runtime.effects)).toBe(true);
    });

    test("No dangling runtime storages", () => {
        expect(globalHookRuntimeAsyncStorage.getStore()).toBeUndefined();
    });

    test("Correctly sets and runs callback", () => {
        const runtime = createHookRuntime({ id, ctx, state });
        let result: any; globalHookRuntimeAsyncStorage.run(runtime, () => result = globalHookRuntimeAsyncStorage.getStore())
        expect(result).toBe(runtime);
    });

    describe("State management", () => {
        afterEach(() => {
            globalStates.clear();
            globalAbortControllers.clear();
        });

        test("creates message state", () => {
            const state = createMessageState({ ctx, handler });
            expect(state).toBeDefined();
            expect(state.id).toBeDefined();
            expect(typeof state.mount).toBe("function");
            expect(typeof state.rerender).toBe("function");
            expect(typeof state.unmount).toBe("function");
            expect(typeof state.error).toBe("function");
        });
    });

});
