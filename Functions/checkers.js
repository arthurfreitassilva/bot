    const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
    const { configuracao } = require("../DataBaseJson");

    async function Checkertlgd(interaction, client) {
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
                    .setCustomId("checkertoken")
                    .setLabel('Checker Token')
                    .setEmoji(`1377455243012345906`)
                    .setStyle(1)
                    .setDisabled(false)
            );

        const row2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("tools1")
                    .setLabel('Voltar')
                    .setEmoji('1371605354605051996')
                    .setStyle(2),
                    
            
                new ButtonBuilder()
                    .setCustomId("voltar1")
                    .setEmoji('1309962550149906522')
                    .setStyle(2) 
            );

        await interaction.update({ content: ``, components: [row1, row2], embeds: [embed], ephemeral: true });
    }

    module.exports = {
        Checkertlgd
    };
