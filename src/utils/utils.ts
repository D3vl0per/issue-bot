export function sleep(ms: any) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

export function stripStatusFromThread(threadName: string): string {
	return threadName
		.split(' ')
		.reverse()
		.join(' ')
		.substring(0, threadName.length - 5)
		.split(' ')
		.reverse()
		.join(' ');
}

export function capitalize(str: string) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

export const labels = [
	{ label: 'Backlog', value: 'backlog' },
	{ label: 'Todo', value: 'todo' },
	{ label: 'In Progress', value: 'wip' },
	{ label: 'Testing', value: 'testing' },
	{ label: 'Done', value: 'done' },
];

export const labelsWithEmojis = [
	{ label: 'Backlog', value: 'backlog', emoji: '📁' },
	{ label: 'Todo', value: 'todo', emoji: '📝' },
	{ label: 'In Progress', value: 'wip', emoji: '🚧' },
	{ label: 'Testing', value: 'testing', emoji: '🧪' },
	{ label: 'Done', value: 'done', emoji: '✅' },
];

export const Priorities = [1, 2, 3];

export const Labels = ['Backlog', 'Todo', 'In-Progress', 'Testing', 'Done'];
