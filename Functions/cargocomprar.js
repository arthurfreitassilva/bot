const { ApplicationCommandType, EmbedBuilder, Webhook, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");

const { JsonDatabase } = require("wio.db");

const { configuracao } = require("../DataBaseJson");



async function configrole24(interaction, client) {



    const configrole24 = configuracao.get(`ConfigRoles.statuscomprar`) || false;

    

    const embed = new EmbedBuilder()

    .setAuthor({ name: `${interaction.guild.name}`, iconURL: `https://cdn.discordapp.com/icons/1315546098223419413/a_c45f0d7f586007a0b19589cb64248042.gif?size=2048` })

    .setDescription(`Configurações do cargo que pode abrir carrinho:\n\n**Cargo necessario:** <@&${configuracao.get("ConfigRoles.cargocarrinho") || `\`Não definido\`` }>\n\n**Link de verificação:** \`\`\`${configuracao.get("ConfigLinks.link") || `Não definido` }\`\`\``)

    .addFields(

        { name: `Status:`, value: `\`\`\`${configrole24 ? 'On' : 'Off'}\`\`\`` }

    )

    .setTimestamp();



    const row2 = new ActionRowBuilder().addComponents(

        new ButtonBuilder()

        .setCustomId("onoffcargo24")

        .setLabel(configrole24 ? "On" : "Off")

        .setEmoji("1383399544448090205")

        .setStyle(configrole24 ? 3 : 4),

        new ButtonBuilder()

        .setCustomId("configurarcargocomprar")

        .setLabel("Configurar Cargo")

        .setEmoji("1383849308276785336")

        .setStyle(1),

        new ButtonBuilder()

        .setCustomId("configurarlink")

        .setLabel("Configurar Link")

        .setEmoji("1377455271298732042")

        .setStyle(2),

        new ButtonBuilder()

        .setCustomId("gencampos")

        .setLabel('Voltar')

        .setEmoji("1371605354605051996")

        .setStyle(2)

        .setDisabled(false),

    );



    await interaction.update({ embeds: [embed], content: '', components: [row2] });

}





module.exports = {

    configrole24

}