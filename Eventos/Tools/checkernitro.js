const { Events, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    name: Events.InteractionCreate, // Evento que reage a interações
    async run(interaction) {
        // Verifica se é o botão correto que foi clicado
        if (interaction.isButton() && interaction.customId === 'nitrochecker') {
            // Cria o modal para inserir os links
            const modal = new ModalBuilder()
                .setCustomId('nitro_modal')
                .setTitle('Verificação de Links Nitro');

            const nitroLinksInput = new TextInputBuilder()
                .setCustomId('nitro_links')
                .setLabel('Cole os links Nitro aqui')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('Insira um link por linha');

            const firstActionRow = new ActionRowBuilder().addComponents(nitroLinksInput);
            modal.addComponents(firstActionRow);

            // Mostra o modal ao usuário
            await interaction.showModal(modal);
        }

        // Verifica se o modal foi submetido
        if (interaction.isModalSubmit() && interaction.customId === 'nitro_modal') {
            const links = interaction.fields.getTextInputValue('nitro_links').split('\n').filter(Boolean);
            const validLinks = [];
            const invalidLinks = [];

            await interaction.reply({ content: 'Verificando links...', ephemeral: true });

            for (const link of links) {
                const promoCode = link.replace('https://discord.com/billing/promotions/', '').replace('https://promos.discord.gg/', '').replace('/', '').trim();
                try {
                    const response = await fetch(`https://discord.com/api/v9/entitlements/gift-codes/${promoCode}`, {
                        headers: { 'Authorization': 'SEU_TOKEN_DISCORD' } // Seu token do Discord
                    });

                    if ([200, 204].includes(response.status)) {
                        const data = await response.json();
                        if (data.uses === data.max_uses) {
                            invalidLinks.push(link);
                        } else {
                            validLinks.push(link);
                        }
                    } else {
                        invalidLinks.push(link);
                    }
                } catch (e) {
                    invalidLinks.push(link);
                }
            }

            let resultMessage = `**Links válidos:**\n${validLinks.join('\n') || 'Nenhum link válido.'}\n\n**Links inválidos/resgatados:**\n${invalidLinks.join('\n') || 'Nenhum link inválido.'}`;

            // Envia os resultados para o privado do usuário
            await interaction.user.send(resultMessage);

            // Edita a resposta original para informar o usuário
            await interaction.editReply({ content: 'Verificação concluída. Os links foram enviados no seu privado.' });
        }
    },
};
