import type { ArgsOf, Client } from 'discordx';
import { Discord, On } from 'discordx';

@Discord()
export class Example {
	@On('threadListSync')
	onMessage([guild]: ArgsOf<'threadListSync'>, client: Client): void {
		console.log('Threads were synced in ', guild);
	}
}
