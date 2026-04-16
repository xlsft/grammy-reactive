import { globalHookRuntimeAsyncStorage } from "../../utils";
import type { ReactiveContext } from "../../types/plugin.types";

/**
 * Returns the active reactive message context.
 *
 * This hook provides access to the current runtime-bound
 * Telegram context inside reactive components and hooks.
 *
 * Useful for accessing:
 * - chat data
 * - user data
 * - API methods
 * - reply helpers
 * - middleware extensions
 *
 * Must be called inside an active reactive message runtime.
 *
 * @template C
 * @returns {C}
 * The active reactive context instance.
 *
 * @example
 * ```tsx
 * const ctx = useContext()
 * await ctx.answerCallbackQuery()
 * ```
 */
export function useContext<C extends ReactiveContext = ReactiveContext>(): C {
    const runtime = globalHookRuntimeAsyncStorage.getStore();

    if (!runtime) {
        throw new Error("useContext must be used inside message runtime");
    }

    return runtime.ctx as C;
}
