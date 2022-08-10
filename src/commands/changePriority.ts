import type { CommandInteraction } from 'discord.js';

import { Discord, Slash, SlashChoice, SlashOption } from 'discordx';
import { getGuildInfo } from '../utils/dbFunctions.js';

import { GitHubService } from '../services/githubService.js';
import { Priorities, stripStatusFromThread } from '../utils/utils.js';
import { Description } from '@discordx/utilities';

const gh = new GitHubService();

@Discord()
export class ChangePriority {
	@Slash('changepriority')
	@Description('Sets priority.')
	async changePriority(
		@SlashChoice(...Priorities)
		@SlashOption('priority', { description: 'Issue priority', required: true })
		prio: number,
		interaction: CommandInteraction
	): Promise<void> {
		try {
			const guildId: any = interaction.guildId;
			const { repo_name, repo_owner, project_id } = await getGuildInfo(guildId);

			await gh.populate(guildId, repo_owner, repo_name, project_id);

			// @ts-ignore - Interaction name broken it exists but throws error
			gh.setPriority(stripStatusFromThread(interaction.channel.name), prio);

			await interaction.reply({
				content: `Priority: ${prio}`,
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
