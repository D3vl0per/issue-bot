import { Client, ThreadChannel } from 'discord.js';
import { RegisterCommandsForAllGuilds } from '../../utils/deploycommands';

export const name = 'threadDelete';
export const once = false;
export function execute(client: Client, thread: ThreadChannel) {
	console.log(`Thread: ${thread.name} deleted.`);
}
