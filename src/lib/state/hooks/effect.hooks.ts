import type { EffectCleanup, EffectState } from "../../../types/hooks.types";
import { createHook } from "./create";
import { globalHookRuntimeAsyncStorage } from "../../../utils";

/**
 * Schedules a side effect to run after the current render cycle.
 *
 * The effect is executed only when its dependency list changes.
 * If the effect returns a cleanup function, it is invoked before
 * the next rerun or during runtime disposal.
 *
 * @param {() => EffectCleanup | Promise<EffectCleanup>} effect
 * The effect callback to schedule.
 * @param {unknown[]} [deps]
 * Optional dependency list controlling reruns.
 *
 * @example
 * ```tsx
 * useEffect(() => {
 *     console.log("mounted")
 *     return () => console.log("cleanup")
 * }, [])
 * ```
 */
export function useEffect(effect: () => EffectCleanup | Promise<EffectCleanup>, deps?: unknown[]): void {
    const { hooks, runtime, index } = createHook();
    const prev = hooks[index] as EffectState | undefined;
    const changed = !prev || !deps || !prev.deps || deps.length !== prev.deps.length || deps.some((dep, i) => !Object.is(dep, prev.deps![i]));
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

/**
 * Flushes all queued effects for the active hook runtime.
 *
 * Effects are executed sequentially in insertion order.
 * Newly scheduled nested effects are also flushed before exit.
 *
 * Must be called inside an active hook runtime scope.
 *
 * @returns {Promise<void>}
 */
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

/**
 * Runs cleanup handlers for all registered effect hooks.
 *
 * This is typically used during component unmount or runtime
 * disposal to release subscriptions, timers, and async resources.
 *
 * @returns {Promise<void>}
 */
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
