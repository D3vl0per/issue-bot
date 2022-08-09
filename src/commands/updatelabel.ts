import type { CommandInteraction, MessageActionRowComponentBuilder, SelectMenuInteraction } from 'discord.js';
import { ActionRowBuilder, SelectMenuBuilder } from 'discord.js';
import { Discord, Guard, SelectMenuComponent, Slash } from 'discordx';
import { getGuildInfo } from '../utils/dbFunctions.js';

import { gh } from '../services/githubService.js';
import { labels, labelsWithEmojis, stripStatusFromThread } from '../utils/utils.js';

@Discord()
export class UpdateLabel {
	@Slash('updatelabel', { description: 'Edit issue label.' })
	async myRoles(interaction: CommandInteraction): Promise<unknown> {
		if (!interaction.channel?.isThread()) {
			await interaction.reply('Channel is not thread channel.');
			return;
		}

		await interaction.deferReply({ ephemeral: true });

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

	@SelectMenuComponent('updatelabel')
	async handle(interaction: SelectMenuInteraction): Promise<unknown> {
		if (!interaction.channel?.isThread()) {
			await interaction.reply('Channel is not thread channel.');
			return;
		}

		await interaction.deferReply({ ephemeral: true });

		// extract selected value by member
		const labelValue = interaction.values?.[0];

		// if value not found
		if (!labelValue) {
			return interaction.followUp('invalid label id, select again');
		}

		await interaction.followUp(`you have selected label: ${labels.find((label) => label.value === labelValue)?.label}`);

		const lebol: any = labels.find((lbl) => lbl.value === labelValue)?.label;

		const guildId: any = interaction.guildId;
		const { repo_name, repo_owner, project_id } = await getGuildInfo(guildId);

		await gh.populate(guildId, repo_owner, repo_name, project_id);
		await gh.editIssueLabel(stripStatusFromThread(interaction.channel.name), [lebol]);

		const status = labelsWithEmojis.find((labels) => labels.value === labelValue)?.emoji;

		await interaction.channel.setName(`${status} - ${stripStatusFromThread(interaction.channel.name)}`);

		return;
	}
}
