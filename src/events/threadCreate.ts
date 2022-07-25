import { Embed, EmbedBuilder } from 'discord.js';
import type { ArgsOf, Client } from 'discordx';
import { Discord, On } from 'discordx';

import { GitHubService } from '../services/githubService.js';

const gh = new GitHubService('test-repo', '0xAndrewBlack');

@Discord()
export class Example {
	@On('threadCreate')
	onMessage([thread]: ArgsOf<'threadCreate'>, client: Client): void {
		const { id, name, guild, guildId, url, lastMessage } = thread;

		let embed: any;
		let issue: any = {};
		let projectId = 0;

		gh.createProject().then((res) => {
			projectId = res.data.id;

			gh.createColumns(projectId);
			gh.setProjectId(projectId);
		});

		gh.createIssue(name, name, ['backlog']).then((res) => {
			issue.id = res.data.number;
			issue.status = res.data.labels[0];
			issue.issueLink = res.data.html_url;

			embed = new EmbedBuilder()
				.setColor('#4F53F1')
				.setTitle(name)
				.setURL(issue.issueLink)
				.setDescription('Issue created.')
				.addFields(
					{
						name: `ID`,
						value: `${issue.id}`,
						inline: true,
					},
					{
						name: `Status`,
						value: `${issue.status.name}`,
						inline: true,
					},
					{
						name: `Project`,
						value: 'N/A',
						inline: true,
					}
				);

			thread.send({ embeds: [embed] });
		});

		console.log('Thread created', name);
	}
}
