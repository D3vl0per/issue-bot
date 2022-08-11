import type { CommandInteraction, MessageActionRowComponentBuilder, SelectMenuInteraction } from 'discord.js';
import { ActionRowBuilder, SelectMenuBuilder } from 'discord.js';
import { Discord, SelectMenuComponent, Slash, SlashChoice, SlashOption } from 'discordx';
import { getGuildInfo } from '../utils/dbFunctions.js';

import { gh } from '../services/githubService.js';
import { Labels, labels, labelsWithEmojis, stripStatusFromThread } from '../utils/utils.js';
import { Description } from '@discordx/utilities';

@Discord()
export class UpdateLabel {
	@Slash('updatelabel')
	@Description('Sets label.')
	async changePriority(
		@SlashChoice(...Labels)
		@SlashOption('label', { description: 'Issue label', required: true })
		label: string,
		interaction: CommandInteraction
	): Promise<void> {
		const labelCleaned = label.replace('-', ' ');

		await interaction.deferReply({ ephemeral: true });
		await interaction.followUp(`You selected label: ${labelCleaned}`);

		const guildId: any = interaction.guildId;
		const { repo_name, repo_owner, project_id } = await getGuildInfo(guildId);

		await gh.populate(guildId, repo_owner, repo_name, project_id);
		// @ts-ignore
		await gh.editIssueLabel(stripStatusFromThread(interaction.channel.name), [labelCleaned]);

		const status = labelsWithEmojis.find((labels) => labels.label === labelCleaned)?.emoji;

		// @ts-ignore
		await interaction.channel.setName(`${status} - ${stripStatusFromThread(interaction.channel.name)}`);

		return;
	}
}
