const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { configuracao } = require("../DataBaseJson");

async function Cloners(interaction, client) {
    const embed = new EmbedBuilder()
        .setColor(configuracao.get(`Cores.Principal`) || '313838')
        .setTitle('Painel de Clonagem - DreamPRO')
        .setDescription(`
**Automatize e proteja seu servidor com as ferramentas de clonagem!**

> \`🔹\` **Cloner Servidor:** Clone canais, cargos, permissões e mais com um clique.
> \`🔹\` **Cloner Site:** Gere um backup do seu servidor em formato web.

Escolha uma das opções abaixo para começar:
`)
        .addFields(
            { name: '`🛠️` Dica', value: 'Use a clonagem com responsabilidade para evitar perdas de dados e garantir a segurança do seu servidor.', inline: false },
            { name: '`🔗` Suporte', value: '[Entre no nosso Discord](https://discord.gg/aplicativos)', inline: true }
        )
        .setFooter({ text: `DreamPRO • ${interaction.guild.name}`, iconURL: interaction.guild.iconURL({ dynamic: true }) })
        .setTimestamp();

    const row2 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("panelclonerslaoq")
                .setLabel('Cloner Servidor')
                .setEmoji('1238303687248576544')
                .setStyle(1)
                .setDisabled(false),
            new ButtonBuilder()
                .setCustomId("ClonerSite")
                .setLabel('Cloner Site')
                .setEmoji('1238300628225228961')
                .setStyle(1)
                .setDisabled(false)
        );

    const row3 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`tools1`)
                .setLabel(`Voltar`)
                .setEmoji('1371605354605051996')
                .setStyle(2)
                .setDisabled(false),
            new ButtonBuilder()
                .setCustomId("voltar1")
                .setEmoji('1309962550149906522')
                .setStyle(1)
                .setDisabled(false)
        );

    await interaction.update({ content: ``, components: [row2, row3], embeds: [embed], ephemeral: true });
}

module.exports = {
    Cloners
};
