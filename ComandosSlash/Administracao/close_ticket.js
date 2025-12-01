const {
    PermissionFlagsBits,
    ApplicationCommandType
} = require("discord.js");

const { getPermissions } = require("../../Functions/PermissionsCache.js");
const { Emojis } = require("../../DataBaseJson");

module.exports = {
    name: "fechar_ticket",
    description: "[🎫] Use para fechar um ticket",
    type: ApplicationCommandType.ChatInput,

    options: [
        {
            name: "reason",
            description: "Motivo do fechamento (opcional)",
            type: 3, // String
            required: false,
        },
    ],

    default_member_permissions: PermissionFlagsBits.Administrator,

    run: async (client, interaction) => {

        // Verifica permissão pelo cache personalizado
        const perm = await getPermissions(client.user.id);

        if (!perm || !perm.includes(interaction.user.id)) {
            return interaction.reply({
                content: `${Emojis.get("negative_dreamm67")} Faltam permissões.`,
                ephemeral: true
            });
        }

        const motivo = interaction.options.getString("reason") || "Nenhum motivo declarado!";

        // Só funciona em threads
        if (!interaction.channel.isThread()) {
            return interaction.reply({
                content: `${Emojis.get("negative_dreamm67")} Esse canal não é um ticket.`,
                ephemeral: true
            });
        }

        // Extrai o ID do usuário da parte final do nome da thread
        const ultimoIndice = interaction.channel.name.lastIndexOf("・");
        const userId = interaction.channel.name.slice(ultimoIndice + 1);

        // Fecha o ticket
        await interaction.channel.delete().catch(() => {});

        // Tenta avisar o usuário no privado
        try {
            const user = await client.users.fetch(userId);
            await user.send({
                content:
                    `Olá <@${userId}>!\n` +
                    `Seu ticket foi **fechado** por ${interaction.user}.\n\n` +
                    `**Motivo:**\n${motivo}`
            });
        } catch (err) {
            // Silencia erro caso o user não permita DMs
        }
    }
};
