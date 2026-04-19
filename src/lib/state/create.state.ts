import type { BotHandlerLifecycleInstance, BotMessageHandler } from "../../types/lib.types";
import { createRerenderMessageState } from "./lifecycle/rerender.state";
import { createUnmountMessageState } from "./lifecycle/unmount.state";
import type { ReactiveContext } from "../../types/plugin.types";
import { globalAbortControllers, globalStates, withRuntime, createHookRuntime, generateUniqueId } from "../../utils";
import { createMountMessageState } from "./lifecycle/mount.state";
import { createErrorMessageState } from "./lifecycle/error.state";

export function createMessageState<C extends ReactiveContext>({ctx, handler }: {
    ctx: C,
    handler: BotMessageHandler<C>,
}): BotHandlerLifecycleInstance<C> {
    const id = generateUniqueId()
    const existing = globalStates.get(id); if (existing) return existing;
    const state: BotHandlerLifecycleInstance<C> = {
        id,
        get controller() {
            if (!globalAbortControllers.has(id)) globalAbortControllers.set(id, new AbortController());
            return globalAbortControllers.get(id)!;
        },
        set controller(value: AbortController) {
            globalAbortControllers.set(id, value);
        },
        async mount() {
            await withRuntime(runtime, async () => {
                await createMountMessageState({ id, ctx, handler, controller: this.controller, state: this })
            })
        },
        async rerender() {
            if (runtime.status.rendering) return; runtime.status.rendering = true
            try {
                await withRuntime(runtime, async () => {
                    this.controller?.abort(); this.controller = new AbortController();
                    await createRerenderMessageState({ id, ctx, handler, controller: this.controller, state: this });
                })
            } finally {
                runtime.status.rendering = false;
                if (runtime.status.pending) { runtime.status.pending = false; await this.rerender() }
            }
        },
        async unmount() {
            await withRuntime(runtime, async () => {
                this.controller?.abort(); this.controller = new AbortController();
                await createUnmountMessageState({ id, ctx, controller: this.controller, state: this });
            })
        },
        async error(error) {
            await withRuntime(runtime, async () => {
                await createErrorMessageState({ id, ctx, error });
            });
        }
    }; globalStates.set(id, state);
    const runtime = createHookRuntime({ id, ctx, state });
    return state
}
