import { Calculator } from "examples/components/Calculator";
import { defineMessageHandler } from "src/lib";

export default defineMessageHandler(async () => {
    return <>
        <Calculator />
    </>
})
