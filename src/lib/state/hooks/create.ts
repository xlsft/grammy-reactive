import { globalHookRuntimeAsyncStorage } from "~/utils";

/**
 * Creates the low-level hook execution context for the current call.
 *
 * Resolves the active runtime scope, current component path,
 * persistent hook storage bucket, and the next hook index.
 *
 * This is the internal primitive used by all built-in hooks.
 *
 * @returns {{
 *   runtime: HookRuntime,
 *   key: string,
 *   hooks: unknown[],
 *   index: number
 * }}
 * The active hook execution metadata.
 */
export const createHook = () => {
    const runtime = globalHookRuntimeAsyncStorage.getStore()!;
    const key = runtime.componentPath.join(".");

    let hooks = runtime.hooks.get(key);
    if (!hooks) {
        hooks = [];
        runtime.hooks.set(key, hooks);
    }

    const index = runtime.hookCursor++;

    return { runtime, key, hooks, index }
}
