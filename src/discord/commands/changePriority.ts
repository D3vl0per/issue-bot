import { config } from '../../config.js';

import { CommandInteraction, EmbedBuilder } from 'discord.js';
import { Discord, Slash, SlashChoice, SlashOption } from 'discordx';
import { Description } from '@discordx/utilities';

import { Priorities, stripStatusFromThread } from '../../utils/discord.js';
import { gh } from '../../services/githubService.js';

@Discord()
export class ChangePriority {
	@Slash('priority')
	@Description('Sets priority.')
	async changePriority(
		@SlashChoice(...Priorities)
		@SlashOption('priority', { description: 'Issue priority', required: true })
		prio: number,
		interaction: CommandInteraction
	): Promise<void> {
		if (!interaction.channel?.isThread()) {
			await interaction.reply('Channel is not thread channel.');
			return;
		}

		try {
			gh.init();

			// @ts-ignore - Interaction name broken it exists but throws error
			gh.setPriority(stripStatusFromThread(interaction.channel.name), prio);

			const priorityEmbed = new EmbedBuilder()
				.setColor(config.DC_COLORS.SUCCESS as any)
				.setTitle(`💈 Priority updated to \`${prio}\` successfully.`);

			await interaction.reply({
				embeds: [priorityEmbed],
				ephemeral: true,
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
	}
}
