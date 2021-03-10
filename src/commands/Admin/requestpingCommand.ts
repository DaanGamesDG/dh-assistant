import { Command } from "discord-akairo";
import { Message, MessageEmbed } from "discord.js";

export default class requestping extends Command {
	constructor() {
		super("requestping", {
			aliases: ["requestping"],
			description: {
				content: "Request a ping for events",
				usage: "requestping",
			},
			channel: "guild",
		});
	}

	async exec(message: Message) {
		if (message.channel.id !== "729327005341843486") return;
		const channel = await this.client.utils.getChannel(this.client.config.cet.ping);
		channel
			.send(
				new MessageEmbed()
					.setTitle(`🔔 Ping request`)
					.setDescription(`Requested by ${message.author.toString()}`)
					.setColor("#9298F4")
			)
			.then((m) =>
				[
					this.client.utils.emojiFinder("greentick"),
					this.client.utils.emojiFinder("redtick"),
				].forEach((e) => m.react(e))
			);
		message.react(this.client.utils.emojiFinder("greentick"));
	}
}
