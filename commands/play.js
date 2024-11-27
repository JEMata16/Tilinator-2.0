const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
} = require("@discordjs/voice");
const ytdl = require("@distube/ytdl-core");

const queue = new Map();

module.exports = {
  name: "play",
  description: "Reproduce una canción desde YouTube",
  async execute(message, args) {
    const url = args[0];
    if (!ytdl.validateURL(url)) {
      return message.reply("¡URL de YouTube no válida!");
    }

    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      return message.reply(
        "¡Debes estar en un canal de voz para reproducir música!"
      );
    }
    // const serverQueue = queue.push(url);
    // serverQueue = queue.push(message.guild.id);
    // serverQueue = queue.get(message.guild.id);

    if (!serverQueue) {
      const queueConstructor = {
        voiceChannel,
        connection: null,
        player: createAudioPlayer(),
        songs: [],
      };

      queue.set(message.guild.id, queueConstructor);
      queueConstructor.songs.push(url);

      try {
        queueConstructor.connection = joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: message.guild.id,
          adapterCreator: message.guild.voiceAdapterCreator,
        });

        this.play(message.guild, queueConstructor.songs[0]);
      } catch (err) {
        console.error(err);
        queue.delete(message.guild.id);
        return message.reply("Hubo un error al conectar al canal de voz.");
      }
    } else {
      serverQueue.songs.push(url);
      return message.reply("Canción añadida a la cola.");
    }
  },

  play(guild, song) {
    const serverQueue = queue.get(guild.id);
    if (!song) {
      serverQueue.connection.destroy();
      queue.delete(guild.id);
      return;
    }

    const stream = ytdl(song, { filter: "audioonly" });
    const resource = createAudioResource(stream);

    serverQueue.player.play(resource);
    serverQueue.connection.subscribe(serverQueue.player);

    serverQueue.player.on("stateChange", (oldState, newState) => {
      if (newState.status === "idle") {
        serverQueue.songs.shift();
        this.play(guild, serverQueue.songs[0]);
      }
    });

    serverQueue.player.on("error", (error) => console.error(error));
  },
};
