import { Calculator } from "examples/components/Calculator"
import { Counter } from "examples/components/Counter"
import { defineMessageHandler, useState } from "~/lib"

export default defineMessageHandler(async () => {

    const [visible, setVisible] = useState(false)

    return <>
        <p>Visible: {visible}</p>
        {visible ? <Calculator/> : <Counter/>}
        <button variant='callback' onClick={() => {
            setVisible(prev => !prev)
        }}>
            {visible ? "Show Counter" : "Show Calculator"}
        </button>
    </>
})
