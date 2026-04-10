import type { EffectCleanup, EffectState, HookRuntime } from "~/types/hooks.types";
import { createHook } from "./create";
import { globalHookRuntimeAsyncStorage } from "~/utils";

export function useEffect(effect: () => EffectCleanup | Promise<EffectCleanup>, deps?: unknown[]): void {
    const { hooks, runtime, index } = createHook();
    const prev = hooks[index] as EffectState | undefined;

    const changed =
        !prev ||
        !deps ||
        !prev.deps ||
        deps.length !== prev.deps.length ||
        deps.some((dep, i) => !Object.is(dep, prev.deps![i]));

    if (!changed) return;

    runtime.effects.push(async () => {
        if (prev?.cleanup) {
            await prev.cleanup();
        }

        const cleanup = await effect();

        hooks[index] = {
            deps,
            cleanup,
        } satisfies EffectState;
    });
}

export async function flushEffects(): Promise<void> {
    const runtime = globalHookRuntimeAsyncStorage.getStore()!;
    if (!runtime) {
        throw new Error("Effects flush must be called inside hook runtime");
    }
    while (runtime.effects.length) {
        const queue = runtime.effects;
        runtime.effects = [];

        for (const effect of queue) {
            await effect();
        }
    }
    runtime.effects = [];
}

export async function cleanupEffects(): Promise<void> {
    const runtime = globalHookRuntimeAsyncStorage.getStore();
    if (!runtime) return;

    for (const hooks of runtime.hooks.values()) {
        for (const hook of hooks) {
            const effect = hook as { cleanup?: () => void | Promise<void> };
            if (effect?.cleanup) {
                await effect.cleanup();
            }
        }
    }
}
