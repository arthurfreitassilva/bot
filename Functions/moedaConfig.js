const { ActionRowBuilder, TextInputBuilder, TextInputStyle, InteractionType, ModalBuilder, EmbedBuilder, ButtonBuilder, StringSelectMenuBuilder } = require("discord.js");
const { configuracao } = require("../DataBaseJson");

async function moedaConfig(interaction, client) {

        interaction.editReply({
            content: ``,
            embeds: [],
            components: [
                new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                    .setCustomId(`selectMoedaC`)
                    .addOptions(
                        {
                            value: `realBRL`,
                            label: `Real Brasileiro`,
                            emoji: `1332898838062825493`
                        },
                        {
                            value: `dolarUSD`,
                            label: `Dólar Americano (🚫)`,
                            emoji: `1333199615218159777`
                        }
                    )
                    .setPlaceholder(`Clique aqui para selecionar a moeda`)
                    .setMaxValues(1)
                )
            ]
        })

}

module.exports = {
    moedaConfig
}