import { config } from './config.js';

import { Shard, ShardingManager } from 'discord.js';

export class ShardBot {
	public static start(): void {
		const manager: ShardingManager = new ShardingManager('./dist/bot.js', {
			totalShards: 'auto',
			mode: 'worker',
			token: config.DC_BOT_TOKEN,
		});

		manager.on('shardCreate', (shard: Shard) => {
			console.info(`Launched shard #${shard.id}`);
		});

		manager.spawn({
			amount: 'auto',
			delay: 1000 * 10,
			timeout: -1,
		});
	}
}

ShardBot.start();
