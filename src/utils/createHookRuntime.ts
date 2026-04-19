import type { HookRuntime } from "src/types/hooks.types";
import type { BotHandlerLifecycleInstance } from "src/types/lib.types";
import type { ReactiveContext } from "src/types/plugin.types";

export function createHookRuntime<C extends ReactiveContext>({ id, ctx, state }: { id: string, ctx: C, state: Partial<BotHandlerLifecycleInstance<C>> }) {
    const runtime: HookRuntime = {
        id, ctx, state,
        hooks: { map: new Map(), cursor: 0, async: new Map() },
        component: { rendered: new Set(), paths: [], cursors: [] },
        effects: [],
        status: { rendering: false, pending: false },
        version: 0
    };
    return runtime
}
