import 'reflect-metadata';

import { config } from './config.js';

import { Interaction, Message, Partials } from 'discord.js';
import { dirname, importx } from '@discordx/importer';
import { IntentsBitField } from 'discord.js';
import { ActivityType } from 'discord.js';
import { Client } from 'discordx';

export class Main {
	public static bot: Client;

	public static async start(): Promise<void> {
		this.bot = new Client({
			shards: 'auto',
			silent: String(config.NODE_ENV) !== 'development' ? true : false,
			botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],
			intents: [
				IntentsBitField.Flags.Guilds,
				IntentsBitField.Flags.GuildMembers,
				IntentsBitField.Flags.GuildMessages,
				IntentsBitField.Flags.GuildMessageReactions,
				IntentsBitField.Flags.GuildVoiceStates,
				IntentsBitField.Flags.MessageContent,
			],
			simpleCommand: {
				prefix: '!',
			},
			partials: [Partials.Channel, Partials.Message, Partials.Reaction],
		});

		this.bot.once('ready', async () => {
			await this.bot.guilds.fetch();
			await this.bot.initApplicationCommands();
			await this.bot.initGlobalApplicationCommands();

			console.log(`${this.bot.user?.username} is up.`);
		});

		this.bot.on('ready', async () => {
			this.bot.user?.setPresence({
				activities: [{ name: 'over your guild.', type: ActivityType.Watching }],
				status: 'dnd',
			});
		});

		this.bot.on('messageCreate', (message: Message) => {
			this.bot.executeCommand(message);
		});

		this.bot.on('interactionCreate', (interaction: Interaction) => {
			this.bot.executeInteraction(interaction);
		});

		await importx(dirname(import.meta.url) + '/discord/{events,commands}/**/*.{ts,js}');

		await this.bot.login(config.DC_BOT_TOKEN);
	}
}

// Weird BigInt error fix from DJX devs LUL.
(BigInt.prototype as any).toJSON = function (): string {
	return this.toString();
};

Main.start();
