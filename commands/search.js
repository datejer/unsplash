const Discord = require("discord.js");
const polyfill = require("es6-promise").polyfill();
const fetch = require("isomorphic-fetch");
const Unsplash = require("unsplash-js").default;
const toJson = require("unsplash-js").toJson;

exports.run = async (client, message, args) => {
	// Cooldown system.
	if (!client.cooldownSearch) {
		client.cooldownSearch = new Set();
	}

	let cooldownEmbed = new Discord.MessageEmbed()
		.setAuthor(message.author.tag, message.author.avatarURL())
		.setColor(client.config.colors.primary)
		.setDescription(
			`Please wait ${exports.help.cooldown} seconds between commands.`
		);

	if (client.cooldownSearch.has(message.author.id))
		return message.channel.send(cooldownEmbed);

	client.cooldownSearch.add(message.author.id);
	setTimeout(() => {
		client.cooldownSearch.delete(message.author.id);
	}, exports.help.cooldown * 1000);

	if (!args[0]) return message.reply("Please enter a keyword.");

	// Create new instance of the API.
	const unsplash = new Unsplash({
		applicationId: client.config.unsplashAccessKey,
		secret: client.config.unsplashSecretKey,
	});

	// Search for photos by keyword.
	unsplash.search
		.photos(args[0], 1)
		.then(toJson)
		.then((json) => {
			if (json.total <= 0) {
				// If it can't find a photo matching the keyword it will display an error.
				let errembed = new Discord.MessageEmbed()
					.setAuthor("An error occured!", "https://i.imgur.com/FCZNSQa.png")
					.setDescription("Couldn't find Photo")
					.setColor(client.config.colors.primary)
					.setTimestamp();

				return message.channel.send(errembed);
			}

			// Get a random photo from the results array.
			let imgNumber = Math.floor(Math.random() * json.results.length);

			unsplash.photos
				.getPhoto(json.results[imgNumber].id)
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

					// Send the photo with all of it's information.
					let embed = new Discord.MessageEmbed()
						.setAuthor(
							`${json.user.name} (@${json.user.username})`,
							json.user.profile_image.medium,
							json.user.links.html
						)
						.setDescription(
							`Keyword: \`${args[0]}\`\n\n${
								json.description
									? json.description
									: json.alt_description
									? json.alt_description
									: "No description."
							}`
						)
						.setColor(json.color)
						.setImage(json.urls.raw)
						.setTimestamp(json.created_at)
						.setFooter(`ID: ${json.id} | ${json.links.html}`)
						.addField("Views", json.views, true)
						.addField("Downloads", json.downloads, true)
						.addField("Likes", json.likes, true);

					if (json.location.title !== null)
						embed.addField("Location", json.location.title, true);

					message.channel.send(embed);
				});
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
	name: "search",
	description: "Search for a photo by keyword.",
	cooldown: "5",
	usage: "search <keyword>",
};
