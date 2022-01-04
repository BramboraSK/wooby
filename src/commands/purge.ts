import { MessageEmbed } from "discord.js";
import { Bot } from "src/bot";
import { Command, CommandInteractionWithValidChannel } from "../interfaces";

export const Purge: Command = {
    name: "purge",
    description: "Purges a specific amount of messages",
    type: "CHAT_INPUT",

    options: [
        {
            name: "amount",
            description: "The amount of messages to purge",
            type: "NUMBER",
            minValue: 1,
            maxValue: 100,
            required: true
        },
        // {
        //     name: "user",
        //     description: "Only messages from this user will be deleted",
        //     type: "USER",
        //     required: false
        // },
        {
            name: "reason",
            description: "The reason for the purge",
            type: "STRING",
            required: false
        }
    ],

    run: async(bot: Bot, interaction: CommandInteractionWithValidChannel): Promise<void> => {
        if (!await bot.checkPermissions(interaction, ["MANAGE_MESSAGES"])) return;

        let amount = interaction.options.getNumber("amount", true);
        // let user = interaction.options.getUser("user");

        let reason = interaction.options.getString("reason");
        if (!reason) reason = "No reason specified";

        const guild = await bot.getGuild(interaction.guildId!);

        if (guild.logChannelID) {
            interaction.guild!.channels.fetch(guild.logChannelID).then(channel => {
                if (bot.isValidChannel(channel)) {
                    const embed = new MessageEmbed()
                        .setTitle("Purge")
                        // ${user ? ` from ${user}` : ""}
                        .setDescription(`**${amount}** message${amount > 1 ? "s" : ""} ${amount > 1 ? "were" : "was"} purged by ${interaction.user}`)
                        .addField("Reason", reason!)
                        .setColor("RED")
                        .setTimestamp()
                    channel.send({ embeds: [embed] });
                }
            });
        }
            
        try {
            interaction.channel.messages.fetch({
                limit: /*user && user.id !== interaction.user.id ? amount : */amount + 1,
            }).then(async(messages) => {
                // if (user)
                //     messages = messages.filter(msg => msg.author.id === user!.id);
        
                await interaction.channel.bulkDelete(messages);
            });
        } catch {
            await interaction.followUp({
                ephemeral: true,
                content: `An error has occurred while deleting **${amount}** message${amount > 1 && "s"}!`
            });

            return;
        }
    }
}