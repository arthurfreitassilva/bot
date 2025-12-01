const { ApplicationCommandType, InteractionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, Events } = require("discord.js");
const fs = require("fs");
const path = require("path");
const { owner, url, clientid, secret, webhook_logs, role, guild_id } = require("../DataBaseJson/configauth.json");
const { JsonDatabase } = require("wio.db");
const { produtos, configuracao, Emojis } = require("../DataBaseJson");
const users = new JsonDatabase({ databasePath: "./DataBaseJson/users.json" });
const axios = require("axios");
const config = require("../config.json");
const DiscordOauth2 = require("discord-oauth2");
const oauth = new DiscordOauth2();

async function ecloud(interaction, client) {
    const cargoVerificado = interaction.guild.roles.cache.get(role);
    const botMention = clientid ? `<@${clientid}>` : `${Emojis.get(`member_remove_emoji`)} Nenhum bot Vinculado`;

    const all = await users.all().filter(a => a.data.username);
    const uri = oauth.generateAuthUrl({
        clientId: clientid,
        clientSecret: secret,
        scope: ["identify", "guilds.join"],
        redirectUri: `${url}/auth/callback`
    });

    const embed = new EmbedBuilder()
        .setTitle(`${Emojis.get(`ecloud`)} — Painel de Config eCloud`)
        .setColor(`${configuracao.get('Cores.Principal') || '0cd4cc'}`)
        .setDescription(`A sincronização está ativada com sucesso, garantindo que todos os membros autenticados sejam continuamente salvos e atualizados na nuvem do seu eCloud Drive, com total segurança, criptografia avançada e acesso em tempo real — tudo de forma automática para que você não precise se preocupar com nada.`)
        .addFields(
            {
                name: `${Emojis.get(`_text_emoji`)}Seu Bot Auth02`,
                value: botMention,
                inline: true,
            },
            {
                name: `${Emojis.get(`permissions_emoji`)}Membros Auth02`,
                value: `\`${all.length}\``,
                inline: true,
            },
            {
                name: `${Emojis.get(`member_verified_emoji`)}Cargo de Verificado`,
                value: cargoVerificado ? `${cargoVerificado}` : `\`Não Definido\``,
                inline: true
            }
        );

    const row2 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("mensagem_auth02")
                .setLabel('Mensagem Auth02')
                .setEmoji(`${Emojis.get(`_lapis_emoji`)}`)
                .setDisabled(false)
                .setStyle(1),
            new ButtonBuilder()
                .setCustomId("logauth")
                .setLabel('Definir WebHocks de Logs')
                .setEmoji(`${Emojis.get(`_rigth_emoji`)}`)
                .setStyle(2),
            new ButtonBuilder()
                .setCustomId("recuperarmembroauth")
                .setLabel('Recuperar Membros')
                .setEmoji(`${Emojis.get(`_change_emoji`)}`)
                .setDisabled(false)
                .setStyle(3)
        );

    const row3 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("configauth")
                .setLabel('Configurar Bot OAuth2')
                .setEmoji(`${Emojis.get(`_settings_emoji`)}`)
                .setStyle(2),
            new ButtonBuilder()
                .setCustomId("acoestu21")
                .setLabel('Psyche eCloud OAuth02 Actions')
                .setEmoji(`${Emojis.get(`ecloud`)}`)
                .setStyle(1)
        );

    const row4 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("voltar1")
                .setEmoji(`1178068047202893869`)
                .setLabel('Voltar')
                .setStyle(2)
        );

    // Single interactionCreate handler
    client.on("interactionCreate", async interaction => {
        try {
            // Handle button interactions
            if (interaction.isButton()) {
                if (interaction.customId === "mensagem_auth02") {
                    const modal = new ModalBuilder()
                        .setCustomId('mensagem_auth02_modal')
                        .setTitle('Mensagem Auth02');

                    const canalInput = new TextInputBuilder()
                        .setCustomId('canal_id_input')
                        .setLabel('ID do canal onde deseja enviar a mensagem:')
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder('Ex: 123456789012345678')
                        .setRequired(true);

                    modal.addComponents(new ActionRowBuilder().addComponents(canalInput));

                    await interaction.showModal(modal); // Show modal immediately
                }

                if (interaction.customId === "logauth") {
                    const modal = new ModalBuilder()
                        .setCustomId('formulario_webhook')
                        .setTitle('Atualizar Webhook de Logs');

                    const webhookInput = new TextInputBuilder()
                        .setCustomId('webhook_url')
                        .setLabel('Cole aqui a nova URL do Webhook:')
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder('https://discord.com/api/webhooks/...')
                        .setRequired(true);

                    const firstActionRow = new ActionRowBuilder().addComponents(webhookInput);
                    modal.addComponents(firstActionRow);

                    await interaction.showModal(modal);
                }

                if (interaction.customId === "recuperarmembroauth") {
                    const modal = new ModalBuilder()
                        .setCustomId("modal_recuperar_membroauth")
                        .setTitle("🔁 Recuperar Membros");

                    const input = new TextInputBuilder()
                        .setCustomId("quantidade_puxar")
                        .setLabel("Quantos membros você deseja puxar?")
                        .setPlaceholder("Ex: 10")
                        .setRequired(true)
                        .setStyle(TextInputStyle.Short);

                    const row = new ActionRowBuilder().addComponents(input);
                    modal.addComponents(row);

                    await interaction.showModal(modal);
                }

                if (interaction.customId === "acoestu21") {
                    const configPath = path.resolve(__dirname, '../DataBaseJson/configauth.json');
                    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                    const { obrigatorioverify } = config;

                    const statusVerificacao = obrigatorioverify === "true" ? "\`🟢 Habilitado\`" : "\`🔴 Desabilitado\`";

                    const embed = new EmbedBuilder()
                        .setTitle(`${Emojis.get(`ecloud`)} Açoes Avançadas - Ecloud`)
                        .setAuthor({ name: "Açoes Avançadas - Ecloud", iconURL: 'https://cdn.discordapp.com/emojis/1269773226960093184.png?size=2048' })
                        .setDescription(`-# seja bem vindo ao painel de açoes avançadas ecloud, aqui voce podera configurar diversas açoes avançadas do seu ecloud ( caso a verificaçao obrigatoria estiver ativada, apenas quem for verificado ira conseguir abrir carrinhos e fazer compras)`)
                        .addFields(
                            { name: 'Status Verificaçao Obrigatoria', value: `${statusVerificacao}`, inline: true },
                            { name: 'Cargo Necessario para pode fazer compras', value: cargoVerificado ? `${cargoVerificado}` : `\`Não Definido\``, inline: true }
                        )
                        .setColor("#2F3136");

                    const botaoVerificar = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId("toggle_verificacao")
                            .setLabel(obrigatorioverify === "true" ? "Desabilitar Verificaçao Obrigatoria" : "Habilitar Verificaçao Obrigatoria")
                            .setStyle(obrigatorioverify === "true" ? 4 : 3)
                            .setEmoji(`${Emojis.get(`_change_emoji`)}`),
                        new ButtonBuilder()
                            .setCustomId("Linkverify2")
                            .setLabel("Alterar Link de Verificaçao")
                            .setStyle(1)
                            .setEmoji(`😁`)
                    );

                    await interaction.reply({
                        embeds: [embed],
                        components: [botaoVerificar],
                        ephemeral: true
                    });
                }

                if (interaction.customId === "toggle_verificacao") {
                    const configPath = path.resolve(__dirname, '../DataBaseJson/configauth.json');
                    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                    const novoValor = config.obrigatorioverify === "true" ? "false" : "true";
                    config.obrigatorioverify = novoValor;

                    fs.writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');

                    const statusVerificacao = novoValor === "true" ? "✅ Ativada" : "❌ Desativada";

                    const novaEmbed = new EmbedBuilder()
                        .setTitle(`${Emojis.get(`ecloud`)} Açoes Avançadas - Ecloud`)
                        .setAuthor({ name: "Açoes Avançadas - Ecloud", iconURL: 'https://cdn.discordapp.com/emojis/1269773226960093184.png?size=2048' })
                        .setDescription(`-# seja bem vindo ao painel de açoes avançadas ecloud, aqui voce podera configurar diversas açoes avançadas do seu ecloud ( caso a verificaçao obrigatoria estiver ativada, apenas quem for verificado ira conseguir abrir carrinhos e fazer compras)`)
                        .addFields(
                            { name: 'Status Verificaçao Obrigatoria', value: `${statusVerificacao}`, inline: true },
                            { name: 'Cargo Necessario para pode fazer compras', value: cargoVerificado ? `${cargoVerificado}` : `\`Não Definido\``, inline: true }
                        )
                        .setColor("#2F3136");

                    const novoBotao = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId("toggle_verificacao")
                            .setLabel(novoValor === "true" ? "Desabilitar Verificaçao Obrigatoria" : "Habilitar Verificaçao Obrigatoria")
                            .setStyle(novoValor === "true" ? 4 : 3)
                            .setEmoji(`${Emojis.get(`_fixe_emoji`)}`),
                        new ButtonBuilder()
                            .setCustomId("Linkverify2")
                            .setLabel("Alterar Link de Verificaçao")
                            .setStyle(1)
                            .setEmoji(`${Emojis.get(`_change_emoji`)}`)
                    );

                    await interaction.update({
                        embeds: [novaEmbed],
                        components: [novoBotao]
                    });

                    await interaction.followUp({
                        content: `${Emojis.get(`checker`)} A verificação obrigatória foi **${novoValor === "true" ? "ativada com sucesso" : "desativada com sucesso"}**.`,
                        ephemeral: true
                    });
                }

                if (interaction.customId === "Linkverify2") {
                    const modal = new ModalBuilder()
                        .setCustomId("modalSetVerifyLink")
                        .setTitle("Definir Link de Verificação");

                    const input = new TextInputBuilder()
                        .setCustomId("verifyLinkInput")
                        .setLabel("Cole aqui o link de verificação")
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true);

                    const row = new ActionRowBuilder().addComponents(input);
                    modal.addComponents(row);

                    await interaction.showModal(modal);
                }

                if (interaction.customId === "continuar_verificacao") {
                    const link = `${uri}`;
                    const botaoLink = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setLabel('Clique aqui para se Verificar')
                            .setURL(link)
                            .setStyle(5) // Link
                    );

                    await interaction.reply({
                        content: 'Clique abaixo para continuar sua verificação:',
                        components: [botaoLink],
                        ephemeral: true
                    });
                }
            }

            // Handle modal submissions
            if (interaction.isModalSubmit()) {
                if (interaction.customId === 'mensagem_auth02_modal') {
                    const canalId = interaction.fields.getTextInputValue('canal_id_input');
                    await interaction.reply({ content: `✅ Canal definido: <#${canalId}>\nAgora digite a mensagem que deseja enviar no chat. Você tem 5 minutos.`, ephemeral: true });

                    const filter = m => m.author.id === interaction.user.id;
                    const collector = interaction.channel.createMessageCollector({ filter, time: 5 * 60 * 1000, max: 1 });

                    collector.on('collect', async msg => {
                        const mensagem = msg.content;
                        const canal = interaction.guild.channels.cache.get(canalId);

                        if (!canal || !canal.isTextBased()) {
                            await interaction.followUp({ content: '❌ O ID do canal é inválido ou não é um canal de texto.', ephemeral: true });
                            return;
                        }

                        const botaoVerifiqueSe = new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setCustomId('continuar_verificacao')
                                .setLabel("Verifique-se")
                                .setEmoji(`${Emojis.get(`_confirm_emoji`)}`)
                                .setStyle(1) // Botão azul
                        );

                        await canal.send({ content: mensagem, components: [botaoVerifiqueSe] });
                        await interaction.followUp({ content: '✅ Mensagem enviada com sucesso com botão de verificação!', ephemeral: true });
                    });

                    collector.on('end', collected => {
                        if (collected.size === 0) {
                            interaction.followUp({ content: '⏰ Tempo esgotado! Nenhuma mensagem foi digitada.', ephemeral: true });
                        }
                    });
                }

                if (interaction.customId === 'formulario_webhook') {
                    const newUrl = interaction.fields.getTextInputValue('webhook_url');
                    const configPath = path.join(__dirname, '../DataBaseJson/configauth.json');

                    try {
                        const config = require(configPath);
                        config.webhook_logs = newUrl;
                        fs.writeFileSync(configPath, JSON.stringify(config, null, 4));

                        await interaction.reply({
                            content: `${Emojis.get(`checker`)} Webhook de Logs atualizado com sucesso! Reinicie o bot para aplicar as configurações.`,
                            ephemeral: true
                        });
                    } catch (error) {
                        console.error("Erro ao atualizar os logs:", error);
                        await interaction.reply({
                            content: `${Emojis.get(`negative_dreamm67`)} Ocorreu um erro ao atualizar o webhook.`,
                            ephemeral: true
                        });
                    }
                }

                if (interaction.customId === "modal_recuperar_membroauth") {
                    await interaction.deferReply({ ephemeral: true });

                    const quantidade = parseInt(interaction.fields.getTextInputValue("quantidade_puxar"));
                    if (isNaN(quantidade) || quantidade <= 0) {
                        return interaction.editReply("❌ Por favor, insira uma quantidade válida de membros.");
                    }

                    await interaction.editReply(`${Emojis.get(`loading_dreamapps`)} Recuperando **${quantidade}** membros. Aguarde...`);

                    const servidorId = interaction.guild.id;
                    const usersPath = path.join(__dirname, "../DataBaseJson/users.json");

                    if (!fs.existsSync(usersPath)) {
                        return interaction.editReply("❌ Arquivo de usuários não encontrado.");
                    }

                    let usersData;
                    try {
                        usersData = JSON.parse(fs.readFileSync(usersPath, "utf-8"));
                    } catch (err) {
                        return interaction.editReply("❌ Erro ao ler os dados dos usuários.");
                    }

                    const clientid = client?.application?.id || (await client.application?.fetch())?.id;
                    const redirectUri = `${url}/auth/callback`;

                    const guild = client.guilds.cache.get(servidorId);
                    if (!guild) return interaction.editReply(`${Emojis.get(`negative_dreamm67`)} Servidor com ID \`${servidorId}\` não encontrado.`);

                    const allUsers = Object.entries(usersData)
                        .filter(([, u]) => u.username && u.accessToken)
                        .slice(0, quantidade);

                    let success = 0;
                    let error = 0;

                    for (const [userId, userData] of allUsers) {
                        try {
                            await oauth.addMember({
                                accessToken: userData.accessToken,
                                botToken: client.token,
                                guildId: servidorId,
                                userId: userId,
                                nickname: userData.username,
                                roles: [],
                                mute: false,
                                deaf: false,
                            });

                            success++;

                            const renewed = await renewUserToken(userId, userData.refreshToken, userData.code);
                            if (!renewed) console.log(`❌ Falha ao renovar token de ${userId}`);
                        } catch (err) {
                            console.log(`Erro ao adicionar ${userId}:`, err?.response?.data || err.message);
                            error++;
                        }
                    }

                    await interaction.editReply({ content: `${Emojis.get(`checker`)} Foram puxados ${success} membros com sucesso!`, embeds: [] });

                    async function renewUserToken(userId, refreshToken, code) {
                        try {
                            const response = await axios.post(
                                'https://discord.com/api/oauth2/token',
                                new URLSearchParams({
                                    client_id: clientid,
                                    client_secret: secret,
                                    grant_type: 'refresh_token',
                                    refresh_token: refreshToken,
                                    redirect_uri: redirectUri,
                                    scope: 'identify'
                                }).toString(),
                                {
                                    headers: {
                                        'Content-Type': 'application/x-www-form-urlencoded'
                                    }
                                }
                            );

                            const { access_token, refresh_token } = response.data;
                            usersData[userId].accessToken = access_token;
                            usersData[userId].refreshToken = refresh_token;

                            fs.writeFileSync(usersPath, JSON.stringify(usersData, null, 2));
                            return true;
                        } catch (err) {
                            console.log("Erro ao renovar token:", err?.response?.data || err.message);
                            return false;
                        }
                    }
                }

                if (interaction.customId === "modalSetVerifyLink") {
                    const newLink = interaction.fields.getTextInputValue("verifyLinkInput");
                    const configPath = path.join(__dirname, "../DataBaseJson/configauth.json");

                    try {
                        const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
                        config.linkverifybot = newLink;
                        fs.writeFileSync(configPath, JSON.stringify(config, null, 4));

                        await interaction.reply({
                            content: "✅ | Link de verificação salvo com sucesso!",
                            ephemeral: true
                        });
                    } catch (error) {
                        console.error("Erro ao salvar o link:", error);
                        await interaction.reply({
                            content: "❌ | Ocorreu um erro ao tentar salvar o link.",
                            ephemeral: true
                        });
                    }
                }
            }
        } catch (error) {
            console.error("Erro ao processar interação:", error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: "❌ Ocorreu um erro ao processar a interação. Tente novamente.", ephemeral: true });
            }
        }
    }, { once: false }); // Ensure this listener is only added once

    await interaction.update({ content: ``, embeds: [embed], ephemeral: true, components: [row2, row3, row4] });
}

module.exports = {
    ecloud
};