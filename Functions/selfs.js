const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { configuracao } = require("../DataBaseJson");

async function Selfsnipe(interaction, client) {
    const embed = new EmbedBuilder()
        .setColor(configuracao.get(`Cores.Principal`) || '0cd4cc')
        .setTitle(`Divulgação`)
        .setDescription(`Aqui você pode divulgar seu servidor de forma segura e eficiente.`)
        .setFooter({ text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) })
        .setTimestamp();

    const row2 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("messagePanel")
                .setLabel('Self por Conta')
                .setEmoji(`1381341839365243020`)
                .setStyle(1)
                .setDisabled(false),
            new ButtonBuilder()
                .setCustomId("mensagemDivulgacaoPanel")
                .setLabel('Self por bot')
                .setEmoji(`1373087418353188865`)
                .setStyle(1)
                .setDisabled(false)
        );

    const row3 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`tools1`)
                .setLabel(`Voltar`)
                .setEmoji(`1371605354605051996`)
                .setStyle(2)
                .setDisabled(false)
        );

    await interaction.update({ content: ``, components: [row2, row3], embeds: [embed], ephemeral: true });
}

module.exports = {
    Selfsnipe
};
