const queue = require("../queue");

module.exports = {
  name: "stop",
  description: "Detener la reproducción de música",
  execute(message) {
    const serverQueue = queue.get(message.guild.id);

    if (!serverQueue) {
      return message.reply("No hay música reproduciéndose!");
    }

    serverQueue.songs = [];
    serverQueue.player.stop();
    serverQueue.connection.destroy();
    queue.delete(message.guild.id);

    message.reply("¡Música detenida y desconectada del canal de voz!");
  },
};
