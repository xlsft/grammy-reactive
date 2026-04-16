import { useState, useMemo, useCallback, useReducer, useEffect, useContext } from "../../src/lib";

const StatusBadge = ({ count }: { count: number }) => {
    const status = useMemo(() => {
        if (count === 0) return "⚪ Idle";
        if (count > 0) return "🟢 Positive";
        return "🔴 Negative";
    }, [count]);

    return <b>{status}</b>;
}

export const Dashboard = () => {

    const ctx = useContext();
    const [count, dispatch] = useReducer((state: number, action: "inc" | "dec" | "reset") => {
        switch (action) {
            case "inc": return state + 1;
            case "dec": return state - 1;
            case "reset": return 0;
            default: return state;
        }
    }, 0);
    const [ticks, setTicks] = useState(0);
    const [live, setLive] = useState(true);
    const doubled = useMemo(() => count * 2, [count]);
    const increment = useCallback(() => dispatch("inc"), []);
    const decrement = useCallback(() => dispatch("dec"), []);
    const reset = useCallback(() => dispatch("reset"), []);
    const toggleLive = useCallback(() => setLive(v => !v), []);

    useEffect(() => {
        if (!live) return;
        const interval = setInterval(() => {
            setTicks(t => t + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [live]);

    return (
        <>
            <media src={`https://picsum.photos/640/640?random=${count}`} />
            <h>Hi! <mention id={ctx.from?.id!}>{ctx.from?.first_name}</mention>, 🚀 This is Smart Counter Dashboard!</h>

            <blockquote>
                Count: <b>{count}</b><br />
                Doubled: <code>{doubled}</code><br />
                Uptime: <b>{ticks}s</b><br />
                Status: <StatusBadge count={count} /><br />
                Image: {`https://picsum.photos/640/640?random=${count}`}
            </blockquote>
            <button onClick={decrement}>➖ Decrement</button>
            <button onClick={increment} row>➕ Increment</button>
            <button onClick={reset}>♻️ Reset</button>
            <button onClick={toggleLive} row>{live ? "⏸ Pause Timer" : "▶️ Resume Timer"}</button>

            <button variant="copy" value={count.toString()} row>Copy current count!</button>
            <button variant="url" url="https://github.com/xlsft/grammy-reactive" row>Open repository</button>
            {count > 10 ? (<><br /><i>🏆 High score mode unlocked</i></>) : null}
        </>
    );
}
