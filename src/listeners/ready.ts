import { Bot } from "src/bot";
import { enabledCommands } from "../index";

export const Ready = (bot: Bot): void => {
    bot.once("ready", async() => {
        if (!bot.user || !bot.application)
            return;

        bot.user.setActivity({ name: "Hanamaru <3", type: "WATCHING" });

        if (process.env.GUILD_ID) {
            await bot.application.commands.set(enabledCommands, process.env.GUILD_ID);
        } else {
            await bot.application.commands.set(enabledCommands);
        }
        
        console.log(`${bot.user.username} is online!`);
    });
}