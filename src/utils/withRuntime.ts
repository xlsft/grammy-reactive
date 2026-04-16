import type { HookRuntime } from "~/types/hooks.types";
import type { ReactiveContext } from "~/types/plugin.types";
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
export function withRuntime<C extends ReactiveContext>(
    runtime: HookRuntime,
    callback: () => Promise<void>
) {
    return globalHookRuntimeAsyncStorage.run(runtime, async () => {
        runtime.componentPath = [];
        runtime.childCursorStack = [0];
        runtime.hookCursor = 0;
        runtime.visited.clear();

        runtime.visited.add("");

        await callback();

        for (const key of runtime.hooks.keys()) {
            if (!runtime.visited.has(key)) {
                runtime.hooks.delete(key);
            }
        }
    });
}
