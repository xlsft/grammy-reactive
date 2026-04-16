import { AsyncLocalStorage } from "node:async_hooks";
import type { Message } from "~/types/grammy.types";
import type { HookRuntime } from "~/types/hooks.types";
import type { BotHandlerLifecycleInstance } from "~/types/lib.types";
import type { ReactiveContext } from "~/types/plugin.types";

/** Stores callback handlers for inline button interactions. */
export const globalButtonCallbacks: Record<string,(ctx: ReactiveContext) => Promise<void> | void> = {}

/** Stores the previously rendered Telegram message state by handler ID. */
export const globalPreviousState: Record<string, Message> = {}

/** Stores the currently active Telegram message state by handler ID. */
export const globalCurrentState: Record<string, Message> = {}

/** Tracks generated unique IDs to prevent collisions. */
export const globalIdSet: Set<string> = new Set();

/** Stores active abort controllers for cancellable async operations. */
export const globalAbortControllers: Map<string, AbortController> = new Map();

/** Async-local storage container for the current hook runtime context. */
export const globalHookRuntimeAsyncStorage = new AsyncLocalStorage<HookRuntime>();

/** Stores active lifecycle state instances by reactive handler ID. */
export const globalStates: Map<string, BotHandlerLifecycleInstance<ReactiveContext>> = new Map();
