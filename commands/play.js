const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const ytdl = require('@distube/ytdl-core');

module.exports = {
	data: new SlashCommandBuilder()
		.setName("play")
		.setDescription("Pon tu chorocotonga música brother")
		.addStringOption(option => 
			option.setName("url")
			.setDescription("URL de la musica brother")
			.setRequired(true)
		),
	async execute(interaction) {
        interaction.deferReply();
		const url = interaction.options.getString("url");
		// Command logic here
		if (!ytdl.validateURL(url)) {
			return interaction.reply({ content: 'Nononono Url invalid', ephemeral: true });
		}

		const channel = interaction.member?.voice.channel;
		if (!channel) {
			return interaction.reply({ content: "Where is your voice channel? Dude", ephemeral: true });
		}

		try {
			const connection = joinVoiceChannel({
				channelId: channel.id,
				guildId: interaction.guild.id,
				adapterCreator: interaction.guild.voiceAdapterCreator,
			});
			const player = createAudioPlayer();
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
			const resource = createAudioResource(stream);
			connection.subscribe(player);
			player.play(resource);
            player.on(AudioPlayerStatus.Idle, () => {
                console.log("Reproducción finalizada.");
                connection.destroy();
            });

			await interaction.reply(`Playing: ${url}`);
		} catch (error) {
			console.error(error);
			await interaction.reply({ content: 'Error playing music!', ephemeral: true });
		}
	},
};
