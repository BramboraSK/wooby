import { ButtonInteraction, CollectorFilter, Message, MessageActionRow, MessageButton, MessageComponentInteraction, MessageEmbed } from "discord.js";
import { Bot } from "src/bot";
import { Command, CommandInteractionWithValidChannel, UserData } from "../interfaces";

const DAY = 86400000;

const dayHasPassed = (oldEpoch: number, newEpoch: number): boolean => newEpoch - oldEpoch >= DAY;
const randRange = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

export const Profile: Command = {
    name: "profile",
    description: "Shows economy profile",
    type: "CHAT_INPUT",

    options: [
        {
            name: "user",
            description: "The user whose economy profile will be shown",
            type: "USER",
            required: false
        }
    ],

    run: async(bot: Bot, interaction: CommandInteractionWithValidChannel): Promise<void> => {
        let userToShow = interaction.options.getUser("user") || interaction.user;
        if (await bot.isUserBot(interaction, userToShow)) return;

        const user = await bot.getUser(userToShow.id);
        const epoch = Date.now();

        const dailyClaimable = dayHasPassed(user.lastDaily, epoch);

        const embed = new MessageEmbed()
            .setTitle(userToShow.tag)
            .setDescription(`You have **${user.lollipops}**🍭`)
            .addField("Rewards", `You can claim the daily reward ${dailyClaimable ? "right now!" : `<t:${Math.floor((user.lastDaily + DAY) / 1000)}:R>`}`)
            .setColor("LUMINOUS_VIVID_PINK")
            .setTimestamp();

        const row = new MessageActionRow().addComponents(
            new MessageButton()
                .setCustomId("Daily")
                .setLabel("Claim the daily reward")
                .setStyle("SUCCESS")
                .setDisabled(!dailyClaimable)
        );

        interaction.followUp({
            ephemeral: false,
            embeds: [embed],
            components: [row]
        }).then(msg => {
            const filter: CollectorFilter<[MessageComponentInteraction]> = (i) => i.user.id === userToShow.id;
            const collector = (msg as Message).createMessageComponentCollector({ filter, time: 60000 });
    
            collector.on("collect", async(i: ButtonInteraction) => {
                switch (i.customId) {
                    case "Daily":
                        user.lollipops += randRange(1200, 1600);
                }
    
                (user[`last${i.customId}` as keyof UserData] as number) = Date.now();
    
                row.components[row.components.findIndex(c => c.customId === i.customId)].setDisabled();
                bot.updateUser(user, ["lollipops", `last${i.customId}` as keyof UserData]);
    
                embed.setDescription(`You have **${user.lollipops}**🍭`);
                embed.fields[0].value = `You can claim the daily reward ${!dailyClaimable ? "right now!" : `<t:${Math.floor((user.lastDaily + DAY) / 1000)}:R>`}`;
    
                await interaction.editReply({
                    embeds: [embed],
                    components: [row]
                });
    
                await i.reply({
                    ephemeral: true,
                    content: `You have successfully claimed the ${i.customId.toLowerCase()} reward!`
                });
            });
    
            collector.on("end", async() => {
                await interaction.editReply({
                    embeds: [embed],
                    components: []
                });
            });
        });
    }
}