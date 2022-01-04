import "dotenv/config";
import { Intents } from "discord.js";
import { Bot } from "./bot";
import sqlite from 'sqlite3';

// SQLite3 database
const sqlite3 = sqlite.verbose();
const db = new sqlite3.Database("database.db");

// Listeners
import { Listener } from "./types";
import { Ready } from "./listeners/ready";
import { InteractionCreate } from "./listeners/interactionCreate";

// Commands
import { Command } from "./interfaces";
import { Ping } from "./commands/ping";
import { EightBall } from "./commands/8ball";
import { Log } from "./commands/log";
import { Ban } from "./commands/ban";
import { Kick } from "./commands/kick";
import { Timeout } from "./commands/timeout";
import { Booru } from "./commands/booru";
import { Profile } from "./commands/profile";
import { Purge } from "./commands/purge";
import { Coinflip } from "./commands/coinflip";

const enabledListeners: Listener[] = [Ready, InteractionCreate];
export const enabledCommands: Command[] = [Ping, EightBall, Log, Ban, Kick, Timeout, Booru, Profile, Purge, Coinflip];

// BOT
const wooby = new Bot({
    intents: [Intents.FLAGS.GUILDS]
}, db);

wooby.registerListeners(enabledListeners);
wooby.login(process.env.DISCORD_TOKEN);