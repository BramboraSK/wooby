import { Bot } from "src/bot";
import { Command, CommandInteractionWithValidChannel } from "../interfaces";

const answers = ["Yes!", "No!", "Of course!", "No chance!", "Yeah!", "Nope!", "I don't know...", "Maybe...?", "Probably yes.", "Probably not."];

export const EightBall: Command = {
    name: "8ball",
    description: "Answers your question",
    type: "CHAT_INPUT",

    options: [
        {
            name: "question",
            description: "Your question",
            type: "STRING",
            required: true
        }
    ],

    run: async(bot: Bot, interaction: CommandInteractionWithValidChannel): Promise<void> => {
        let question = interaction.options.getString("question", true).toLowerCase().replace(/[^0-9a-zA-Z]+/g, "");
        let hash = 0;

        for (let i = 0; i < question.length; ++i) {
            hash = ((hash << 5) - hash) + question.charCodeAt(i);
            hash |= 0;
        }

        let index = String(Math.abs(hash)).split("").map(n => Number(n)).reduce((a, b) => a + b) % 7;

        await interaction.followUp({
            ephemeral: true,
            content: `**Your question:** ${interaction.options.getString("question", true)}\n**My answer:** ${answers[index]}`
        });
    }
}