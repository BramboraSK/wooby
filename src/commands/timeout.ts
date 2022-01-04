import { MessageEmbed } from "discord.js";
import { Bot } from "src/bot";
import { Command, CommandInteractionWithValidChannel } from "../interfaces";
import timestring from "timestring";

export const Timeout: Command = {
    name: "timeout",
    description: "Times out the user",
    type: "CHAT_INPUT",

    options: [
        {
            name: "user",
            description: "The user that will be timed out",
            type: "USER",
            required: true
        },
        {
            name: "duration",
            description: "The duration of the time out (write 'remove' to remove the time out)",
            type: "STRING",
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
        if (!await bot.checkPermissions(interaction, ["MODERATE_MEMBERS"])) return;

        let member = await interaction.guild!.members.fetch(interaction.options.getUser("user", true));

        if (!member.moderatable) {
            await interaction.followUp({
                ephemeral: true,
                content: `I can't time out this user!`
            });

            return;
        }

        let duration = interaction.options.getString("duration", true);
        let timeout: number | null = null;

        if (duration !== "remove") {
            try {
                timeout = timestring(duration, "ms");
            } catch {
                await interaction.followUp({
                    ephemeral: true,
                    content: `Invalid duration format!`
                });
    
                return;
            }

            if (timeout < 5000) {
                await interaction.followUp({
                    ephemeral: true,
                    content: `The minimal duration you can time out users for is 5 seconds!`
                });
    
                return;
            }
        }

        let reason = interaction.options.getString("reason");
        if (!reason) reason = "No reason specified";

        const guild = await bot.getGuild(interaction.guildId!);

        if (guild.logChannelID) {
            interaction.guild!.channels.fetch(guild.logChannelID).then(channel => {
                if (bot.isValidChannel(channel)) {
                    const embed = new MessageEmbed()
                        .setTitle("Time out")
                        .addField("Reason", reason!)
                        .setTimestamp()

                    if (timeout) {
                        embed.setDescription(`${member} was timed out by ${interaction.user}, the time out will expire <t:${Math.floor((Date.now() + timeout) / 1000)}:R>`);
                        embed.setColor("RED");
                    } else {
                        embed.setDescription(`${member}'s time out was removed by ${interaction.user}`);
                        embed.setColor("GREEN");
                    }
                    
                    channel.send({ embeds: [embed] });
                }
            });
        }
            
        try {
            await member.timeout(timeout, reason);
        } catch {
            await interaction.followUp({
                ephemeral: true,
                content: `An error has occurred while ${timeout ? "timing out" : "removing time out from"} ${member}!`
            });

            return;
        }

        await interaction.followUp({
            ephemeral: true,
            content: `${member}${timeout ? " was successfully timed out" : "'s time out was successfully removed"}! **Reason:** ${reason}`
        });
    }
}