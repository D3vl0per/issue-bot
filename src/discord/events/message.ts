import type { ArgsOf, Client } from 'discordx';
import { Discord, On } from 'discordx';

import { stripStatusFromThread } from '../../utils/discord';

@Discord()
export class MessageHandler {
	@On('messageCreate')
	onMessageCreate([message]: ArgsOf<'messageDelete'>, client: Client): void {
		// console.log('Message Sent', client.user?.username, message.content);
		// console.log(stripStatusFromThread(String(message.content)));
	}
	@On('messageDelete')
	onMessageDelete([message]: ArgsOf<'messageDelete'>, client: Client): void {
		console.log('Message Deleted', client.user?.username, message.content);
	}
}
