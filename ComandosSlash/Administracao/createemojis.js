const { PermissionFlagsBits, ApplicationCommandType } = require("discord.js");
const { getPermissions } = require("../../Functions/PermissionsCache.js");
const { owner } = require('../../config.json');
const { configuracao } = require("../../DataBaseJson/index.js");
const { Emojis } = require("../../DataBaseJson");

module.exports = {
    name: "emojis",
    description: "[🤖] Criar emojis automáticos no servidor",
    type: ApplicationCommandType.ChatInput,
    default_member_permissions: PermissionFlagsBits.Administrator,

    run: async (client, interaction) => {

        // Verifica se é dono da aplicação
        if (!owner.includes(interaction.user.id)) {
            return interaction.reply({
                content: `${Emojis.get("negative_dreamm67")} Você não possui permissão para usar este comando.`,
                ephemeral: true
            });
        }

        // Evita erro de tempo
        await interaction.deferReply();

        // Zera os arrays antes de recriar emojis
        configuracao.set(`Emojis_EntregAbaixo`, []);
        configuracao.set(`Emojis_EntregAuto`, []);

        // Arrays de emojis
        const entregAbaixo = [
            "https://cdn.discordapp.com/emojis/1183841001824067676.webp?size=96&quality=lossless",
            "https://cdn.discordapp.com/emojis/1183841127661580339.webp?size=96&quality=lossless",
            "https://cdn.discordapp.com/emojis/1183841205839220776.webp?size=96&quality=lossless",
            "https://cdn.discordapp.com/emojis/1183841312018026556.webp?size=96&quality=lossless",
            "https://cdn.discordapp.com/emojis/1183841529148739669.webp?size=96&quality=lossless",
            "https://cdn.discordapp.com/emojis/1183841627425476621.webp?size=96&quality=lossless",
            "https://cdn.discordapp.com/emojis/1183841719976996885.webp?size=96&quality=lossless",
            "https://cdn.discordapp.com/emojis/1183841795864535151.webp?size=96&quality=lossless",
            "https://cdn.discordapp.com/emojis/1183841842467446844.webp?size=96&quality=lossless"
        ];

        const entregAuto = [
            "https://cdn.discordapp.com/emojis/1194131420499677317.webp?size=96&quality=lossless",
            "https://cdn.discordapp.com/emojis/1194131444797288549.webp?size=96&quality=lossless",
            "https://cdn.discordapp.com/emojis/1194131474534899753.webp?size=96&quality=lossless",
            "https://cdn.discordapp.com/emojis/1194131507858636961.webp?size=96&quality=lossless",
            "https://cdn.discordapp.com/emojis/1194131544764317736.webp?size=96&quality=lossless",
            "https://cdn.discordapp.com/emojis/1194131583767162960.webp?size=96&quality=lossless",
            "https://cdn.discordapp.com/emojis/1194131629812220005.webp?size=96&quality=lossless",
            "https://cdn.discordapp.com/emojis/1194131674196344922.webp?size=96&quality=lossless",
        ];

        /**
         * Função para criar emojis em lote
         */
        async function criarEmojis(lista, key, prefix) {
            for (let i = 0; i < lista.length; i++) {

                // Verifica se o servidor ainda tem slots
                const guild = interaction.guild;
                if (guild.emojis.cache.size >= guild.emojis.maximum) {
                    await interaction.followUp({
                        content: `⚠️ Limite de emojis atingido. Alguns emojis não foram criados.`,
                        ephemeral: true
                    });
                    break;
                }

                try {
                    const emojiName = `${prefix}${i + 1}`;

                    const novoEmoji = await guild.emojis.create({
                        attachment: lista[i],
                        name: emojiName
                    });

                    configuracao.push(key, {
                        id: novoEmoji.id,
                        name: novoEmoji.name
                    });

                } catch (err) {
                    console.error(`Erro ao criar emoji ${prefix}${i + 1}:`, err);
                }
            }
        }

        // Criação dos emojis
        await criarEmojis(entregAbaixo, "Emojis_EntregAbaixo", "eb");
        await criarEmojis(entregAuto, "Emojis_EntregAuto", "ea");

        // Resposta final
        await interaction.editReply(`✅ Todos os emojis foram criados com sucesso e adicionados à configuração!`);
    },
};
