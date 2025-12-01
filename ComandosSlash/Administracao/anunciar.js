const {
    EmbedBuilder,
    ButtonBuilder,
    ActionRowBuilder,
    ButtonStyle
} = require("discord.js");

const { getPermissions } = require("../../Functions/PermissionsCache.js");

module.exports = {
    name: "anunciar",
    description: "[🤖] Envie um anúncio no servidor.",

    run: async (client, interaction) => {

        const perm = await getPermissions(client.user.id);

        // Permissões inválidas
        if (!perm || !Array.isArray(perm) || !perm.includes(interaction.user.id)) {
            return interaction.reply({
                content: "❌️ Você não possui permissão para usar este comando.",
                ephemeral: true
            });
        }

        // Botões de escolha
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("contentanunciar24")
                .setLabel("Mensagem")
                .setStyle(ButtonStyle.Secondary),

            new ButtonBuilder()
                .setCustomId("embedanunciar24")
                .setLabel("Embed")
                .setStyle(ButtonStyle.Secondary)
        );

        // Resposta da interação
        await interaction.reply({
            content: "💬 Escolha o tipo de aviso que deseja fazer.",
            components: [row],
            ephemeral: true
        });
    },
};
