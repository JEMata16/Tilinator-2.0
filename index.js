const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

client.once('ready', () => {
  console.log(`${client.user.tag} fucking shet online dude omg en plan holy shet oh por dios`);
});

client.on('messageCreate', async (message) => {
  if (!message.content.startsWith('!play') || message.author.bot) return;

  const args = message.content.split(' ');
  if (args.length < 2) {
    return message.reply('Yutub u erre ele por dios');
  }

  const url = args[1];

  if (!ytdl.validateURL(url)) {
    return message.reply('Hermano que tu haces, eso está malo');
  }

  const channel = message.member?.voice.channel;
  if (!channel) {
    return message.reply('Hermano donde estás loco? Y tu canal?');
  }

  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: message.guild.id,
    adapterCreator: message.guild.voiceAdapterCreator,
  });

  const stream = ytdl(url, { filter: 'audioonly' });
  const resource = createAudioResource(stream);
  const player = createAudioPlayer();

  player.play(resource);
  connection.subscribe(player);

  player.on('error', (error) => {
    console.error('Error playing audio:', error);
    connection.destroy();
  });

  message.reply(`Ahora suena bomba: ${url}`);
});

client.login(process.env.DISCORD_TOKEN);
