import { globalHookRuntimeAsyncStorage } from "~/utils";

export const createHook = () => {
    const runtime = globalHookRuntimeAsyncStorage.getStore()!;
    const key = runtime.componentPath.join(".");
    let hooks = runtime.hooks.get(key); if (!hooks) { hooks = []; runtime.hooks.set(key, hooks) }
    const index = runtime.hookCursor++;

    return { runtime, key, hooks, index }
}
