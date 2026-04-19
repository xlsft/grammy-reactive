import type { HookRuntime } from "../types/hooks.types";
import type { ReactiveContext } from "../types/plugin.types";
import { globalHookRuntimeAsyncStorage } from "./global";

/**
 * Executes a render callback within an isolated hook runtime scope.
 *
 * This internal runtime boundary binds the provided hook runtime to the
 * current asynchronous execution context, resets all traversal cursors,
 * initializes render visitation state, and performs stale hook cleanup
 * after the render pass completes.
 *
 * Responsibilities:
 * - bind runtime to async storage
 * - reset component traversal cursors
 * - reset hook cursor state
 * - bootstrap root visitation path
 * - track visited hook branches
 * - garbage collect stale hook entries after render
 *
 * Any hook branches not visited during the current render pass are
 * automatically removed from the persistent hook registry.
 *
 * @template {ReactiveContext} C
 * @param {HookRuntime} runtime - The active hook runtime instance.
 * @param {() => Promise<void>} callback - The render pass to execute.
 * @returns {Promise<void>}
 */
export function withRuntime(
    runtime: HookRuntime,
    callback: () => Promise<void>
) {
    return globalHookRuntimeAsyncStorage.run(runtime, async () => {
        runtime.component.paths = [];
        runtime.component.cursors = [0];
        runtime.hooks.cursor = 0;
        runtime.component.rendered.clear();

        runtime.component.rendered.add("");

        await callback();

        for (const key of runtime.hooks.map.keys()) {
            if (!runtime.component.rendered.has(key)) {
                runtime.hooks.map.delete(key);
            }
        }
    });
}
