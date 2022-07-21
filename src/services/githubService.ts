import { Octokit } from '@octokit/rest';
import { createAppAuth } from '@octokit/auth-app';

export class GitHub {
	private app: Octokit;

	constructor() {
		this.app = new Octokit({
			authStrategy: createAppAuth,
			auth: {
				appId: process.env.GH_APP_ID,
				privateKey: process.env.GH_PRIVATE_KEY,
				installationId: process.env.GH_INSTALL_ID,
			},
		});
	}

	createIssue(title: string) {}

	editIssue(n: Number) {}

	setRepo(url: string) {}

	createProjectItem() {}

	editProjectItem() {}
}
