const Discord = require("discord.js");

module.exports = {
    name: "contar",
    description: "[🤖] Conta o número de mensagens em um canal.",
    type: Discord.ApplicationCommandType.ChatInput,
    options: [
        {
            name: "canal",
            description: "Selecione o canal onde deseja contar as mensagens.",
            type: Discord.ApplicationCommandOptionType.Channel,
            required: true
        }
    ],

    run: async (client, interaction) => {

        // Verificação de permissão
        if (!interaction.member.permissions.has(Discord.PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: "🚫 | Apenas administradores podem usar este comando.",
                ephemeral: true
            });
        }

        const canal = interaction.options.getChannel("canal");

        // Verificar se é canal válido
        if (
            ![
                Discord.ChannelType.GuildText,
                Discord.ChannelType.PublicThread,
                Discord.ChannelType.PrivateThread
            ].includes(canal.type)
        ) {
            return interaction.reply({
                content: "⚠️ | Selecione um canal de texto ou thread válido.",
                ephemeral: true
            });
        }

        // Função principal de contagem
        const contarMensagens = async (canal) => {
            let total = 0;
            let ultimaId = null;

            while (true) {
                const msgs = await canal.messages
                    .fetch({ limit: 100, before: ultimaId })
                    .catch(() => null);

                if (!msgs || msgs.size === 0) break;

                total += msgs.size;
                ultimaId = msgs.last().id;

                // Proteção: evita travar em casos extremos
                await new Promise(r => setTimeout(r, 350));
            }

            return total;
        };

        try {
            // Resposta inicial
            await interaction.reply({
                content: `🔄 | Contando mensagens no canal **${canal.name}**. Isso pode levar alguns minutos...`,
                ephemeral: true
            });

            console.log(`📁 Iniciando contagem de mensagens em #${canal.name} (${canal.id})`);

            const total = await contarMensagens(canal);

            await interaction.editReply({
                content: `📊 | Contagem finalizada!\nO canal **${canal.name}** possui **${total.toLocaleString()}** mensagens.`
            });

            console.log(`✅ Contagem finalizada: ${total} mensagens em #${canal.name}`);

        } catch (erro) {
            console.error(`❌ Erro ao contar mensagens no canal ${canal.name}:`, erro);

            await interaction.editReply({
                content: "❗ | Ocorreu um erro ao realizar a contagem. Tente novamente mais tarde."
            });
        }
    }
};
