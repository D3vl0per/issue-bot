import type { ArgsOf, Client } from 'discordx';
import { Discord, On } from 'discordx';

import { GitHubService } from '../services/githubService.js';

const gh = new GitHubService('test-repo', '0xAndrewBlack');

@Discord()
export class Example {
	@On('threadDelete')
	onMessage([thread]: ArgsOf<'threadDelete'>, client: Client): void {
		const { name } = thread;

		console.log('Thread deleted', name);

		gh.closeIssue(name);
	}
}
