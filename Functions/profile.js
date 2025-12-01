const { EmbedBuilder } = require("discord.js");
const { EstatisticasKing } = require("../index.js");
const { configuracao, Emojis } = require("../DataBaseJson/index.js");

async function profileuser(interaction, userID = null) {

    if (!userID) userID = interaction.user.id;

    const PrimeiraCompra = await EstatisticasKing.FirstOrder(userID);
    const UltimaCompra = await EstatisticasKing.LastOrder(userID);
    const rendimento = await EstatisticasKing.Ranking(10, 'valorTotal', userID);

    if (PrimeiraCompra == null) {
        return interaction.reply({
            content: `${Emojis.get('avisos')} Sem dados salvos`,
            ephemeral: true
        });
    }

    const cor = configuracao.get("Cores.Principal") || "635b44";

    const embed = new EmbedBuilder()
        .setColor(cor)
        .setAuthor({
            name: interaction.user.username,
            iconURL: interaction.user.displayAvatarURL({ dynamic: true })
        })
        .setTitle("Perfil")
        .addFields(
            {
                name: "**Valor total gasto**",
                value: `\`R$ ${Number(rendimento.valorTotal).toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })}\``,
                inline: true
            },
            {
                name: "**Pedidos aprovados**",
                value: `\`${rendimento.qtdCompraTotal}\``,
                inline: true
            },
            {
                name: "**Posição no rank**",
                value: `\`${rendimento.posicao}\``,
                inline: true
            },
            {
                name: "**Primeira compra**",
                value: `<t:${Math.ceil(PrimeiraCompra.data.data / 1000)}:R>`,
                inline: true
            },
            {
                name: "**Última compra**",
                value: `<t:${Math.ceil(UltimaCompra.data.data / 1000)}:R>`,
                inline: true
            }
        )
        .setTimestamp()
        .setFooter({ text: interaction.user.username });

    return interaction.reply({
        embeds: [embed],
        ephemeral: true
    });
}

module.exports = {
    profileuser
};
