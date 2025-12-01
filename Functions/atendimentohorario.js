const { RoleSelectMenuBuilder, EmbedBuilder, InteractionType, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js")
const { JsonDatabase } = require('wio.db');
const { tickets, configuracao } = require("../DataBaseJson/index")

async function Atendimentohorario(interaction, client) {

    const atendimentohorario24 = tickets.get(`statushorario`) || false;

    const embed = new EmbedBuilder()
    .setAuthor({ name: 'Sistema Horario Atendimento', iconURL: `https://cdn.discordapp.com/emojis/1250148517368959089.png?size=2048` })
    .setDescription(`> **Configure o horario de atendimento, Ex: \`10:00\` ate as \`19:00\`, Quando o __cliente__ tente abrir fora do horário de expediente não criará um ticket.**`)
    .setThumbnail(`https://cdn.discordapp.com/attachments/1378358712992927744/1378746766215614664/a_50741748cc147c7f05530ec16f4be087-1.gif?ex=683db97c&is=683c67fc&hm=22e8f97ca92eee00a6f057752b9a19b1736d8b31ec785b297293dd32521d57be&`)
    .setFooter({ text: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL({ dynamic: true }) })
    .addFields(
        { name: '`📊` **\`Status\`**', value: atendimentohorario24 ? 'On' : 'Off' },
        { name: '`⏰` **\`Horario de Abertura\`**', value: `\`${tickets.get("horarioAbertura") || `Não Definido`}\`` },
        { name: '`⏰` **\`Horario de Fechamento\`**', value: `\`${tickets.get("horarioFechamento") || `Não Definido`}\`` },
    )
    .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
        .setCustomId("onoffatendimentohorario24")
        .setLabel(atendimentohorario24 ? "On" : "Off")
        .setEmoji(atendimentohorario24 ? '1248300851282579552' : '1248300875978641419')
        .setStyle(atendimentohorario24 ? 3 : 4),
        new ButtonBuilder()
        .setCustomId("confighorarioatendimento24")
        .setLabel("Configurar")
        .setEmoji("1309962605162528928")
        .setStyle(2),
        new ButtonBuilder()
        .setCustomId("painelconfigticket")
        .setLabel('Voltar')
        .setEmoji(`1178068047202893869`)
        .setStyle(2),
    )

    await interaction.update({ embeds: [embed], components: [row], ephemeral: true })

}

module.exports = {
    Atendimentohorario
};
