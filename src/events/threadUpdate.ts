import { log } from 'console';
import type { ArgsOf, Client } from 'discordx';
import { Discord, On } from 'discordx';

import { GitHubService } from '../services/githubService.js';

const gh = new GitHubService('test-repo', '0xAndrewBlack');

@Discord()
export class Example {
	@On('threadUpdate')
	onMessage([oldThread, newThread]: ArgsOf<'threadUpdate'>, client: Client): void {
		const oldName = oldThread.name;
		const newName = newThread.name;

		if (newThread.archived) {
			console.log('Archieved ', newThread.name);

			gh.lockIssue(newName);
			gh.closeIssue(newThread.name);
		}

		if (oldThread.archived && !newThread.archived) {
			console.log('unarchived');
			gh.unLockIssue(newName);
			gh.reOpenIssue(newName);
		}

		gh.editIssue(oldName, newName);

		console.log(`Old: ${oldName}, New: ${newName}`);
	}
}
