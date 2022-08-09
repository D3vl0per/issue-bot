import { env } from 'process';

import { Octokit } from '@octokit/rest';
import GitHubProject from 'github-project';

export class GitHubService {
	public github: Octokit;
	private guildId: string;
	private repo: string;
	private owner: string;
	private location: string;
	private projectId: Number;
	private labels: Array<string>;
	private project: GitHubProject;

	constructor() {
		this.github = new Octokit({
			auth: process.env.GH_TOKEN,
		});
		this.guildId = 'N/A';
		this.repo = 'N/A';
		this.owner = 'N/A';
		this.location = `${this.repo}/${this.repo}`;
		this.projectId = 0;
		this.project = new GitHubProject({
			org: String(env.GH_ORG),
			number: Number(env.GH_PROJECT_NUMBER),
			token: String(env.GH_TOKEN),
		});
		this.labels = ['Backlog', 'Todo', 'In-Progress', 'Testing', 'Done'];
	}

	async populate(guildId: string, owner: string, repo: string, project: string) {
		this.guildId = guildId;
		this.repo = repo;
		this.owner = owner;
		this.location = `${this.owner}/${this.repo}`;
		this.projectId = Number(project);
	}

	async initColumns(projectId: number): Promise<void> {
		const { github, labels, location } = this;

		labels.forEach((label: string) => {
			github.projects.createColumn({
				project_id: projectId,
				name: label,
			});
		});
	}

	async createIssue(title: string, body: string, label: string | Array<string>) {
		const { github, project, repo, owner } = this;

		const issue = await github.rest.issues.create({
			owner: owner,
			repo: repo,
			title: title,
			body: body,
			labels: [...label],
		});

		project.items.add(issue.data.node_id, {
			status: String(label),
		});

		return issue;
	}

	async editIssueWoBody(oldTitle: string, newTitle: string) {
		const { github, repo, owner, location } = this;

		let issueNumber = 0;

		github.search
			.issuesAndPullRequests({
				q: `type:issue ${oldTitle} repo:${owner}/${repo}`,
				sort: 'created',
			})
			.then((query) => {
				const { number, labels } = query.data.items[0];

				github.issues.update({
					issue_number: Number(number),
					owner: owner,
					repo: repo,
					title: newTitle,
					// labels: labels,
				});
			})
			.catch((e: Error) => {
				console.log('Bruh.', e);

				return 'Issue not found.';
			});
	}

	async editIssue(oldTitle: string, newTitle: string, issueBody: string) {
		const { github, repo, owner, location } = this;

		console.log(oldTitle);
		console.log(newTitle);
		console.log(issueBody);

		github.search
			.issuesAndPullRequests({
				q: `type:issue ${oldTitle} repo:${owner}/${repo}`,
				sort: 'created',
			})
			.then((query) => {
				const { number, labels, node_id } = query.data.items[0];

				this.editProject(node_id, String(labels));

				github.issues.update({
					issue_number: Number(number),
					owner: owner,
					repo: repo,
					title: newTitle,
					body: issueBody,
					labels: labels,
				});
			})
			.catch((e: Error) => {
				console.log('Bruh.', e);

				return 'Issue not found.';
			});
	}

	async editProject(nodeId: string, status: string) {
		const { project } = this;

		return project.items.getByContentId(nodeId).then((d) => {
			project.items.updateByContentId(nodeId, {
				status: status,
			});
		});
	}

	async editIssueLabel(title: string, label: string | Array<string>) {
		const { github, repo, owner, location } = this;

		let issueNumber = 0;

		github.search
			.issuesAndPullRequests({
				q: `type:issue ${title} repo:${owner}/${repo}`,
			})
			.then((query) => {
				const { number, node_id } = query.data.items[0];

				this.editProject(node_id, String(label));

				github.issues.update({
					issue_number: Number(number),
					owner: owner,
					repo: repo,
					labels: [...label],
				});
			})
			.catch((e: Error) => {
				console.log('Bruh.', e);

				return 'Issue not found.';
			});
	}

	async toggleLockIssue(title: string) {
		const { github, repo, owner, location } = this;
		let issueNumber = 0;

		github.search
			.issuesAndPullRequests({
				q: `type:issue ${title} repo:${owner}/${repo}`,
				sort: 'created',
			})
			.then((query) => {
				const { number, labels } = query.data.items[0];

				if (query.data.items[0].locked) {
					github.issues.unlock({
						issue_number: Number(number),
						owner: owner,
						repo: repo,
						title: title,
						labels: labels,
					});
					return;
				}

				github.issues.lock({
					issue_number: Number(number),
					owner: owner,
					repo: repo,
					title: title,
					labels: labels,
				});
			})
			.catch((e: Error) => {
				console.log('Bruh.', e);

				return 'Issue not found.';
			});
	}

	async toggleIssue(title: string) {
		const { github, repo, owner, location } = this;

		github.search
			.issuesAndPullRequests({
				q: `type:issue ${title} repo:${owner}/${repo}`,
				sort: 'created',
			})
			.then((query) => {
				const { state, number, labels } = query.data.items[0];

				github.issues.update({
					issue_number: Number(number),
					owner: owner,
					repo: repo,
					title: title,
					labels: labels,
					state: state === 'open' ? 'closed' : 'open',
				});
			})
			.catch((e: Error) => {
				console.log('Bruh.', e);

				return 'Issue not found.';
			});
	}

	async isOrg(owner: string): Promise<boolean> {
		try {
			await this.github.rest.orgs.get({
				org: owner,
			});
			return true;
		} catch (error) {
			return false;
		}
	}

	async getProject() {}

	async createCard(issueContentId: string, title: string) {
		const { github, project } = this;

		return await project.items.add(issueContentId, {
			title: title,
		});
	}

	async getCard(title: string) {
		const { github, project } = this;

		const issueNodeId: any = await project.items.list().then((data) => {
			return data.find((d) => d.fields.title === title)?.id;
		});

		return project.items.get(issueNodeId);
	}

	async updateCard(oldTitle: string, newTitle: string) {
		const { github, project, getCard } = this;

		const card: any = await getCard('title');

		project.items.update(card.id, {
			title: newTitle,
		});
	}

	async getCards() {
		const { project } = this;

		return await project.items.list();
	}
}

export const gh = new GitHubService();
