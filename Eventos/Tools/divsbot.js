const { ModalBuilder, TextInputBuilder, ActionRowBuilder } = require("discord.js");
const { Client } = require("discord.js");

module.exports = {
    name: "interactionCreate",
    run: async (interaction) => {
        const { customId } = interaction;
        if (!customId) return;

        // Custom ID para o painel inicial
        if (customId === "mensagemDivulgacaoPanel") {
            const modal = new ModalBuilder()
                .setCustomId(`mensagemDivulgacaoModal`)
                .setTitle("Enviar mensagem para todos no servidor!");

            const mensagem = new TextInputBuilder()
                .setCustomId("mensagemDivulgacaoTexto")
                .setLabel("Coloque a mensagem para divulgar")
                .setPlaceholder("Mensagem para divulgar")
                .setStyle(1)
                .setRequired(true);

            const token = new TextInputBuilder()
                .setCustomId("mensagemDivulgacaoToken")
                .setLabel("Coloque o token do bot")
                .setPlaceholder("Insira o token do bot")
                .setStyle(1)
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(mensagem),
                new ActionRowBuilder().addComponents(token)
            );

            return interaction.showModal(modal);
        }

        // Custom ID para o modal
        if (customId === "mensagemDivulgacaoModal") {
            const mensagem = interaction.fields.getTextInputValue("mensagemDivulgacaoTexto");
            const token = interaction.fields.getTextInputValue("mensagemDivulgacaoToken");
            await interaction.reply({ content: `🔁 **| Aguarde um momento, estou verificando as informações...**`, ephemeral: true });

            const bot = new Client({ intents: ['Guilds', 'GuildMembers', 'DirectMessages'] });
            let tokenInvalido = false;

            try {
                await bot.login(token).catch(() => tokenInvalido = true);
            } catch {
                tokenInvalido = true;
            }

            if (tokenInvalido) {
                return interaction.editReply({ content: `❌ **| Token inválido fornecido.**`, ephemeral: true });
            }

            await interaction.editReply({ content: `🔁 **| Iniciando a divulgação para todos os servidores...**`, ephemeral: true });

            // Pega todos os servidores em que o bot está
            bot.guilds.cache.forEach(async (guild) => {
                const members = guild.members.cache.filter(member => !member.user.bot);

                for (let [index, member] of members.entries()) {
                    setTimeout(async () => {
                        try {
                            // Abre uma DM com o usuário
                            const dmChannel = await member.createDM();

                            // Envia a mensagem fornecida pelo usuário
                            await dmChannel.send(`${mensagem}`);
                        } catch (error) {
                            console.error(`Erro ao enviar mensagem para ${member.user.tag}:`, error);
                        }
                    }, index * 10000);  // Delay de 10 segundos entre cada mensagem
                }
            });

            await interaction.editReply({ content: `✅ **| Mensagem enviada com sucesso para todos os membros de todos os servidores!` });
            await bot.destroy();
        }
    }
};
