const { Client, GatewayIntentBits, Events, Collection } = require("discord.js");
require("dotenv").config();
const fs = require('node:fs');
const path = require('node:path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(path.join(commandsPath, file));
	client.commands.set(command.data.name, command);
}


client.once("ready", () => {
  console.log(`Bot conectado como ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
  console.log("Interaction", interaction);
	if (!interaction.isChatInputCommand()) {console.log('Comando no reconocido'); return; }
  console.log(`Comando: ${interaction.commandName}`);
	const command = client.commands.get(interaction.commandName);
	if (!command) {
		console.error(`No command matching ${interaction.commandName} found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error executing the command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error executing the command!', ephemeral: true });
		}
	}
});

client.login(process.env.DISCORD_TOKEN);
