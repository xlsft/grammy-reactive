import { useMemo, useState } from "../../src/lib"

export const Counter = async () => {
    const [count, setCount] = useState(0)
    const double = useMemo(() => count * 2, [count])

    return <>
        <p>{count}, double: {double}</p>
        {count > 0 ?
            <button onClick={() => setCount(Math.max(count - 1))}>
                -
            </button>
        : null }
        <button onClick={() => setCount(count + 1)} row>
            +
        </button>
    </>
}
