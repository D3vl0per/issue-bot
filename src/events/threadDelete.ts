import { Octokit } from '@octokit/rest';
import type { ArgsOf, Client } from 'discordx';
import { Discord, On } from 'discordx';
import { closeIssue } from '../services/github.js';

// import { GitHubService } from '../services/githubService.js';

// const gh = new GitHubService('0xAndrewBlack', 'test-repo');

@Discord()
export class ThreadDelete {
	@On('threadDelete')
	onMessage([thread]: ArgsOf<'threadDelete'>, client: Client): void {
		const { name } = thread;

		console.log('Thread deleted', name);

		const github = new Octokit({
			auth: process.env.GH_TOKEN,
		});
		closeIssue(github, thread.guildId, thread.name);
		// gh.closeIssue(name);
	}
}
