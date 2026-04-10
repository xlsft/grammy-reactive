import type { ReducerHook } from "~/types/hooks.types";
import { useState } from "./state.hooks";

export function useReducer<S, A>(
    reducer: ReducerHook<S, A>,
    initialState: S
): [S, (action: A) => Promise<void>] {
    const [state, setState] = useState(initialState);

    const dispatch = async (action: A) => {
        await setState(prev => reducer(prev, action));
    };

    return [state, dispatch];
}
