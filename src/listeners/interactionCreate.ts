import { CommandInteraction, Interaction } from "discord.js";
import { Bot } from "src/bot";
import { CommandInteractionWithValidChannel } from "src/interfaces";
import { enabledCommands } from "../index";

const handleSlashCommand = async(bot: Bot, interaction: CommandInteractionWithValidChannel): Promise<void> => {
    const slashCommand = enabledCommands.find(c => c.name === interaction.commandName);

    if (slashCommand) {
        await interaction.deferReply();
        slashCommand.run(bot, interaction);
    } else {
        interaction.followUp({ content: "An error has occurred!" });
    }
}

export const InteractionCreate = (bot: Bot): void => {
    bot.on("interactionCreate", async(interaction: Interaction) => {
        if (interaction.isCommand()) {
            if (!bot.isValidChannel(interaction.channel)) {
                await interaction.followUp({
                    ephemeral: true,
                    content: "You can't use commands in this channel!"
                });

                return;
            }

            await handleSlashCommand(bot, interaction as CommandInteractionWithValidChannel);
        }
    });
}