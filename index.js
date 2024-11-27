const { Client, GatewayIntentBits } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
} = require("@discordjs/voice");
const ytdl = require("ytdl-core");
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

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith("*play")) {
    const args = message.content.split(" ");
    if (args.length < 2) {
      return message.reply("¡Por favor proporciona una URL de YouTube!");
    }

    const url = args[1];
    if (!ytdl.validateURL(url)) {
      return message.reply("¡URL de YouTube no válida!");
    }

    const channel = message.member?.voice.channel;
    if (!channel) {
      return message.reply(
        "¡Debes estar en un canal de voz para reproducir música!"
      );
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
}});

client.login(process.env.DISCORD_TOKEN);
