import { globalHookRuntimeAsyncStorage } from "./global";

/**
 * Executes a callback within an isolated nested component scope.
 *
 * This internal traversal boundary creates a stable path-based identity
 * for the current component branch, resets its local hook cursor, and
 * tracks the branch as visited for the active render pass.
 *
 * Before entering the nested scope, the current traversal state is
 * snapshotted. After execution completes, the previous traversal
 * state is always restored, even if the callback throws.
 *
 * Responsibilities:
 * - increment child cursor position
 * - extend component path identity
 * - mark branch as visited
 * - isolate local hook cursor state
 * - restore parent traversal state
 *
 * @template T
 * @param {() => Promise<T>} callback - The nested component render scope.
 * @returns {Promise<T>} The callback result.
 */
export async function withComponentScope<T>(
    callback: () => Promise<T>
): Promise<T> {
    const runtime = globalHookRuntimeAsyncStorage.getStore()!;
    const level = runtime.childCursorStack.length - 1;
    const current = runtime.childCursorStack[level] ?? 0;
    const previous = {
        path: [...runtime.componentPath],
        children: [...runtime.childCursorStack],
        cursor: runtime.hookCursor,
    };

    runtime.childCursorStack[level] = current + 1;
    runtime.componentPath.push(current);
    runtime.visited.add(runtime.componentPath.join("."));
    runtime.childCursorStack.push(0);
    runtime.hookCursor = 0;

    try {
        return await callback();
    } finally {
        runtime.componentPath = previous.path;
        runtime.childCursorStack = previous.children;
        runtime.hookCursor = previous.cursor;
    }
}
