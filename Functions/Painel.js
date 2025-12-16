const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { produtos, configuracao, Emojis } = require("../DataBaseJson");
const startTime = Date.now();
const maxMemory = 100;
const { ecloud } = require("../Functions/eCloudConfig");

// ✅ FUNÇÃO SEGURA PARA RESPONDER INTERAÇÕES
async function safeReply(interaction, data) {
  try {
    if (interaction.replied || interaction.deferred) {
      return await interaction.editReply(data).catch(() => {});
    }

    if (interaction.isRepliable()) {
      return await interaction.reply({ ...data, flags: 64 }).catch(() => {});
    }
  } catch (err) {
    console.error("Erro ao responder interação:", err);
  }
}

async function Painel(interaction, client, config = { email: "" }) {
  try {

    const status = configuracao.get("vendasstatus") || false;
    const userEmail = config?.email || "usuário";

    const embed = new EmbedBuilder()
      .setColor(configuracao.get("Cores.Principal") || "#00FFFF")
      .setImage("https://cdn.discordapp.com/attachments/1384476805284499487/1386103909088624650/painel_de_controle_Dream-1.png")
      .setTitle(`${Emojis.get(`dr`)}${Emojis.get(`ea`)}${Emojis.get(`mmm`)}`)
      .setDescription(`-# 🏡 Olá, **${interaction.user.username}**, gerencie o painel do seu bot.`)
      .addFields(
        { name: "Developed By", value: "`Dream Apps`", inline: true },
        { name: "Uptime", value: `<t:${Math.ceil(startTime / 1000)}:R>`, inline: true },
        { name: "Status da Loja", value: status ? "`🟢 Ativado`" : "`🔴 Desativado`", inline: true },
        { name: "Ping", value: `\`${client.ws.ping} ms\``, inline: true },
        { name: "Versão", value: "`5.0.5`", inline: true },
        { 
          name: "Cargo Cliente", 
          value: configuracao.get("ConfigRoles.cargoCliente")
            ? `<@&${configuracao.get("ConfigRoles.cargoCliente")}>`
            : "`Não configurado`",
          inline: true 
        }
      )
      .setFooter({ 
        text: `${interaction.guild.name} - Todos os direitos reservados.`,
        iconURL: interaction.guild.iconURL() 
      })
      .setTimestamp();

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("onoffvendas")
        .setLabel(status ? "Desativar Loja" : "Ativar Loja")
        .setEmoji(status ? "1383407510136029204" : "1383399544448090205")
        .setStyle(status ? ButtonStyle.Danger : ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId("painelconfigvendas")
        .setLabel("Marketplace")
        .setEmoji("1386137235627311204")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId("painelconfigticket")
        .setLabel("Atendimento")
        .setEmoji("1386137310957015060")
        .setStyle(ButtonStyle.Primary)
    );

    const row3 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("painelpersonalizar").setLabel("Aparência").setEmoji("1379907510080634962").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("gerenciarconfigs").setLabel("Definições").setEmoji("1377455293595648061").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("ecloud").setLabel("DreamCloud").setEmoji("1383399698370662471").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("configavançadas24").setLabel("Proteção").setEmoji("1383399536008888443").setStyle(ButtonStyle.Secondary)
    );

    const row4 = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("eaffaawwawa").setLabel("AutoExecuções").setEmoji("1383407073022443541").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("actionsautomations").setLabel("Moderação").setEmoji("1377455321806667817").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("tools1").setLabel("Tools").setEmoji("1371605629218721892").setStyle(ButtonStyle.Secondary)
    );

    await safeReply(interaction, {
      content: "",
      embeds: [embed],
      components: [row2, row3, row4]
    });

  } catch (error) {
    console.error("Erro no painel:", error);
    await safeReply(interaction, { content: "❌ Erro ao carregar painel." });
  }
}

async function Gerenciar2(interaction, client) {
  try {
    const embed = new EmbedBuilder()
      .setColor(configuracao.get("Cores.Principal") || "#00FFFF")
      .setTitle(`${Emojis.get(`shop`)} Marketplace`)
      .setDescription(`-# 🛒 Configure seu sistema de vendas e produtos.`)
      .setFooter({ 
        text: `${interaction.guild.name} - Painel de vendas`,
        iconURL: interaction.guild.iconURL() 
      })
      .setTimestamp();

    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("criarrrr")
        .setLabel("Criar Produto")
        .setEmoji("1246952363143729265")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId("gerenciarotemae")
        .setLabel("Gerenciar Produtos")
        .setEmoji("1178079212700188692")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId("formasdepagamentos")
        .setLabel("Formas de Pagamento")
        .setEmoji("1309962449696456764")
        .setStyle(ButtonStyle.Primary)
    );

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("configcargos")
        .setLabel("Configurar Cargos")
        .setEmoji("1309962502834229268")
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId("personalizarcanais")
        .setLabel("Configurar Canais")
        .setEmoji("1309962501877923931")
        .setStyle(ButtonStyle.Secondary)
    );

    const row3 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("voltar00")
        .setLabel("Voltar")
        .setEmoji("1305590970062082078")
        .setStyle(ButtonStyle.Secondary)
    );

    await safeReply(interaction, {
      content: "",
      embeds: [embed],
      components: [row1, row2, row3]
    });

  } catch (error) {
    console.error("Erro no Gerenciar2:", error);
    await safeReply(interaction, { content: "❌ Erro ao carregar painel de marketplace." });
  }
}

async function definirduvidas(interaction, client) {
  try {
    const embed = new EmbedBuilder()
      .setColor(configuracao.get("Cores.Principal") || "#00FFFF")
      .setTitle(`${Emojis.get(`question`)} Sistema de Dúvidas`)
      .setDescription(`-# ❓ Configure o botão de dúvidas para seus clientes.`)
      .addFields(
        { 
          name: "Botão Configurado", 
          value: configuracao.get('BotaoDuvidas.nomebotao') ? `✅ ${configuracao.get('BotaoDuvidas.nomebotao')}` : "❌ Não configurado",
          inline: true 
        },
        { 
          name: "Link", 
          value: configuracao.get('BotaoDuvidas.linkbotao') ? `${configuracao.get('BotaoDuvidas.linkbotao').substring(0, 50)}...` : "Nenhum",
          inline: true 
        }
      )
      .setFooter({ 
        text: `${interaction.guild.name}`,
        iconURL: interaction.guild.iconURL() 
      })
      .setTimestamp();

    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("botaoduvidas")
        .setLabel("Configurar Botão")
        .setEmoji("1377455293595648061")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId("voltar00")
        .setLabel("Voltar")
        .setEmoji("1305590970062082078")
        .setStyle(ButtonStyle.Secondary)
    );

    await safeReply(interaction, {
      content: "",
      embeds: [embed],
      components: [row1]
    });

  } catch (error) {
    console.error("Erro no definirduvidas:", error);
    await safeReply(interaction, { content: "❌ Erro ao carregar sistema de dúvidas." });
  }
}

module.exports = { Painel, Gerenciar2, definirduvidas };
