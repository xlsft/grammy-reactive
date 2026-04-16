import { useEffect } from "../state/hooks";

/**
 * Runs a callback once when the component is first mounted.
 *
 * This is a lifecycle helper built on top of `useEffect`
 * with an empty dependency list.
 *
 * Useful for startup logic such as:
 * - loading initial data
 * - starting timers
 * - subscribing to external events
 * - sending analytics
 *
 * @param {() => void | Promise<void>} callback
 * The mount callback to execute once.
 *
 * @example
 * ```tsx
 * onMounted(async () => {
 *     await loadSomeHeavyOperation()
 * })
 * ```
 */
export function onMounted(callback: () => void | Promise<void>): void {
    useEffect(async () => {
        return await callback()
    }, [])
}
