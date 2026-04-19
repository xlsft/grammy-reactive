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
    if (!runtime) throw new Error("No runtime found");
    const level = runtime.component.cursors.length - 1;
    const current = runtime.component.cursors[level] ?? 0;
    const previous = {
        path: [...runtime.component.paths],
        children: [...runtime.component.cursors],
        cursor: runtime.hooks.cursor,
    };

    runtime.component.cursors[level] = current + 1;
    runtime.component.paths.push(current);
    runtime.component.rendered.add(runtime.component.paths.join("."));
    runtime.component.cursors.push(0);
    runtime.hooks.cursor = 0;

    try {
        return await callback();
    } finally {
        runtime.component.paths = previous.path;
        runtime.component.cursors = previous.children;
        runtime.hooks.cursor = previous.cursor;
    }
}
