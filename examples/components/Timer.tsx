import { useContext, useEffect, useState } from "~/lib";

export const Timer = () => {
    const [seconds, setSeconds] = useState(0);
    const ctx = useContext();

    useEffect(() => {
        console.log("⏱ timer mounted");

        const interval = setInterval(async () => {
            await setSeconds(prev => {
                const next = prev + 1;

                ctx.api.setMessageReaction(
                    ctx.chat?.id!,
                    ctx.message?.message_id!,
                    [
                        {
                            type: "emoji",
                            emoji: next % 2 === 0 ? "🌚" : "🔥",
                        },
                    ]
                );

                return next;
            });
        }, 1000);

        return () => {
            console.log("🧹 timer cleanup");
            clearInterval(interval);
        };
    }, []);

    return (
        <>
            <h>⏱ Timer</h>
            <blockquote>
                Running for <b>{seconds}</b> seconds
            </blockquote>
        </>
    );
}
