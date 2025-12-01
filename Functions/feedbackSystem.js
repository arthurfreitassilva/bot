const { EmbedBuilder, PermissionsBitField, ButtonBuilder, ButtonStyle, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { Emojis } = require("../DataBaseJson");

// Configuração de caminhos
const BASE_DIR = path.join(__dirname, '..', 'DataBaseJson');

// Mapa para armazenar mensagens originais
const messageMap = new Map();

// Funções de utilidade
async function ensureDirectoryExists(dirPath) {
    try {
        await fs.promises.mkdir(dirPath, { recursive: true });
        console.log(`✅ Diretório verificado/criado: ${dirPath}`);
        return true;
    } catch (error) {
        console.error(`❌ Erro ao criar diretório ${dirPath}:`, error);
        return false;
    }
}

async function loadConfig() {
    const configPath = path.join(BASE_DIR, 'configuracao.json');
    try {
        await ensureDirectoryExists(BASE_DIR);
        const data = fs.readFileSync(configPath, 'utf8');
        console.log('✅ Configuração carregada com sucesso');
        return JSON.parse(data);
    } catch (error) {
        console.error('❌ Erro ao carregar configuração:', error);
        return { ConfigChannels: { feedback: null }, feedbackChannelId: null };
    }
}

async function saveConfig(config) {
    const configPath = path.join(BASE_DIR, 'configuracao.json');
    try {
        await ensureDirectoryExists(BASE_DIR);
        await fs.promises.writeFile(configPath, JSON.stringify(config, null, 2), 'utf8');
        console.log('✅ Configuração salva com sucesso em:', configPath);
        return true;
    } catch (error) {
        console.error('❌ Erro ao salvar configuração:', error);
        throw error;
    }
}

async function loadProhibitedWords() {
    const wordsPath = path.join(BASE_DIR, 'palavrasproibidas.json');
    try {
        await ensureDirectoryExists(BASE_DIR);
        const data = fs.readFileSync(wordsPath, 'utf8');
        console.log('✅ Palavras proibidas carregadas com sucesso');
        return JSON.parse(data).words || [];
    } catch (error) {
        console.error('❌ Erro ao carregar palavras proibidas (pode ser arquivo novo):', error);
        return [];
    }
}

async function saveProhibitedWords(words) {
    const wordsPath = path.join(BASE_DIR, 'palavrasproibidas.json');
    try {
        await ensureDirectoryExists(BASE_DIR);
        await fs.promises.writeFile(wordsPath, JSON.stringify({ words }, null, 2), 'utf8');
        console.log('✅ Palavras proibidas salvas com sucesso em:', wordsPath);
        return true;
    } catch (error) {
        console.error('❌ Erro ao salvar palavras proibidas (detalhes):', error);
        throw error;
    }
}

async function createFeedbackPanel(interaction, message = null, prohibitedWords = []) {
    try {
        const setProhibitedWordsButton = new ButtonBuilder()
            .setCustomId('setProhibitedWords')
            .setLabel('Palavras Proibidas')
            .setEmoji("1312115815130071163")
            .setStyle(ButtonStyle.Primary);

        const setFeedbackChannelButton = new ButtonBuilder()
            .setCustomId('setFeedbackChannel')
            .setLabel('Definir Canal de Feedback')
            .setEmoji("1378763416302391408")
            .setStyle(ButtonStyle.Secondary);

        const backButton = new ButtonBuilder()
            .setCustomId('voltarautomaticos')
            .setLabel('Voltar')
            .setEmoji("1309962730433941614")
            .setStyle(ButtonStyle.Danger);

        const row1 = new ActionRowBuilder().addComponents(setProhibitedWordsButton, setFeedbackChannelButton, backButton);

        const config = await loadConfig();
        const feedbackChannel = config.feedbackChannelId ? `<#${config.feedbackChannelId}>` : 'Não definido';
        const wordsList = prohibitedWords.length > 0 ? `\nPalavras proibidas configuradas: ${prohibitedWords.join(', ')}` : '';

        const embed = new EmbedBuilder()
            .setColor('#2F3136')
            .setTitle('Configuração de Feedbacks Negativos')
            .setDescription(`-# > **Aqui você pode configurar o sistema de feedbacks negativos, que consiste em detectar as palavras/apelidos configuradas, e avisar aos administradores dos feedbacks potencialmente negativos, e dar a oportunidade de apagar e administrar a mensagem!**\n\-# \`\🔧\`Canal atual: __${feedbackChannel}${wordsList}__`)
            .setFooter({ text: 'Sistema de Feedback' });

        // Verificar se a mensagem é válida antes de tentar editá-la
        if (message) {
            try {
                // Tentar buscar a mensagem para confirmar sua existência
                const channel = await interaction.client.channels.fetch(message.channelId);
                const fetchedMessage = await channel.messages.fetch(message.id).catch(() => null);
                if (fetchedMessage) {
                    await message.edit({
                        embeds: [embed],
                        components: [row1]
                    });
                    return; // Sucesso, não precisa de mais respostas
                }
            } catch (editError) {
                console.error('❌ Falha ao editar mensagem existente:', editError);
            }
        }

        // Fallback: atualizar a interação atual
        if (interaction.deferred) {
            await interaction.editReply({
                embeds: [embed],
                components: [row1],
                content: null
            });
        } else if (!interaction.replied) {
            await interaction.update({
                embeds: [embed],
                components: [row1],
                content: null
            });
        } else {
            console.warn('⚠️ Interação já respondida, não será atualizada novamente.');
        }
    } catch (error) {
        console.error('❌ Erro ao criar painel de feedback:', error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: '❌ Erro ao criar o painel de feedback. Tente novamente.',
                flags: MessageFlags.Ephemeral
            }).catch(console.error);
        } else if (interaction.deferred) {
            await interaction.editReply({
                content: '❌ Erro ao criar o painel de feedback. Tente novamente.',
                flags: MessageFlags.Ephemeral
            }).catch(console.error);
        }
    }
}

async function handleButtonInteraction(interaction, client) {
    try {
        if (interaction.customId === 'setProhibitedWords') {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                return await interaction.reply({
                    content: '❌ Você precisa ser administrador para usar esta função!',
                    flags: MessageFlags.Ephemeral
                });
            }

            const modal = new ModalBuilder()
                .setCustomId(`prohibitedWordsModal_${interaction.message.id}`)
                .setTitle('Definir Palavras Proibidas');

            const wordsInput = new TextInputBuilder()
                .setCustomId('prohibitedWordsInput')
                .setLabel('Palavras (separadas por vírgula)')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('exemplo1, exemplo2, exemplo3')
                .setRequired(true);

            const row = new ActionRowBuilder().addComponents(wordsInput);
            modal.addComponents(row);

            messageMap.set(`prohibitedWordsModal_${interaction.message.id}`, interaction.message);
            await interaction.showModal(modal);
        } else if (interaction.customId === 'setFeedbackChannel') {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                return await interaction.reply({
                    content: '❌ Você precisa ser administrador para usar esta função!',
                    flags: MessageFlags.Ephemeral
                });
            }

            const modal = new ModalBuilder()
                .setCustomId(`feedbackChannelModal_${interaction.message.id}`)
                .setTitle('Definir Canal de Feedback');

            const channelInput = new TextInputBuilder()
                .setCustomId('feedbackChannelInput')
                .setLabel('ID do Canal de Feedback')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Digite o ID do canal')
                .setRequired(true);

            const row = new ActionRowBuilder().addComponents(channelInput);
            modal.addComponents(row);

            messageMap.set(`feedbackChannelModal_${interaction.message.id}`, interaction.message);
            await interaction.showModal(modal);
        } else if (interaction.customId === 'deleteMessage') {
            if (interaction.message.deletable) {
                await interaction.message.delete();
                await interaction.reply({
                    content: `${Emojis.get('positive_dream')} Mensagem apagada com sucesso!`,
                    flags: MessageFlags.Ephemeral
                });
            } else {
                await interaction.reply({
                    content: `${Emojis.get('negative_dreamm67')} Não tenho permissão para apagar esta mensagem!`,
                    flags: MessageFlags.Ephemeral
                });
            }
        } else if (interaction.customId === 'goToChannel') {
            const config = await loadConfig();
            const feedbackChannelId = config.feedbackChannelId;
            if (feedbackChannelId) {
                const guildId = interaction.guildId;
                const channelLink = `[Ir para o Canal](https://discord.com/channels/${guildId}/${feedbackChannelId})`;
                await interaction.reply({
                    content: `\`\🔗\` ${channelLink}`,
                    flags: MessageFlags.Ephemeral
                });
            } else {
                await interaction.reply({
                    content: `${Emojis.get('negative_dreamm67')} Canal de feedback não configurado!`,
                    flags: MessageFlags.Ephemeral
                });
            }
        } else if (interaction.customId === 'notnegative_dreamm67') {
            await interaction.reply({
                content: `${Emojis.get('positive_dream')} Esta mensagem foi marcada como não negativa!`,
                flags: MessageFlags.Ephemeral
            });
        } else if (interaction.customId.startsWith('adminDeleteMessage_')) {
            const messageId = interaction.customId.split('_')[1];
            const embed = interaction.message.embeds[0];
            if (!embed) {
                await interaction.update({
                    content: `${Emojis.get('negative_dreamm67')} Embed não encontrada!`,
                    embeds: [],
                    components: []
                });
                return;
            }
            const channelMatch = embed.description.match(/<#(\d+)>/);
            const channelId = channelMatch ? channelMatch[1] : null;

            console.log('Channel ID:', channelId, 'Message ID:', messageId);

            if (channelId && messageId) {
                try {
                    const channel = await client.channels.fetch(channelId);
                    if (!channel) {
                        await interaction.update({
                            content: `${Emojis.get('negative_dreamm67')} Canal não encontrado!`,
                            embeds: [],
                            components: []
                        });
                        return;
                    }
                    const targetMessage = await channel.messages.fetch(messageId).catch(() => null);
                    if (targetMessage && targetMessage.deletable) {
                        await targetMessage.delete();
                        await interaction.update({
                            content: `${Emojis.get('positive_dream')} Mensagem original apagada com sucesso!`,
                            embeds: [],
                            components: []
                        });
                    } else {
                        await interaction.update({
                            content: `${Emojis.get('negative_dreamm67')} Não tenho permissão ou a mensagem não existe!`,
                            embeds: [],
                            components: []
                        });
                    }
                } catch (error) {
                    console.error('Erro ao deletar mensagem:', error);
                    await interaction.update({
                        content: `${Emojis.get('negative_dreamm67')} Erro ao tentar apagar a mensagem original!`,
                        embeds: [],
                        components: []
                    });
                }
            } else {
                await interaction.update({
                    content: `${Emojis.get('negative_dreamm67')} Não foi possível identificar o canal ou a mensagem!`,
                    embeds: [],
                    components: []
                });
            }
        } else if (interaction.customId.startsWith('adminNotnegative_dreamm67_')) {
            const messageId = interaction.customId.split('_')[1];
            await interaction.update({
                content: `${Emojis.get('positive_dream')} Mensagem ${messageId} marcada como não negativa!`,
                embeds: [],
                components: []
            });
        } else if (interaction.customId.startsWith('adminGoToChannel_')) {
            // Mantido para compatibilidade com notificações antigas
            const config = await loadConfig();
            const feedbackChannelId = config.feedbackChannelId;
            if (feedbackChannelId) {
                const guildId = interaction.guildId;
                const channelLink = `[Ir para o Canal](https://discord.com/channels/${guildId}/${feedbackChannelId})`;
                await interaction.update({
                    content: `\`\🔗\` ${channelLink}`,
                    embeds: [],
                    components: []
                });
            } else {
                await interaction.update({
                    content: `${Emojis.get('negative_dreamm67')} Canal de feedback não configurado!`,
                    embeds: [],
                    components: []
                });
            }
        }
    } catch (error) {
        console.error('❌ Erro na interação de botão:', error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: '⚠️ Ocorreu um erro ao processar sua solicitação.',
                flags: MessageFlags.Ephemeral
            }).catch(console.error);
        }
    }
}

async function handleModalSubmit(interaction, client) {
    try {
        console.log(`📝 Modal submetido: ${interaction.customId}`);

        if (interaction.customId.startsWith('prohibitedWordsModal_')) {
            console.log('Processando palavras proibidas...');
            const wordsInput = interaction.fields.getTextInputValue('prohibitedWordsInput');
            console.log('Palavras recebidas:', wordsInput);
            const wordsArray = wordsInput.split(',')
                .map(word => word.trim().toLowerCase())
                .filter(word => word.length > 0);

            if (wordsArray.length === 0) {
                console.log('Nenhuma palavra válida fornecida');
                await interaction.reply({
                    content: '❌ Nenhuma palavra válida fornecida!',
                    flags: MessageFlags.Ephemeral
                });
                return;
            }

            console.log('Tentando salvar palavras:', wordsArray);
            await saveProhibitedWords(wordsArray);
            console.log('Palavras salvas com sucesso');

            const originalMessageId = interaction.customId.split('_')[1];
            const originalMessage = messageMap.get(interaction.customId);

            // Atualizar o painel de feedback
            await createFeedbackPanel(interaction, originalMessage, wordsArray);
            messageMap.delete(interaction.customId);

            // Responder ao modal (apenas uma vez)
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: `${Emojis.get('positive_dream')} ${wordsArray.length} palavras proibidas salvas com sucesso!`,
                    flags: MessageFlags.Ephemeral
                });
            }
        } else if (interaction.customId.startsWith('feedbackChannelModal_')) {
            console.log('Processando ID do canal de feedback...');
            const channelId = interaction.fields.getTextInputValue('feedbackChannelInput').trim();

            // Validar se o ID é um número válido
            if (!/^\d+$/.test(channelId)) {
                await interaction.reply({
                    content: '❌ ID do canal inválido! Digite apenas números.',
                    flags: MessageFlags.Ephemeral
                });
                return;
            }

            // Verificar se o canal existe
            try {
                await client.channels.fetch(channelId);
            } catch (error) {
                await interaction.reply({
                    content: '❌ Canal não encontrado! Verifique o ID e tente novamente.',
                    flags: MessageFlags.Ephemeral
                });
                return;
            }

            // Carregar configuração atual
            const config = await loadConfig();
            config.feedbackChannelId = channelId;
            config.ConfigChannels.feedback = channelId; // Sincronizar com ConfigChannels.feedback

            // Salvar configuração
            await saveConfig(config);
            console.log('ID do canal salvo com sucesso');

            const originalMessageId = interaction.customId.split('_')[1];
            const originalMessage = messageMap.get(interaction.customId);
            const prohibitedWords = await loadProhibitedWords();

            // Atualizar o painel de feedback
            await createFeedbackPanel(interaction, originalMessage, prohibitedWords);
            messageMap.delete(interaction.customId);

            // Responder ao modal (apenas uma vez)
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: `${Emojis.get('positive_dream')} Canal de feedback configurado com sucesso!`,
                    flags: MessageFlags.Ephemeral
                });
            }
        }
    } catch (error) {
        console.error('❌ Erro crítico no modal (detalhes):', error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                content: '⚠️ Ocorreu um erro inesperado. Por favor, tente novamente.',
                flags: MessageFlags.Ephemeral
            }).catch(console.error);
        }
    }
}

async function monitorFeedbacks(message, client) {
    if (message.author.bot) return;

    const config = await loadConfig();
    if (!config.feedbackChannelId || message.channel.id !== config.feedbackChannelId) return;

    const prohibitedWords = await loadProhibitedWords();
    const content = message.content.toLowerCase();
    const foundWords = prohibitedWords.filter(word => content.includes(word));

    if (foundWords.length > 0) {
        // Buscar cargos com permissão de Administrador
        const adminRoles = message.guild.roles.cache.filter(role =>
            role.permissions.has(PermissionsBitField.Flags.Administrator)
        );

        // Coletar membros com esses cargos, evitando duplicatas
        const adminMembers = new Set();
        for (const role of adminRoles.values()) {
            const members = await message.guild.members.fetch()
                .then(members => members.filter(m => m.roles.cache.has(role.id) && !m.user.bot));
            members.forEach(member => adminMembers.add(member));
        }

        console.log(`📢 Notificando ${adminMembers.size} administradores sobre feedback negativo.`);

        // Criar botões de ação
        const adminDeleteButton = new ButtonBuilder()
            .setCustomId(`adminDeleteMessage_${message.id}`)
            .setLabel('Apagar Mensagem')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji("1320235731959939143");

        const adminNotnegative_dreamm67Button = new ButtonBuilder()
            .setCustomId(`adminNotnegative_dreamm67_${message.id}`)
            .setLabel('Não Negativa')
            .setStyle(ButtonStyle.Success)
            .setEmoji("1312119323262980148");

        const adminGoToChannelButton = new ButtonBuilder()
            .setLabel('Ir para o Canal')
            .setStyle(ButtonStyle.Link)
            .setURL(`https://discord.com/channels/${message.guildId}/${config.feedbackChannelId}`);

        const row = new ActionRowBuilder().addComponents(adminDeleteButton, adminNotnegative_dreamm67Button, adminGoToChannelButton);

        // Criar embed de notificação
        const embed = new EmbedBuilder()
            .setColor('#313838')
            .setTitle('Feedback Negativo Detectado')
            .setThumbnail("https://previews.123rf.com/images/davizro/davizro1907/davizro190700031/128789377-hand-taking-a-negative_dreamm67-assessment-represented-with-face-clippings-with-different-expressions.jpg")
            .setDescription(`\`\📲\` Mensagem em __${message.channel.toString()}__\n-# **Olá, foi detectado que algum usuário/cliente enviou uma avaliação negativa, pedimos para que você veja e administre a avaliação potencialmente negativa!**`)
            .addFields(
                { name: '`👤` Autor', value: message.author.toString(), inline: true },
                { name: '`🛑` Palavras detectadas', value: foundWords.join(', '), inline: true },
                { name: '`📡` Conteúdo', value: message.content.slice(0, 1000), inline: true },
            )
            .setTimestamp();

        // Notificar cada administrador
        let notifiedCount = 0;
        for (const admin of adminMembers) {
            try {
                await admin.send({ embeds: [embed], components: [row] });
                notifiedCount++;
            } catch (error) {
                console.error(`❌ Não foi possível notificar ${admin.user.tag}:`, error);
            }
        }
        console.log(`✅ ${notifiedCount} de ${adminMembers.size} administradores notificados com sucesso.`);
    }
}

module.exports = {
    handleButtonInteraction,
    createFeedbackPanel,
    handleModalSubmit,
    monitorFeedbacks
};