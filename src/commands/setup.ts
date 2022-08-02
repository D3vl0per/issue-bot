import { Octokit } from '@octokit/rest';
import type { CommandInteraction, ModalSubmitInteraction } from 'discord.js';
import { ActionRowBuilder, SelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';

import { Discord, ModalComponent, Slash } from 'discordx';
import { getDetails, setUpService } from '../services/github.js';

@Discord()
export class SetUp {
	@Slash('setup')
	async attachment(interaction: CommandInteraction): Promise<void> {
		// Create the modal
		const modal = new ModalBuilder().setTitle('Setup BOT').setCustomId('BOT Setup');

		// Create text input fields
		const repoName = new TextInputBuilder()
			.setCustomId('repoName')
			.setLabel('Repo name (Only name, not URL)')
			.setStyle(TextInputStyle.Short);

		const repoOwner = new TextInputBuilder()
			.setCustomId('repoOwner')
			.setLabel('Repo Owner (Username only)')
			.setStyle(TextInputStyle.Short);

		const row1 = new ActionRowBuilder<TextInputBuilder>().addComponents(repoOwner);

		const row2 = new ActionRowBuilder<TextInputBuilder>().addComponents(repoName);

		// Add action rows to form
		modal.addComponents(row1, row2);

		// --- snip ---

		// Present the modal to the user
		interaction.showModal(modal);
	}

	@ModalComponent('BOT Setup')
	async handle(interaction: ModalSubmitInteraction): Promise<void> {
		const [repoName, repoOwner] = ['repoName', 'repoOwner'].map((id) => interaction.fields.getTextInputValue(id));

		const { channelId, guildId } = interaction;

		// const details = await getDetails(String(guildId));

		// if (details[0].repo_name) {
		// 	await interaction.reply(`Config exits. repo name: ${repoName}, repo owner: ${repoOwner}`);

		// 	return;
		// }

		setUpService(String(guildId), String(channelId), repoOwner, repoName);

		return;
	}
}
