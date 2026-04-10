import { useMemo } from "./memo.hooks";

export function useRef<T>(initial: T) {
    return useMemo(() => ({ current: initial }), []);
}
