import type { CommandInteraction, MessageActionRowComponentBuilder, SelectMenuInteraction } from 'discord.js';
import { ActionRowBuilder, SelectMenuBuilder } from 'discord.js';
import { Discord, SelectMenuComponent, Slash } from 'discordx';

import Client, { bot } from '../main.js';
import { GitHubService } from '../services/githubService.js';

const gh = new GitHubService('test-repo', '0xAndrewBlack');

// Backlog, todo, in-progress, testing, done
const labels = [
	{ label: 'Backlog', value: 'backlog' },
	{ label: 'Todo', value: 'todo' },
	{ label: 'In-Progress', value: 'wip' },
	{ label: 'Testing', value: 'testing' },
	{ label: 'Done', value: 'done' },
];

@Discord()
export class Example {
	@SelectMenuComponent('updatelabel')
	async handle(interaction: SelectMenuInteraction): Promise<unknown> {
		if (!interaction.channel?.isThread()) {
			await interaction.reply('Channel is not thread channel.');
			return;
		}

		await interaction.deferReply();

		// extract selected value by member
		const labelValue = interaction.values?.[0];

		// if value not found
		if (!labelValue) {
			return interaction.followUp('invalid label id, select again');
		}

		await interaction.followUp(`you have selected label: ${labels.find((label) => label.value === labelValue)?.label}`);

		const chs: any = bot.channels.cache.find((c) => c.id === interaction.channelId);

		gh.editLabel([`${labelValue}`], Number(chs.id));

		return;
	}

	@Slash('updatelabel', { description: 'Edit issue label.' })
	async myRoles(interaction: CommandInteraction): Promise<unknown> {
		if (!interaction.channel?.isThread()) {
			await interaction.reply('Channel is not thread channel.');
			return;
		}

		await interaction.deferReply();

		// create menu for roles
		const menu = new SelectMenuBuilder().addOptions(labels).setCustomId('updatelabel');

		// create a row for message actions
		const buttonRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(menu);

		// send it
		interaction.editReply({
			components: [buttonRow],
			content: 'Select the label!',
		});
		return;
	}
}
