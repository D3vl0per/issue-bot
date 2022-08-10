import type { CommandInteraction, ModalSubmitInteraction } from 'discord.js';
import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';

import { Discord, ModalComponent, Slash } from 'discordx';
import { insertGuildInfo, isGuildExists } from '../utils/dbFunctions.js';

import { gh } from '../services/githubService.js';
import { Description } from '@discordx/utilities';

@Discord()
export class SetUp {
	@Slash('setup')
	@Description('First time GitHub setup.')
	async attachment(interaction: CommandInteraction): Promise<void> {
		if (interaction.channel?.isThread()) {
			await interaction.reply('Channel is a thread channel, use the command under a normal text channel.');

			return;
		}

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

		const projectID = new TextInputBuilder()
			.setCustomId('projectID')
			.setLabel('Project ID (Top level GitHub Project)')
			.setStyle(TextInputStyle.Short);

		const row1 = new ActionRowBuilder<TextInputBuilder>().addComponents(repoOwner);

		const row2 = new ActionRowBuilder<TextInputBuilder>().addComponents(repoName);

		const row3 = new ActionRowBuilder<TextInputBuilder>().addComponents(projectID);

		// Add action rows to form
		modal.addComponents(row1, row2, row3);

		// Present the modal to the user
		interaction.showModal(modal);
	}

	@ModalComponent('BOT Setup')
	async handle(interaction: ModalSubmitInteraction): Promise<void> {
		const [repoName, repoOwner, projectID] = ['repoName', 'repoOwner', 'projectID'].map((id) =>
			interaction.fields.getTextInputValue(id)
		);

		const { guildId } = interaction;

		await insertGuildInfo(String(guildId), String(interaction.channelId), repoOwner, repoName, projectID);
		await gh.populate(String(guildId), repoOwner, repoName, projectID);

		await interaction.deferReply({ ephemeral: true });
		await interaction.reply(
			`Successful setup with ${projectID} project, ${repoName} repository and ${repoOwner} owner.`
		);

		return;
	}
}
