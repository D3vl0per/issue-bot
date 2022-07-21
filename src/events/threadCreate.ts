import type { ArgsOf, Client } from 'discordx';
import { Discord, On } from 'discordx';

@Discord()
export class Example {
	@On('threadCreate')
	onMessage([thread]: ArgsOf<'threadCreate'>, client: Client): void {
		console.log('Thread created', thread.name);
	}
}
