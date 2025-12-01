const { ApplicationCommandType, EmbedBuilder, Webhook, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");
const fs = require("fs");
const path = require("path");
const client = require("discord.js")
const { produtos, configuracao, Emojis } = require("../DataBaseJson");
const startTime = Date.now();
const maxMemory = 100;
const usedMemory = process.memoryUsage().heapUsed / 1024 / 1024;
const memoryUsagePercentage = (usedMemory / maxMemory) * 100;
const roundedPercentage = Math.min(100, Math.round(memoryUsagePercentage));
const { owner } = require("../config.json")

function getSaudacao() {
  const brazilTime = new Date().toLocaleString("en-US", {timeZone: "America/Sao_Paulo"});
  const hora = new Date(brazilTime).getHours();

  if (hora < 12) {
      return 'Bom dia';
  } else if (hora < 18) {
      return 'Boa tarde';
  } else {
      return 'Boa noite';
  }
}


async function Avançados(interaction, client) {

  const embed = new EmbedBuilder()
  .setColor(`${configuracao.get(`Cores.Principal`) == null ? '0cd4cc' : configuracao.get('Cores.Principal')}`)
  .setTitle(`Painel de Proteção`)
  .setThumbnail("https://images-ext-1.discordapp.net/external/XXEOFzWlylpBcKyQFSktsthvwjrYefPcOMVHHUe7mc0/%3Fsize%3D2048/https/cdn.discordapp.com/emojis/1269773226960093184.png")
  .setAuthor({ name: `Gerenciamento de proteção`, iconURL: 'https://cdn.discordapp.com/emojis/1269773226960093184.png?size=2048' })
  .setDescription(`> **${getSaudacao()} ${interaction.user}, Utilize os botões abaixo para configurar o ${client.user}.**`)
  .addFields(
    { name: `**Versão Atual**`, value: `1.0.0`, inline: true },
    { name: `**Tempo On**`, value: `<t:${Math.ceil(startTime / 1000)}:R>`, inline: true }
  )
  .setFooter(
    { text: '🔧 Configuração geral', iconURL: 'https://cdn.discordapp.com/emojis/1278805406671437975.gif?size=2048' }
  )
  .setTimestamp();

    if( interaction.user.id !== owner ) return interaction.reply({ content: `${Emojis.get(`negative_dreamm67`)} Você precisa ser o owner para acessar essa parte. owner atual: <@${owner}>`, ephemeral: true })

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
        .setCustomId("comandosperm")
        .setLabel('Comandos')
        .setEmoji(`1312119264739725322`)
        .setStyle(2)
        .setDisabled(false),

        new ButtonBuilder()
        .setCustomId("permissaoadm")
        .setLabel('Add Perms')
        .setEmoji(`1305243177803972781`)
        .setStyle(2)
        .setDisabled(false),

        new ButtonBuilder()
        .setCustomId("configemojis24")
        .setLabel('Configurar Emojis')
        .setEmoji(`1306692966898991235`)
        .setStyle(2)
        .setDisabled(false),

        new ButtonBuilder()
        .setCustomId("limpardm")
        .setLabel("Limpar Dm")
        .setEmoji("1306690936272588830")
        .setStyle(4),

        new ButtonBuilder()
        .setCustomId("voltar1")
        .setLabel('Voltar')
        .setEmoji(`1309962730433941614`)
        .setStyle(2)
        .setDisabled(false),
    )

    interaction.update({ embeds: [embed], components: [row], content: '', ephemeral: true})


}

async function Configcomandos24(interaction, client) {

  if( interaction.user.id !== owner ) return interaction.reply({ content: `${Emojis.get(`negative_dreamm67`)} | Você precisa ser o owner para acessar essa parte. owner atual: <@${owner}>`, ephemeral: true })

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('select_menu')
        .setPlaceholder('Clique aqui para configurar')
        .addOptions([
            {
              label: 'Ban & Unban',
              value: 'banunba24',
              description: 'Cargos Que podem Banir e desbanir usuarios atravez do comando',
              emoji: '1246954960218886146'
            },
            {
              label: 'Unlock & Lock',
              value: 'unlocklock24',
              description: 'Cargos Que podem desbloquear e bloquear canais atravez do comando',
              emoji: '1297640825391681596'
            },
            {
              label: 'Clear & Nuke',
              value: 'clearnuke24',
              description: 'Cargos Que podem Limpar mensagens de canais e recriar canais atravez do comando',
              emoji: '1246953228655132772'
            },
        ]);

    const row = new ActionRowBuilder()
        .addComponents(selectMenu);

        const row2 = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
          .setCustomId('configavançadas24')
          .setLabel('Voltar')
          .setEmoji("1246953097033416805")
          .setStyle(2),
        )

    await interaction.update({
        content: 'Configurações Avançadas:',
        embeds: [],
        components: [row, row2]
    });

}

async function Emojis24(interaction, client) {

  const embed = new EmbedBuilder()
  .setColor(`${configuracao.get(`Cores.Principal`) == null ? '0cd4cc' : configuracao.get('Cores.Principal')}`)
  .setAuthor({ name: `Configuração De Emoji`, iconURL: 'https://cdn.discordapp.com/emojis/1269773226960093184.png?size=2048' })
  .setDescription(`> ** Configurações de emoji, para configurar os emojis utilize os botões abaixo, caso não saiba para que server esses emojis veja a imagem abaixo**`)
  .setImage("https://cdn.discordapp.com/attachments/1378358712992927744/1378541242845106206/image_2.png?ex=683cfa14&is=683ba894&hm=9bccbc315cc2f1a591c03655a53d96a1848a1fb416f61192d105db8759c45304&")

    if( interaction.user.id !== owner ) return interaction.reply({ content: `${Emojis.get(`negative_dreamm67`)} | Você precisa ser o owner para acessar essa parte. owner atual: <@${owner}>`, ephemeral: true })

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
        .setCustomId("create_emojis")
        .setLabel('Adicionar Emojis')
        .setEmoji(`1372326106606075956`)
        .setStyle(2)
        .setDisabled(false),

        new ButtonBuilder()
        .setCustomId("remove_emojis")
        .setLabel('Remover Emojis')
        .setEmoji(`1309962729003679788`)
        .setStyle(4)
        .setDisabled(false),

        new ButtonBuilder()
        .setCustomId('configavançadas24')
        .setLabel('Voltar')
        .setEmoji("1246953097033416805")
        .setStyle(2),
    )

    interaction.update({ embeds: [embed], components: [row], content: '', ephemeral: true})

}

async function Perms24(interaction, client) {

  const embed = new EmbedBuilder()
  .setColor(`${configuracao.get(`Cores.Principal`) == null ? '0cd4cc' : configuracao.get('Cores.Principal')}`)
  .setAuthor({ name: `Configuração de permissão`, iconURL: 'https://cdn.discordapp.com/emojis/1269773226960093184.png?size=2048' })
  .setImage("https://cdn.discordapp.com/attachments/1378358712992927744/1378540746335850587/image_1.png?ex=683cf99d&is=683ba81d&hm=82f07b6e41050859323c5a81bd5649dc16569512aa3cbd13fd4dffaa9d58d61a&")
  .setDescription(`> ** Configurações de Perm, Para outros usuarios poderem configurar a source**`)

    if( interaction.user.id !== owner ) return interaction.reply({ content: `${Emojis.get(`negative_dreamm67`)} | Você precisa ser o owner para acessar essa parte. owner atual: <@${owner}>`, ephemeral: true })

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
        .setCustomId("perm_add")
        .setLabel('Adicionar Perm')
        .setEmoji(`1305243177803972781`)
        .setStyle(2)
        .setDisabled(false),

        new ButtonBuilder()
        .setCustomId("perm_remove")
        .setLabel('Remover Permissão')
        .setEmoji(`1309962729003679788`)
        .setStyle(2)
        .setDisabled(false),

        new ButtonBuilder()
        .setCustomId("perm_list")
        .setLabel('Lista De Permissões')
        .setEmoji(`1309962436622680177`)
        .setStyle(1)
        .setDisabled(false),

        new ButtonBuilder()
        .setCustomId('configavançadas24')
        .setLabel('Voltar')
        .setEmoji("1246953097033416805")
        .setStyle(2),
    )

    interaction.update({ embeds: [embed], components: [row], content: '', ephemeral: true})

}


module.exports = {
  Avançados, Configcomandos24, Emojis24, Perms24
}
