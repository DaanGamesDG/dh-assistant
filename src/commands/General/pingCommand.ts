import { Command } from "discord-akairo";
import { Message } from "discord.js";

export default class pingCommand extends Command {
	public constructor() {
		super("ping", {
			aliases: ["ping", "pong"],
			category: "General",
			description: {
				content: "Check the edit and discord connection latency",
				usage: "ping",
			},
		});
	}

	public exec(message: Message) {
		message.util.send(`> 🏓 Pinging...`).then((m) => {
			m.edit(
				`> 🏓 Pong, edit latency is \`${
					(Date.now() - m.createdTimestamp).toString().startsWith("-")
						? (Date.now() - m.createdTimestamp).toString().slice(1)
						: (Date.now() - m.createdTimestamp).toString()
				}\` ms and the API Latency is \`${this.client.ws.ping}\` ms!`
			);
		});
	}
}
