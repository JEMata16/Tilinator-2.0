const { Client, GatewayIntentBits } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
} = require("@discordjs/voice");
const ytdl = require("@distube/ytdl-core");
require("dotenv").config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

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
      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
        selfDeaf: false,
      });

      // Crea un reproductor de audio
      const player = createAudioPlayer();

      // Crea un recurso de audio desde la transmisión de YouTube
      const stream = ytdl(url, {
        filter: 'audioonly',
        quality: 'highestaudio',
        requestOptions: {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          },
        },
      });
      stream.on("info", () => console.log("Stream obtenido con éxito"));
      stream.on("error", (err) => console.error("Error en el stream:", err));

      const resource = createAudioResource(stream);

      // Conecta el reproductor al canal de voz
      connection.subscribe(player);

      // Reproduce el recurso
      player.play(resource);
      player.on('error', (error) => {
        console.error('Error en el AudioPlayer:', error);
        message.reply('Error linea 79');
      });
      // Maneja eventos del reproductor
      player.on(AudioPlayerStatus.Idle, () => {
        console.log("Reproducción finalizada.");
        connection.destroy(); // Desconecta del canal al terminar
      });

      message.reply(`🎶 Reproduciendo ahora: ${url}`);
    } catch (error) {
      console.error("Error al intentar reproducir música:", error);
      message.reply(
        "Mierdon de aplicacion no se puede reproducir musica"
      );
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
