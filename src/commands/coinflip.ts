import { ButtonInteraction, CollectorFilter, Message, MessageActionRow, MessageButton, MessageComponentInteraction, MessageEmbed } from "discord.js";
import { Bot } from "src/bot";
import { Command, CommandInteractionWithValidChannel, UserData } from "../interfaces";

export const Coinflip: Command = {
    name: "coinflip",
    description: "Flips a coin",
    type: "CHAT_INPUT",

    options: [
        {
            name: "bet",
            description: "How many lollipops will be bet",
            type: "NUMBER",
            minValue: 1,
            required: true
        },
        {
            name: "side",
            description: "Which side of the coin will be bet on",
            type: "STRING",
            required: true,
            choices: [
                {
                    name: "Heads",
                    value: "heads"
                },
                {
                    name: "Tails",
                    value: "tails"
                }
            ]
        },
    ],

    run: async(bot: Bot, interaction: CommandInteractionWithValidChannel): Promise<void> => {
        const flip = async(bet: number, side: string) => {
            const user = await bot.getUser(interaction.user.id);

            if (bet > user.lollipops) {
                await interaction.followUp({
                    ephemeral: true,
                    content: "You don't have enough lollipops!"
                });

                return;
            }

            let won = Math.round(Math.random());
            let winningSide = won ? side : side === "heads" ? "tails" : "heads";

            user.lollipops += won ? bet : -bet;
            bot.updateUser(user, ["lollipops"])

            const embed = new MessageEmbed()
                .setTitle("Coinflip")
                .setDescription(`You flipped the coin...${winningSide}! You've ${won ? "won" : "lost"}! You have **${user.lollipops}**🍭`)
                .setColor(won ? "GREEN" : "RED")
                .setTimestamp();

            const row = new MessageActionRow().addComponents(
                new MessageButton()
                    .setCustomId("heads")
                    .setLabel("Bet again on heads")
                    .setStyle("SUCCESS"),

                new MessageButton()
                    .setCustomId("tails")
                    .setLabel("Bet again on tails")
                    .setStyle("SUCCESS")
            );

            const collect = (msg: Message) => {
                const filter: CollectorFilter<[MessageComponentInteraction]> = (i) => i.user.id === interaction.user.id;
                const collector = (msg as Message).createMessageComponentCollector({ filter, time: 60000 });

                collector.on("collect", async(i: ButtonInteraction) => {
                    collector.stop();
                    return await flip(bet, i.customId);
                });
        
                collector.on("end", async() => {
                    await msg.edit({
                        embeds: [embed],
                        components: []
                    });
                });
            }

            interaction.followUp({
                ephemeral: false,
                embeds: [embed],
                components: [row]
            }).then(msg => collect(msg as Message));
        }

        await flip(interaction.options.getNumber("bet", true), interaction.options.getString("side", true));
    }
}