const {
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    PermissionsBitField,
    EmbedBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require("discord.js");

const fetch = require("node-fetch");

// =======================================================================
//  PAINEL DE AJUDA
// =======================================================================

async function createHelpPanel(interaction) {
    try {
        await interaction.deferUpdate();

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("notifyDevs")
                .setLabel("Notificar Developers")
                .setEmoji("1306695413100838983")
                .setStyle(ButtonStyle.Secondary)
        );

        const embed = new EmbedBuilder()
            .setColor("#2F3136")
            .setAuthor({
                name: "Painel de Ajuda - Suflay",
                iconURL:
                    "https://cdn.discordapp.com/attachments/1378358712992927744/1378542873087311984/image.png"
            })
            .setThumbnail("https://cdn.discordapp.com/emojis/1350325127371558975.webp")
            .setImage("https://cdn.discordapp.com/attachments/1378796348404400269/1378812735533613176/image_5.png")
            .setDescription(
                "> Envie uma notificação aos desenvolvedores:\n-# `📡` Use o botão abaixo."
            );

        await interaction.editReply({
            embeds: [embed],
            components: [row],
            ephemeral: true
        });
    } catch (error) {
        console.error("Erro ao criar painel de ajuda:", error);
    }
}

// =======================================================================
//  INTERAÇÃO DE BOTÕES
// =======================================================================

async function handleButtonInteraction(interaction, client) {
    try {
        switch (interaction.customId) {
            case "ajudasuflay":
                return createHelpPanel(interaction);

            case "notifyDevs":
                return handleNotifyButton(interaction);

            default:
                break;
        }
    } catch (error) {
        console.error("Erro ao processar interação de botão:", error);
        safeReply(interaction, "-# Ocorreu um erro ao processar sua ação.");
    }
}

// Função separada para manter o código limpo
async function handleNotifyButton(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return interaction.update({
            content: "-# Você precisa ser **Administrador** para usar essa função!",
            embeds: [],
            components: [],
            ephemeral: true
        });
    }

    const modal = new ModalBuilder()
        .setCustomId("notifyDevsModal")
        .setTitle("Notificar Desenvolvedores");

    const messageInput = new TextInputBuilder()
        .setCustomId("devMessageInput")
        .setLabel("Digite sua mensagem")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(messageInput));

    await interaction.showModal(modal);
}

// =======================================================================
//  MODAL — ENVIO PARA OS DESENVOLVEDORES
// =======================================================================

async function handleModalSubmit(interaction) {
    try {
        if (interaction.customId !== "notifyDevsModal") return;

        await interaction.deferReply({ ephemeral: true });

        const message = interaction.fields.getTextInputValue("devMessageInput");

        const embed = new EmbedBuilder()
            .setColor("#FF0000")
            .setAuthor({
                name: "Notificação de Usuário",
                iconURL: interaction.user.displayAvatarURL()
            })
            .setDescription(
                `> \`📡\` Mensagem enviada por **${interaction.user.tag}** no servidor **${interaction.guild.name}**:\n\n${message}`
            )
            .addFields(
                { name: "`🆔` Usuário ID", value: interaction.user.id },
                {
                    name: "`📅` Data/Hora",
                    value: new Date().toLocaleString("pt-BR", {
                        timeZone: "America/Sao_Paulo"
                    })
                }
            )
            .setFooter({
                text: "Sistema de Notificação | DreamPro!",
                iconURL:
                    "https://cdn.discordapp.com/avatars/1362091002239782912/f451048f2149bf4d9c0a78b7cff37442.webp"
            })
            .setTimestamp();

        await fetch(
            "https://discord.com/api/webhooks/1379965759190466631/8afFo4Prdyl5F0JmColyaBy9tqZgjnF9En4z83_o5BgCE5y4IyPa3RJzL1d6jVjFp2D2",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ embeds: [embed.toJSON()] })
            }
        );

        await interaction.editReply({
            content: "-# Mensagem enviada aos desenvolvedores com sucesso!",
            ephemeral: true
        });
    } catch (error) {
        console.error("Erro ao enviar notificação:", error);
        safeEdit(interaction, "-# Ocorreu um erro ao enviar a mensagem.");
    }
}

// =======================================================================
//  FUNÇÕES DE RESPOSTA SEGURA
// =======================================================================

async function safeReply(interaction, content) {
    if (!interaction.replied && !interaction.deferred)
        return interaction.reply({ content, ephemeral: true });
}

async function safeEdit(interaction, content) {
    try {
        await interaction.editReply({ content, ephemeral: true });
    } catch {}
}

// =======================================================================

module.exports = {
    createHelpPanel,
    handleButtonInteraction,
    handleModalSubmit
};
