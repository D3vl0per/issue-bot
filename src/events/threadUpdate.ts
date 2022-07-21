import type { ArgsOf, Client } from 'discordx';
import { Discord, On } from 'discordx';

@Discord()
export class Example {
	@On('threadUpdate')
	onMessage([thread]: ArgsOf<'threadUpdate'>, client: Client): void {
		console.log('Thread updated', thread.name);
	}
}
