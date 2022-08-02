import { Octokit } from '@octokit/rest';
import { inspect } from 'util';

import { bot } from '../entry.bot.js';
import { Card, CardContent, Project } from '../interfaces/github.js';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export class GitHubService {
	public github: Octokit;
	private repo: string;
	private owner: string;
	private location: string;
	private labels: any;
	private projectId: Number;
	// private channel: Number;
	// private guildId: String;

	constructor(owner: string, repo: string) {
		this.repo = repo;
		this.owner = owner;
		this.location = `${owner}/${repo}`;
		this.projectId = 0;

		// this.guildId = guildId;
		// this.channel = channelId;

		this.github = new Octokit({
			auth: process.env.GH_TOKEN,
		});

		this.labels = ['Backlog', 'Todo', 'In-Progress', 'Testing', 'Done'];
	}

	async test() {
		// this.github.rest.
	}

	// Utility to check for organizations and users.
	async isOrg(octokit: Octokit, owner: string): Promise<boolean> {
		try {
			await octokit.rest.orgs.get({
				org: owner,
			});
			return true;
		} catch (error) {
			return false;
		}
	}

	async getProjects(octokit: Octokit, projectLocation: string): Promise<Project[]> {
		const [owner, repo] = projectLocation.split('/');
		const projects = await (async () => {
			if (repo) {
				return await octokit.paginate(octokit.rest.projects.listForRepo, {
					owner: owner,
					repo: repo,
					per_page: 100,
				});
			} else if (await this.isOrg(octokit, owner)) {
				return await octokit.paginate(octokit.rest.projects.listForOrg, {
					org: owner,
					per_page: 100,
				});
			} else {
				return await octokit.paginate(octokit.rest.projects.listForUser, {
					username: owner,
					per_page: 100,
				});
			}
		})();
		// console.log(`Projects list: ${inspect(projects)}`);

		return projects.map((p) => {
			return new Project(p.number, p.name, p.id);
		});
	}

	getProject(projects: Project[], projectNumber: number, projectName: string): Project | undefined {
		if (!isNaN(projectNumber) && projectNumber > 0) {
			return projects.find((project) => project.number == projectNumber);
		} else if (projectName) {
			return projects.find((project) => project.name == projectName);
		} else {
			throw 'A valid input for project-number OR project-name must be supplied.';
		}
	}

	async getContent(octokit: Octokit, repository: string, issueNumber: number): Promise<CardContent> {
		const [owner, repo] = repository.split('/');
		const { data: issue } = await octokit.rest.issues.get({
			owner: owner,
			repo: repo,
			issue_number: issueNumber,
		});
		// console.log(`Issue: ${inspect(issue)}`);
		if (!issue) throw 'No issue or pull request matching the supplied input found.';

		if (issue['pull_request']) {
			const { data: pull } = await octokit.rest.pulls.get({
				owner: owner,
				repo: repo,
				pull_number: issueNumber,
			});
			return new CardContent(pull['id'], issue['url'], 'PullRequest');
		} else {
			return new CardContent(issue['id'], issue['url'], 'Issue');
		}
	}

	async findCardInColumn(octokit: Octokit, columnId: number, contentUrl: string, page = 1): Promise<Card | undefined> {
		const perPage = 100;
		const { data: cards } = await octokit.rest.projects.listCards({
			column_id: columnId,
			per_page: perPage,
			page: page,
		});
		// console.log(`Cards: ${inspect(cards)}`);

		const card = cards.find((card: any) => card.contentUrl == contentUrl);

		if (card) {
			return new Card(card.id, card.column_url);
		} else if (cards.length == perPage) {
			return this.findCardInColumn(octokit, columnId, contentUrl, ++page);
		} else {
			return undefined;
		}
	}

	async findCardInColumns(octokit: Octokit, columns: Array<any>, contentUrl: string): Promise<Card | undefined> {
		for (const column of columns) {
			const card = await this.findCardInColumn(octokit, column['id'], contentUrl);
			// console.log(`findCardInColumn: ${inspect(card)}`);
			if (card) {
				return card;
			}
		}
		return undefined;
	}

	// Init columns.
	async createColumns(projectId: number): Promise<void> {
		this.labels.forEach((label: any) => {
			this.github.projects.createColumn({
				project_id: projectId,
				name: label,
			});
		});
	}

	async createProject(): Promise<any> {
		let exists = this.github.projects
			.listForRepo({
				owner: this.owner,
				repo: this.repo,
				state: 'all',
			})
			.then((res) => {
				if (
					res.data.find((data) => {
						data.name && data.state === 'open';
					})
				) {
					return true;
				}

				return false;
			});

		if (await exists) {
			return;
		}

		if (!this.isOrg) {
			return this.github.projects.createForOrg({
				org: this.owner,
				repo: this.repo,
				name: this.repo,
			});
		}

		return this.github.projects.createForRepo({
			owner: this.owner,
			repo: this.repo,
			name: this.repo,
		});
	}

	createCard(thread: string, name: string) {
		// create card in a given column with a given name.
		return this.github.projects.createCard({
			note: thread,
			column_id: 0, // ex.: Backlog (but have to find the id)
			content_id: 0, // Issue number
		});
	}

	updateCard(thread: string, name: string, body: string) {
		// TODO.
		this.github.projects.updateCard({
			card_id: 0,
			note: name,
			column_id: 0, // ex.: Backlog (but have to find the id)
			content_id: 0, // Issue number
			body: body,
		});
	}

	moveCard(thread: string, label: string) {
		// TODO.
		this.github.projects.moveCard({
			card_id: 0,
			column_id: 0, // ex.: Backlog (but have to find the id)
			position: 'bottom',
		});
	}

	lockIssue(channel: string) {
		let n = 0;

		this.github.search
			.issuesAndPullRequests({
				q: `type:issue ${channel} repo:${this.owner}/${this.repo}`,
			})
			.then((query) => {
				n = query.data.items[0].number;

				this.github.issues.lock({
					issue_number: Number(n),
					owner: this.owner,
					repo: this.repo,
					title: channel,
					labels: query.data.items[0].labels,
				});
			})
			.catch((e: Error) => {
				console.log('Bruh.', e);

				return 'Issue not found.';
			});
	}

	unLockIssue(channel: string) {
		let n = 0;

		this.github.search
			.issuesAndPullRequests({
				q: `type:issue ${channel} repo:${this.owner}/${this.repo}`,
			})
			.then((query) => {
				n = query.data.items[0].number;

				this.github.issues.unlock({
					issue_number: Number(n),
					owner: this.owner,
					repo: this.repo,
					title: channel,
					labels: query.data.items[0].labels,
				});
			})
			.catch((e: Error) => {
				console.log('Bruh.', e);

				return 'Issue not found.';
			});
	}

	reOpenIssue(channel: string) {
		let n = 0;

		this.github.search
			.issuesAndPullRequests({
				q: `type:issue ${channel} repo:${this.owner}/${this.repo}`,
			})
			.then((query) => {
				n = query.data.items[0].number;

				this.github.issues.update({
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
		let n = 0;

		this.github.search
			.issuesAndPullRequests({
				q: `type:issue ${channel} repo:${this.owner}/${this.repo}`,
			})
			.then((query) => {
				n = query.data.items[0].number;

				this.github.issues.update({
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

		this.github.search
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

				this.github.issues.update({
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
		return this.github.issues.create({
			owner: this.owner,
			repo: this.repo,
			title: title,
			body: body,
			labels: labels,
		});
	}

	editIssue(old: string, title: string) {
		let n = 0;

		this.github.search
			.issuesAndPullRequests({
				q: `type:issue ${old} repo:${this.owner}/${this.repo}`,
			})
			.then((query) => {
				n = query.data.items[0].number;

				this.github.issues.update({
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
		this.github.search
			.issuesAndPullRequests({
				q: `type:issue ${id} repo:${this.owner}/${this.repo}`,
			})
			.then((query) => {
				this.github.issues.update({
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

		this.github.search
			.issuesAndPullRequests({
				q: `type:issue ${old} repo:${this.owner}/${this.repo}`,
			})
			.then((query) => {
				n = query.data.items[0].number;

				this.github.issues.update({
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

	setProjectId(id: Number) {
		this.projectId = id;
	}

	createProjectItem(note: string) {
		return this.github.projects.createCard({
			note: note,
			column_id: 0,
			content_id: 0,
		});
	}

	editProjectItem(note: string) {
		return this.github.projects.updateCard({
			card_id: 0,
			note: note,
			column_id: 0,
			content_id: 0,
		});
	}
}
