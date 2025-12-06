const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, ButtonStyle, TextInputStyle, InteractionType } = require("discord.js");
const { produtos, Temporario, Emojis, configuracao } = require("../../DataBaseJson");
const { QuickDB } = require("quick.db");
const { EfiBankConfiguracao } = require("../../Functions/FormasDePagamentosConfig");
const { Painel } = require("../../Functions/Painel");
const startTime = Date.now();
const maxMemory = 100;
const usedMemory = process.memoryUsage().heapUsed / 1024 / 1024;
const memoryUsagePercentage = (usedMemory / maxMemory) * 100;
const roundedPercentage = Math.min(100, Math.round(memoryUsagePercentage));

module.exports = {
    name: 'interactionCreate',

    run: async (interaction, client) => {
        try {
            if (interaction.customId === `onoffvendas`) {
                await interaction.deferUpdate(); // Defer the interaction to avoid timeout
                const status = await configuracao.get("vendasstatus") || false;
                await configuracao.set("vendasstatus", !status);

                const embed = new EmbedBuilder()
                      .setColor(configuracao.get("Cores.Principal") || "#00FFFF")
                      .setImage("https://cdn.discordapp.com/attachments/1384476805284499487/1386103909088624650/painel_de_controle_Dream-1.png?ex=68587d5c&is=68572bdc&hm=e8720b1b718b4e4b9f2204357613ad054b80805831693be8544a6bf21d65fcd8&")
                      .setTitle(`${Emojis.get(`dr`)}${Emojis.get(`ea`)}${Emojis.get(`mmm`)}`)
                      .setDescription(
                        `-# \`🏡\` Olá, **${
                          interaction.user.displayName
                        }**, gerencie o painel do seu bot eSales.`
                      )
                      .addFields(
                        { name: "Developed By", value: `\`Dream Apps\``, inline: true },
                        {
                          name: "Uptime",
                          value: `<t:${Math.ceil(startTime / 1000)}:R>`,
                          inline: true,
                        },
                        { name: "Status da Vendas", value: status ? "`🟢` Ativado" : "`🔴` Desabilitado", inline: true }, 
                        { name: "Ping", value: `\`${client.ws.ping} ms\``, inline: true },
                        { name: "Versão DPro", value: `\`5.0.5\``, inline: true },
                        { 
          name: "Cargo Cliente", 
          value: configuracao.get("ConfigRoles.cargoCliente") ? `<@&${configuracao.get("ConfigRoles.cargoCliente")}>` : "`Não configurado`", 
          inline: true 
        }
                      )
                      .setFooter({
                        text: `${interaction.guild.name} - Todos os direitos reservados.`,
                        iconURL: interaction.guild.iconURL(),
                      })
                      .setTimestamp();

                const row2 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("onoffvendas")
                            .setLabel(status ? "Desativar Loja" : "Ativar Loja")
                            .setEmoji(status ? "1383407510136029204" : "1383399544448090205")
                            .setStyle(status ? 4 : 3),
                        new ButtonBuilder()
                            .setCustomId("painelconfigvendas")
                            .setLabel('Gerenciar Marketplace')
                            .setEmoji(`<:emoji_5:1386137235627311204>`)
                            .setStyle(1),
                        new ButtonBuilder()
                            .setCustomId("painelconfigticket")
                            .setLabel("Gerenciar Atendimento")
                            .setEmoji("1386137310957015060")
                            .setStyle(1),
                    );

                const row3 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("painelpersonalizar")
                            .setLabel('Aparência & Layout')
                            .setEmoji("1379907510080634962")
                            .setStyle(2),
                        new ButtonBuilder()
                            .setCustomId("gerenciarconfigs")
                            .setLabel('Definições')
                            .setEmoji("1377455293595648061")
                            .setStyle(2),
                        new ButtonBuilder()
                            .setCustomId("ecloud")
                            .setLabel("DreamCloud")
                            .setEmoji("<:cloud:1383399698370662471>")
                            .setStyle(2),
                        new ButtonBuilder()
                            .setCustomId("configavançadas24")
                            .setLabel('Proteção')
                            .setEmoji("<:protect:1383399536008888443>")
                            .setStyle(2),
                    );

                const row4 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("eaffaawwawa")
                            .setLabel('AutoExecuções')
                            .setEmoji("1383407073022443541")
                            .setStyle(2),
                        new ButtonBuilder()
                            .setCustomId("actionsautomations")
                            .setLabel('Moderação')
                            .setEmoji("<:fechadura:1377455321806667817>")
                            .setStyle(2),

                        new ButtonBuilder().setCustomId("tools1").setLabel('Tools').setEmoji('1371605629218721892').setStyle(2),

                    );

                await interaction.editReply({
                    content: ``,
                    components: [row2, row3, row4],
                    embeds: [embed]
                });
            }

            if (interaction.type === InteractionType.ModalSubmit) {
                if (interaction.customId === `alterarcredenciais`) {
                    await interaction.deferReply({ ephemeral: true }); // Defer the modal reply
                    const clientid = interaction.fields.getTextInputValue("clientid");
                    const clientsecret = interaction.fields.getTextInputValue("clientsecret");

                    await interaction.editReply({ content: `Agora, envie o arquivo do certificado \`.p12\` como um anexo.`, embeds: [], components: [] });

                    const filter = (m) => m.author.id === interaction.user.id;
                    const collector = interaction.channel.createMessageCollector({ filter, time: 60000 });

                    collector.on('collect', async (m) => {
                        try {
                            if (m.attachments.first()) {
                                const file = m.attachments.first();
                                if (file.name.endsWith(".p12")) {
                                    const fs = require("fs");
                                    const path = require("path");
                                    const https = require("https");
                                    const axios = require("axios");

                                    await m.delete();

                                    const certificadoPath = path.join(`./Eventos/Sistema De Configuracao/${file.name}`);
                                    const response = await axios.get(file.url, { responseType: "arraybuffer" });
                                    fs.writeFileSync(certificadoPath, response.data);

                                    const certificadoBuffer = fs.readFileSync(certificadoPath);
                                    const authData = Buffer.from(`${clientid}:${clientsecret}`).toString("base64");
                                    const agent = new https.Agent({ pfx: certificadoBuffer, passphrase: "" });

                                    const tokenResponse = await axios.post(
                                        "https://pix.api.efipay.com.br/oauth/token",
                                        JSON.stringify({ grant_type: "client_credentials" }),
                                        {
                                            headers: {
                                                Authorization: `Basic ${authData}`,
                                                "Content-Type": "application/json",
                                            },
                                            httpsAgent: agent,
                                        }
                                    );
                                    const access_token = tokenResponse.data.access_token;

                                    const chavesPixResponse = await axios.get("https://pix.api.efipay.com.br/v2/gn/evp", {
                                        headers: {
                                            Authorization: `Bearer ${access_token}`,
                                            "Content-Type": "application/json",
                                        },
                                        httpsAgent: agent,
                                    });
                                    let chavepix = ``;
                                    if (chavesPixResponse.data.chaves.length < 1) {
                                        const chavesPixResponsePost = await axios.post("https://pix.api.efipay.com.br/v2/gn/evp", {}, {
                                            headers: {
                                                Authorization: `Bearer ${access_token}`,
                                                "Content-Type": "application/json",
                                            },
                                            httpsAgent: agent,
                                        });
                                        chavepix = chavesPixResponsePost.data.chaves[0];
                                    } else {
                                        chavepix = chavesPixResponse.data.chaves[0];
                                    }

                                    await configuracao.set("pagamentos.EfiAPI", {
                                        client_id: clientid,
                                        client_secret: clientsecret,
                                        chavepix: chavepix,
                                        certificado: file.name,
                                    });
                                    await configuracao.set("pagamentos.EfiOnOff", true);
                                    await configuracao.set("pagamentos.MpOnOff", false);
                                    await configuracao.set("pagamentos.MpSite", false);

                                    await interaction.editReply({
                                        content: `${Emojis.get("positive_dream")} Certificado enviado com sucesso!`,
                                        embeds: [],
                                        components: [],
                                    });
                                    await EfiBankConfiguracao(client, interaction, 1);
                                } else {
                                    await interaction.editReply({
                                        content: `${Emojis.get(`negative_dreamm67`)} O arquivo enviado não é um certificado \`.p12\`!`,
                                        embeds: [],
                                        components: []
                                    });
                                    await EfiBankConfiguracao(client, interaction, 1);
                                }
                            } else {
                                await interaction.editReply({
                                    content: `${Emojis.get(`negative_dreamm67`)} Você não enviou nenhum arquivo!`,
                                    embeds: [],
                                    components: []
                                });
                                await EfiBankConfiguracao(client, interaction, 1);
                            }
                        } catch (error) {
                            console.error("Erro:", error.message);
                            await interaction.editReply({
                                content: `${Emojis.get("negative_dreamm67")} Houve um erro ao salvar as informações, tente novamente.`,
                                embeds: [],
                                components: [],
                            });
                            setTimeout(async () => {
                                await EfiBankConfiguracao(client, interaction, 1);
                            }, 3000);
                        }
                    });
                }
            }

            if (interaction.isButton()) {
                if (interaction.customId === `efionoff`) {
                    await interaction.deferUpdate(); // Defer the interaction
                    let status = await configuracao.get("pagamentos.EfiOnOff") || false;
                    await configuracao.set("pagamentos.EfiOnOff", !status);
                    await EfiBankConfiguracao(client, interaction, 1);
                }

                if (interaction.customId === `configurarefibank`) {
                    await interaction.deferUpdate(); // Defer the interaction
                    await EfiBankConfiguracao(client, interaction, 1);
                }

                if (interaction.customId === `alterarcredenciais`) {
                    const modal = new ModalBuilder()
                        .setCustomId(`alterarcredenciais`)
                        .setTitle(`Credenciais Efi Bank`);

                    const clientid = new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId("clientid")
                            .setLabel("CLIENT ID")
                            .setPlaceholder("Client_id_XxxXxXx")
                            .setValue(`${configuracao.get("pagamentos.EfiAPI.client_id") || ""}`)
                            .setRequired(true)
                            .setStyle(TextInputStyle.Short)
                    );

                    const clientsecret = new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId("clientsecret")
                            .setLabel("CLIENT SECRET")
                            .setPlaceholder("Client_secret_XxxXxXx")
                            .setValue(`${configuracao.get("pagamentos.EfiAPI.client_secret") || ""}`)
                            .setRequired(true)
                            .setStyle(TextInputStyle.Short)
                    );

                    modal.addComponents(clientid, clientsecret);
                    await interaction.showModal(modal);
                }
            }
        } catch (error) {
            console.error("Error in interactionCreate:", error);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: `${Emojis.get("negative_dreamm67")} Ocorreu um erro ao processar sua solicitação.`,
                    ephemeral: true
                });
            }
        }
    }
};