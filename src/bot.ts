import { Client, ClientOptions, CommandInteraction, Guild, GuildMember, NewsChannel, NonThreadGuildBasedChannel, PermissionResolvable, TextBasedChannel, TextChannel, ThreadChannel, User } from "discord.js";
import { Database } from "sqlite3";
import { GuildData, UserData } from "./interfaces";
import { AllowedChannelTypes, Listener } from "./types";

export class Bot extends Client {
    readonly db: Database;

    constructor(options: ClientOptions, db: Database) {
        super (options);
        this.db = db;
    }

    registerListeners(listeners: Listener[]): void {
        listeners.forEach(listener => listener(this));
    }

    isValidChannel(channel: TextBasedChannel | NonThreadGuildBasedChannel | null): channel is AllowedChannelTypes {
        if (channel instanceof NewsChannel || channel instanceof TextChannel || channel instanceof ThreadChannel)
            return true;

        return false;
    }

    async checkPermissions(interaction: CommandInteraction, permissions: PermissionResolvable[]): Promise<boolean> {
        if (interaction.member instanceof GuildMember && interaction.guild instanceof Guild) {
            for (const member of [interaction.member, interaction.guild.me]) {
                if (!(member instanceof GuildMember)) {
                    await interaction.followUp({
                        ephemeral: true,
                        content: `An unknown error has occurred! Try again.`
                    });
        
                    return false;
                }

                for (const permission of permissions) {
                    if (!member.permissions.has(permission)) {
                        let content = member.id === this.user!.id ? `I don't have enough permissions to do this!` : `You don't have enough permissions to preform this command!`;

                        await interaction.followUp({
                            ephemeral: true,
                            content
                        });
        
                        return false;
                    }
                }
            }
        }

        return true;
    }

    async isUserBot(interaction: CommandInteraction, user: User): Promise<boolean> {
        if (user.bot) {
            await interaction.followUp({
                ephemeral: true,
                content: "The user can't be a BOT!"
            });

            return true;
        }

        return false;
    }

    createGuild(id: string): Promise<GuildData> {
        return new Promise(resolve => {
            this.db.run(`INSERT INTO guilds (id) VALUES (${id})`, err => {
                if (err) return console.error(err);
                resolve(this.getGuild(id));
            });
        });
    }

    getGuild(id: string): Promise<GuildData> {
        return new Promise(resolve => {
            this.db.get(`SELECT * FROM guilds WHERE id=${id}`, (err, res: GuildData | undefined) => {
                if (err) return console.error(err);
                if (res) return resolve(res);
                resolve(this.createGuild(id));
            });
        });
    }

    updateGuild(guild: GuildData, toUpdate: (keyof GuildData)[]): void {
        this.db.run(`UPDATE guilds SET ${toUpdate.map(key => `${key}=${guild[key]}`).join(", ")} WHERE id=${guild.id}`, err => {
            if (err) return console.error(err);
        });
    }

    createUser(id: string): Promise<UserData> {
        return new Promise(resolve => {
            this.db.run(`INSERT INTO users (id) VALUES (${id})`, err => {
                if (err) return console.error(err);
                resolve(this.getUser(id));
            });
        });
    }

    getUser(id: string): Promise<UserData> {
        return new Promise(resolve => {
            this.db.get(`SELECT * FROM users WHERE id=${id}`, (err, res: UserData | undefined) => {
                if (err) return console.error(err);
                if (res) return resolve(res);
                resolve(this.createUser(id));
            });
        });
    }

    updateUser(user: UserData, toUpdate: (keyof UserData)[]): void {
        this.db.run(`UPDATE users SET ${toUpdate.map(key => `${key}=${user[key]}`).join(", ")} WHERE id=${user.id}`, err => {
            if (err) return console.error(err);
        });
    }
}