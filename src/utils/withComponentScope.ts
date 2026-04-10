import { globalHookRuntimeAsyncStorage } from "./global";

export async function withComponentScope<T>(
    callback: () => Promise<T>
): Promise<T> {
    const runtime = globalHookRuntimeAsyncStorage.getStore()!;

    const previousPath = [...runtime.componentPath];
    const previousChildStack = [...runtime.childCursorStack];
    const previousHookCursor = runtime.hookCursor;

    const level = runtime.childCursorStack.length - 1;
    const current = runtime.childCursorStack[level] ?? 0;

    runtime.childCursorStack[level] = current + 1;

    runtime.componentPath.push(current);
    runtime.visited.add(runtime.componentPath.join("."));

    runtime.childCursorStack.push(0);
    runtime.hookCursor = 0;

    try {
        return await callback();
    } finally {
        runtime.componentPath = previousPath;
        runtime.childCursorStack = previousChildStack;
        runtime.hookCursor = previousHookCursor;
    }
}
