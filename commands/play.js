const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
} = require("@discordjs/voice");
const ytdl = require("@distube/ytdl-core");
const ytSearch = require("yt-search");
const queue = require("../commands/queue");

module.exports = {
  name: "play",
  description: "Reproduce una canción desde YouTube",
  async execute(message, args) {
    if (!args.length) {
      return message.reply("La historia del coronel Sanders");
    }

    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      return message.reply(
        "Vuelva a su aula ya!"
      );
    }

    const serverQueue = queue.get(message.guild.id);
    let song;

    if (ytdl.validateURL(args[0])) {
      // Si el argumento es una URL válida de YouTube
      song = { title: "Canción desde URL", url: args[0] };
    } else {
      // Si no es una URL, realiza una búsqueda en YouTube
      const searchResult = await ytSearch(args.join(" "));
      if (!searchResult.videos.length) {
        return message.reply("Bote el chicle por favor.");
      }
      const video = searchResult.videos[0];
      song = { title: video.title, url: video.url };
    }

    if (!serverQueue) {
      const queueConstructor = {
        voiceChannel,
        connection: null,
        player: createAudioPlayer(),
        songs: [],
      };

      queue.set(message.guild.id, queueConstructor);
      queueConstructor.songs.push(song);

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
        return message.reply("Yo no soy tu padre!");
      }
    } else {
      serverQueue.songs.push(song);
      return message.reply(`**${song.title}** addded to la cola.`);
    }
  },

  play(guild, song) {
    const serverQueue = queue.get(guild.id);
    if (!song) {
      serverQueue.connection.destroy();
      queue.delete(guild.id);
      return;
    }

    const stream = ytdl(song.url, { filter: "audioonly" });
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
