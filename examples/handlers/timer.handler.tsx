import { Timer } from "examples/components/Timer";
import { defineMessageHandler } from "src/lib";

export default defineMessageHandler(async () => {
    return <>
        <Timer />
    </>
})
