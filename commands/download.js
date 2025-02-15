const Discord = require("discord.js");
const polyfill = require("es6-promise").polyfill();
const fetch = require("isomorphic-fetch");
const Unsplash = require("unsplash-js").default;
const toJson = require("unsplash-js").toJson;

exports.run = async (client, message, args) => {
	// Cooldown system.
	if (!client.cooldownDownload) {
		client.cooldownDownload = new Set();
	}

	let cooldownEmbed = new Discord.MessageEmbed()
		.setAuthor(message.author.tag, message.author.avatarURL())
		.setColor(client.config.colors.primary)
		.setDescription(
			`Please wait ${exports.help.cooldown} seconds between commands.`
		);

	if (client.cooldownDownload.has(message.author.id))
		return message.channel.send(cooldownEmbed);

	client.cooldownDownload.add(message.author.id);
	setTimeout(() => {
		client.cooldownDownload.delete(message.author.id);
	}, exports.help.cooldown * 1000);

	if (!args[0]) return message.reply("Please enter a photo ID.");

	// Create new instance of the API.
	const unsplash = new Unsplash({
		applicationId: client.config.unsplashAccessKey,
		secret: client.config.unsplashSecretKey,
	});

	// Get the photo by its ID.
	unsplash.photos
		.getPhoto(args[0])
		.then(toJson)
		.then((json) => {
			if (json.errors) {
				// Any errors returned by the API will be displayed.
				let errembed = new Discord.MessageEmbed()
					.setAuthor("An error occured!", "https://i.imgur.com/FCZNSQa.png")
					.setDescription(json.errors.join("\n"))
					.setColor(client.config.colors.primary)
					.setTimestamp();

				return message.channel.send(errembed);
			}

			// Send the download link of the photo with its information.
			let embed = new Discord.MessageEmbed()
				.setTitle("Download [Click]")
				.setDescription(
					`ID: \`${args[0]}\`\n\n${
						json.description
							? json.description
							: json.alt_description
							? json.alt_description
							: "No description."
					}`
				)
				.setURL(json.links.download)
				.setColor(json.color)
				.setThumbnail(json.urls.raw)
				.setTimestamp(json.created_at)
				.setFooter(
					`${json.user.name} (@${json.user.username}) on Unsplash`,
					json.user.profile_image.medium
				)
				.addField("Views", json.views, true)
				.addField("Downloads", json.downloads, true)
				.addField("Likes", json.likes, true);

			if (json.location.title !== null)
				embed.addField("Location", json.location.title, true);

			return message.channel.send(embed);
		})
		.catch((err) => {
			let embed = new Discord.MessageEmbed()
				.setAuthor("An error occured!", "https://i.imgur.com/FCZNSQa.png")
				.setDescription(err)
				.setColor(client.config.colors.primary)
				.setTimestamp();

			return message.channel.send(embed);
		});
};

exports.help = {
	name: "download",
	description: "Download a photo using its ID.",
	cooldown: "5",
	usage: "download <id>",
};
