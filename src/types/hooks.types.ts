import type { BotHandlerLifecycleInstance } from "./lib.types";
import type { ReactiveContext } from "./plugin.types";

export type HookRuntime = {
    id: string
    ctx: ReactiveContext
    state: BotHandlerLifecycleInstance<ReactiveContext>
    hooks: Map<string, unknown[]>
    componentPath: number[]
    childCursorStack: number[]
    hookCursor: number
    effects: Array<() => Promise<void>>;
    visited: Set<string>
};

export type MemoHook<T> = {
    value: T;
    deps?: unknown[];
};

export type ReducerHook<S, A> = (state: S, action: A) => S;

export type EffectState = {
    deps?: unknown[];
    cleanup?: EffectCleanup;
};

export type EffectCleanup = void | (() => void | Promise<void>);
