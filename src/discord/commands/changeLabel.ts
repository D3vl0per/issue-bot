import { config } from '../../config.js';

import { CommandInteraction, EmbedBuilder } from 'discord.js';
import { Discord, Slash, SlashOption } from 'discordx';
import { Description } from '@discordx/utilities';

import { stripStatusFromThread } from '../../utils/discord.js';
import { gh } from '../../services/githubService.js';

@Discord()
export class UpdateLabel {
	@Slash('label')
	@Description('Sets label.')
	async changePriority(
		@SlashOption('label', { description: 'Issue label', required: true })
		label: string,
		interaction: CommandInteraction
	): Promise<void> {
		try {
			const labelEmbed = new EmbedBuilder()
				.setColor(config.DC_COLORS.SUCCESS as any)
				.setTitle(`🏷️ Label(s) set to \`${label}\` successfully.`);

			await gh.init();

			// @ts-ignore
			await gh.editIssueLabel(stripStatusFromThread(interaction.channel.name), [...label.split(',')], true);

			await interaction.reply({
				ephemeral: true,
				embeds: [labelEmbed],
			});
		} catch (error: unknown) {
			const errorEmbed = new EmbedBuilder()
				.setTitle('❌ An error occurred.')
				.setDescription(`\`${JSON.stringify(error)}\``)
				.setColor(config.DC_COLORS.ERROR as any);

			interaction.reply({
				ephemeral: true,
				embeds: [errorEmbed],
			});

			return;
		}

		return;
	}
}
