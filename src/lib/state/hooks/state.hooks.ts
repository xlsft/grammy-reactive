import { createHook } from "./create";

/**
 * Creates a persistent reactive state value for the current message handler.
 *
 * The state value is preserved across rerender cycles for the same
 * mounted message session.
 *
 * The `initial` value is only used during the first render of the
 * hook slot. On subsequent rerenders, the previously stored state
 * value is returned instead.
 *
 * Calling the updater function stores the new value and immediately
 * triggers an asynchronous message rerender.
 *
 * Supports both:
 * - direct value updates
 * - updater callbacks based on the previous state
 *
 * > Hook calls must remain in the same order between rerenders.
 * > Changing the hook call order may corrupt state alignment.
 *
 * @template T
 * @param {T} initial - The initial state value for the first render.
 * @returns {[T, (val: T | ((prev: T) => T)) => Promise<void>]}
 * A tuple containing the current state value and an async updater.
 *
 * @example
 * const [count, setCount] = useState(0);
 *
 * @example
 * await setCount(10);
 *
 * @example
 * await setCount(prev => prev + 1);
 *
 * @example
 * const Counter = defineMessageHandler(async ({ useState }) => {
 *     const [count, setCount] = useState(0);
 *
 *     return (
 *         <button
 *             variant="callback"
 *             onClick={() => setCount(prev => prev + 1)}
 *         >
 *             Count: {count}
 *         </button>
 *     );
 * });
 */
export function useState<T>(initial: T): [T, (value: T | ((prev: T) => T)) => Promise<void>] {
    const { index, runtime, hooks } = createHook()
    if (hooks[index] === undefined) hooks[index] = initial

    const setValue = async (next: T | ((prev: T) => T)) => {
        const prev = hooks[index] as T;
        hooks[index] =
            typeof next === "function"
                ? (next as (prev: T) => T)(prev)
                : next;

        if (runtime.state.rerender) await runtime.state.rerender();
    };

    return [hooks[index] as T, setValue];
}
