const { ApplicationCommandType } = require("discord.js");
const { getPermissions } = require("../../Functions/PermissionsCache.js");
const { configuracao } = require("../../DataBaseJson/index.js");

module.exports = {
    name: "interactionCreate",
    run: async (interaction, client) => {
        const { customId } = interaction;
        if (!customId) return;

        if (customId === "remove_emojis") {
            const perm = await getPermissions(client.user.id);
            if (!perm || !perm.includes(interaction.user.id)) {
                return interaction.reply({ content: `${Emojis.get(`negative_dreamm67`)} Você não possui permissão para usar esse comando.`, ephemeral: true });
            }

            await interaction.reply({ content: "> ** 🔄 Removendo os emojis, aguarde...**", ephemeral: true });

            try {
                const entregAbaixoEmojis = configuracao.get("Emojis_EntregAbaixo");
                if (entregAbaixoEmojis) {
                    for (const emoji of entregAbaixoEmojis) {
                        const guildEmoji = interaction.guild.emojis.cache.get(emoji.id);
                        if (guildEmoji) {
                            await guildEmoji.delete();
                        }
                    }
                    await configuracao.delete("Emojis_EntregAbaixo");
                }

                const entregAutoEmojis = configuracao.get("Emojis_EntregAuto");
                if (entregAutoEmojis) {
                    for (const emoji of entregAutoEmojis) {
                        const guildEmoji = interaction.guild.emojis.cache.get(emoji.id);
                        if (guildEmoji) {
                            await guildEmoji.delete();
                        }
                    }
                    await configuracao.delete("Emojis_EntregAuto");
                }

                const entregAutoEmojis224 = configuracao.get("Emojis_carrinho");
                if (entregAutoEmojis224) {
                    for (const emoji of entregAutoEmojis224) {
                        const guildEmoji = interaction.guild.emojis.cache.get(emoji.id);
                        if (guildEmoji) {
                            await guildEmoji.delete();
                        }
                    }
                    await configuracao.delete("Emojis_carrinho");
                }

                await interaction.editReply({ content: `${Emojis.get(`positive_dream`)} Emojis removidos com sucesso deste servidor! Lembre-se de reiniciar o bot para garantir que as alterações entrem em vigor.`, ephemeral: true });
            } catch (error) {
                console.error("Erro ao remover emojis:", error);
                await interaction.editReply({ content: `${Emojis.get(`negative_dreamm67`)} Ocorreu um erro ao remover os emojis.`, ephemeral: true });
            }
        }
    }
};
