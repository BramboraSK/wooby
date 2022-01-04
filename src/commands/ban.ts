import { MessageEmbed } from "discord.js";
import { Bot } from "src/bot";
import { AllowedChannelTypes } from "src/types";
import { Command, CommandInteractionWithValidChannel } from "../interfaces";

export const Ban: Command = {
    name: "ban",
    description: "Bans the user",
    type: "CHAT_INPUT",

    options: [
        {
            name: "user",
            description: "The user that will be banned",
            type: "USER",
            required: true
        },
        {
            name: "reason",
            description: "The reason for the ban",
            type: "STRING",
            required: false
        }
    ],

    run: async(bot: Bot, interaction: CommandInteractionWithValidChannel): Promise<void> => {
        if (!await bot.checkPermissions(interaction, ["BAN_MEMBERS"])) return;

        let member = await interaction.guild!.members.fetch(interaction.options.getUser("user", true));

        if (!member.bannable) {
            await interaction.followUp({
                ephemeral: true,
                content: `I can't ban this user!`
            });

            return;
        }

        let reason = interaction.options.getString("reason");
        if (!reason) reason = "No reason specified";

        const guild = await bot.getGuild(interaction.guildId!);

        if (guild.logChannelID) {
            interaction.guild!.channels.fetch(guild.logChannelID).then(channel => {
                if (bot.isValidChannel(channel)) {
                    const embed = new MessageEmbed()
                        .setTitle("Ban")
                        .setDescription(`${member} was banned by ${interaction.user}`)
                        .addField("Reason", reason!)
                        .setColor("RED")
                        .setTimestamp();
                    (channel as AllowedChannelTypes).send({ embeds: [embed] });
                }
            });
        }
            
        try {
            await member.ban({ reason: reason });
        } catch {
            await interaction.followUp({
                ephemeral: true,
                content: `An error has occurred while banning ${member}!`
            });

            return;
        }

        await interaction.followUp({
            ephemeral: true,
            content: `${member} was successfully banned! **Reason:** ${reason}`
        });
    }
}