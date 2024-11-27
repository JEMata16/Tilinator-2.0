module.exports = {
  name: "skip",
  description: "Saltar a la siguiente canción",
  execute(message) {
    const serverQueue = queue.get(message.guild.id);
    if (!serverQueue) {
      return message.reply("No hay canciones en la cola para saltar.");
    }

    serverQueue.player.stop();
    message.reply("Canción saltada.");
  },
};
