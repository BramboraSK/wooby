import { NewsChannel, TextChannel, ThreadChannel } from "discord.js";
import { Bot } from "./bot";

export type Listener = (bot: Bot) => void;
export type AllowedChannelTypes = NewsChannel | TextChannel | ThreadChannel;