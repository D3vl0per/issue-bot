import { env } from 'process';

import dotenv from 'dotenv';

dotenv.config();

export const config = {
	NODE_ENV: String(env.NODE_ENV),
	DC_BOT_TOKEN: String(env.DC_BOT_TOKEN),
	DC_COLOR: String(env.DC_COLOR),
	CHANNEL_IDS: String(env.CHANNEL_IDS),
	GUILD_ID: String(env.GUILD_ID),
	GH_ORG: String(env.GH_ORG),
	GH_REPO: String(env.GH_REPO),
	GH_PROJECT_NUMBER: Number(env.GH_PROJECT_NUMBER),
	GH_TOKEN: String(env.GH_TOKEN),
	GH_APP_ID: String(env.GH_APP_ID),
};
