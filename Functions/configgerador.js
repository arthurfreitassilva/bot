const { EmbedBuilder, ApplicationCommandType, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { JsonDatabase } = require("wio.db");
const fs = require("fs/promises"); // Importação para fs
const path = require("path"); // Importação para path
const { configuracao } = require("../DataBaseJson");

async function configurargeradorpainelconfig(interaction, client) {

  const embed = new EmbedBuilder()
    .setColor(`${configuracao.get(`Cores.Principal`) == null ? '0cd4cc': configuracao.get('Cores.Principal')}`)
    .setTitle(`Painel do seu Gerador rOS`)
    .setDescription(`##  Painel de configuração do seu Bot de gerador
> - Este Painel é dedicado a configuração do seu Gerador
> - Configure seu gerador com os botões abaixo !`)
    .setFooter(
      { text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) }
    )
    .setTimestamp()

  const row2 = new ActionRowBuilder()
    .addComponents(
    new ButtonBuilder()
        .setCustomId("sistemagerador")
        .setLabel(`Configurar Gerador`)
            .setEmoji({ id: '1386288729693491262' })
            .setStyle(1),
    new ButtonBuilder()
        .setCustomId("sistemaowner")
        .setLabel(`Configuração Owner`)
            .setEmoji({ id: '1358000568102158408' })
            .setStyle(3)
    )

  const row3 = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder().setCustomId(`othersgeneetc`).setLabel(`Voltar`).setEmoji({ id: '1371605354605051996' }).setStyle(2)
    )

    await interaction.update({ content: ``, components: [row2, row3], embeds: [embed], ephemeral: true, files: []  })
  }




module.exports = {
    configurargeradorpainelconfig
}
