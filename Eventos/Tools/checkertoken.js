const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const fs = require('fs');
const axios = require('axios');

module.exports = {
    name: 'interactionCreate',
    async run(interaction) {
        try {
            // Verifica se a interação é um botão e se a customId corresponde ao 'checkertoken'
            if (interaction.isButton() && interaction.customId === 'checkertoken') {
                const modal = new ModalBuilder()
                    .setCustomId('tokenModal')
                    .setTitle('Verificação de Tokens');

                const tokensInput = new TextInputBuilder()
                    .setCustomId('tokensInput')
                    .setLabel('Insira os tokens (1 por linha)')
                    .setStyle(TextInputStyle.Paragraph);

                const actionRow = new ActionRowBuilder().addComponents(tokensInput);
                modal.addComponents(actionRow);

                // Exibe o modal para o usuário
                await interaction.showModal(modal);
            }

            // Verifica se a interação é um submit de modal e se a customId corresponde ao 'tokenModal'
            if (interaction.isModalSubmit() && interaction.customId === 'tokenModal') {
                // Deferir a resposta para evitar o erro de interação desconhecida
                await interaction.deferReply({ ephemeral: true });

                const tokens = interaction.fields.getTextInputValue('tokensInput')
                    .split('\n')
                    .map(token => token.trim())
                    .filter(token => token); // Remove tokens vazios

                if (tokens.length === 0) {
                    await interaction.editReply({ content: 'Nenhum token foi fornecido.', ephemeral: true });
                    return;
                }

                let tokensValidos = [];
                let tokensInvalidos = [];

                // Realiza a verificação dos tokens de forma assíncrona usando Promise.all
                const resultados = await Promise.all(tokens.map(token => verificarToken(token)));

                resultados.forEach(resultado => {
                    if (resultado.status === 'válido') {
                        tokensValidos.push(resultado.token);
                    } else {
                        tokensInvalidos.push(resultado.token);
                    }
                });

                // Cria o arquivo com os tokens válidos
                const validFilePath = './tokens_validos.txt';
                fs.writeFileSync(validFilePath, tokensValidos.join('\n'));

                // Tenta enviar o arquivo dos tokens válidos para o usuário em mensagem privada
                try {
                    if (tokensValidos.length > 0) {
                        await interaction.user.send({
                            content: `Foram encontrados ${tokensValidos.length} token(s) válido(s):`,
                            files: [validFilePath]
                        });
                    } else {
                        await interaction.user.send('Nenhum token válido foi encontrado.');
                    }
                } catch (error) {
                    console.error('Erro ao enviar mensagem privada:', error);
                    await interaction.editReply({
                        content: 'Não foi possível enviar uma mensagem privada com os tokens válidos. Verifique suas configurações de privacidade.',
                        ephemeral: true
                    });
                    return;
                }

                // Responde no canal público informando que a verificação foi concluída
                await interaction.editReply({
                    content: `Verificação de tokens concluída! Verifique suas mensagens privadas. (${tokensValidos.length} válido(s), ${tokensInvalidos.length} inválido(s))`,
                    ephemeral: true
                });
            }
        } catch (error) {
            console.error('Erro ao processar interação:', error);
            // Garante que o erro seja respondido ao usuário, se possível
            if (!interaction.deferred && !interaction.replied) {
                await interaction.reply({
                    content: 'Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.',
                    ephemeral: true
                }).catch(err => console.error('Erro ao responder com mensagem de erro:', err));
            } else if (interaction.deferred) {
                await interaction.editReply({
                    content: 'Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.',
                    ephemeral: true
                }).catch(err => console.error('Erro ao editar resposta com mensagem de erro:', err));
            }
        }
    }
};

// Função de verificação de token
async function verificarToken(token) {
    try {
        const response = await axios.get('https://discord.com/api/v9/users/@me', {
            headers: { 'Authorization': token }
        });

        if (response.status === 200) {
            const dados = response.data;
            const premium_type = dados.premium_type || 0;
            const username = dados.username || 'Desconhecido';
            const verified = dados.verified ? 'Sim' : 'Não';
            const mfa_enabled = dados.mfa_enabled ? 'Habilitado' : 'Desabilitado';

            let premiumTipo = 'Nenhum';
            if (premium_type === 1) premiumTipo = 'Nitro Basic';
            if (premium_type === 2) premiumTipo = 'Nitro Gaming';

            return {
                status: 'válido',
                token: token,
                username,
                verificado: verified,
                mfa: mfa_enabled,
                premium: premiumTipo
            };
        }
    } catch (error) {
        return { status: 'inválido', token };
    }
}