import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { ApplicationCommand, Client, Guild, GuildApplicationCommandPermissionData, Permissions } from 'discord.js';
import { ApplicationCommandPermissionTypes } from 'discord.js/typings/enums';
import fs from 'fs';

import Command from '../models/command';

const commands: Map<string, Command> = LoadCommands();

export function GetCommands() {
	return commands;
}

function LoadCommands(): Map<string, Command> {
	const cmds = new Map<string, Command>();

	const files = fs.readdirSync(`${__dirname}/../commands`).filter((file) => file.endsWith('.js'));

	for (const file of files) {
		const cmd = require(`${__dirname}/../commands/${file}`) as Command;

		cmds.set(cmd.data.name.toLowerCase(), cmd);
	}

	return cmds;
}

// Registers commands for all guilds currently joined
export async function RegisterCommandsForAllGuilds(client: Client) {
	for (const [id, guild] of client.guilds.cache) {
		RegisterCommandsForGuild(guild);
	}
}

// Register / Perms for a guild
export async function RegisterCommandsForGuild(guild: Guild) {
	console.log(`[${guild.name}] Registering Commands`);
	const res = await RegisterRawCommandsForGuild(guild.client, guild.id);

	//Fix Permission
	console.log(`[${guild.name}] Applying Permissions`);
	const fullPermissions = await CalculateAdminPermissions(guild, res);

	await guild.commands.permissions.set({
		fullPermissions,
	});

	console.log(`[${guild.name}] Commands Registered`);
}

//Used when admin roles are changed etc.
export async function UpdatePermissionsForGuild(guild: Guild) {
	await guild.commands.fetch();
	console.log(`[${guild.name}] Updating Permissions`);
	const appCommands = [...guild.commands.cache.values()];
	const fullPermissions = await CalculateAdminPermissions(guild, appCommands);

	const r = await guild.commands.permissions.set({
		fullPermissions,
	});

	console.log(`[${guild.name}] Updated Permissions`);

	return r;
}

// Calculate the perms object
async function CalculateAdminPermissions(
	guild: Guild,
	appCommands: ApplicationCommand[]
): Promise<GuildApplicationCommandPermissionData[]> {
	const perms: GuildApplicationCommandPermissionData[] = [];

	const adminRoles = [...guild.roles.cache.filter((x) => x.permissions.has(Permissions.FLAGS.ADMINISTRATOR)).values()];

	if (!adminRoles || adminRoles.length == 0) return perms;

	for (const cmd of commands.values()) {
		if (cmd.admin) {
			const appCmd = appCommands.find((x) => x.name == cmd.data.name);
			if (!appCmd) continue;

			perms.push({
				id: appCmd.id,
				permissions: adminRoles.map((role) => {
					return {
						id: role.id,
						permission: true,
						type: 'ROLE',
					};
				}),
			});
		}
	}

	return perms;
}

// Send the instructions to register commands
async function RegisterRawCommandsForGuild(client: Client, guildId: string): Promise<ApplicationCommand[]> {
	const rest = new REST({ version: '9' }).setToken(process.env.DC_BOT_TOKEN as string);

	const cmds = [...commands.values()];

	const res = await rest
		.put(Routes.applicationGuildCommands(client.user?.id || '', guildId), {
			body: cmds.map((x) => {
				const cmd = x.data.toJSON();

				if (x.admin) {
					/* @ts-ignore */
					cmd.default_permission = false;
				}

				return cmd;
			}),
		})
		.catch((x) => console.error(`Failed to set commands`));
	return res as ApplicationCommand[];
}
