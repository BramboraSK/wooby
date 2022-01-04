import { CommandInteraction, DMChannel, MessageEmbed, NewsChannel, TextChannel, ThreadChannel } from "discord.js";
import { Bot } from "src/bot";
import { Command, CommandInteractionWithValidChannel } from "../interfaces";
import { search } from "booru";

export const Booru: Command = {
    name: "booru",
    description: "Sets a image from a booru",
    type: "CHAT_INPUT",

    options: [
        {
            name: "site",
            description: "Site from which the image will be picked (default is 'safebooru')",
            type: "STRING",
            required: false,
            choices: [
                {
                    name: "e621 (NSFW)",
                    value: "e621"
                },
                {
                    name: "e926",
                    value: "e926"
                },
                {
                    name: "hypnohub (NSFW)",
                    value: "hypnohub"
                },
                {
                    name: "danbooru (NSFW)",
                    value: "danbooru"
                },
                {
                    name: "konachan.com (NSFW)",
                    value: "konachan.com"
                },
                {
                    name: "konachan.net",
                    value: "konachan.net"
                },
                {
                    name: "yandere (NSFW)",
                    value: "yandere"
                },
                {
                    name: "gelbooru (NSFW)",
                    value: "gelbooru"
                },
                {
                    name: "r34 (NSFW)",
                    value: "r34"
                },
                {
                    name: "safebooru",
                    value: "safebooru"
                },
                {
                    name: "tbib",
                    value: "tbib"
                },
                {
                    name: "xbooru (NSFW)",
                    value: "xbooru"
                },
                {
                    name: "paheal (NSFW)",
                    value: "paheal"
                },
                {
                    name: "derpibooru (NSFW)",
                    value: "derpibooru"
                },
                {
                    name: "realbooru (NSFW)",
                    value: "realbooru"
                },
            ]
        },
        {
            name: "search_query",
            description: "Only images that contain tags that are specified in the search query will be picked",
            type: "STRING",
            required: false
        }
    ],

    run: async(bot: Bot, interaction: CommandInteractionWithValidChannel): Promise<void> => {
        if (interaction.channel instanceof ThreadChannel) {
            if (!interaction.channel.parent || !interaction.channel.parent.nsfw) {
                await interaction.followUp({
                    ephemeral: true,
                    content: `This channel isn't NSFW!`
                });
    
                return;
            }
        } else {
            if (!interaction.channel.nsfw) {
                await interaction.followUp({
                    ephemeral: true,
                    content: `This channel isn't NSFW!`
                });
    
                return;
            }
        }

        let site = interaction.options.getString("site") || "safebooru";
        let search_query = interaction.options.getString("search_query") || undefined;

        try {
            search(site, search_query, { limit: 1, random: true }).then(async(posts) => {
                if (posts.length < 1) {
                    await interaction.followUp({
                        ephemeral: true,
                        content: `No results found!`
                    });
        
                    return;
                }
    
                const embed = new MessageEmbed()
                    .setColor("LUMINOUS_VIVID_PINK")
                    .setTimestamp();
    
                if (search_query)
                    embed.setTitle(search_query);
    
                if (posts[0].fileUrl) {
                    embed.setImage(posts[0].fileUrl);
                } else {
                    embed.setDescription("An error has occurred!");
                }
    
                await interaction.followUp({
                    ephemeral: true,
                    embeds: [embed]
                });
            });
        } catch {
            await interaction.followUp({
                ephemeral: true,
                content: `An error has occurred!`
            });

            return;
        }
    }
}