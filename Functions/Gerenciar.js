const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

async function Gerenciar(interaction, client) {

    // Row 1 – Cargos e Canais
    const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("configcargos")
            .setLabel("Cargos")
            .setEmoji("1309962502834229268")
            .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
            .setCustomId("personalizarcanais")
            .setLabel("Canais")
            .setEmoji("1309962501877923931")
            .setStyle(ButtonStyle.Secondary)
    );

    // Row 2 – Formas de pagamento
    const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("formasdepagamentos")
            .setLabel("Formas de pagamento")
            .setEmoji("1309962449696456764")
            .setStyle(ButtonStyle.Primary)
    );

    // Row 3 – Voltar
    const row3 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("voltar00")
            .setEmoji("1305590970062082078")
            .setStyle(ButtonStyle.Secondary),

        new ButtonBuilder()
            .setCustomId("voltar1")
            .setEmoji("1292237216915128361")
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true)
    );

    const payload = {
        content: "O que precisa configurar?",
        embeds: [],
        components: [row1, row2, row3]
    };

    // Se for slash command → interaction.reply
    // Se for botão → interaction.update
    if (!interaction.replied && !interaction.deferred && !interaction.message) {
        await interaction.reply(payload);
    } else {
        await interaction.update(payload);
    }
}

module.exports = { Gerenciar };
