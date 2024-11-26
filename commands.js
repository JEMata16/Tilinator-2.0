const { SlashCommandBuilder } = require("@discordjs/builders");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { Client, Intents } = require("discord.js");
require("dotenv").config();
// Tu bot Token

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_APPLICATION_ID;
const guildId = process.env.DISCORD_GUILD_ID;

// Crea el objeto REST
const rest = new REST({ version: "9" }).setToken(token);

// Define tus comandos
const commands = [
  new SlashCommandBuilder()
    .setName("play")
    .setDescription("Pon tu chorocotonga música brother"),
  new SlashCommandBuilder()
    .setName("pause")
    .setDescription("HERMANO DALE PAUSA"),
  new SlashCommandBuilder().setName("skip").setDescription("Jump ////"),
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

    

    console.log("Comandos registrados correctamente");
  } catch (error) {
    console.error("Hubo un error al registrar los comandos:", error);
  }
})();
