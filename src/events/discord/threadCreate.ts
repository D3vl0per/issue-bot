import { Client, ThreadChannel } from 'discord.js';
import { RegisterCommandsForAllGuilds } from '../../utils/deploycommands';

export const name = 'threadCreate';
export const once = false;
export function execute(client: Client, thread: ThreadChannel) {
	console.log(`Thread: ${thread.name} created.`);
}
