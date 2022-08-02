import type { CommandInteraction, ModalSubmitInteraction } from 'discord.js';
import { ActionRowBuilder, SelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';

import { Discord, ModalComponent, Slash } from 'discordx';

import { GitHubService } from '../services/githubService.js';

const gh = new GitHubService('0xAndrewBlack', 'test-repo');

@Discord()
export class EditIssue {
	@Slash('editissue')
	async attachment(interaction: CommandInteraction): Promise<void> {
		if (!interaction.channel?.isThread()) {
			await interaction.reply('Channel is not thread channel.');
			return;
		}

		// Create the modal
		const modal = new ModalBuilder().setTitle('Edit Issue').setCustomId('Edit Issue');

		// Create text input fields
		const issueId = new TextInputBuilder().setCustomId('issueId').setLabel('Issue Id').setStyle(TextInputStyle.Short);

		const issueTitle = new TextInputBuilder()
			.setCustomId('issueTitle')
			.setLabel('Issue Title')
			.setStyle(TextInputStyle.Short);

		const issueBody = new TextInputBuilder()
			.setCustomId('issueBody')
			.setLabel('Issue Body')
			.setStyle(TextInputStyle.Paragraph);

		const row1 = new ActionRowBuilder<TextInputBuilder>().addComponents(issueId);

		const row2 = new ActionRowBuilder<TextInputBuilder>().addComponents(issueTitle);

		const row3 = new ActionRowBuilder<TextInputBuilder>().addComponents(issueBody);

		// Add action rows to form
		modal.addComponents(row1, row2, row3);

		// --- snip ---

		// Present the modal to the user
		interaction.showModal(modal);
	}

	@ModalComponent('Edit Issue')
	async handle(interaction: ModalSubmitInteraction): Promise<void> {
		if (!interaction.channel?.isThread()) {
			await interaction.reply('Channel is not thread channel.');
			return;
		}

		const [issueId, issueTitle, issueBody] = ['issueId', 'issueTitle', 'issueBody'].map((id) =>
			interaction.fields.getTextInputValue(id)
		);

		await interaction.reply(`issue id: ${issueId}, issue title: ${issueTitle}, issue body: ${issueBody}`);

		interaction.channel.edit({
			name: `${issueTitle}`,
		});

		gh.editIssueIdWithBody(Number(issueId), issueTitle, issueBody);

		return;
	}
}
