export default interface DiscordEvent {
	name: string;
	once: boolean;
	execute: (...args: any) => any;
}
