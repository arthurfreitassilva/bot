const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { configuracao } = require("../DataBaseJson");

async function autoreact24(interaction, client) {
    const autoReactStatus = configuracao.get(`AutoReact.status`) || false;
    const autoReactEmoji = configuracao.get(`AutoReact.Emoji`) || "Não Definido";
    const autoReactCanais = configuracao.get(`AutoReact.Canais`) || ["Não Definido"];

    const atualstatus = configuracao.get("AutoReact.status");
    const mudarstatus = !atualstatus;

    const botaostyolo = mudarstatus ? 4 : 3;
    const botaoemoji = mudarstatus ? "1248300875978641419" : "1248300851282579552";

    const embed = new EmbedBuilder()
    .setColor(`${configuracao.get('Cores.Principal') || '0cd4cc'}`)
    .setTitle("Auto Reação - Sistema")
    .setAuthor({ name: "Auto Reação - Sistema", iconURL: 'https://cdn.discordapp.com/emojis/1269773226960093184.png?size=2048' })
    .setDescription("`**Sistema de auto reação configurável.**")
    .addFields(
        { name: `**Status**`, value: `\`\`${autoReactStatus ? "Desligado" : "Ligado"}\`\``, inline: true },
                    { name: `**Emoji**`, value: `${autoReactEmoji}`, inline: true },
        { name: `**Canais**`, value: `\`\`${autoReactCanais.join(", ")}\`\``, inline: true },
    )
    .setFooter({ text: "Auto Reação", iconURL: 'https://cdn.discordapp.com/emojis/1242617727911460933.gif?size=2048' })
    .setTimestamp();

const row24 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
        .setCustomId(`${interaction.user.id}_onoff`)
        .setEmoji(botaoemoji)
        .setStyle(botaostyolo),
        new ButtonBuilder()
        .setCustomId("configautoreact")
        .setLabel("Configurar Auto Reação")
        .setStyle(2)
        .setEmoji("1309962605162528928"),
    new ButtonBuilder()
        .setCustomId("resetautoreact")
        .setLabel("Resetar Configuração")
        .setStyle(4)
        .setEmoji("1309962546718969908"),
    new ButtonBuilder()
        .setCustomId("atualizarembed24")
        .setLabel("Aplicar alterações")
        .setStyle(2)
        .setEmoji("1305153239821324319"),
    new ButtonBuilder()
        .setCustomId("eaffaawwawa")
        .setEmoji("1305590970062082078")
        .setLabel('Voltar')
        .setStyle(2)
);

await interaction.update({ embeds: [embed], content: ``, ephemeral: true, components: [row24] });
}

module.exports = {
    autoreact24
};
