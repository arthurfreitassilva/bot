const { EmbedBuilder, ApplicationCommandType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { produtos, configuracao, Emojis } = require("../DataBaseJson");
const startTime = Date.now();
const maxMemory = 100;
const { ecloud } = require("../Functions/eCloudConfig");
const usedMemory = process.memoryUsage().heapUsed / 1024 / 1024;
const memoryUsagePercentage = (usedMemory / maxMemory) * 100;
const roundedPercentage = Math.min(100, Math.round(memoryUsagePercentage));

async function Painel(interaction, client, config = { email: "" }) {  // Valor padrão para config
  try {
    const status = configuracao.get("vendasstatus") || false;

    // Verifica se config.email existe, senão usa string vazia
    const userEmail = config?.email || "usuário";
const embed = new EmbedBuilder()
      .setColor(configuracao.get("Cores.Principal") || "#00FFFF")
      .setImage("https://cdn.discordapp.com/attachments/1384476805284499487/1386103909088624650/painel_de_controle_Dream-1.png?ex=68587d5c&is=68572bdc&hm=e8720b1b718b4e4b9f2204357613ad054b80805831693be8544a6bf21d65fcd8&")
      .setTitle(`${Emojis.get(`dr`)}${Emojis.get(`ea`)}${Emojis.get(`mmm`)}`)
      .setDescription(
        `-# \`🏡\` Olá, **${
          interaction.user.displayName
        }**, gerencie o painel do seu bot eSales.`
      )
      .addFields(
        { name: "Developed By", value: `\`Dream Apps\``, inline: true },
        {
          name: "Uptime",
          value: `<t:${Math.ceil(startTime / 1000)}:R>`,
          inline: true,
        },
        { name: "Status da Vendas", value: status ? "`🟢` Ativado" : "`🔴` Desabilitado", inline: true }, 
        { name: "Ping", value: `\`${client.ws.ping} ms\``, inline: true },
        { name: "Versão DPro", value: `\`5.0.5\``, inline: true },
        { 
          name: "Cargo Cliente", 
          value: configuracao.get("ConfigRoles.cargoCliente") ? `<@&${configuracao.get("ConfigRoles.cargoCliente")}>` : "`Não configurado`", 
          inline: true 
        }
      )
      .setFooter({
        text: `${interaction.guild.name} - Todos os direitos reservados.`,
        iconURL: interaction.guild.iconURL(),
      })
      .setTimestamp();


    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId("onoffvendas")
          .setLabel(status ? "Desativar Loja" : "Ativar Loja")
          .setEmoji(status ? "1383407510136029204" : "1383399544448090205")
          .setStyle(status ? 4 : 3),
        new ButtonBuilder()
          .setCustomId("painelconfigvendas")
          .setLabel('Gerenciar Marketplace')
          .setEmoji(`<:emoji_5:1386137235627311204>`)
          .setStyle(1),
        new ButtonBuilder()
          .setCustomId("painelconfigticket")
          .setLabel("Gerenciar Atendimento")
          .setEmoji("1386137310957015060")
          .setStyle(1)
          .setDisabled(false),
      );

    const row3 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId("painelpersonalizar")
          .setLabel('Aparência & Layout')
          .setEmoji("1379907510080634962")
          .setStyle(2),
        new ButtonBuilder()
          .setCustomId("gerenciarconfigs")
          .setLabel('Definições')
          .setEmoji("1377455293595648061")
          .setStyle(2),
        new ButtonBuilder()
          .setCustomId("ecloud")
          .setLabel("DreamCloud")
          .setEmoji("<:cloud:1383399698370662471>")
          .setStyle(2)
          ,
        new ButtonBuilder()
          .setCustomId("configavançadas24")
          .setLabel('Proteção')
          .setEmoji("<:protect:1383399536008888443>")
          .setStyle(2),
      );
    
    const row4 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId("eaffaawwawa")
          .setLabel('AutoExecuções')
          .setEmoji("1383407073022443541")
          .setStyle(2),
        new ButtonBuilder()
          .setCustomId("actionsautomations")
          .setLabel('Moderação')
          .setEmoji("<:fechadura:1377455321806667817>")
          .setStyle(2),

          new ButtonBuilder().setCustomId("tools1").setLabel('Tools').setEmoji('1371605629218721892').setStyle(2),
        
      );

      await interaction.editReply({ 
        content: ``,
        components: [row2, row3, row4],
        embeds: [embed]
      });

  } catch (error) {
    console.error("Erro na função Painel:", error);
    await interaction.editReply("❌ Ocorreu um erro ao carregar o painel.");
  }
}

async function Gerenciar2(interaction, client) {

  const ggg = produtos.valueArray();

  const embed = new EmbedBuilder()
    .setColor(`${configuracao.get(`Cores.Principal`) == null ? '#660f7e' : configuracao.get('Cores.Principal')}`)
    .setImage("https://cdn.discordapp.com/attachments/1347717737463418890/1350913835661529199/painel_de_controle_Dream.png?ex=67d8780d&is=67d7268d&hm=fd5a1351163780839e69e70b21fb6e9c33fee0b1b58c7ce11a5b871a5942f479&")
    .setTitle(`**Painel De Produtos**`)
    .setDescription(`> Senhor(a) **${interaction.user.username}**, escolha o que deseja fazer.`)
    .addFields(
      { name: `**${Emojis.get(`deliveredorder_emoji`)} Total de produtos fornecidos**`, value: `${ggg.length}` },
      { name: `**${Emojis.get(`brand_emoji`)} Moeda Padrão**`, value: `${configuracao.get("pagamentos.moeda") === "BRL" ? "\`BRL\` - \`pt_BR\`" : "\`USD\` - \`es_CO\`"}` }
    )
    .setFooter(
      { text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) ? interaction.guild.iconURL({ dynamic: true }) : null }
    )
    .setTimestamp()


  if (configuracao.get(`Instrucoes.mensagem`)) {
    let instruções = configuracao.get(`Instrucoes`)
    embed.addFields({ name: `Instruções ao Cliente`, value: `-# Mensagem Após a Entrega\n${instruções.mensagem}\n-# Nome do Botão:\n${instruções.nomebotao}\n-# Link do Botão:\n${instruções.linkbotao}` })
  }



  const row2 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId("criarrrr")
        .setLabel('Criar')
        .setEmoji(`1178067873894236311`)
        .setStyle(1),
      new ButtonBuilder()
        .setCustomId("gerenciarotemae")
        .setLabel('Gerenciar')
        .setEmoji(`1178067945855910078`)
        .setStyle(1),
      new ButtonBuilder()
        .setCustomId("gerenciarposicao")
        .setLabel('Hierarquia')
        .setEmoji(`1178086608004722689`)
        .setStyle(1)
    )

  const row3 = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId("marca-qrcode")
        .setLabel("Marca")
        .setEmoji(`1238298715869937685`)
        .setStyle(1),
      new ButtonBuilder()
        .setCustomId(`altMoeda`)
        .setLabel(`Moeda`)
        .setEmoji(`1246953442283618334`)
        .setStyle(1),
      new ButtonBuilder()
        .setCustomId(`${interaction.user.id}_discohookconfig`)
        .setLabel("Termos")
        .setEmoji("1303148897933328385")
        .setStyle(1),
      new ButtonBuilder()
        .setCustomId(`othersgeneetc`)
        .setLabel(`Extensões`)
        .setEmoji(`1293757911306338376`)
        .setDisabled(false)
        .setStyle(1),
    )

  const row4 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("definirduvidas") // botaoduvidas
      .setLabel(`Botão de Dúvidas`)
      .setEmoji(Emojis.get(`_staff_emoji`))
      .setStyle(2),

    new ButtonBuilder()
        .setCustomId("rendimento")
        .setLabel('Registros De Vendas')
        .setEmoji(`1326691397277061140`)
        .setStyle(2)
  )

  
  
  const botoesvoltar = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("voltar00")
      .setEmoji(`1238413255886639104`)
      .setStyle(2),
    new ButtonBuilder()
      .setCustomId(`voltar1`)
      .setEmoji('1292237216915128361')
      .setDisabled(true)
      .setStyle(1)
  )



  await interaction.editReply({ embeds: [embed], components: [row2, row3, row4, botoesvoltar], content: `` })
}

async function definirduvidas(interaction, client) {

  let infoduvidas = configuracao.get(`BotaoDuvidas`) // 

  const embed = new EmbedBuilder()
    .setColor(`${configuracao.get(`Cores.Principal`) == null ? '#660f7e' : configuracao.get('Cores.Principal')}`)
    .setAuthor({ name: "DreamPro", iconURL: "https://cdn.discordapp.com/attachments/1383928144733409351/1384133409852624936/5992756f70f6d5ea352071e2dca21243.png?ex=68515230&is=685000b0&hm=ef5a68457791a4c30bdcaf43460f1eeeffbdf0654893b19cbe29cf964fb8d2f6&" }) 
    .setTitle(`Botão de Dúvidas`)
    .setDescription(`> \`\👩‍💻\` Senhor(a) **${interaction.user.username}**, configure o botão de dúvidas.`)
    .addFields(
      { name: '`🔧` Nome do Botão', value: `\`${infoduvidas?.nomebotao ? infoduvidas.nomebotao : `Não Defindo`}\``, inline: true },
      { name: '`🕵️‍♂️` Emoji do Botão', value: `${infoduvidas?.emoji ? infoduvidas.emoji : `\`Sem Emoji\``}`, inline: true },
      { name: '`📎` Link do Botão', value: `${infoduvidas?.linkbotao ? infoduvidas.linkbotao : `\`Não Defindo\``}`, inline: true },
    )
    .setFooter(
      { text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) ? interaction.guild.iconURL({ dynamic: true }) : null }
    )
    .setTimestamp()

  const botao = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('ativarbotaoduvidas')
      .setLabel(`${infoduvidas?.status ? `Botão Ativado` : `Botão Desativado`} `)
      .setEmoji(Emojis.get(`_transfer_emoji`))
      .setStyle(infoduvidas?.status ? 3 : 4),
    new ButtonBuilder()
      .setCustomId('botaoduvidas')
      .setLabel('Definir botão de dúvidas')
      .setEmoji(Emojis.get(`_staff_emoji`))
      .setStyle(2),
  )

  const botao2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("voltar3")
      .setEmoji(`1238413255886639104`)
      .setStyle(2),
    new ButtonBuilder()
      .setCustomId(`voltar1`)
      .setEmoji('1292237216915128361')
      .setStyle(1)
  )

  await interaction.update({ embeds: [embed], components: [botao, botao2], content: `` })
}

function getSaudacao() {
  const now = new Date();
  const brtHours = (now.getUTCHours() - 3 + 24) % 24; // Ajuste de UTC para BRT

  if (brtHours >= 18 || brtHours < 4) {
    return 'Boa noite';
  } else if (brtHours >= 12) {
    return 'Boa tarde';
  } else {
    return 'Bom dia';
  }
}


module.exports = {
  Painel,
  Gerenciar2,
  definirduvidas
}
