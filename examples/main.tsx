
import { Bot, Context } from "grammy";
import { reactive, type ReactiveFlavor } from "../src/lib";
import startHandler from "./handlers/start.handler";
import calculatorHandler from "./handlers/calculator.handler";
import timerHandler from "./handlers/timer.handler";
import asyncHandler from "./handlers/async.handler";

const bot = new Bot<ReactiveFlavor<Context>>(process.env.TG_TOKEN!);
bot.use(reactive());
bot.command("start", startHandler);
bot.command("calculator", calculatorHandler);
bot.command("timer", timerHandler)
bot.command("async", asyncHandler)

bot.command("static_text", async (ctx) => {
    await ctx.reply("This is a text command");
});

bot.command("static_jsx", async (ctx) => {
    await ctx.reply(() => <>
        <b>This is a jsx command</b>
    </>);
});

bot.start()
