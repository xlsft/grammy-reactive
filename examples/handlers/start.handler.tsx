import Dashboard from "examples/components/Dashboard"
import { defineMessageHandler } from "~/lib"

export default defineMessageHandler(async () => {

    return <>
        <Dashboard/>
    </>
})
