import { config } from '../../config.js';

import { CommandInteraction, EmbedBuilder } from 'discord.js';
import { Discord, Slash, SlashChoice, SlashOption } from 'discordx';
import { Description } from '@discordx/utilities';

import { Labels, labelsWithEmojis, stripStatusFromThread } from '../../utils/discord.js';
import { gh } from '../../services/githubService.js';

@Discord()
export class ChangeStatus {
	@Slash('status')
	@Description('Sets status.')
	async changePriority(
		@SlashChoice(...Labels)
		@SlashOption('label', { description: 'Issue label', required: true })
		status: string,
		interaction: CommandInteraction
	): Promise<void> {
		const statusCleaned = status.replace('-', ' ');

		const statusEmbed = new EmbedBuilder()
			.setColor(config.DC_COLORS.SUCCESS as any)
			.setTitle(`🧪 Status updated to \`${statusCleaned}\` successfully.`);

		await interaction.reply({
			embeds: [statusEmbed],
			ephemeral: true,
		});

		gh.init();

		// @ts-ignore
		await gh.editIssueLabel(stripStatusFromThread(interaction.channel.name), [statusCleaned], false);

		const statusEmoji = labelsWithEmojis.find((labels) => labels.label === statusCleaned)?.emoji;

		// @ts-ignore
		await interaction.channel.setName(`${statusEmoji} - ${stripStatusFromThread(interaction.channel.name)}`);

		return;
	}
}
