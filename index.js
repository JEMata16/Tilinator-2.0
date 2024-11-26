const { Client, GatewayIntentBits, Events } = require("discord.js");
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

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;

  if (commandName === 'play') {
    const url = options.getString('url');

    if (!url) {
      return interaction.reply({
        content: "Url inválida.",
        ephemeral: true,
      });
    }
    await interaction.deferReply();
    
    await interaction.reply(`🎶 Buscando la música de: ${url}`);
    
    if (!ytdl.validateURL(url)) {
      return interaction.reply("Nononono Url invalid");
    }

    
    const channel = message.member?.voice.channel;
    if (!channel) {
      return interaction.editReply(
        "Where is your voice channel? Dude"
      );
    }

    try {
      const connection = await joinVoiceChannel({
        channelId: channel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
        selfDeaf: false,
      });

      // Crea un reproductor de audio
      const player = await createAudioPlayer();

      // Crea un recurso de audio desde la transmisión de YouTube
      const stream = await ytdl(url, {
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

      const resource = await createAudioResource(stream);

      // Conecta el reproductor al canal de voz
      connection.subscribe(player);

      // Reproduce el recurso
      player.play(resource);
      player.on('error', (error) => {
        console.error('Error en el AudioPlayer:', error);
        interaction.reply('Conchasumaire otra vez error');
      });
      // Maneja eventos del reproductor
      player.on(AudioPlayerStatus.Idle, () => {
        console.log("Reproducción finalizada.");
        connection.destroy(); // Desconecta del canal al terminar
      });

      interaction.reply(`🎶 Suena la bomba de: ${url}`);
    } catch (error) {
      console.error("Error al intentar reproducir música:", error);
      interaction.reply(
        "Mierdon de aplicacion no se puede reproducir musica"
      );
    }
  }

  if (commandName === 'pause') {
    //Stops the music
    const player = message.guild.voiceConnection?.audioPlayer;
    if (player) {
      player.pause();
    }
  }

  if (commandName === 'skip') {
    // Reproduce la siguiente cancion
    const player = message.guild.voiceConnection?.audioPlayer;
    if (player) {
      player.unpause();
    }
  }

  if (commandName === 'stop') {
    //Stops the music
    const player = message.guild.voiceConnection?.audioPlayer;
    if (player) {
      player.stop();
    }
  }


});

client.login(process.env.DISCORD_TOKEN);
