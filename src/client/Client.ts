import { SapphireClient } from "@sapphire/framework";
import {
	ActivitiesOptions,
	BitFieldResolvable,
	Collection,
	IntentsString,
	PartialTypes,
	PresenceStatusData,
} from "discord.js";
import { join } from "path";
import Logger from "./structures/Logger";
import Utils from "./Utils";
import * as constants from "./constants";
import BlacklistManager from "./structures/BlacklistManager";
import { PrismaClient } from "@prisma/client";
import LevelManager from "./structures/LevelManager";
import PermissionHandler from "./structures/PermissionHandler";

export default class Client extends SapphireClient {
	public owners: string[];
	public constants = constants;

	public isOwner(id: string): boolean {
		return this.owners.includes(id);
	}

	public prisma = new PrismaClient();
	public utils = new Utils(this);

	public levelManager = new LevelManager(this);
	public blacklistManager = new BlacklistManager(this);
	public permissionHandler = new PermissionHandler(this);

	public loggers = new Collection<string, Logger>();
	public multipliers = new Collection<string, number>();

	constructor(options: ClientOptions) {
		super({
			intents: options.intents,
			allowedMentions: { users: [], repliedUser: false, roles: [] },
			baseUserDirectory: join(__dirname, "..", "bot"),
			defaultPrefix: process.env.PREFIX,
			partials: options.partials,
			loadDefaultErrorListeners: false,
			presence: {
				activities: options.activity,
				status: options.status,
			},
		});

		this.owners = options.owners;

		const botLogger = new Logger({ name: "BOT", webhook: process.env.LOGS });
		this.loggers.set("bot", botLogger);

		const DataLogger = new Logger({ name: "DB", webhook: process.env.LOGS });
		this.loggers.set("db", DataLogger);

		if (options.debug)
			this.on("debug", (msg) => {
				botLogger.debug(msg);
			});

		process.on("unhandledRejection", this.handleRejection.bind(this));
	}

	private handleRejection(reason: unknown) {
		this.loggers.get("bot")?.error("Unhandled rejection: ", reason);
	}

	public async start(): Promise<void> {
		await this.prisma.$connect();
		this.loggers.get("db")?.info("Successfully connected to postgreSQL Database via Prisma!");

		const blacklisted = await this.prisma.botBlacklist.findMany();
		this.blacklistManager.setBlacklisted(blacklisted.map((b) => b.id));

		await this.login(process.env.TOKEN);
	}
}

interface ClientOptions {
	intents: BitFieldResolvable<IntentsString, number>;
	owners: string[];
	partials?: PartialTypes[] | undefined;
	activity?: ActivitiesOptions[] | undefined;
	status?: PresenceStatusData | undefined;
	debug?: boolean;
}

declare module "@sapphire/framework" {
	// eslint-disable-next-line @typescript-eslint/no-shadow
	class SapphireClient {
		owners: string[];
		constants: typeof constants;
		isOwner(id: string): boolean;

		prisma: PrismaClient;
		utils: Utils;

		levelManager: LevelManager;
		blacklistManager: BlacklistManager;
		permissionHandler: PermissionHandler;

		loggers: Collection<string, Logger>;
		multipliers: Collection<string, number>;
	}

	interface Preconditions {
		OwnerOnly: never;
		Blacklisted: never;
	}
}
