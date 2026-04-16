import type { BotHandlerLifecycleInstance, BotMessageHandler } from "../../types/lib.types";
import { createRerenderMessageState } from "./lifecycle/rerender.state";
import { createUnmountMessageState } from "./lifecycle/unmount.state";
import type { ReactiveContext } from "../../types/plugin.types";
import { globalAbortControllers, globalStates, withRuntime } from "../../utils";
import { createMountMessageState } from "./lifecycle/mount.state";
import type { HookRuntime } from "../../types/hooks.types";
import { createErrorMessageState } from "./lifecycle/error.state";

export function createMessageState<C extends ReactiveContext>({ id, ctx, handler }: {
    id: string,
    ctx: C,
    handler: BotMessageHandler<C>,
}): BotHandlerLifecycleInstance<C> {
    const existing = globalStates.get(id);
    if (existing) return existing;
    if (!id) {
        throw new Error("createMessageState: id is required");
    }
    const _id = id; // 👈 immutable capture
    const state: BotHandlerLifecycleInstance<C> = {
        get controller() {
            if (!globalAbortControllers.has(_id)) globalAbortControllers.set(_id, new AbortController());
            return globalAbortControllers.get(_id)!;
        },
        set controller(value: AbortController) {
            globalAbortControllers.set(_id, value);
        },
        async mount() {
            await withRuntime(runtime, async () => {
                await createMountMessageState({
                    id: _id,
                    ctx,
                    handler,
                    controller: this.controller,
                    state: this
                })
            })
        },
        async rerender() {
            if (runtime.isRendering) {
                runtime.pendingRender = true;
                return;
            }
            runtime.isRendering = true;
            try {
                await withRuntime(runtime, async () => {
                    this.controller?.abort();
                    this.controller = new AbortController();

                    await createRerenderMessageState({
                        id: _id,
                        ctx,
                        handler,
                        controller: this.controller,
                        state: this,
                    });
                });
            } finally {
                runtime.isRendering = false;
                if (runtime.pendingRender) {
                    runtime.pendingRender = false;
                    await this.rerender();
                }
            }
        },
        async unmount() {
            await withRuntime(runtime, async () => {
                this.controller?.abort(); this.controller = new AbortController();
                await createUnmountMessageState({
                    id: _id,
                    ctx,
                    controller: this.controller,
                    state: this
                })
            })
        },
        async error(error) {
            await withRuntime(runtime, async () => {
                await createErrorMessageState({
                    id: _id,
                    ctx,
                    error
                });
            });
        }
    };
    globalStates.set(_id, state);
    const runtime: HookRuntime = {
        id: _id,
        ctx,
        state,
        hooks: new Map(),
        visited: new Set(),
        componentPath: [],
        childCursorStack: [0],
        hookCursor: 0,
        effects: [],
        renderVersion: 0,
        isRendering: false,
        pendingRender: false,
    };
    return state
}
