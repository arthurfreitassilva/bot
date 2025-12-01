const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const fs = require('fs');
const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');

module.exports = {
    name: 'interactionCreate',
    async run(interaction) {
        if (!interaction.isButton()) return;

        // Verifica se o botão clicado é o "checkerproxy"
        if (interaction.customId === 'checkerproxy') {
            // Cria o modal para o formulário de envio de proxies
            const modal = new ModalBuilder()
                .setCustomId('proxyModal')
                .setTitle('Verificar Proxies');

            // Adiciona um campo de input para o usuário inserir proxies
            const proxyInput = new TextInputBuilder()
                .setCustomId('proxyInput')
                .setLabel('Insira seus proxies (um por linha)')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            // Cria uma linha de ação com o input
            const actionRow = new ActionRowBuilder().addComponents(proxyInput);
            modal.addComponents(actionRow);

            // Apresenta o modal para o usuário
            await interaction.showModal(modal);
        }

        // Quando o modal for submetido
        if (interaction.isModalSubmit() && interaction.customId === 'proxyModal') {
            const proxyData = interaction.fields.getTextInputValue('proxyInput');
            const proxies = proxyData.split('\n').filter(Boolean);

            // Salva os proxies em um arquivo temporário
            fs.writeFileSync('user_proxies.txt', proxies.join('\n'));

            // Chama a função para verificar os proxies
            checkProxies(proxies, interaction.user);
        }
    }
};

// Função que verifica os proxies e envia o resultado ao usuário
async function checkProxies(proxies, user) {
    const validProxies = [];

    const requestWithTimeout = async (proxy) => {
        const agent = new HttpsProxyAgent(`http://${proxy}`);
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000));
        const requestPromise = axios.get('https://example.com', { httpsAgent: agent });

        return Promise.race([requestPromise, timeoutPromise]);
    };

    const proxyPromises = proxies.map(async proxy => {
        try {
            await requestWithTimeout(proxy.trim());
            validProxies.push(proxy.trim());
        } catch (error) {
            // Proxy inválido, não faz nada
        }
    });

    await Promise.all(proxyPromises);

    // Salva os proxies válidos em um arquivo e envia para o usuário
    fs.writeFileSync('valid_proxies.txt', validProxies.join('\n'));
    await user.send({
        content: `Aqui estão os proxies válidos (${validProxies.length}):`,
        files: [{ attachment: 'valid_proxies.txt' }]
    });
}
