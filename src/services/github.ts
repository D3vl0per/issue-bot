import { Octokit } from '@octokit/rest';
import { inspect } from 'util';

import { bot } from '../entry.bot.js';
import { Card, CardContent, Project } from '../interfaces/github.js';

import { PrismaClient, sync } from '@prisma/client';
const prisma = new PrismaClient();

const labels = ['Backlog', 'Todo', 'In-Progress', 'Testing', 'Done'];

async function isOrg(octokit: Octokit, owner: string): Promise<boolean> {
	try {
		await octokit.rest.orgs.get({
			org: owner,
		});
		return true;
	} catch (error) {
		return false;
	}
}

async function getProjects(octokit: Octokit, projectLocation: string): Promise<Project[]> {
	const [owner, repo] = projectLocation.split('/');
	const projects = await (async () => {
		if (repo) {
			return await octokit.paginate(octokit.rest.projects.listForRepo, {
				owner: owner,
				repo: repo,
				per_page: 100,
			});
		} else if (await isOrg(octokit, owner)) {
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

function getProject(projects: Project[], projectNumber: number, projectName: string): any {
	if (!isNaN(projectNumber) && projectNumber > 0) {
		return projects.find((project) => project.number == projectNumber);
	} else if (projectName) {
		return projects.find((project) => project.name == projectName);
	} else {
		throw 'A valid input for project-number OR project-name must be supplied.';
	}
}

async function getContent(octokit: Octokit, repository: string, issueNumber: number): Promise<CardContent> {
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

async function findCardInColumn(
	octokit: Octokit,
	columnId: number,
	contentUrl: string,
	page = 1
): Promise<Card | undefined> {
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
		return findCardInColumn(octokit, columnId, contentUrl, ++page);
	} else {
		return undefined;
	}
}

async function findCardInColumns(octokit: Octokit, columns: Array<any>, contentUrl: string): Promise<Card | undefined> {
	for (const column of columns) {
		const card = await findCardInColumn(octokit, column['id'], contentUrl);
		// console.log(`findCardInColumn: ${inspect(card)}`);
		if (card) {
			return card;
		}
	}
	return undefined;
}

// Init columns
async function createColumns(github: Octokit, projectId: number): Promise<void> {
	labels.forEach((label: any) => {
		github.projects.createColumn({
			project_id: projectId,
			name: label,
		});
	});
}

export async function getDetails(guildId: string): Promise<any> {
	return prisma.sync.findMany({
		where: {
			guild_id: guildId,
		},
	});
}

export async function createIssue(
	github: Octokit,
	guildId: string,
	title: string,
	body: string,
	labels: Array<string>
) {
	const details = await getDetails(guildId);
	const { repo_name, repo_owner } = details[0];

	return github.issues.create({
		owner: repo_owner,
		repo: repo_name,
		title: title,
		body: body,
		labels: labels,
	});
}

export async function editIssue(github: Octokit, guildId: string, old: string, title: string) {
	let n = 0;
	const details = await getDetails(guildId);
	const { repo_name, repo_owner } = details[0];

	github.search
		.issuesAndPullRequests({
			q: `type:issue ${old} repo:${repo_owner}/${repo_name}`,
		})
		.then((query) => {
			n = query.data.items[0].number;

			github.issues.update({
				issue_number: Number(n),
				owner: repo_owner,
				repo: repo_name,
				title: title,
				labels: query.data.items[0].labels,
			});
		})
		.catch((e: Error) => {
			console.log('Bruh.', e);

			return 'Issue not found.';
		});
}

export async function editIssueWithContent(
	github: Octokit,
	guildId: string,
	issueId: Number,
	title: string,
	body: string
) {
	const details = await getDetails(guildId);
	const { repo_name, repo_owner } = details[0];

	github.search
		.issuesAndPullRequests({
			q: `type:issue ${issueId} repo:${repo_owner}/${repo_name}`,
		})
		.then((query) => {
			github.issues.update({
				issue_number: Number(issueId),
				owner: repo_owner,
				repo: repo_name,
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

export async function setUpService(guildId: string, channelId: string, repoOwner: string, repoName: string) {
	const db = await prisma.sync.create({
		data: {
			guild_id: guildId,
			repo_name: repoName,
			repo_owner: repoOwner,
			channel_id: channelId,
			project_id: '0',
		},
	});

	console.log(db);
}

export async function lockIssue(github: Octokit, guildId: string, channel: string) {
	let n = 0;
	const details = await getDetails(guildId);
	const { repo_name, repo_owner } = details[0];

	github.search
		.issuesAndPullRequests({
			q: `type:issue ${channel} repo:${repo_owner}/${repo_name}`,
			sort: 'created',
		})
		.then((query) => {
			n = query.data.items[0].number;

			github.issues.lock({
				issue_number: Number(n),
				owner: repo_owner,
				repo: repo_name,
				title: channel,
				labels: query.data.items[0].labels,
			});
		})
		.catch((e: Error) => {
			console.log('Bruh.', e);

			return 'Issue not found.';
		});
}

export async function unLockIssue(github: Octokit, guildId: string, channel: string) {
	let n = 0;
	const details = await getDetails(guildId);
	const { repo_name, repo_owner } = details[0];

	github.search
		.issuesAndPullRequests({
			q: `type:issue ${channel} repo:${repo_owner}/${repo_name}`,
			sort: 'created',
		})
		.then((query) => {
			n = query.data.items[0].number;

			github.issues.unlock({
				issue_number: Number(n),
				owner: repo_owner,
				repo: repo_name,
				title: channel,
				labels: query.data.items[0].labels,
			});
		})
		.catch((e: Error) => {
			console.log('Bruh.', e);

			return 'Issue not found.';
		});
}

export async function reOpenIssue(github: Octokit, guildId: string, channel: string) {
	let n = 0;
	const details = await getDetails(guildId);
	const { repo_name, repo_owner } = details[0];

	github.search
		.issuesAndPullRequests({
			q: `type:issue ${channel} repo:${repo_owner}/${repo_name}`,
			sort: 'created',
		})
		.then((query) => {
			n = query.data.items[0].number;

			github.issues.update({
				issue_number: Number(n),
				owner: repo_owner,
				repo: repo_name,
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

export async function closeIssue(github: Octokit, guildId: string, channel: string) {
	let n = 0;
	const details = await getDetails(guildId);
	const { repo_name, repo_owner } = details[0];

	github.search
		.issuesAndPullRequests({
			q: `type:issue ${channel} repo:${repo_owner}/${repo_name}`,
			sort: 'created',
		})
		.then((query) => {
			n = query.data.items[0].number;

			github.issues.update({
				issue_number: Number(n),
				owner: repo_owner,
				repo: repo_name,
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

export async function editLabel(github: Octokit, guildId: string, label: Array<string>, number: Number) {
	let n = 0;
	const details = await getDetails(guildId);
	const { repo_name, repo_owner } = details[0];
	let ch: any = bot.channels.cache.find((c) => Number(c.id) === number);

	github.search
		.issuesAndPullRequests({
			q: `type:issue ${ch.name} repo:${repo_owner}/${repo_name}`,
		})
		.then((query) => {
			n = query.data.items[0].number;

			// this.app.issues.setLabels({
			// 	owner: this.owner,
			// 	repo: this.repo,
			// 	issue_number: 10,
			// 	labels: label,
			// });

			github.issues.update({
				issue_number: Number(n),
				owner: repo_owner,
				repo: repo_name,
				labels: label,
			});
		})
		.catch((e: Error) => {
			console.log('Bruh.', e);

			return 'Issue not found.';
		});
}

export async function createSync(github: Octokit, guildId: string, name: string, issueId: Number, label: string) {
	const details = await getDetails(guildId);
	const { repo_name, repo_owner } = details[0];
	const location = repo_owner + '/' + repo_name;

	let projects = await getProjects(github, location);

	let proj: any = projects.map((project: Project) => {
		if (project.name == `${repo_name}-project`) {
			return project;
		}
	});

	let pro: Project = getProject(projects, proj[0].number, proj[0]?.name);
	const projectId = pro.id;

	// console.log(pro);

	const g = await prisma.sync.findMany({
		where: {
			guild_id: guildId,
		},
	});

	// console.log(g);

	const updated = await prisma.sync.update({
		where: {
			id: g[0]?.id,
		},
		data: {
			project_id: String(projectId),
		},
	});

	// console.log(updated);

	const columns = await github.rest.projects.listColumns({
		project_id: projectId,
	});

	if (!(columns.status === 200)) {
		await createColumns(github, Number(updated?.project_id)).catch((e) => console.log(e));
	}

	// console.log(columns);

	let cardId: any = 0;
	let card: any;

	// switch (label) {
	// 	case 'Backlog':
	// 		cardId = columns.data.map((column) => {
	// 			if (column.name == 'Backlog') {
	// 				return Number(column.id);
	// 			}
	// 		});

	// 		card = github.projects.createCard({
	// 			column_id: Number(cardId),
	// 		});
	// 		break;
	// 	case 'Todo':
	// 		cardId = columns.data.map((column) => {
	// 			if (column.name == 'Todo') {
	// 				return Number(column.id);
	// 			}
	// 		});

	// 		card = github.projects.createCard({
	// 			column_id: Number(cardId),
	// 		});
	// 		break;
	// 	case 'In-Progress':
	// 		cardId = columns.data.map((column) => {
	// 			if (column.name == 'In-Progress') {
	// 				return Number(column.id);
	// 			}
	// 		});

	// 		card = github.projects.createCard({
	// 			column_id: Number(cardId),
	// 		});
	// 		break;
	// 	case 'Testing':
	// 		cardId = columns.data.map((column) => {
	// 			if (column.name == 'Testing') {
	// 				return Number(column.id);
	// 			}
	// 		});

	// 		card = github.projects.createCard({
	// 			column_id: Number(cardId),
	// 		});
	// 		break;
	// 	case 'Done':
	// 		cardId = columns.data.map((column) => {
	// 			if (column.name == 'Done') {
	// 				return Number(column.id);
	// 			}
	// 		});

	// 		card = github.projects.createCard({
	// 			column_id: Number(cardId),
	// 		});
	// 		break;
	// }

	console.log(card);
	console.log(cardId);

	let actualCol: any = await columns.data.map(({ id, name }) => {
		if (name.toLowerCase() === label.toLowerCase()) {
			return id;
		}
	});

	// console.log(actualCol);

	github.projects.createCard({
		column_id: actualCol,
		note: name,
	});
}
