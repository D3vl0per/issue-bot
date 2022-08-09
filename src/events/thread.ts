import type { ArgsOf, Client } from 'discordx';
import { Discord, On } from 'discordx';
import { EmbedBuilder } from 'discord.js';

import { getGuildInfo, isGuildExists } from '../utils/dbFunctions.js';

import { GitHubService } from '../services/githubService.js';
import { labelsWithEmojis, stripStatusFromThread } from '../utils/utils.js';

const gh = new GitHubService();

@Discord()
export class ThreadHandler {
	@On('threadCreate')
	async onThreadCreate([thread]: ArgsOf<'threadCreate'>, client: Client): Promise<void> {
		const { name, guildId } = thread;

		let issueEmbed: any;
		let issueObj: any = {};

		const validChannels = process.env.CHANNEL_NAMES?.split(',');
		if (!validChannels?.includes(String(thread.parentId))) return;

		try {
			const exists = await isGuildExists(guildId);

			if (!exists) {
				thread.send('Missing settings, please set me up.');
				return;
			}

			const { repo_name, repo_owner, project_id } = await getGuildInfo(guildId);

			await gh.populate(guildId, repo_owner, repo_name, project_id);
			const { data } = await gh.createIssue(name, name, ['Backlog']);
			const status = labelsWithEmojis.find((label) => label.label === 'Backlog')?.emoji;
			thread.setName(`${status} - ${name}`);

			issueObj.id = data.number;
			issueObj.status = data.labels[0];
			issueObj.issueLink = data.html_url;
		} catch (e) {
			console.log('Bruh.', e);
			thread.send('Missing settings, please set me up.');
			return;
		}

		issueEmbed = new EmbedBuilder()
			.setColor('#4F53F1')
			.setTitle(name)
			.setURL(issueObj.issueLink)
			.setDescription('Issue created.')
			.addFields(
				{
					name: `ID`,
					value: `${issueObj.id}`,
					inline: false,
				},
				{
					name: `Status`,
					value: `${issueObj.status.name}`,
					inline: false,
				}
			)
			.setTimestamp()
			.setFooter({
				text: 'Synced by ZGEN.',
				iconURL: client.user?.displayAvatarURL(),
			});

		thread.send({ embeds: [issueEmbed] });
	}
	@On('threadUpdate')
	async onThreadUpdate([oldThread, newThread]: ArgsOf<'threadUpdate'>, client: Client): Promise<void> {
		const oldName = stripStatusFromThread(oldThread.name);
		const newName = stripStatusFromThread(newThread.name);

		const { guildId } = newThread;
		const { repo_name, repo_owner, project_id } = await getGuildInfo(guildId);

		await gh.populate(guildId, repo_owner, repo_name, project_id);

		if (newThread.archived) {
			console.log('THREAD > Archived.');
			// Lock and close issue
			gh.toggleIssue(oldName);
			gh.toggleLockIssue(oldName);
			return;
		}

		if (oldThread.archived && !newThread.archived) {
			console.log('THREAD > Unarchived.');
			// Unlock and open issue
			gh.toggleIssue(newName);
			gh.toggleLockIssue(newName);
			return;
		}

		// Just simply edit the issue based on name change
		gh.editIssueWoBody(oldName, newName);
	}
	@On('threadDelete')
	async onThreadDelete([thread]: ArgsOf<'threadDelete'>, client: Client): Promise<void> {
		const { name } = thread;

		console.log('Thread deleted', stripStatusFromThread(name));

		const { guildId } = thread;

		const { repo_name, repo_owner, project_id } = await getGuildInfo(guildId);

		await gh.populate(guildId, repo_owner, repo_name, project_id);

		gh.toggleIssue(name);
		gh.toggleLockIssue(name);
	}
	@On('threadListSync')
	async onThreadSync([guild]: ArgsOf<'threadListSync'>, client: Client): Promise<void> {
		console.log('Threads were synced in ', guild);
	}
}
