import { useContext, useEffect, useState } from "~/lib";

export const Timer = () => {
    const [seconds, setSeconds] = useState(0);
    const ctx = useContext();

    useEffect(() => {
        console.log("⏱ timer mounted");

        const interval = setInterval(async () => {
            setSeconds(prev => prev + 1);
            await ctx.api.setMessageReaction(
                ctx.chat?.id!,
                ctx.message?.message_id!,
                [{ type: "emoji", emoji: seconds % 2 === 0 ? '🌚' : '🔥' }]
            );
        }, 1000);

        return () => {
            console.log("🧹 timer cleanup");
            clearInterval(interval);
        };
    }, []);

    return (
        <>
            <h>⏱ Live Timer</h>
            <blockquote>
                Running for <b>{seconds}</b> seconds
            </blockquote>
        </>
    );
}
