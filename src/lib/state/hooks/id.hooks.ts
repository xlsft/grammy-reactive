import { generateUniqueId } from "../../../utils";
import { useMemo } from "./memo.hooks";

export function useId(): string {
    return useMemo(() => generateUniqueId(), []);
}
