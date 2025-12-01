const { PermissionFlagsBits, EmbedBuilder, ApplicationCommandType, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const Discord = require("discord.js");
const { MessageStock } = require("../../Functions/ConfigEstoque.js");
const { produtos } = require("../../DataBaseJson");
const { getPermissions } = require("../../Functions/PermissionsCache.js");

module.exports = {
    name: "remover_cupons",
    description: "[🤖] Use para configurar minhas funções",
    type: ApplicationCommandType.ChatInput,
    options: [
        {
            name: "name",
            description: "-",
            type: Discord.ApplicationCommandOptionType.String,
            required: true,
        },
    ],
    default_member_permissions: PermissionFlagsBits.Administrator,

    run: async (client, interaction, message) => {
        const perm = await getPermissions(client.user.id);
        if (perm === null || !perm.includes(interaction.user.id)) {
            return interaction.reply({ content: `${Emojis.get(`negative_dreamm67`)} Sem permissão.`, ephemeral: true });
        }

        const nome = interaction.options.getString("name");

        const dd = produtos.fetchAll();
        const clientesComCupom = [];
        const clientesSemCupom = [];

        dd.forEach((cliente) => {
            const indexCupom = cliente.data.Cupom.findIndex((cupom) => cupom.Nome === nome);

            if (indexCupom !== -1) {
                cliente.data.Cupom.splice(indexCupom, 1);
                clientesComCupom.push(cliente.ID);
            } else {
                clientesSemCupom.push(cliente.ID);
            }
        });

        dd.forEach((cliente) => {
            produtos.set(`${cliente.ID}.Cupom`, cliente.data.Cupom);
        });

        const primeiroErro = clientesSemCupom.slice(0, 10).join("\n");
        const restanteErro = clientesSemCupom.length > 10 ? `\n... e mais ${clientesSemCupom.length - 10} produtos` : "";

        interaction.reply({
            content: `O cupom \`${nome}\` foi removido com sucesso em \`${clientesComCupom.length}\` produtos, e falhou nos produtos abaixo:\n\nTambém não foi encontrado nos produtos abaixo:\n\`${primeiroErro}${restanteErro}\``,
            ephemeral: true,
        })
    },
};
