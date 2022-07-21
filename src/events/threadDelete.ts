import type { ArgsOf, Client } from 'discordx';
import { Discord, On } from 'discordx';

@Discord()
export class Example {
	@On('threadDelete')
	onMessage([thread]: ArgsOf<'threadDelete'>, client: Client): void {
		console.log('Thread deleted', thread.name);
	}
}
