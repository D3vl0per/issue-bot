import type { ArgsOf, Client } from 'discordx';
import { Embed, EmbedBuilder } from 'discord.js';
import { Discord, On } from 'discordx';

import { createIssue, createSync, getDetails } from '../services/github.js';
import { Octokit } from '@octokit/rest';

@Discord()
export class ThreadCreate {
	@On('threadCreate')
	async onMessage([thread]: ArgsOf<'threadCreate'>, client: Client): Promise<void> {
		const { id, name, guild, guildId } = thread;

		let embed: any;
		let issue: any = {};

		const validChannels = process.env.CHANNEL_NAMES?.split(',');
		if (!validChannels?.includes(String(thread.parentId))) return;

		const github = new Octokit({
			auth: process.env.GH_TOKEN,
		});

		const { data } = await createIssue(github, guildId, name, name, ['backlog']);

		// console.log(data);

		issue.id = data.number;
		issue.status = data.labels[0];
		issue.issueLink = data.html_url;

		const details = await getDetails(guildId);
		const { repo_name, repo_owner } = details[0];

		await createSync(github, guildId, name, issue.id, 'backlog');

		embed = new EmbedBuilder()
			.setColor('#4F53F1')
			.setTitle(name)
			.setURL(issue.issueLink)
			.setDescription('Issue created.')
			.addFields(
				{
					name: `ID`,
					value: `${issue.id}`,
					inline: false,
				},
				{
					name: `Status`,
					value: `${issue.status.name}`,
					inline: false,
				}
			)
			.setTimestamp()
			.setFooter({
				text: 'Synced by ZGEN.',
				iconURL: client.user?.displayAvatarURL(),
			});

		thread.send({ embeds: [embed] });
	}
}
