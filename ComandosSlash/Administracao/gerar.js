const {
  EmbedBuilder,
  ApplicationCommandType,
  ApplicationCommandOptionType,
  ActionRowBuilder,
  ButtonBuilder,
  PermissionFlagsBits
} = require("discord.js");

const { JsonDatabase } = require("wio.db");
const General = new JsonDatabase({ databasePath: "./DataBaseJson/General.json" });
const config = new JsonDatabase({ databasePath: "./DataBaseJson/configbasicasindex.json" });

const fs = require("fs");
const path = require("path");
const cooldowns = new Map();
const { Emojis } = require("../../DataBaseJson");

module.exports = {
  name: "gerar",
  description: "[ Gerador ] Gere algum serviço do bot",
  type: ApplicationCommandType.ChatInput,
  default_member_permissions: PermissionFlagsBits.Administrator,
  autoDeferReply: false, // Desabilita defer automático para evitar conflito com replies diretos

  options: [
    {
      name: "serviço",
      description: "qual serviço você deseja gerar?",
      type: ApplicationCommandOptionType.String,
      required: true
    }
  ],

  run: async (client, interaction) => {

    // =============================
    // 📁 Verificação do Stock
    // =============================
    const stockDirectory = path.join(__dirname, "../../Stock");

    if (!fs.existsSync(stockDirectory)) {
      return interaction.reply({
        content: "❌ | A pasta **Stock** não existe.",
        ephemeral: true
      });
    }

    const files = fs.readdirSync(stockDirectory);

    // =============================
    // 🔧 Configs
    // =============================
    const service = interaction.options.getString("serviço");
    const canalCorreto = General.get(`${interaction.guild.id}.canal_gerador`);
    const cargoCorreto = General.get(`${interaction.guild.id}.cargo_gerador`);
    const isSystemOn = General.get(`${interaction.guild.id}.sistema`);

    const cooldownTime = General.get(`${interaction.guild.id}.gen_cooldawn`) || 10000;
    const now = Date.now();

    // =============================
    // ⏳ COOLDOWN
    // =============================
    if (cooldowns.has(interaction.user.id)) {
      const expiration = cooldowns.get(interaction.user.id);
      const timeLeft = expiration - now;

      if (timeLeft > 0) {
        const endTS = Math.floor((now + timeLeft) / 1000);
        return interaction.reply({
          content: `❌ | Você está em cooldown!\nDisponível em: <t:${endTS}:R>`,
          ephemeral: true
        });
      }
    }

    cooldowns.set(interaction.user.id, now + cooldownTime);

    // =============================
    // 📌 Sistema Off
    // =============================
    if (isSystemOn === "off") {
      return interaction.reply({
        content: "❌ | O sistema do gerador está **offline** neste servidor.",
        ephemeral: true
      });
    }

    // =============================
    // ❌ Serviço inexistente
    // =============================
    if (!files.includes(`${service}.txt`)) {
      return interaction.reply({
        content: `❌ | O serviço \`${service}\` não existe no stock!`,
        ephemeral: true
      });
    }

    // =============================
    // 📢 Canal incorreto
    // =============================
    if (!canalCorreto) {
      return interaction.reply({
        content: "❌ | Canal de geração **não configurado**.",
        ephemeral: true
      });
    }

    if (interaction.channel.id !== canalCorreto) {
      return interaction.reply({
        content: `❌ | Vá até <#${canalCorreto}> para usar este comando.`,
        ephemeral: true
      });
    }

    // =============================
    // 🎭 Verificação de cargo
    // =============================
    if (cargoCorreto) {
      if (!interaction.member.roles.cache.has(cargoCorreto)) {
        return interaction.reply({
          content: `❌ | Você precisa do cargo <@&${cargoCorreto}>.`,
          ephemeral: true
        });
      }
    }

    // =============================
    // 📤 Processar Stock
    // =============================
    const servicePath = path.join(stockDirectory, `${service}.txt`);
    let lines;

    try {
      lines = fs.readFileSync(servicePath, "utf-8")
        .replace(/\r/g, "")
        .split("\n")
        .filter(l => l.trim() !== "");
    } catch (err) {
      console.error(err);
      return interaction.reply({
        content: "❌ | Erro ao ler o serviço!",
        ephemeral: true
      });
    }

    if (lines.length === 0) {
      return interaction.reply({
        content: `❌ | O serviço \`${service}\` está **vazio**!`,
        ephemeral: true
      });
    }

    const lastLine = lines.pop();

    try {
      fs.writeFileSync(servicePath, lines.join("\n"), "utf-8");
    } catch (err) {
      console.error(err);
      return interaction.reply({
        content: "❌ | Erro ao salvar o stock!",
        ephemeral: true
      });
    }

    // =============================
    // 🕒 Timestamp
    // =============================
    const unix = Math.floor(Date.now() / 1000);
    const formattedDate = `<t:${unix}:f> (<t:${unix}:R>)`;

    // =============================
    // 📩 Embed no canal
    // =============================
    const embedGerado = new EmbedBuilder()
      .setTitle(
        General.get(`${interaction.guild.id}.titulo_gen`)
        || `${interaction.guild.name} | Conta gerada`
      )
      .setDescription(`Pronto ${interaction.user}, o serviço \`${service}\` foi gerado e enviado no seu privado.`)
      .setColor(General.get(`${interaction.guild.id}.cor_gen`) || "#2e2e2e")
      .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    const banner = General.get(`${interaction.guild.id}.banner_gen`) || config.get(`banner_bot`);
    if (banner) embedGerado.setImage(banner);

    await interaction.reply({ embeds: [embedGerado] });

    // =============================
    // 📥 Embed na DM
    // =============================
    const embedDM = new EmbedBuilder()
      .setTitle(
        General.get(`${interaction.guild.id}.titulo_gen`)
        || `${interaction.guild.name} | Conta gerada`
      )
      .setDescription(
        `\`\`\`${lastLine}\`\`\`\n` +
        `**${Emojis.get(`_transfer_emoji`)} Serviço:** ${service}\n` +
        `**${Emojis.get(`date_emoji`)} Data:** ${formattedDate}\n` +
        `**${Emojis.get(`usuario2`)} Autor:** ${interaction.user}`
      )
      .setThumbnail(config.get(`thumbnail_bot`) || interaction.guild.iconURL())
      .setColor(General.get(`${interaction.guild.id}.cor_gen`) || "#2e2e2e")
      .setFooter({ text: `Clique no botão abaixo para copiar` });

    if (banner) embedDM.setImage(banner);

    const botoes = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("copiarconta")
        .setLabel("Copiar Conta")
        .setEmoji("1381349625994154024")
        .setStyle(1)
    );

    let dm;
    try {
      dm = await interaction.user.send({ embeds: [embedDM], components: [botoes] });
    } catch {
      return interaction.followUp({
        content: "⚠️ | Não consegui enviar sua DM. Verifique se ela está aberta!",
        ephemeral: true
      });
    }

    // =============================
    // 🎛️ Coletor de botões
    // =============================
    const collector = dm.createMessageComponentCollector({ time: 60000 });

    collector.on("collect", async i => {
      if (i.customId === "copiarconta") {
        await i.reply({ content: lastLine, ephemeral: true });
      }
    });
  }
};
