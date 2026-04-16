import { Dashboard } from "examples/components/Dashboard"
import { defineMessageHandler } from "../../src/lib"

export default defineMessageHandler(async () => {

    return <>
        <Dashboard/>
    </>
})
