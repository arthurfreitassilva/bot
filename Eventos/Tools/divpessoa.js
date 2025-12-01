const { ModalBuilder, TextInputBuilder, ActionRowBuilder } = require("discord.js");
const { Client } = require('discord.js-selfbot-v13');

module.exports = {
    name: "interactionCreate",
    run: async (interaction) => {
        const { customId, user } = interaction;
        if (!customId) return;

        // Modifiquei as customId para novos valores
        if (customId === "messagePanel") {
            const modal = new ModalBuilder()
                .setCustomId(`messagePanelModal`)
                .setTitle("Enviar mensagem para todos os servidores!");

            const mensagem = new TextInputBuilder()
                .setCustomId("messageContent")
                .setLabel("Coloque a mensagem para divulgar")
                .setPlaceholder("Mensagem para divulgar")
                .setStyle(1)
                .setRequired(true);

            const token = new TextInputBuilder()
                .setCustomId("userToken")
                .setLabel("Coloque o token da conta")
                .setPlaceholder("A conta precisa estar nos servidores")
                .setStyle(1)
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(mensagem),
                new ActionRowBuilder().addComponents(token)
            );

            return interaction.showModal(modal);
        }

        if (customId === "messagePanelModal") {
            const mensagem = interaction.fields.getTextInputValue("messageContent");
            const token = interaction.fields.getTextInputValue("userToken");
            await interaction.reply({ content: `🔁 **| Aguarde um momento, estou verificando as informações...**`, ephemeral: true });

            const self = new Client();
            let tokenInvalido = false;

            try {
                await self.login(token).catch(() => tokenInvalido = true);
            } catch {
                tokenInvalido = true;
            }

            if (tokenInvalido) {
                return interaction.editReply({ content: `❌ **| Token inválido fornecido.**`, ephemeral: true });
            }

            const guilds = self.guilds.cache;
            if (guilds.size === 0) {
                await self.logout().catch(() => {});
                return interaction.editReply({ content: `❌ **| A conta não está em nenhum servidor.**`, ephemeral: true });
            }

            await interaction.editReply({ content: `🔁 **| Iniciando a divulgação para todos os servidores...**`, ephemeral: true });

            for (const guild of guilds.values()) {
                const members = guild.members.cache.filter(member => !member.user.bot);

                for (let [index, member] of members.entries()) {
                    setTimeout(async () => {
                        try {
                            const dmChannel = await member.createDM();
                            // Enviar apenas a mensagem fornecida
                            await dmChannel.send(mensagem);
                        } catch (error) {
                            console.error(`Erro ao enviar mensagem para ${member.user.tag}:`, error);
                        }
                    }, index * 10000);  // Delay de 10 segundos entre as mensagens
                }
            }

            await interaction.editReply({ content: `✅ **| Mensagem enviada com sucesso para todos os membros de todos os servidores!**` });
            await self.logout().catch(() => {});
        }
    }
};
