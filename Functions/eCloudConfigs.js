const { EmbedBuilder, ApplicationCommandType, StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, InteractionType } = require("discord.js");
const fs = require("fs");
const path = require("path");
const client = require("discord.js")
const Discord = require("discord.js")

async function configauth(interaction, client) {


    const row1 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("cargoauth")
                .setEmoji(`1249510835735498814`)
                .setLabel('Cargo Verificado')
                .setStyle(1),


        )

    const row2 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
             .setCustomId("infosauth")
             .setLabel('Minhas Informações')
             .setEmoji('1236318308756750438')
             .setStyle(1),
            new ButtonBuilder()
             .setCustomId("infoauth")
             .setLabel('Configurações Obrigatorias')
             .setEmoji('1236318155056349224')
             .setStyle(1),

        )

    const row3 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("voltarauth")
                .setEmoji(`1178068047202893869`)
                .setLabel('Voltar')
                .setStyle(2)
        )

        
client.on("interactionCreate", async interaction => {
    if (!interaction.isButton()) return;

    // Verifique se o botão pressionado é o "cargoauth"
    if (interaction.customId === "cargoauth") {
        await interaction.deferReply({ ephemeral: true });

        // Criando o Select Menu com todos os cargos do servidor
        const roles = interaction.guild.roles.cache.filter(role => role.id !== interaction.guild.id); // Exclui o cargo @everyone
        const options = roles.map(role => {
            return {
                label: role.name,
                value: role.id,
            };
        });

        // Criar a linha do select menu
        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('select_role')
                .setPlaceholder('Selecione o cargo de verificado')
                .addOptions(options)
        );

        // Enviar o select menu para o usuário
        await interaction.followUp({
            content: "**🔄 Selecione o cargo de verificado:**",
            components: [row]
        });
    }
});

// Captura da seleção do cargo do usuário
client.on('interactionCreate', async interaction => {
    if (!interaction.isStringSelectMenu()) return;

    if (interaction.customId === 'select_role') {
        const selectedRoleID = interaction.values[0];

        const fs = require('fs');
        const path = require('path');
        const configPath = path.join(__dirname, '..', 'DataBaseJson', 'configauth.json');

        try {
            // Atualizar o arquivo de configuração com o cargo selecionado
            const config = require(configPath);
            config.role = selectedRoleID;
            fs.writeFileSync(configPath, JSON.stringify(config, null, 4));

            // Resposta para o usuário
            await interaction.update({
                content: `**✅ Cargo de verificado atualizado com sucesso!**\n\`O cargo do bot deve estar ACIMA do cargo de verificado!\``,
                components: [], // Remove os componentes após a seleção
            });
        } catch (error) {
            console.error("Erro ao atualizar o cargo:", error);
            await interaction.update({
                content: "**❌ Ocorreu um erro ao atualizar o CARGO.**",
                components: [], // Remove os componentes após o erro
            });
        }
    }
});

    if (interaction.message == undefined) {
        interaction.reply({ embeds: [], components: [row1, row2, row3], content: `Oque deseja configurar?` })
    } else {
        interaction.update({ embeds: [], components: [row1, row2, row3], content: `Oque deseja configurar?` })
    }

}


module.exports = {
    configauth
}
