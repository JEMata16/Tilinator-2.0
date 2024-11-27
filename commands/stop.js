module.exports = {
  name: "stop",
  description: "Detiene la música y limpia la cola",
  execute(message) {
    const serverQueue = queue.get(message.guild.id);
    if (!serverQueue) {
      return message.reply("No hay música reproduciéndose.");
    }

    serverQueue.songs = [];
    serverQueue.player.stop();
    serverQueue.connection.destroy();
    queue.delete(message.guild.id);

    message.reply("Música detenida y cola limpiada.");
  },
};
