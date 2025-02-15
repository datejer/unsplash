const fs = require("fs");

module.exports = (client) => {
	let packageFile = JSON.parse(fs.readFileSync("./package.json", "utf8"));
	console.log(`\n             Unsplash v${packageFile.version}\n`);
	console.log(
		`Bot has started, with ${client.users.cache.size} users, in ${client.channels.cache.size} channels of ${client.guilds.cache.size} guilds.`
	);
	console.log(`Logged in as ${client.user.tag} (ID: ${client.user.id})\n`);
	// Set the status and activity of the bot user.
	client.user.setStatus("available");
	client.user.setActivity(client.config.activityMessage, {
		type: client.config.activityType,
	});
};
