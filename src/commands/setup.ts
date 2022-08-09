import type { CommandInteraction, ModalSubmitInteraction } from 'discord.js';
import { ActionRowBuilder, SelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';

import { Discord, ModalComponent, Slash } from 'discordx';
import { insertGuildInfo, isGuildExists } from '../utils/dbFunctions.js';

import { gh } from '../services/githubService.js';

@Discord()
export class SetUp {
	@Slash('setup')
	async attachment(interaction: CommandInteraction): Promise<void> {
		if (await isGuildExists(String(interaction.guildId))) {
			interaction.reply('Already configured.');

			return;
		}

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

		const projectName = new TextInputBuilder()
			.setCustomId('projectName')
			.setLabel('Project Name (Top level GitHub Project)')
			.setStyle(TextInputStyle.Short);

		const row1 = new ActionRowBuilder<TextInputBuilder>().addComponents(repoOwner);

		const row2 = new ActionRowBuilder<TextInputBuilder>().addComponents(repoName);

		const row3 = new ActionRowBuilder<TextInputBuilder>().addComponents(projectName);

		// Add action rows to form
		modal.addComponents(row1, row2, row3);

		// Present the modal to the user
		interaction.showModal(modal);
	}

	@ModalComponent('BOT Setup')
	async handle(interaction: ModalSubmitInteraction): Promise<void> {
		const [repoName, repoOwner, projectName] = ['repoName', 'repoOwner', 'projectName'].map((id) =>
			interaction.fields.getTextInputValue(id)
		);

		const { guildId } = interaction;

		await insertGuildInfo(String(guildId), String(interaction.channelId), repoOwner, repoName, projectName);
		await gh.populate(String(guildId), repoOwner, repoName, projectName);

		await interaction.deferReply({ ephemeral: true });
		await interaction.reply(
			`Successful setup with ${projectName} project, ${repoName} repository and ${repoOwner} owner.`
		);

		return;
	}
}
