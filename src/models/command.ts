import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';

export default interface Command {
	data: SlashCommandBuilder;
	execute: (interaction: CommandInteraction) => any;
	admin?: boolean;
}
