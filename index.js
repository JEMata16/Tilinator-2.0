const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once('ready', () => {
  console.log(`Bot conectado como ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith('!play')) {
    const args = message.content.split(' ');
    if (args.length < 2) {
      return message.reply('¡Por favor proporciona una URL de YouTube!');
    }

    const url = args[1];
    if (!ytdl.validateURL(url)) {
      return message.reply('¡URL de YouTube no válida!');
    }

    const channel = message.member?.voice.channel;
    if (!channel) {
      return message.reply('¡Debes estar en un canal de voz para reproducir música!');
    }

    try {
      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
        selfDeaf: false,
      });

      // Crea un reproductor de audio
      const player = createAudioPlayer();

      // Crea un recurso de audio desde la transmisión de YouTube
      const stream = ytdl(url, { filter: 'audioonly', quality: 'highestaudio' });
      const resource = createAudioResource(stream);

      // Conecta el reproductor al canal de voz
      connection.subscribe(player);

      // Reproduce el recurso
      player.play(resource);

      // Maneja eventos del reproductor
      player.on(AudioPlayerStatus.Idle, () => {
        console.log('Reproducción finalizada.');
        connection.destroy(); // Desconecta del canal al terminar
      });

      message.reply(`🎶 Reproduciendo ahora: ${url}`);
    } catch (error) {
      console.error('Error al intentar reproducir música:', error);
      message.reply('Hubo un error al intentar reproducir la música. Por favor, inténtalo de nuevo.');
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
