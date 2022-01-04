import { Bot } from "src/bot";
import { Command, CommandInteractionWithValidChannel } from "../interfaces";

export const Log: Command = {
    name: "log",
    description: "Sets a log channel",
    type: "CHAT_INPUT",

    options: [
        {
            name: "log_channel",
            description: "The channel to which log messages will be sent",
            type: "CHANNEL",
            required: true
        }
    ],

    run: async(bot: Bot, interaction: CommandInteractionWithValidChannel): Promise<void> => {
        if (!await bot.checkPermissions(interaction, ["MANAGE_CHANNELS"])) return;

        let logChannel = interaction.options.getChannel("log_channel", true);

        const guild = await bot.getGuild(interaction.guildId!);
        guild.logChannelID = logChannel.id;

        bot.updateGuild(guild, ["logChannelID"]);

        await interaction.followUp({
            ephemeral: true,
            content: `The log channel was successfully set to ${logChannel}!`
        });
    }
}