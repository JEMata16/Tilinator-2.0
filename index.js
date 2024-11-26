const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],

});

client.once('ready', () => {
  console.log(`${client.user.tag} is online!`);
});

client.on('messageCreate', async (message) => {
  if (!message.content.startsWith('!play') || message.author.bot) return;

  const args = message.content.split(' ');
  if (args.length < 2) {
    return message.reply('Please provide a YouTube URL!');
  }

  const url = args[1];

  if (!ytdl.validateURL(url)) {
    return message.reply('Invalid YouTube URL!');
  }

  const channel = message.member?.voice.channel;
  if (!channel) {
    return message.reply('You need to be in a voice channel to play music!');
  }

const connection = joinVoiceChannel({
  channelId: channel.id,
  guildId: message.guild.id,
  adapterCreator: message.guild.voiceAdapterCreator,
  selfDeaf: false,
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

  message.reply(`Now playing: ${url}`);
});

client.login(process.env.DISCORD_TOKEN);
