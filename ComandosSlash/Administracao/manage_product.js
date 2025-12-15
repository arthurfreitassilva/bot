const { PermissionFlagsBits, ApplicationCommandType } = require("discord.js");
const { GerenciarCampos } = require("../../Functions/GerenciarCampos");
const { getPermissions } = require("../../Functions/PermissionsCache.js");
const { Emojis } = require("../../DataBaseJson");

module.exports = {
  name: "gerenciar_produto",
  description: "[🤖] Use para configurar minhas funções",
  type: ApplicationCommandType.ChatInput,
  autoDeferReply: false, // Desabilita defer automático para evitar conflito com replies diretos
  options: [{ name: "product", description: "-", type: 3, required: true, autocomplete: true }],
  default_member_permissions: PermissionFlagsBits.Administrator,

  run: async (client, interaction) => {
    const perm = await getPermissions(client.user.id);
    if (perm === null || !perm.includes(interaction.user.id)) {
      return interaction.reply({ content: `${Emojis.get(`negative_dreamm67`)} Faltam permissões.`, ephemeral: true });
    }

    // Verificar se 'interaction.options._hoistedOptions[0]' está definido
    if (!interaction.options._hoistedOptions || !interaction.options._hoistedOptions[0]) {
      return interaction.reply({ content: `Nenhum item registrado em seu BOT`, ephemeral: true });
    }

    const productValue = interaction.options._hoistedOptions[0].value;

    GerenciarCampos(interaction, productValue);
  }
}
