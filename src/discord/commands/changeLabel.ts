import { CommandInteraction } from 'discord.js';
import { Discord, Slash, SlashChoice, SlashOption } from 'discordx';
import { getGuildInfo } from '../../utils/dbFunctions.js';

import { GitHubService, gh } from '../../services/githubService.js';

// const gh = new GitHubService();
import { Labels, labelsWithEmojis, stripStatusFromThread } from '../../utils/utils.js';
import { Description } from '@discordx/utilities';

@Discord()
export class UpdateLabel {
	@Slash('label')
	@Description('Sets label.')
	async changePriority(
		// @SlashChoice(...Labels)
		@SlashOption('label', { description: 'Issue label', required: true })
		label: string,
		interaction: CommandInteraction
	): Promise<void> {
		try {
			const labelCleaned = label.replace('-', ' ');

			await interaction.deferReply({ ephemeral: true });
			await interaction.followUp(`You selected label: ${label}`);

			// const guildId: any = interaction.guildId;
			// const { repo_name, repo_owner, project_id } = await getGuildInfo(guildId);
			// await gh.populate(guildId, repo_owner, repo_name, project_id);
			await gh.init();

			// @ts-ignore
			await gh.editIssueLabel(stripStatusFromThread(interaction.channel.name), [...label.split(',')], true);

			// const status = labelsWithEmojis.find((labels) => labels.label === label)?.emoji || '❓';

			// @ts-ignore
			// await interaction.channel.setName(`${status} - ${stripStatusFromThread(interaction.channel.name)}`);
		} catch (e: unknown) {
			interaction.reply({
				ephemeral: true,
				content: String(e),
			});
		}

		return;
	}
}
