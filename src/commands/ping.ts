import { Bot } from "src/bot";
import { Command, CommandInteractionWithValidChannel } from "../interfaces";

export const Ping: Command = {
    name: "ping",
    description: "Sends back Pong!",
    type: "CHAT_INPUT",

    run: async(bot: Bot, interaction: CommandInteractionWithValidChannel): Promise<void> => {
        await interaction.followUp({
            ephemeral: true,
            content: "Pong!"
        });
    }
}