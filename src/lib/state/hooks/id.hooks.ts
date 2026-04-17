import { generateUniqueId } from "src/utils";
import { useMemo } from "./memo.hooks";

export function useId(): string {
    return useMemo(() => generateUniqueId(), []);
}
