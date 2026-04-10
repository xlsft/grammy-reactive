import {
    useState,
    useMemo,
    useCallback,
    useReducer,
    useEffect,
    useContext,
} from "~/lib";

type Action =
    | { type: "inc" }
    | { type: "dec" }
    | { type: "reset" };

function reducer(state: number, action: Action) {
    switch (action.type) {
        case "inc":
            return state + 1;
        case "dec":
            return state - 1;
        case "reset":
            return 0;
        default:
            return state;
    }
}

function StatusBadge({ count }: { count: number }) {
    const status = useMemo(() => {
        if (count === 0) return "⚪ Idle";
        if (count > 0) return "🟢 Positive";
        return "🔴 Negative";
    }, [count]);

    return <b>{status}</b>;
}

export default function Dashboard() {
    const ctx = useContext();

    const [count, dispatch] = useReducer(reducer, 0);
    const [ticks, setTicks] = useState(0);
    const [live, setLive] = useState(true);

    const doubled = useMemo(() => count * 2, [count]);

    const increment = useCallback(() => {
        dispatch({ type: "inc" });
    }, []);

    const decrement = useCallback(() => {
        dispatch({ type: "dec" });
    }, []);

    const reset = useCallback(() => {
        dispatch({ type: "reset" });
    }, []);

    const toggleLive = useCallback(() => {
        setLive(v => !v);
    }, []);

    useEffect(() => {
        if (!live) return;

        const interval = setInterval(() => {
            setTicks(t => t + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [live]);

    return (
        <>
            <h>🚀 Smart Counter Dashboard</h>

            <blockquote>
                Count: <b>{count}</b>
                <br />
                Doubled: <code>{doubled}</code>
                <br />
                Uptime: <b>{ticks}s</b>
                <br />
                Status: <StatusBadge count={count} />
            </blockquote>

            <button onClick={increment}>➕ Increment</button>
            <button onClick={decrement}>➖ Decrement</button>
            <button onClick={reset}>♻️ Reset</button>
            <button onClick={toggleLive}>
                {live ? "⏸ Pause Timer" : "▶️ Resume Timer"}
            </button>

            {count > 10 ? (
                <>
                    <br />
                    <i>🏆 High score mode unlocked</i>
                </>
            ) : null}
        </>
    );
}
