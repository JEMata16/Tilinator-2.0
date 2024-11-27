const queue = require("../commands/queue");
const { createAudioResource } = require("@discordjs/voice");
const ytdl = require("@distube/ytdl-core");


module.exports = {
  name: "skip",
  description: "Saltar la canción actual",
  execute(message) {
    const serverQueue = queue.get(message.guild.id);

    
    if (!serverQueue) {
      return message.reply("¡No hay música para saltar!");
    }

    
    serverQueue.player.stop(); 
    serverQueue.songs.shift(); 

    // Siguiente canción si hay
    if (serverQueue.songs.length > 0) {
      message.reply("¡Canción saltada! Reproduciendo la siguiente.");
      this.play(message.guild, serverQueue.songs[0]);
    } else {
      
      serverQueue.connection.destroy();
      queue.delete(message.guild.id);
      message.reply("¡No quedan más canciones en la cola! Música detenida.");
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
