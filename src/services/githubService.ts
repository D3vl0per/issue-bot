import { Octokit } from '@octokit/rest';
import bot from '../main.js';

export class GitHubService {
	private app: Octokit;
	private repo: string;
	private owner: string;

	constructor(repo: string, owner: string) {
		this.repo = repo;
		this.owner = owner;

		this.app = new Octokit({
			auth: process.env.GH_TOKEN,
		});
	}

	reOpenIssue(channel: string) {
		let n = 0;

		this.app.search
			.issuesAndPullRequests({
				q: `type:issue ${channel} repo:${this.owner}/${this.repo}`,
			})
			.then((query) => {
				n = query.data.items[0].number;

				this.app.issues.update({
					issue_number: Number(n),
					owner: this.owner,
					repo: this.repo,
					title: channel,
					labels: query.data.items[0].labels,
					state: 'open',
				});
			})
			.catch((e: Error) => {
				console.log('Bruh.', e);

				return 'Issue not found.';
			});
	}

	closeIssue(channel: string) {
		console.log(channel);

		let n = 0;

		this.app.search
			.issuesAndPullRequests({
				q: `type:issue ${channel} repo:${this.owner}/${this.repo}`,
			})
			.then((query) => {
				n = query.data.items[0].number;

				this.app.issues.update({
					issue_number: Number(n),
					owner: this.owner,
					repo: this.repo,
					title: channel,
					labels: query.data.items[0].labels,
					state: 'closed',
				});
			})
			.catch((e: Error) => {
				console.log('Bruh.', e);

				return 'Issue not found.';
			});
	}

	editLabel(label: Array<string>, number: Number) {
		let n = 0;
		let ch: any = bot.channels.cache.find((c) => Number(c.id) === number);

		this.app.search
			.issuesAndPullRequests({
				q: `type:issue ${ch.name} repo:${this.owner}/${this.repo}`,
			})
			.then((query) => {
				n = query.data.items[0].number;

				// this.app.issues.setLabels({
				// 	owner: this.owner,
				// 	repo: this.repo,
				// 	issue_number: 10,
				// 	labels: label,
				// });

				this.app.issues.update({
					issue_number: Number(n),
					owner: this.owner,
					repo: this.repo,
					labels: label,
				});
			})
			.catch((e: Error) => {
				console.log('Bruh.', e);

				return 'Issue not found.';
			});
	}

	createIssue(title: string, body: string, labels: Array<string>) {
		return this.app.issues.create({
			owner: this.owner,
			repo: this.repo,
			title: title,
			body: body,
			labels: labels,
		});
	}

	editIssue(old: string, title: string) {
		let n = 0;

		this.app.search
			.issuesAndPullRequests({
				q: `type:issue ${old} repo:${this.owner}/${this.repo}`,
			})
			.then((query) => {
				n = query.data.items[0].number;

				this.app.issues.update({
					issue_number: Number(n),
					owner: this.owner,
					repo: this.repo,
					title: title,
					labels: query.data.items[0].labels,
				});
			})
			.catch((e: Error) => {
				console.log('Bruh.', e);

				return 'Issue not found.';
			});
	}

	editIssueIdWithBody(id: Number, title: string, body: string) {
		this.app.search
			.issuesAndPullRequests({
				q: `type:issue ${id} repo:${this.owner}/${this.repo}`,
			})
			.then((query) => {
				this.app.issues.update({
					issue_number: Number(id),
					owner: this.owner,
					repo: this.repo,
					body: body,
					title: title,
					labels: query.data.items[0].labels,
				});
			})
			.catch((e: Error) => {
				console.log('Bruh.', e);

				return 'Issue not found.';
			});
	}

	editIssueWithBody(old: string, title: string, body: string) {
		let n = 0;

		this.app.search
			.issuesAndPullRequests({
				q: `type:issue ${old} repo:${this.owner}/${this.repo}`,
			})
			.then((query) => {
				n = query.data.items[0].number;

				this.app.issues.update({
					issue_number: Number(n),
					owner: this.owner,
					repo: this.repo,
					body: body,
					title: title,
					labels: query.data.items[0].labels,
				});
			})
			.catch((e: Error) => {
				console.log('Bruh.', e);

				return 'Issue not found.';
			});
	}

	setOwner(owner: string) {
		this.owner = owner;
	}

	setRepo(url: string) {
		this.repo = url;
	}

	createProjectItem(note: string) {
		return this.app.projects.createCard({
			note: note,
			column_id: 0,
			content_id: 0,
		});
	}

	editProjectItem(note: string) {
		return this.app.projects.updateCard({
			card_id: 0,
			note: note,
			column_id: 0,
			content_id: 0,
		});
	}
}
