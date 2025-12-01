const { ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const fs = require('fs').promises;
const path = require('path');

// Função para garantir que o diretório existe
async function ensureDirectoryExists(dirPath) {
    try {
        if (!await fs.access(dirPath).then(() => true).catch(() => false)) {
            await fs.mkdir(dirPath, { recursive: true });
        }
    } catch (error) {
        console.error(`Erro ao criar diretório ${dirPath}: ${error}`);
    }
}

// Função para carregar configurações do JSON
async function loadConfig() {
    const configPath = './DataBaseJson/configuracao.json';
    try {
        await ensureDirectoryExists(path.dirname(configPath));
        const data = await fs.readFile(configPath, 'utf8').catch(() => '{}');
        return JSON.parse(data) || { email: "", vendasstatus: false, Repostagem: { Status: false }, feedbackChannelId: null, termsEnabled: false, termsText: "" };
    } catch (error) {
        console.error(`Erro ao carregar configuracao.json: ${error}`);
        return { email: "", vendasstatus: false, Repostagem: { Status: false }, feedbackChannelId: null, termsEnabled: false, termsText: "" };
    }
}

// Função para salvar configurações no JSON
async function saveConfig(config) {
    const configPath = './DataBaseJson/configuracao.json';
    try {
        await ensureDirectoryExists(path.dirname(configPath));
        await fs.writeFile(configPath, JSON.stringify(config, null, 2));
    } catch (error) {
        console.error(`Erro ao salvar configuracao.json: ${error}`);
        throw new Error('Falha ao salvar configurações');
    }
}

module.exports = {
    name: "interactionCreate",
    run: async (interaction, client) => {
        const { customId } = interaction;
        if (!interaction.isButton() && !interaction.isModalSubmit()) return;
        if (!customId) return;

        // Painel de configuração dos Termos de Serviço
        if (customId === `${interaction.user.id}_discohookconfig`) {
            const config = await loadConfig();
            const termsEnabled = config.termsEnabled || false;

            const toggleButton = new ButtonBuilder()
                .setCustomId('toggleTerms')
                .setLabel(termsEnabled ? 'Desativar Termos' : 'Ativar Termos')
                .setEmoji("1349986862495694909")
                .setStyle(termsEnabled ? ButtonStyle.Danger : ButtonStyle.Success);

            const setTermsButton = new ButtonBuilder()
                .setCustomId('setTerms')
                .setLabel('Configurar Termos')
                .setEmoji("1338239575583232070")
                .setStyle(ButtonStyle.Primary);

            const backButton = new ButtonBuilder()
                .setCustomId("painelconfigvendas")
                .setLabel('Voltar')
                .setEmoji('1178068047202893869')
                .setStyle(ButtonStyle.Secondary);

            const row = new ActionRowBuilder()
                .addComponents(toggleButton, setTermsButton, backButton);

            const embed = new EmbedBuilder()
                .setAuthor({ name: 'Configuração de Termos de Serviço', iconURL: 'https://cdn.discordapp.com/icons/1315546098223419413/a_3cac8b5c3212b16c23a656b016723bd9.gif?size=2048' })
                .setDescription('> Configure os Termos de Serviço para o servidor.')
                .setColor("#313838")
                .setThumbnail('https://cdn.discordapp.com/emojis/1200049577877835787.png?size=2048')
                .addFields([
                    { name: '> `📊` Status', value: termsEnabled ? '`🟢 Ativado`' : '`🔴 Desativado`' },
                    { name: '> `📖` Termos Atuais', value: config.termsText || 'Nenhum termo configurado.' }
                ])
                .setFooter({ text: 'Sistema de Termos de Serviço', iconURL: 'https://cdn.discordapp.com/emojis/1248300571522371686.png?size=2048' });

            await interaction.update({
                embeds: [embed],
                components: [row],
                ephemeral: true
            });
        }

        // Ativar/Desativar Termos
        if (customId === 'toggleTerms') {
            const config = await loadConfig();
            config.termsEnabled = !config.termsEnabled;
            await saveConfig(config);

            const toggleButton = new ButtonBuilder()
                .setCustomId('toggleTerms')
                .setLabel(config.termsEnabled ? 'Desativar Termos' : 'Ativar Termos')
                .setEmoji("1383399544448090205")
                .setStyle(config.termsEnabled ? ButtonStyle.Danger : ButtonStyle.Success);

            const setTermsButton = new ButtonBuilder()
                .setCustomId('setTerms')
                .setLabel('Configurar Termos')
                .setEmoji("1338239575583232070")
                .setStyle(ButtonStyle.Primary);

            const backButton = new ButtonBuilder()
                .setCustomId("painelconfigvendas")
                .setLabel('Voltar')
                .setEmoji('1178068047202893869')
                .setStyle(ButtonStyle.Secondary);

            const row = new ActionRowBuilder()
                .addComponents(toggleButton, setTermsButton, backButton);

            const embed = new EmbedBuilder()
                .setAuthor({ name: 'Configuração de Termos de Serviço', iconURL: 'https://cdn.discordapp.com/emojis/990284971384111204.png?size=2048' })
                .setDescription('> Configure os Termos de Serviço para o servidor.')
                .setColor("#313838")
                .setThumbnail('https://cdn.discordapp.com/emojis/1200049577877835787.png?size=2048')
                .addFields([
                    { name: '> `📊` Status', value: config.termsEnabled ? '`🟢` Ativado' : '`🔴` Desativado' },
                    { name: '> `📖` Termos Atuais', value: config.termsText || 'Nenhum termo configurado.' }
                ])
                .setFooter({ text: 'Sistema de Termos de Serviço', iconURL: 'https://cdn.discordapp.com/emojis/1248300571522371686.png?size=2048' });

            await interaction.update({
                embeds: [embed],
                components: [row],
                ephemeral: true
            });
        }

        // Abrir modal para configurar os Termos
        if (customId === 'setTerms') {
            const modal = new ModalBuilder()
                .setCustomId('termsModal')
                .setTitle('Configurar Termos de Serviço');

            const termsInput = new TextInputBuilder()
                .setCustomId('termsText')
                .setLabel('Digite os Termos de Serviço')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('Digite aqui os termos de serviço do servidor...')
                .setRequired(true);

            const actionRow = new ActionRowBuilder().addComponents(termsInput);
            modal.addComponents(actionRow);

            await interaction.showModal(modal);
        }

        // Processar o modal de configuração dos Termos
        if (customId === 'termsModal') {
            const termsText = interaction.fields.getTextInputValue('termsText');
            const config = await loadConfig();
            config.termsText = termsText;
            await saveConfig(config);

            const termsEnabled = config.termsEnabled || false;

            const toggleButton = new ButtonBuilder()
                .setCustomId('toggleTerms')
                .setLabel(termsEnabled ? 'Desativar Termos' : 'Ativar Termos')
                .setEmoji("1349986862495694909")
                .setStyle(termsEnabled ? ButtonStyle.Danger : ButtonStyle.Success);

            const setTermsButton = new ButtonBuilder()
                .setCustomId('setTerms')
                .setLabel('Configurar Termos')
                .setEmoji("1338239575583232070")
                .setStyle(ButtonStyle.Primary);

            const backButton = new ButtonBuilder()
                .setCustomId("painelconfigvendas")
                .setLabel('Voltar')
                .setEmoji('1178068047202893869')
                .setStyle(ButtonStyle.Secondary);

            const row = new ActionRowBuilder()
                .addComponents(toggleButton, setTermsButton, backButton);

            const embed = new EmbedBuilder()
                .setAuthor({ name: 'Configuração de Termos de Serviço', iconURL: 'https://cdn.discordapp.com/emojis/990284971384111204.png?size=2048' })
                .setDescription('> Configure os Termos de Serviço para o servidor.')
                .setColor("#313838")
                .setThumbnail('https://cdn.discordapp.com/emojis/1200049577877835787.png?size=2048')
                .addFields([
                    { name: '> `📊` Status', value: termsEnabled ? '`🟢` Ativado' : '`🔴` Desativado' },
                    { name: '> `📖` Termos Atuais', value: termsText || 'Nenhum termo configurado.' }
                ])
                .setFooter({ text: 'Sistema de Termos de Serviço', iconURL: 'https://cdn.discordapp.com/emojis/1248300571522371686.png?size=2048' });

            await interaction.update({
                embeds: [embed],
                components: [row],
                ephemeral: true
            });
        }

        // Botão de aceitação dos Termos de Serviço
        if (customId === 'acceptTerms') {
            const userId = interaction.user.id;
            const acceptanceData = {
                userId: userId,
                acceptedAt: new Date().toISOString()
            };

            // Salvar aceitação do usuário
            const termsAcceptedPath = './DataBaseJson/termosaceitos.json';
            let acceptedUsers = [];
            try {
                await ensureDirectoryExists(path.dirname(termsAcceptedPath));
                const data = await fs.readFile(termsAcceptedPath, 'utf8').catch(() => '[]');
                acceptedUsers = JSON.parse(data);
            } catch (error) {
                console.error(`Erro ao carregar termosaceitos.json: ${error}`);
            }

            if (!acceptedUsers.some(user => user.userId === userId)) {
                acceptedUsers.push(acceptanceData);
                try {
                    await fs.writeFile(termsAcceptedPath, JSON.stringify(acceptedUsers, null, 2));
                } catch (error) {
                    console.error(`Erro ao salvar termosaceitos.json: ${error}`);
                    await interaction.update({
                        content: `${Emojis.get('negative_dreamm67')} Erro ao salvar sua aceitação. Tente novamente.`,
                        embeds: [],
                        components: [],
                        ephemeral: true
                    });
                    return;
                }
            }

            // Após aceitar, prosseguir com a criação do carrinho
            try {
                // Ajustado para ../../Functions/ para subir dois níveis
                const { CreateCarrinho } = require("../../Functions/CreateCarrinho");
                const infos = interaction.client.tempCartInfos; // Dados temporários do carrinho
                await CreateCarrinho(interaction, infos);
            } catch (error) {
                console.error(`Erro ao carregar CreateCarrinho: ${error}`);
                await interaction.update({
                    content: `${Emojis.get('negative_dreamm67')} Erro ao processar o carrinho. O módulo CreateCarrinho não foi encontrado. Verifique o caminho do arquivo.`,
                    embeds: [],
                    components: [],
                    ephemeral: true
                });
            }
        }
    }
};