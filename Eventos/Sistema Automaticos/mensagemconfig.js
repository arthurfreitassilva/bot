const { 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle,
    MessageFlags,
    ButtonStyle
} = require("discord.js");
const fs = require('fs');
const path = require('path');
const mensagemPach = path.resolve(__dirname, '../../DataBaseJson/msgauto.json');
const { configuracao } = require('../../DataBaseJson');

module.exports = {
    name: 'interactionCreate',
    run: async (interaction, client) => {
        try {
            if (interaction.isButton()) {
                if (interaction.customId === 'configmsgauto') {
                    await updateConfigEmbed(interaction, client);
                } else if (interaction.customId === 'addConfig') {
                    const row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('selectEmbed')
                                .setLabel('Embed')
                                .setStyle(ButtonStyle.Primary),
                            new ButtonBuilder()
                                .setCustomId('selectMessage')
                                .setLabel('Mensagem')
                                .setStyle(ButtonStyle.Primary)
                        );
                    
                    // Adicionando verificação se a interação ainda está disponível
                    if (interaction.deferred || interaction.replied) {
                        await interaction.editReply({ 
                            content: 'Escolha o tipo de configuração:', 
                            components: [row], 
                            ephemeral: true 
                        });
                    } else {
                        await interaction.reply({ 
                            content: 'Escolha o tipo de configuração:', 
                            components: [row], 
                            ephemeral: true 
                        });
                    }
                } else if (interaction.customId === 'selectEmbed') {
                    const modal = new ModalBuilder()
                        .setCustomId('embedModal')
                        .setTitle('Configurar Embed');

                    // Configuração dos campos do modal (mantido igual ao anterior)
                    const titleInput = new TextInputBuilder()
                        .setCustomId('titleInput')
                        .setLabel('Título')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true);

                    const descriptionInput = new TextInputBuilder()
                        .setCustomId('descriptionInput')
                        .setLabel('Descrição (máx. 500 caracteres)')
                        .setStyle(TextInputStyle.Paragraph)
                        .setMaxLength(500)
                        .setRequired(true);

                    const thumbnailInput = new TextInputBuilder()
                        .setCustomId('thumbnailInput')
                        .setLabel('URL do Thumbnail (opcional)')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(false);

                    const bannerInput = new TextInputBuilder()
                        .setCustomId('bannerInput')
                        .setLabel('URL do Banner (opcional)')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(false);

                    const iconInput = new TextInputBuilder()
                        .setCustomId('iconInput')
                        .setLabel('URL do Ícone (opcional)')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(false);

                    const footerInput = new TextInputBuilder()
                        .setCustomId('footerInput')
                        .setLabel('Footer (opcional)')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(false);

                    const chatIdsInput = new TextInputBuilder()
                        .setCustomId('chatIdsInput')
                        .setLabel('IDs dos Chats (separados)')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true);

                    const timeInputs = new TextInputBuilder()
                        .setCustomId('timeInputs')
                        .setLabel('Tempos (Deletar/Repostar em seg, separados)')
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder('ex.: 30, 60')
                        .setRequired(true);

                    modal.addComponents(
                        new ActionRowBuilder().addComponents(titleInput),
                        new ActionRowBuilder().addComponents(descriptionInput),
                        new ActionRowBuilder().addComponents(thumbnailInput),
                        new ActionRowBuilder().addComponents(bannerInput),
                        new ActionRowBuilder().addComponents(iconInput),
                        new ActionRowBuilder().addComponents(footerInput),
                        new ActionRowBuilder().addComponents(chatIdsInput),
                        new ActionRowBuilder().addComponents(timeInputs)
                    );

                    await interaction.showModal(modal);
                } else if (interaction.customId.startsWith('deleteConfig_')) {
                    const idToDelete = parseInt(interaction.customId.split('_')[1], 10);

                    if (isNaN(idToDelete)) {
                        return await handleInteractionResponse(interaction, { 
                            content: 'ID inválido.', 
                            ephemeral: true 
                        });
                    }

                    let msgData = [];
                    if (fs.existsSync(mensagemPach)) {
                        try {
                            msgData = JSON.parse(fs.readFileSync(mensagemPach));
                            if (!Array.isArray(msgData)) {
                                console.error('O conteúdo do arquivo não é um array');
                                msgData = [];
                            }
                        } catch (error) {
                            console.error('Erro ao ler ou parsear o arquivo:', error);
                            msgData = [];
                        }
                    }

                    msgData = msgData.filter(data => data.id !== idToDelete);

                    fs.writeFileSync(mensagemPach, JSON.stringify(msgData, null, 2));

                    await updateConfigEmbed(interaction, client);
                }
            }

            if (interaction.isModalSubmit()) {
                if (interaction.customId === 'embedModal') {
                    // Responder imediatamente para evitar timeout
                    await handleInteractionResponse(interaction, { 
                        content: 'Processando sua configuração...', 
                        ephemeral: true 
                    });

                    const title = interaction.fields.getTextInputValue('titleInput');
                    const description = interaction.fields.getTextInputValue('descriptionInput');
                    const thumbnail = interaction.fields.getTextInputValue('thumbnailInput') || null;
                    const banner = interaction.fields.getTextInputValue('bannerInput') || null;
                    const icon = interaction.fields.getTextInputValue('iconInput') || null;
                    const footer = interaction.fields.getTextInputValue('footerInput') || null;
                    const chatIds = interaction.fields.getTextInputValue('chatIdsInput').split(',').map(id => id.trim());
                    const [deleteTime, repostTime] = interaction.fields.getTextInputValue('timeInputs').split(',').map(t => parseInt(t.trim(), 10));

                    if (isNaN(deleteTime) || isNaN(repostTime)) {
                        return await handleInteractionResponse(interaction, { 
                            content: 'Os tempos devem ser números válidos.', 
                            ephemeral: true 
                        });
                    }

                    let msgData = [];
                    if (fs.existsSync(mensagemPach)) {
                        try {
                            msgData = JSON.parse(fs.readFileSync(mensagemPach));
                            if (!Array.isArray(msgData)) {
                                console.error('O conteúdo do arquivo não é um array');
                                msgData = [];
                            }
                        } catch (error) {
                            console.error('Erro ao ler ou parsear o arquivo:', error);
                            msgData = [];
                        }
                    }

                    msgData.push({
                        id: msgData.length + 1,
                        type: 'embed',
                        title: title,
                        description: description,
                        thumbnail: thumbnail,
                        banner: banner,
                        icon: icon,
                        footer: footer,
                        chatIds: chatIds,
                        deleteTime: deleteTime,
                        repostTime: repostTime
                    });

                    fs.writeFileSync(mensagemPach, JSON.stringify(msgData, null, 2));

                    await updateConfigEmbed(interaction, client);
                } else if (interaction.customId === 'messageModal') {
                    // Responder imediatamente para evitar timeout
                    await handleInteractionResponse(interaction, { 
                        content: 'Processando sua configuração...', 
                        ephemeral: true 
                    });

                    const message = interaction.fields.getTextInputValue('messageInput');
                    const banner = interaction.fields.getTextInputValue('bannerInput') || null;
                    const icon = interaction.fields.getTextInputValue('iconInput') || null;
                    const chatIds = interaction.fields.getTextInputValue('chatIdsInput').split(',').map(id => id.trim());
                    const [deleteTime, repostTime] = interaction.fields.getTextInputValue('timeInputs').split(',').map(t => parseInt(t.trim(), 10));

                    if (isNaN(deleteTime) || isNaN(repostTime)) {
                        return await handleInteractionResponse(interaction, { 
                            content: 'Os tempos devem ser números válidos.', 
                            ephemeral: true 
                        });
                    }

                    let msgData = [];
                    if (fs.existsSync(mensagemPach)) {
                        try {
                            msgData = JSON.parse(fs.readFileSync(mensagemPach));
                            if (!Array.isArray(msgData)) {
                                console.error('O conteúdo do arquivo não é um array');
                                msgData = [];
                            }
                        } catch (error) {
                            console.error('Erro ao ler ou parsear o arquivo:', error);
                            msgData = [];
                        }
                    }

                    msgData.push({
                        id: msgData.length + 1,
                        type: 'message',
                        message: message,
                        banner: banner,
                        icon: icon,
                        chatIds: chatIds,
                        deleteTime: deleteTime,
                        repostTime: repostTime
                    });

                    fs.writeFileSync(mensagemPach, JSON.stringify(msgData, null, 2));

                    await updateConfigEmbed(interaction, client);
                }
            }
        } catch (error) {
            console.error('Erro no interactionCreate:', error);
        }
    }
};

async function updateConfigEmbed(interaction, client) {
    try {
        let msgData = [];
        if (fs.existsSync(mensagemPach)) {
            try {
                msgData = JSON.parse(fs.readFileSync(mensagemPach));
                if (!Array.isArray(msgData)) {
                    console.error('O conteúdo do arquivo não é um array');
                    msgData = [];
                }
            } catch (error) {
                console.error('Erro ao ler ou parsear o arquivo:', error);
                msgData = [];
            }
        }

        const embed = new EmbedBuilder()
            .setTitle('Configurações de Mensagens Automáticas')
            .setColor(configuracao.get('Cores.Principal') || '0cd4cc');

        if (msgData.length === 0) {
            embed.setDescription('Nenhuma configuração de mensagem automática encontrada.');
        } else {
            msgData.forEach(data => {
                const fields = [
                    { name: 'ID', value: data.id.toString(), inline: true },
                    { name: 'Tipo', value: data.type, inline: true }
                ];
                if (data.type === 'embed') {
                    fields.push({ name: 'Título', value: data.title || 'N/A', inline: true });
                    fields.push({ name: 'Descrição', value: data.description || 'N/A', inline: true });
                    if (data.thumbnail) fields.push({ name: 'Thumbnail', value: data.thumbnail, inline: true });
                    if (data.banner) fields.push({ name: 'Banner', value: data.banner, inline: true });
                    if (data.icon) fields.push({ name: 'Ícone', value: data.icon, inline: true });
                    if (data.footer) fields.push({ name: 'Footer', value: data.footer, inline: true });
                } else if (data.type === 'message') {
                    fields.push({ name: 'Mensagem', value: data.message, inline: true });
                    if (data.banner) fields.push({ name: 'Banner', value: data.banner, inline: true });
                    if (data.icon) fields.push({ name: 'Ícone', value: data.icon, inline: true });
                }
                fields.push({ name: 'IDs dos Chats', value: data.chatIds.join(', '), inline: true });
                fields.push({ name: 'Tempo para Deletar (s)', value: data.deleteTime.toString(), inline: true });
                fields.push({ name: 'Tempo para Repostar (s)', value: data.repostTime.toString(), inline: true });

                embed.addFields(fields);
            });
        }

        // Criar botões de ação
        const actionRow1 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('addConfig')
                    .setLabel('Adicionar Configuração')
                    .setEmoji('1236318155056349224')
                    .setStyle(ButtonStyle.Primary)
            );

        // Criar botões de deletar em linhas separadas (máximo 5 por linha)
        const deleteButtonsRows = [];
        const maxButtonsPerRow = 5;
        
        for (let i = 0; i < msgData.length; i += maxButtonsPerRow) {
            const row = new ActionRowBuilder();
            const chunk = msgData.slice(i, i + maxButtonsPerRow);
            
            chunk.forEach(data => {
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`deleteConfig_${data.id}`)
                        .setLabel(`Deletar ${data.id}`)
                        .setEmoji('1178076767567757312')
                        .setStyle(ButtonStyle.Danger)
                );
            });
            
            deleteButtonsRows.push(row);
        }

        const actionRowBack = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('voltarautomaticos')
                    .setLabel('Voltar')
                    .setEmoji('1178068047202893869')
                    .setStyle(ButtonStyle.Secondary)
            );

        // Juntar todos os componentes
        const components = [actionRow1];
        if (deleteButtonsRows.length > 0) {
            components.push(...deleteButtonsRows);
        }
        components.push(actionRowBack);

        await handleInteractionResponse(interaction, { 
            content: '', 
            embeds: [embed], 
            components: components,
            ephemeral: true 
        });
    } catch (error) {
        console.error('Erro no updateConfigEmbed:', error);
    }
}

// Função auxiliar para lidar com respostas de interação
async function handleInteractionResponse(interaction, options) {
    try {
        if (interaction.deferred || interaction.replied) {
            return await interaction.editReply(options);
        } else {
            return await interaction.reply(options);
        }
    } catch (error) {
        console.error('Erro ao responder à interação:', error);
        // Tentar enviar uma mensagem de fallback se possível
        if (interaction.channel && !interaction.ephemeral) {
            try {
                await interaction.channel.send({
                    content: 'Ocorreu um erro ao processar sua interação. Por favor, tente novamente.',
                    ephemeral: true
                });
            } catch (channelError) {
                console.error('Erro ao enviar mensagem de fallback:', channelError);
            }
        }
    }
}