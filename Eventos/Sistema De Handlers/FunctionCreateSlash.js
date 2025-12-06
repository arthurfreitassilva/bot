const Discord = require("discord.js");

module.exports = {
    name: 'interactionCreate',

    run: async (interaction, client) => {
        try {
            // Verifica se a interação é de comando de texto (Chat Input Command)
            if (interaction.isChatInputCommand()) {

                const cmd = client.slashCommands.get(interaction.commandName);

                if (!cmd) {
                    // Defer primeiro para evitar timeout
                    if (!interaction.deferred && !interaction.replied) {
                        await interaction.deferReply({ flags: Discord.MessageFlags.Ephemeral }).catch(() => {});
                    }
                    return interaction.editReply({ content: "Ocorreu algum erro amigo, o comando não foi encontrado." }).catch(() => 
                        interaction.reply({ content: "Ocorreu algum erro amigo, o comando não foi encontrado.", flags: Discord.MessageFlags.Ephemeral }).catch(() => {})
                    );
                }

                // CRITICAL: Defer interaction immediately to prevent 3-second timeout
                // Alguns comandos podem preferir defer, outros não - então tornamos isso opcional
                // Se o comando tiver a propriedade deferReply: false, não faz defer automático
                if (cmd.autoDeferReply !== false && !interaction.deferred && !interaction.replied) {
                    const deferOptions = cmd.deferEphemeral === false ? {} : { flags: Discord.MessageFlags.Ephemeral };
                    await interaction.deferReply(deferOptions).catch(err => {
                        console.error(`Failed to auto-defer command ${interaction.commandName}:`, err.message);
                    });
                }

                // Garantir que a interação tenha o membro corretamente configurado
                interaction["member"] = interaction.guild.members.cache.get(interaction.user.id);

                // Executa o comando
                await cmd.run(client, interaction);

            }

            // Verifica se a interação é de Menu Contextual de Mensagem
            if (interaction.isMessageContextMenuCommand()) {
                const command = client.slashCommands.get(interaction.commandName);
                if (command) {
                    // Defer context menu commands too
                    if (!interaction.deferred && !interaction.replied) {
                        await interaction.deferReply({ flags: Discord.MessageFlags.Ephemeral }).catch(() => {});
                    }
                    await command.run(client, interaction);
                }
            }

            // Verifica se a interação é de Menu Contextual de Usuário
            if (interaction.isUserContextMenuCommand()) {
                const command = client.slashCommands.get(interaction.commandName);
                if (command) {
                    // Defer context menu commands too
                    if (!interaction.deferred && !interaction.replied) {
                        await interaction.deferReply({ flags: Discord.MessageFlags.Ephemeral }).catch(() => {});
                    }
                    await command.run(client, interaction);
                }
            }
        } catch (error) {
            console.error("Erro ao processar interação:", error);
            
            // Tentar responder ao erro de forma segura
            try {
                if (interaction.deferred || interaction.replied) {
                    await interaction.editReply({ content: "Ocorreu um erro ao processar sua interação. Tente novamente mais tarde." });
                } else {
                    await interaction.reply({ content: "Ocorreu um erro ao processar sua interação. Tente novamente mais tarde.", flags: Discord.MessageFlags.Ephemeral });
                }
            } catch (replyError) {
                console.error("Failed to send error message:", replyError.message);
            }
        }
    }
};
