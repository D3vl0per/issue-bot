import type { CommandInteraction, MessageActionRowComponentBuilder, SelectMenuInteraction } from 'discord.js';
import { ActionRowBuilder, SelectMenuBuilder } from 'discord.js';
import { Discord, SelectMenuComponent, Slash } from 'discordx';
import { getGuildInfo } from '../utils/dbFunctions.js';

import { gh } from '../services/githubService.js';
import { labels, labelsWithEmojis, stripStatusFromThread } from '../utils/utils.js';
import { Description } from '@discordx/utilities';

@Discord()
export class UpdateLabel {
	@Slash('updatelabel')
	@Description('Edits issue label.')
	async myRoles(interaction: CommandInteraction): Promise<unknown> {
		if (!interaction.channel?.isThread()) {
			await interaction.reply('Channel is not thread channel.');

			return;
		}

		await interaction.deferReply({ ephemeral: true });

		const menu = new SelectMenuBuilder().addOptions(labels).setCustomId('updatelabel');
		const buttonRow = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(menu);

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

		const labelValue = interaction.values?.[0];

		if (!labelValue) return interaction.followUp('invalid label id, select again');

		await interaction.followUp(`You selected label: ${labels.find((label) => label.value === labelValue)?.label}`);

		const guildId: any = interaction.guildId;
		const lbl: any = labels.find((lbl) => lbl.value === labelValue)?.label;
		const { repo_name, repo_owner, project_id } = await getGuildInfo(guildId);

		await gh.populate(guildId, repo_owner, repo_name, project_id);
		await gh.editIssueLabel(stripStatusFromThread(interaction.channel.name), [lbl]);

		const status = labelsWithEmojis.find((labels) => labels.value === labelValue)?.emoji;

		await interaction.channel.setName(`${status} - ${stripStatusFromThread(interaction.channel.name)}`);

		return;
	}
}
