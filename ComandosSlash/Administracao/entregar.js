const { 
  PermissionFlagsBits, 
  EmbedBuilder, 
  ApplicationCommandType 
} = require("discord.js");

const { pedidos, pagamentos, carrinhos, configuracao, produtos } = require("../../DataBaseJson");
const { getPermissions } = require("../../Functions/PermissionsCache.js");
const { Emojis } = require("../../DataBaseJson");

module.exports = {
  name: "aprovar",
  description: "[🤖] Use para aprovar um pagamento",
  type: ApplicationCommandType.ChatInput,
  default_member_permissions: PermissionFlagsBits.Administrator,

  run: async (client, interaction) => {

    // 🔐 Verificação de permissão via sistema do bot
    const perm = await getPermissions(client.user.id);
    if (!perm || !perm.includes(interaction.user.id)) {
      return interaction.reply({
        content: `${Emojis.get("negative_dreamm67")} Faltam permissões.`,
        ephemeral: true
      });
    }

    // 🛒 Verifica se existe um carrinho aberto neste canal
    if (!carrinhos.has(interaction.channel.id)) {
      return interaction.reply({
        content: `${Emojis.get("negative_dreamm67")} Não há um carrinho aberto neste canal.`,
        ephemeral: true
      });
    }

    const carrinho = carrinhos.get(interaction.channel.id);
    const produtoCampos = produtos.get(`${carrinho.infos.produto}.Campos`);
    const campoSelecionado = produtoCampos.find(c => c.Nome === carrinho.infos.campo);

    let valor = campoSelecionado.valor * carrinho.quantidadeselecionada;

    // 🔖 Aplica cupom se existir
    if (carrinho.cupomadicionado !== undefined) {
      const listaCupons = produtos.get(`${carrinho.infos.produto}.Cupom`);
      const cupom = listaCupons.find(c => c.Nome === carrinho.cupomadicionado);
      valor *= (1 - cupom.desconto / 100);
    }

    const valorFormatado = Number(valor).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    // 📩 Embed enviado no PV do usuário
    const embedUsuario = new EmbedBuilder()
      .setColor(configuracao.get("Cores.Processamento") || "#fcba03")
      .setTitle(`${Emojis.get("neworder_emoji")} Pedido solicitado`)
      .setDescription(`Seu pedido foi criado e agora está aguardando a confirmação do pagamento.`)
      .addFields(
        {
          name: "**Detalhes**",
          value: `\`${carrinho.quantidadeselecionada}x ${carrinho.infos.produto} - ${carrinho.infos.campo} | R$ ${valorFormatado}\``
        },
        {
          name: "Forma de Pagamento",
          value: "`Pix - Aprovando Manualmente`"
        }
      )
      .setFooter({
        text: interaction.guild.name,
        iconURL: interaction.guild.iconURL({ dynamic: true }) || undefined
      })
      .setTimestamp();

    try {
      await interaction.user.send({ embeds: [embedUsuario] });
    } catch (_) {
      // Usuário com DM fechada → ignorado
    }

    // 📥 Embed enviado no canal de logs
    const embedLog = new EmbedBuilder()
      .setColor(configuracao.get("Cores.Processamento") || "#fcba03")
      .setTitle(`${Emojis.get("neworder_emoji")} Pedido solicitado`)
      .setDescription(`Usuário ${interaction.user} solicitou um pedido.`)
      .addFields(
        {
          name: "**Detalhes**",
          value: `\`${carrinho.quantidadeselecionada}x ${carrinho.infos.produto} - ${carrinho.infos.campo} | R$ ${valorFormatado}\``
        },
        {
          name: "**Forma de pagamento**",
          value: "`Pix - Aprovando Manualmente`"
        }
      )
      .setFooter({
        text: interaction.guild.name,
        iconURL: interaction.guild.iconURL({ dynamic: true }) || undefined
      })
      .setTimestamp();

    try {
      const logChannel = await client.channels.fetch(configuracao.get("ConfigChannels.logpedidos"));
      const msg = await logChannel.send({ embeds: [embedLog] });
      carrinhos.set(`${interaction.channel.id}.replys`, { channelid: msg.channel.id, idmsg: msg.id });
    } catch (_) {
      // Canal não existe ou sem perm → ignorado
    }

    // 💾 Salva pagamento como aprovado
    pagamentos.set(interaction.channel.id, {
      pagamentos: {
        id: "Aprovado Manualmente",
        method: "pix",
        data: Date.now()
      }
    });

    // Resposta final
    interaction.reply({
      content: `${Emojis.get("positive_dream")} Pagamento aprovado manualmente. Aguarde...`,
      ephemeral: true
    });
  }
};
