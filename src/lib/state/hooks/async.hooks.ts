import type { AsyncData } from "src/types/hooks.types";
import { createHook } from "./create";
import { useState } from "./state.hooks";
import { useEffect } from "./effect.hooks";

export function useAsync<T>(key: string, handler: () => Promise<T>, deps?: unknown[]): AsyncData<T>;
export function useAsync<T>(handler: () => Promise<T>, deps?: unknown[]): AsyncData<T>;
export function useAsync<T>(keyOrHandler: string | (() => Promise<T>), handlerOrDeps?: (() => Promise<T>) | unknown[], maybeDeps: unknown[] = []): AsyncData<T> {
    const { runtime, index, key: componentKey } = createHook();

    let key: string, handler: () => Promise<T>, deps: unknown[];

    if (typeof keyOrHandler === "string") {
        key = keyOrHandler; handler = handlerOrDeps as () => Promise<T>; deps = maybeDeps;
    } else {
        handler = keyOrHandler; deps = (handlerOrDeps as unknown[]) ?? []; key = `${componentKey}:${index}`;
    }

    if (!runtime.asyncCache.has(key)) runtime.asyncCache.set(key, { value: null, error: null, promise: null });

    const entry = runtime.asyncCache.get(key)!;

    const [state, setState] = useState({
        value: entry.value,
        error: entry.error,
    });

    const execute = async () => {
        if (entry.promise) { await entry.promise; return }
        const promise = handler(); entry.promise = promise;
        setState(prev => ({ ...prev, }));
        try {
            const value = await promise; entry.value = value; entry.error = null; entry.promise = null
            setState({ value, error: null })
        } catch (error) {
            entry.error = error; entry.promise = null
            setState({ value: null, error });
        }
    };

    useEffect(() => {
        if (!entry.promise && entry.value === null && entry.error === null) execute()
    }, deps);

    return {
        value: state.value,
        error: state.error,
        pending: entry.promise !== null,
        refresh: async () => {
            entry.promise = null;
            await execute();
        },
    };
}
