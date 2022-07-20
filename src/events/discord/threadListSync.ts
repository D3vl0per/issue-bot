import { Client, Guild, ThreadChannel } from 'discord.js';
import { RegisterCommandsForAllGuilds } from '../../utils/deploycommands';

export const name = 'threadListSync';
export const once = false;
export function execute(client: Client, guild: Guild) {
	console.log(`Threads were synced in ${guild} guild`);
}
