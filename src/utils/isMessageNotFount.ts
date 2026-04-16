import { GrammyError } from "grammy";

/**
 * Checks whether an unknown error represents a Telegram
 * "message not found" failure.
 *
 * This utility is used to safely classify known non-fatal
 * lifecycle cases where a target message no longer exists,
 * such as:
 * - deleting an already removed message
 * - editing an invalid message ID
 *
 * Supports both common Telegram Bot API error descriptions
 * currently returned by Grammy.
 *
 * @param {unknown} error - The unknown runtime error to inspect.
 * @returns {boolean}
 * `true` when the error is a recognized "message not found" case.
 */
export function isMessageNotFound(error: unknown): boolean {
    return (
        error instanceof GrammyError &&
        (
            error.description.includes("message to delete not found") ||
            error.description.includes("MESSAGE_ID_INVALID")
        )
    );
}
