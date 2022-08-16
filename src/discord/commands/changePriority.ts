import { CommandInteraction, EmbedBuilder } from 'discord.js';

import { Discord, Slash, SlashChoice, SlashOption } from 'discordx';
// import { getGuildInfo } from '../../utils/dbFunctions.js';

import { GitHubService } from '../../services/githubService.js';
import { Priorities, stripStatusFromThread } from '../../utils/discord.js';
import { Description } from '@discordx/utilities';
import { config } from '../..//config.js';

const gh = new GitHubService();

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
			const guildId: any = interaction.guildId;
			// const { repo_name, repo_owner, project_id } = await getGuildInfo(guildId);
			const { repo, owner, projectId } = gh.getData();
			gh.init();
			await gh.populate(guildId, owner, repo, String(projectId));

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
