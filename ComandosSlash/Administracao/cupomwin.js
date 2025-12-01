const Discord = require("discord.js");
const { PermissionFlagsBits, ApplicationCommandType } = require("discord.js");
const { Emojis } = require("../../DataBaseJson");

module.exports = {
  name: "set_cupom",
  description: "[🤖] Envia um cupom de desconto",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      name: "user",
      description: "Usuário que receberá o cupom",
      type: Discord.ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: "cupom",
      description: "Código do cupom",
      type: Discord.ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "canal",
      description: "Canal do produto para enviar no botão",
      type: Discord.ApplicationCommandOptionType.Channel,
      required: true,
    },
  ],
  default_member_permissions: PermissionFlagsBits.Administrator,

  run: async (client, interaction) => {
    const user = interaction.options.getUser("user");
    const cupom = interaction.options.getString("cupom");
    const channel = interaction.options.getChannel("canal");

    // Verificação de permissão
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({
        content: `${Emojis.get("negative_dreamm67")} Você não tem permissão para usar este comando.`,
        ephemeral: true,
      });
    }

    // Embed
    const embed = new Discord.EmbedBuilder()
      .setColor("#8b008b")
      .setTitle("`🎉` **Parabéns! Você ganhou um cupom!** `🎉`")
      .setDescription(
        `${user}, você foi **selecionado(a)** para receber um cupom **exclusivo!** 🌟\n\n` +
        `💸 **Cupom:** \`${cupom}\`\n` +
        `Aproveite e realize sua compra agora mesmo!`
      )
      .addFields({
        name: "`📦` Válido somente para o produto:",
        value: `<#${channel.id}>`,
      })
      .setFooter({ text: "Aproveite antes que expire! 😋" })
      .setTimestamp();

    // Botão
    const row = new Discord.ActionRowBuilder().addComponents(
      new Discord.ButtonBuilder()
        .setLabel("Aproveitar Cupom!")
        .setEmoji("<:pinkglitter:1347324419210608640>")
        .setStyle(Discord.ButtonStyle.Link)
        .setURL(`https://discord.com/channels/${interaction.guild.id}/${channel.id}`)
    );

    // Enviar para o usuário
    user
      .send({ embeds: [embed], components: [row] })
      .then(() => {
        interaction.reply({
          content: `${Emojis.get("positive_dream")} Cupom enviado com sucesso para **${user.tag}**!`,
          ephemeral: true,
        });
      })
      .catch(() => {
        interaction.reply({
          content: `${Emojis.get("negative_dreamm67")} Não consegui enviar DM para **${user.tag}**. Ele pode estar com DM fechada.`,
          ephemeral: true,
        });
      });
  },
};
