import type { ArgsOf, Client } from 'discordx';
import { EmbedBuilder } from 'discord.js';
import { Discord, On } from 'discordx';

@Discord()
export class GuildCreate {
	@On('guildCreate')
	onMessage([guild]: ArgsOf<'guildCreate'>, client: Client): void {
		console.log(`Guild joined ${guild.name}`);

		const defaultChannel = guild.systemChannel;

		const setUpEmbed = new EmbedBuilder()
			.setTitle('Yo!')
			.setURL('https://github.com/0xAndrewBlack/github-discord-sync')
			.setColor('#6D0CE3')
			.setDescription(
				"Yo, it's Sync!\n\nRead the following embed to learn how to sync your issues.\nFor more documentation visit the GitHub repo or the GitHub Wiki (the link is in the embed title).\n\n"
			)
			.addFields([
				{
					name: `🛠️ Setup`,
					value: `Use the \`/setup\` slash command to set me up with the corresponding repo and channel.\n\n`,
				},
				{
					name: `:plus: Create Issue`,
					value: `An issue will be created when a new thread is made under the corresponding channel.\n\n`,
				},
				{
					name: `✏️ Edit Issue`,
					value: `To edit an issue use the \`/editissue\` slash command.\n\n`,
				},
				{
					name: `✅ Update Label`,
					value: `Use the \`/updatelabel\` command.\n\n`,
				},
				{
					name: `❌ Close or Delete an Issue`,
					value: `Archive or Lock the thread to close/lock the issue.\n\nUnfortunately, it's not possible to delete Issues, yet.\n\n`,
				},
				{
					name: `🚩 Help the developers.`,
					value: `Use the \`/feedback\` command to give feedback about anything related to the BOT.\n\n\`Note: With GitHub and other API related Issues unfortunately we can't help. 😢\`\n\n`,
				},
			])
			.setThumbnail(String(client.user?.displayAvatarURL()))
			.setFooter({
				text: 'Sync BOT',
				iconURL: client.user?.displayAvatarURL(),
			})
			.setTimestamp();

		defaultChannel?.send({ embeds: [setUpEmbed] });
	}
}
