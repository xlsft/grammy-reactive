import { AsyncLocalStorage } from "node:async_hooks";
import type { Message } from "~/types/grammy.types";
import type { HookRuntime } from "~/types/hooks.types";
import type { BotHandlerLifecycleInstance } from "~/types/lib.types";
import type { ReactiveContext } from "~/types/plugin.types";

export const globalButtonCallbacks: Record<string, (ctx: ReactiveContext) => Promise<void> | void> = {}
export const globalPreviousState: Record<string, Message> = {}
export const globalCurrentState: Record<string, Message> = {}
export const globalIdSet: Set<string> = new Set();
export const globalAbortControllers: Map<string, AbortController> = new Map();
export const globalHookRuntimeAsyncStorage = new AsyncLocalStorage<HookRuntime>();
export const globalStates: Map<string, BotHandlerLifecycleInstance<ReactiveContext>> = new Map();
