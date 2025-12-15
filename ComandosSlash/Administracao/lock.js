const {
    PermissionFlagsBits,
    ApplicationCommandType,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder
} = require("discord.js");

const { getPermissions } = require("../../Functions/PermissionsCache.js");
const { Emojis } = require("../../DataBaseJson");

module.exports = {
    name: "lock",
    description: "[🔒] Use para trancar o canal",
    type: ApplicationCommandType.ChatInput,
    autoDeferReply: false, // Desabilita defer automático para evitar conflito com replies diretos
    default_member_permissions: PermissionFlagsBits.Administrator,

    run: async (client, interaction) => {

        // =============================
        // 🔐 Verificar permissão personalizada
        // =============================
        const perm = await getPermissions(client.user.id);
        if (!perm || !perm.includes(interaction.user.id)) {
            return interaction.reply({
                content: `${Emojis.get(`negative_dreamm67`)} Você não tem permissão para isso.`,
                ephemeral: true
            });
        }

        // =============================
        // 🔒 Tentar trancar o canal
        // =============================
        try {
            await interaction.channel.permissionOverwrites.edit(
                interaction.guild.id,
                { SendMessages: false }
            );
        } catch (err) {
            console.error(err);
            return interaction.reply({
                content: `${Emojis.get(`negative_dreamm67`)} Erro ao tentar bloquear o canal.`,
                ephemeral: true
            });
        }

        // =============================
        // 📩 Mensagem
        // =============================
        const embed = new EmbedBuilder()
            .setDescription(`🔒 Este canal ${interaction.channel} foi **trancado** por ${interaction.user}.`)
            .setColor("#FF0000");

        const botao = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("unlockChannel")
                    .setLabel("Destrancar")
                    .setStyle(2) // Secondary
            );

        return interaction.reply({
            embeds: [embed],
            components: [botao]
        });
    }
};
