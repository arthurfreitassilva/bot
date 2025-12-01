const {
    PermissionFlagsBits,
    ApplicationCommandType,
    ActionRowBuilder,
    ButtonBuilder,
    EmbedBuilder,
    ApplicationCommandOptionType
} = require("discord.js");

const { getPermissions } = require("../../Functions/PermissionsCache.js");
const { Emojis } = require("../../DataBaseJson");

module.exports = {
    name: "arquivar_ticket",
    description: "[🎫] Use para arquivar um ticket",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "reason",
            description: "Motivo do arquivamento (opcional)",
            type: ApplicationCommandOptionType.String,
            required: false,
        },
    ],

    // Permissão padrão do comando
    default_member_permissions: PermissionFlagsBits.Administrator,

    run: async (client, interaction) => {

        const perm = await getPermissions(client.user.id);

        // Sistema de permissões internas
        if (!perm || !Array.isArray(perm) || !perm.includes(interaction.user.id)) {
            return interaction.reply({
                content: `${Emojis.get("negative_dreamm67")} Você não possui permissão para usar este comando.`,
                ephemeral: true
            });
        }

        const reason = interaction.options.getString("reason") ?? "`😫` Nenhum motivo declarado!";

        // Só funciona em threads
        if (!interaction.channel.isThread()) {
            return interaction.reply({
                content: `${Emojis.get("negative_dreamm67")} Este canal não é um ticket.`,
                ephemeral: true
            });
        }

        // Obtém ID do usuário a partir do nome da thread
        const ultimoIndice = interaction.channel.name.lastIndexOf("・");
        const userId = interaction.channel.name.slice(ultimoIndice + 1);

        // Arquiva a thread
        await interaction.channel.setArchived(true);

        // Tenta enviar DM ao usuário
        try {
            const user = await client.users.fetch(userId);
            await user.send({
                content: 
                    `Olá <@${userId}>, seu ticket foi arquivado por **${interaction.user.tag}**.\n` +
                    `**Motivo:**\n${reason}`
            });
        } catch (err) {
            // Silencia erros sem quebrar o comando
        }

        return interaction.reply({
            content: `${Emojis.get("positive_dreamm67")} Ticket arquivado com sucesso.`,
            ephemeral: true
        });
    },
};
