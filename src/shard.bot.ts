import { env } from 'process';

import { Shard, ShardingManager } from 'discord.js';

export class ShardedBot {
	static start(): void {
		const manager: ShardingManager = new ShardingManager('./dist/entry.bot.js', {
			totalShards: 2,
			mode: 'worker',
			token: env.DC_BOT_TOKEN,
		});

		manager.on('shardCreate', (shard: Shard) => {
			console.log(`Launched shard ${shard.id}`);
		});

		manager.spawn();
	}
}

ShardedBot.start();
