import { GrammyError } from "grammy";

export function isMessageNotFound(error: unknown): boolean {
    return (
        error instanceof GrammyError &&
        (
            error.description.includes("message to delete not found") ||
            error.description.includes("MESSAGE_ID_INVALID")
        )
    );
}
