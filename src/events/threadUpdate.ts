import type { ArgsOf, Client } from 'discordx';
import { Discord, On } from 'discordx';
import { Octokit } from '@octokit/rest';
import { closeIssue, editIssue, lockIssue, reOpenIssue, unLockIssue } from '../services/github.js';

@Discord()
export class ThreadUpdate {
	@On('threadUpdate')
	onMessage([oldThread, newThread]: ArgsOf<'threadUpdate'>, client: Client): void {
		const oldName = oldThread.name;
		const newName = newThread.name;

		const github = new Octokit({
			auth: process.env.GH_TOKEN,
		});

		if (newThread.archived) {
			lockIssue(github, newThread.guildId, newName);
			// gh.lockIssue(newName);
			closeIssue(github, newThread.guildId, newName);
			// gh.closeIssue(newThread.name);
		}

		if (oldThread.archived && !newThread.archived) {
			console.log('unarchive.');

			unLockIssue(github, newThread.guildId, newName);
			// gh.unLockIssue(newName);
			reOpenIssue(github, newThread.guildId, newName);
			// gh.reOpenIssue(newName);
		}

		editIssue(github, newThread.guildId, oldName, newName);
		// gh.editIssue(oldName, newName);
	}
}
