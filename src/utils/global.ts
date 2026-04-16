import { AsyncLocalStorage } from "node:async_hooks";
import type { HookRuntime } from "~/types/hooks.types";
import type { BotHandlerLifecycleInstance, CycleState } from "~/types/lib.types";
import type { ReactiveContext } from "~/types/plugin.types";

/** Stores callback handlers for inline button interactions. */
export const globalButtonCallbacks: Record<string, (ctx: ReactiveContext) => Promise<void> | void> = {}

/** Stores the previously rendered message state by handler ID. */
export const globalPreviousState: Record<string, CycleState> = {}

/** Stores the currently active message state by handler ID. */
export const globalCurrentState: Record<string, CycleState> = {}

/** Tracks generated unique IDs to prevent collisions. */
export const globalIdSet: Set<string> = new Set();

/** Stores active abort controllers for cancellable async operations. */
export const globalAbortControllers: Map<string, AbortController> = new Map();

/** Async-local storage container for the current hook runtime context. */
export const globalHookRuntimeAsyncStorage = new AsyncLocalStorage<HookRuntime>();

/** Stores active lifecycle state instances by reactive handler ID. */
export const globalStates: Map<string, BotHandlerLifecycleInstance<ReactiveContext>> = new Map();
