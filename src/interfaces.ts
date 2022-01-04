import { CommandInteraction, ChatInputApplicationCommandData } from "discord.js";
import { Bot } from "./bot";
import { AllowedChannelTypes } from "./types";

export interface CommandInteractionWithValidChannel extends CommandInteraction {
    channel: AllowedChannelTypes;
}

export interface Command extends ChatInputApplicationCommandData {
    run: (bot: Bot, interaction: CommandInteractionWithValidChannel) => void;
}


export interface GuildData {
    id: string;
    logChannelID: string | null;
}

export interface UserData {
    id: string;
    lollipops: number;
    lastDaily: number;
}