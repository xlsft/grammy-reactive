
import { Bot, Context } from "grammy";
import { reactive, type ReactiveFlavor } from "~/lib";
import startHandler from "./handlers/start.handler";
import calculatorHandler from "./handlers/calculator.handler";
import timerHandler from "./handlers/timer.handler";

const bot = new Bot<ReactiveFlavor<Context>>(process.env.TG_TOKEN!);
bot.use(reactive());
bot.command("start", startHandler);
bot.command("calculator", calculatorHandler);
bot.command("timer", timerHandler)

bot.start()
