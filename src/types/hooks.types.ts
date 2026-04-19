import type { BotHandlerLifecycleInstance } from "./lib.types";
import type { ReactiveContext } from "./plugin.types";

/**
 * Stores the active runtime state for a reactive hook execution cycle.
 *
 * This object tracks hook values, nested component traversal,
 * render scheduling, effect queues, and stale render protection.
 */
export type HookRuntime = {
    id: string
    ctx: ReactiveContext
    state: Partial<BotHandlerLifecycleInstance<ReactiveContext>>
    hooks: {
        map: Map<string, unknown[]>
        cursor: number
        async: Map<string, AsyncCacheEntry<any>>
    }
    component: {
        paths: number[]
        cursors: number[]
        rendered: Set<string>
    }
    effects: Array<() => Promise<void>>;
    version: number
    status: {
        rendering: boolean
        pending: boolean
    }

};

/**
 * Stores a memoized hook result together with its dependency list.
 *
 * The cached value is reused until the dependency array changes.
 *
 * @template T
 */
export type MemoHook<T> = {
    value: T;
    deps?: unknown[];
};

/**
 * Describes a reducer function used for state transition hooks.
 *
 * Reducers receive the previous state and an action payload,
 * then return the next state snapshot.
 *
 * @template S
 * @template A
 */
export type ReducerHook<S, A> = (state: S, action: A) => S;

/**
 * Stores dependency tracking and cleanup state for effect hooks.
 *
 * This is used internally to determine when effects should rerun
 * and which cleanup callback should be invoked beforehand.
 */
export type EffectState = {
    deps?: unknown[];
    cleanup?: EffectCleanup;
};

/**
 * Represents an optional cleanup callback returned by an effect.
 *
 * Cleanup handlers may be synchronous or asynchronous.
 */
export type EffectCleanup = void | (() => void | Promise<void>);


export type AsyncData<T> = {
    value: T | null;
    pending: boolean;
    error: unknown;
    refresh: () => Promise<void>;
};

export type AsyncCacheEntry<T> = {
    value: T | null;
    error: unknown;
    promise: Promise<T> | null;
};
