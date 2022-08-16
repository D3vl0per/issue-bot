import { config } from '../../config.js';

import { CommandInteraction, EmbedBuilder, ModalSubmitInteraction } from 'discord.js';
import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { Discord, ModalComponent, Slash } from 'discordx';
import { Description } from '@discordx/utilities';

import { stripStatusFromThread } from '../../utils/discord.js';
import { gh } from '../../services/githubService.js';

@Discord()
export class EditIssue {
	@Slash('issue')
	@Description('Edits issue title and body via a modal.')
	async attachment(interaction: CommandInteraction): Promise<void> {
		if (!interaction.channel?.isThread()) {
			await interaction.reply('Channel is not thread channel.');

			return;
		}

		// Create the modal
		const modal = new ModalBuilder().setTitle('Edit Issue').setCustomId('Edit Issue');

		// Create text input fields
		const issueTitle = new TextInputBuilder()
			.setCustomId('issueTitle')
			.setLabel('Issue Title')
			.setStyle(TextInputStyle.Short);

		const issueBody = new TextInputBuilder()
			.setCustomId('issueBody')
			.setLabel('Issue Body')
			.setStyle(TextInputStyle.Paragraph);

		const row2 = new ActionRowBuilder<TextInputBuilder>().addComponents(issueTitle);

		const row3 = new ActionRowBuilder<TextInputBuilder>().addComponents(issueBody);

		// Add action rows to form
		modal.addComponents(row2, row3);

		// Present the modal to the user
		interaction.showModal(modal);
	}

	@ModalComponent('Edit Issue')
	async handle(interaction: ModalSubmitInteraction): Promise<void> {
		if (!interaction.channel?.isThread()) {
			await interaction.reply('Channel is not thread channel.');

			return;
		}

		const [issueTitle, issueBody] = ['issueTitle', 'issueBody'].map((id) => interaction.fields.getTextInputValue(id));
		const status = interaction.channel.name.split(' ')[0];
		// const guildId: any = interaction.guildId;
		// const { repo_name, repo_owner, project_id } = await getGuildInfo(guildId);

		// await gh.populate(guildId, repo_owner, repo_name, project_id);
		await gh.editIssue(stripStatusFromThread(interaction.channel.name), issueTitle, issueBody);

		const issueEmbed = new EmbedBuilder()
			.setColor(config.DC_COLORS.SUCCESS as any)
			.setTitle(`✨ Issue \`${issueTitle}\` updated successfully.`);

		await interaction.reply({
			embeds: [issueEmbed],
			ephemeral: true,
		});

		interaction.channel.setName(`${status} - ${issueTitle}`);

		return;
	}
}
