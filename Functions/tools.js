const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { configuracao } = require("../DataBaseJson");

async function ToolsPanel(interaction, client) {
    const embed = new EmbedBuilder()
        .setColor(configuracao.get(`Cores.Principal`) || '313838')
        .setTitle('Painel de Ferramentas - DreamPRO')
        .setDescription(`
**Bem-vindo ao seu painel de ferramentas!**

Aqui você encontra utilidades para gerenciar e turbinar seu servidor. Selecione uma das opções abaixo para começar:

> \`\🔹\` **Cloners:** Clone canais, cargos e mais!
> \`\🔹\` **Selfs:** Ferramentas de autoatendimento e automação.
> \`\🔹\` **Checkers:** Verifique status, tokens e informações.

Clique em um botão abaixo para acessar a ferramenta desejada!
`)
        .addFields(
            { name: '`🛠️` Dica', value: 'Use as ferramentas com responsabilidade para garantir a segurança do seu servidor.', inline: false },
            { name: '`🔗` Suporte', value: '[Entre no nosso Discord](https://discord.gg/aplicativos)', inline: true }
        )
        .setFooter({ text: `DreamPRO • ${interaction.guild.name}`, iconURL: interaction.guild.iconURL({ dynamic: true }) })
        .setTimestamp();

    const row1 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("cloners")
                .setLabel('Configurar Cloner Servidor')
                .setEmoji('1381349625994154024')
                .setStyle(1),

            new ButtonBuilder()
                .setCustomId("selfs")
                .setLabel('Configurar Selfs Bot & Conta')
                .setEmoji('1349987948329832488')
                .setStyle(1),

            new ButtonBuilder()
                .setCustomId("checks")
                .setLabel('Configurar Checker')
                .setEmoji('1291567110828462090')
                .setStyle(1),
        );

    const row2 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("voltar00")
                .setLabel('Voltar')
                .setEmoji('1371605354605051996')
                .setStyle(2),
                new ButtonBuilder()
                .setCustomId("voltar1")
                
                .setEmoji('1309962550149906522')
                .setStyle(1) // Voltar ao painel principal
        );

    await interaction.update({ content: ``, components: [row1, row2], embeds: [embed], files: [] ,ephemeral: true });
}

module.exports = {
    ToolsPanel
};
