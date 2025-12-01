const {
    PermissionFlagsBits,
    ApplicationCommandType,
    ActionRowBuilder,
    ButtonBuilder,
} = require("discord.js");

const { pedidos, pagamentos, carrinhos, configuracao, produtos, Temporario, BackupStorage } = require("../../DataBaseJson");
const { Emojis } = require("../../DataBaseJson");

module.exports = {
    name: "realizar_backup",
    description: "[🤖 Moderação] Guild backup options.",
    type: ApplicationCommandType.ChatInput,
    default_member_permissions: PermissionFlagsBits.Administrator,
    run: async (client, interaction) => {

        await interaction.reply({
            content: `${Emojis.get("loading_dreamapps")} Aguarde...`,
            ephemeral: true
        });

        // Somente o dono do servidor pode usar
        if (interaction.guild.ownerId !== interaction.user.id) {
            return interaction.editReply({
                content: `${Emojis.get("negative_dreamm67")} Apenas o dono do servidor pode usar este comando.`,
                ephemeral: true
            });
        }

        // Chama a função principal
        BackupFunction(interaction);
    }
};

async function BackupFunction(interaction) {

    // Verificação mais segura para presença de backups
    const backupList = (() => {
        try { return BackupStorage?.fetchAll?.() || []; }
        catch { return []; }
    })();

    const hasBackup = Array.isArray(backupList) && backupList.length > 0;

    const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("restaurarservidor")
            .setLabel("Restaurar servidor")
            .setEmoji(Emojis.get("_transfer_emoji"))
            .setStyle(3)
            .setDisabled(!hasBackup),

        new ButtonBuilder()
            .setCustomId("salvartemplate")
            .setLabel("Salvar template")
            .setEmoji(Emojis.get("_mail_emoji"))
            .setStyle(2)
    );

    const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("sincronizardados")
            .setLabel("Sincronizar")
            .setEmoji(Emojis.get("_change_emoji"))
            .setStyle(1),

        new ButtonBuilder()
            .setCustomId("apagarbackup")
            .setLabel("Apagar Backup")
            .setEmoji(Emojis.get("_trash_emoji"))
            .setStyle(4)
            .setDisabled(!hasBackup)
    );

    await interaction.editReply({
        content: "",
        components: [row1, row2],
        ephemeral: true
    });
}
