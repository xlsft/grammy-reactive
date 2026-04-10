import { globalHookRuntimeAsyncStorage } from "~/utils";
import type { ReactiveContext } from "~/types/plugin.types";

export function useContext<C extends ReactiveContext = ReactiveContext>(): C {
    const runtime = globalHookRuntimeAsyncStorage.getStore();

    if (!runtime) {
        throw new Error("useContext must be used inside message runtime");
    }

    return runtime.ctx as C;
}
