const { SlashCommandBuilder } = require("@discordjs/builders");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
require("dotenv").config();

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_APPLICATION_ID;
const guildId = process.env.DISCORD_GUILD_ID;

// Crea el objeto REST
const rest = new REST({ version: "10" }).setToken(token);

// Define tus comandos
const commands = [
  new SlashCommandBuilder()
    .setName("play")
    .setDescription("Pon tu chorocotonga música brother")
    .addStringOption((option) =>
      option.setName("url")
        .setDescription("URL de la musica brother")
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName("pause")
    .setDescription("HERMANO DALE PAUSA"),
  new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Jump ////"),
  new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stop wait a minute"),
].map((command) => command.toJSON());

// Registra los comandos
(async () => {
  try {
    console.log("Empezando a registrar comandos...");

    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    );

    console.log(`${commands.length} comandos registrados correctamente`);
  } catch (error) {
    console.error("Hubo un error al registrar los comandos:", error);
  }
})();
