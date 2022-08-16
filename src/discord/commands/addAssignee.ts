import { config } from '../../config.js';

import { CommandInteraction, EmbedBuilder } from 'discord.js';
import { Discord, Slash, SlashOption } from 'discordx';
import { Description } from '@discordx/utilities';

import { stripStatusFromThread } from '../../utils/discord.js';
import { gh } from '../../services/githubService.js';

@Discord()
export class AddAssignee {
	@Slash('assign')
	@Description('Adds user to the issue.')
	async addAssignee(
		@SlashOption('username', { description: 'GitHub username', required: true })
		assignee: string,
		interaction: CommandInteraction
	): Promise<void> {
		if (!interaction.channel?.isThread()) {
			await interaction.reply('Channel is not thread channel.');

			return;
		}

		try {
			const { guildId }: any = interaction;

			// @ts-ignore - Interaction name broken it exists but throws error
			const channelName = stripStatusFromThread(interaction.channel?.name);
			const { repo, owner, projectId } = gh.getData();
			gh.init();
			await gh.populate(guildId, owner, repo, String(projectId));
			await gh.addAssignee(channelName, assignee);

			const assigneeEmbed = new EmbedBuilder()
				.setColor(config.DC_COLORS.SUCCESS as any)
				.setTitle(`🧑 \`${assignee}\` assigned to \`${channelName}\` issue successfully.`);

			await interaction.reply({
				embeds: [assigneeEmbed],
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
