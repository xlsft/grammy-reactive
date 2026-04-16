import type { ReducerHook } from "~/types/hooks.types";
import { useState } from "./state.hooks";

/**
 * Creates reducer-based reactive state.
 *
 * State updates are performed by dispatching actions through
 * the provided reducer function, which receives the previous
 * state and returns the next one.
 *
 * This hook is useful for complex state transitions,
 * predictable update flows, and action-driven UI logic.
 *
 * @template S
 * @template A
 * @param {ReducerHook<S, A>} reducer
 * The reducer function used to calculate the next state.
 * @param {S} initialState - The initial reducer state.
 * @returns {[S, (action: A) => Promise<void>]}
 * The current state and an async dispatch function.
 *
 * @example
 * ```tsx
 * const [count, dispatch] = useReducer(
 *     (state, action: "inc" | "dec") => action === "inc" ? state + 1 : state - 1,
 *     0
 * )
 *
 * dispatch("inc")
 * ```
 */
export function useReducer<S, A>(reducer: ReducerHook<S, A>, initialState: S): [S, (action: A) => Promise<void>] {
    const [state, setState] = useState(initialState);

    const dispatch = async (action: A) => {
        await setState(prev => reducer(prev, action));
    };

    return [state, dispatch];
}
