import { CommandInteraction, EmbedBuilder } from 'discord.js';
import { Discord, Slash, SlashChoice, SlashOption } from 'discordx';
// import { getGuildInfo } from '../../utils/dbFunctions.js';

import { GitHubService, gh } from '../../services/githubService.js';

// const gh = new GitHubService();
import { Labels, labelsWithEmojis, stripStatusFromThread } from '../../utils/discord.js';
import { Description } from '@discordx/utilities';
import { config } from '../..//config.js';

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

		// const guildId: any = interaction.guildId;
		// const { repo_name, repo_owner, project_id } = await getGuildInfo(guildId);

		// await gh.populate(guildId, repo_owner, repo_name, project_id);
		gh.init();
		// @ts-ignore
		await gh.editIssueLabel(stripStatusFromThread(interaction.channel.name), [statusCleaned], false);

		const statusEmoji = labelsWithEmojis.find((labels) => labels.label === statusCleaned)?.emoji;

		// @ts-ignore
		await interaction.channel.setName(`${statusEmoji} - ${stripStatusFromThread(interaction.channel.name)}`);

		return;
	}
}
