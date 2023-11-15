const { SlashCommandBuilder, ActionRowBuilder, PermissionFlagsBits, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('verify')
		.setDescription('Send Verify Message'),
	async execute(interaction) {
    if (interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        const verify = new ButtonBuilder()
          .setCustomId('verify')
          .setLabel('Verify Account')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('✅');

        let row = new ActionRowBuilder() 
          .addComponents(verify);

        await interaction.reply({ content: `✅ Mensagem enviada!`, ephemeral: true })
        await interaction.channel.send({ components: [row] })
    } else interaction.reply({ content: `Você não possui permissão para utilzar este comando!`, ephemeral: true })
	},
};