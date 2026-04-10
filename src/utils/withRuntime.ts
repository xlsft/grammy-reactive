import type { HookRuntime } from "~/types/hooks.types";
import type { ReactiveContext } from "~/types/plugin.types";
import { globalHookRuntimeAsyncStorage } from "./global";

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
