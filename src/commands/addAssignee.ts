import type { CommandInteraction } from 'discord.js';

import { Discord, Slash, SlashOption } from 'discordx';
import { getGuildInfo } from '../utils/dbFunctions.js';

import { GitHubService } from '../services/githubService.js';
import { stripStatusFromThread } from '../utils/utils.js';
import { Description } from '@discordx/utilities';

const gh = new GitHubService();

@Discord()
export class AddAssignee {
	@Slash('addassignee')
	@Description('Adds user to the issue.')
	async addAssignee(
		@SlashOption('assignee', { description: 'GitHub username', required: true })
		assignee: string,
		interaction: CommandInteraction
	): Promise<void> {
		try {
			const { guildId }: any = interaction;

			// @ts-ignore - Interaction name broken it exists but throws error
			const channelName = interaction.channel?.name;
			const { repo_name, repo_owner, project_id } = await getGuildInfo(guildId);

			await gh.populate(guildId, repo_owner, repo_name, project_id);
			await gh.addAssignee(stripStatusFromThread(channelName), assignee);

			await interaction.reply({
				content: `${assignee} user is assigned to ${stripStatusFromThread(channelName)} issue.`,
				ephemeral: true,
			});
		} catch (error) {
			await interaction.reply({
				content: String(error),
				ephemeral: true,
			});
		}
	}
}
