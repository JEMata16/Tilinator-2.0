const queue = new Map();
module.exports = queue;


// module.exports = {
//   name: "queue",
//   description: "Muestra las canciones en la cola",
//   execute(message) {
//     const queue = require("../commands/play.js");
//     const serverQueue = queue.get(message.guild.id);
//     if (!serverQueue || !serverQueue.songs.length) {
//       return message.reply("No hay canciones en la cola.");
//     }

//     const songList = serverQueue.songs
//       .map((song, index) => `${index + 1}. ${song}`)
//       .join("\n");
//     message.reply(`Cola de reproducción:\n${songList}`);
//   },
// };
