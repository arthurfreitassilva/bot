const {
    ApplicationCommandType,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionsBitField
} = require("discord.js");
const { Emojis } = require("../../DataBaseJson");

module.exports = {
    name: "deletealltickets",
    description: "[🎫] Deleta todos os tickets",
    type: ApplicationCommandType.ChatInput,

    run: async (client, interaction) => {

        // Verificação de permissões
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: `${Emojis.get("negative_dreamm67")} Você não possui permissão para usar este comando.`,
                ephemeral: true
            });
        }

        // Botões
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("delete")
                .setLabel("Deletar")
                .setStyle(ButtonStyle.Danger),

            new ButtonBuilder()
                .setCustomId("cancel")
                .setLabel("Cancelar")
                .setStyle(ButtonStyle.Secondary)
        );

        // Mensagem inicial
        const reply = await interaction.reply({
            content: `⚠️ Deseja realmente deletar **todos os tickets**?`,
            components: [row],
            ephemeral: true,
            fetchReply: true
        });

        // Filtro de botões
        const filter = i =>
            ["delete", "cancel"].includes(i.customId) &&
            i.user.id === interaction.user.id;

        const collector = reply.createMessageComponentCollector({
            filter,
            time: 60000
        });

        collector.on("collect", async i => {

            // Cancelar
            if (i.customId === "cancel") {
                return i.update({
                    content: `${Emojis.get("positive_dream")} Ação cancelada.`,
                    components: []
                });
            }

            // Deletar
            if (i.customId === "delete") {
                await i.update({
                    content: `${Emojis.get("loading_dreamapps")} Deletando todos os tickets...`,
                    components: []
                });

                // Buscar threads
                const allThreads = await interaction.guild.channels.fetchActiveThreads();
                let count = 0;

                for (const thread of allThreads.threads.values()) {
                    // Ignorar threads que possuem "🛒" no nome
                    if (!thread.name.includes("🛒")) {
                        try {
                            await thread.delete();
                            count++;
                        } catch (err) {
                            console.log(`Erro ao deletar o thread: ${thread.id}`, err);
                        }
                    }
                }

                // Embed final
                const embed = new EmbedBuilder()
                    .setTitle("Tickets Deletados")
                    .setDescription(
                        `${Emojis.get("positive_dream")} Foram deletados **${count}** tickets com sucesso.`
                    )
                    .setColor("#00FF00")
                    .setFooter({ text: interaction.guild.name })
                    .setTimestamp();

                return interaction.editReply({ content: "", embeds: [embed] });
            }
        });

        // Caso o usuário não clique em nada
        collector.on("end", collected => {
            if (collected.size === 0) {
                interaction.editReply({
                    content: "⏱ | Tempo esgotado. Ação cancelada.",
                    components: []
                });
            }
        });
    }
};
