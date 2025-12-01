const { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { produtos, Emojis, configuracao } = require("../DataBaseJson");

async function automatico(interaction, client) {
    // Cria um embed estilizado com o emoji de thumb
    const embed = new EmbedBuilder()
        .setColor("#2F3136") // Cor cinza escura
        .setTitle(`${Emojis.get(`command_emoji`)} Painel de Automações`)
        .setDescription("- O que deseja configurar? Escolha uma opção abaixo:")
        .setThumbnail("https://cdn.discordapp.com/emojis/1375741152094978111.webp?size=96") // Emoji de thumb
        
        
        .setFooter({ text: `Configurações Automáticas | ${client.user.username}`, iconURL: client.user.displayAvatarURL() })
        .setTimestamp();

    // Linha de botões para as opções de automação
    const row2 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("autoreact24")
                .setLabel("Auto React")
                .setEmoji("1309962436622680177")
                .setDisabled(false)
                .setStyle(2), // Estilo Secondary (cinza)
            
            new ButtonBuilder()
                .setCustomId("configlock")
                .setLabel("Lock Automático")
                .setEmoji("1309962503782142004") // Emoji de thumb
                .setStyle(1), // Estilo Primary (azul)
            new ButtonBuilder()
                .setCustomId("openFeedbackPanel")
                .setLabel("Feedbacks Negativos")
                .setEmoji("1312115652114387015") // Emoji de thumb
                .setStyle(1), // Estilo Primary (azul)
            
            
        );

    // Linha para o botão de voltar
    const row3 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("voltar1")
                .setEmoji("1305590970062082078")
                .setLabel("Voltar")
                .setStyle(4), // Estilo Danger (vermelho)
        );

    // Atualiza a interação com o embed e os botões
    await interaction.update({
        embeds: [embed],
        content: null, // Remove o conteúdo solto
        ephemeral: true,
        components: [row2, row3]
    });
}

module.exports = { automatico };