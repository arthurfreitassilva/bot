const { EmbedBuilder, ApplicationCommandType, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { produtos, configuracao } = require("../DataBaseJson");

async function diversiadeconfigpanel(interaction, client) {

  const embed = new EmbedBuilder()
    .setColor(`${configuracao.get(`Cores.Principal`) == null ? '0cd4cc': configuracao.get('Cores.Principal')}`)
    .setAuthor({
        name: 'Diversidade',
        iconURL: 'https://cdn.discordapp.com/emojis/1371605365799780462.webp?size=96'
    })
    .setDescription(`-# > Aqui você selecionar algumas coisas extra para você configurar para o seu servidor.`)
    .setFooter(
      { text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) }
    )
    .setTimestamp()

  const row2 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId("configgenpainelzika")
        .setLabel('Gerador')
        .setEmoji(`1295647862214103082`)
        .setStyle(1),
      new ButtonBuilder()
        .setCustomId("criarservidordo0")
        .setLabel('Criar Servidor')
        .setEmoji(`1238300628225228961`) 
        .setStyle(1),
      new ButtonBuilder()
        .setCustomId("consultadddso") 
        .setLabel('Consulta dados ( proxima atualização )')
        .setEmoji(`1295648248970608690`)
        .setStyle(1)
    )

  const row3 = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder().setCustomId(`voltar1`).setLabel(`Voltar`).setEmoji(`1238413255886639104`).setStyle(2)
    )

    await interaction.update({ content: ``, components: [row2, row3], embeds: [embed], ephemeral: true, files: []  })
  }




module.exports = {
    diversiadeconfigpanel
}

