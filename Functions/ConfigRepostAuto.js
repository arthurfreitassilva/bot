const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { produtos, configuracao, msgsauto } = require("../DataBaseJson");
const moment = require('moment-timezone');

async function AcoesRepostAutomatics(interaction, client) {
    const repostagemHora = configuracao.get(`Repostagem.Hora`) || "00:01";
    const currentStatus = configuracao.get(`Repostagem.Status`);

    // Obtendo a hora atual no fuso horário de São Paulo
    const currentTime = moment.tz("America/Sao_Paulo");

    const [hours, minutes] = repostagemHora.split(':').map(Number);
    let nextExecutionTime = moment.tz("America/Sao_Paulo").set({ hour: hours, minute: minutes, second: 0, millisecond: 0 });

    if (nextExecutionTime.isBefore(currentTime)) {
        nextExecutionTime.add(1, 'day');
    }

    const nextExecutionTimestamp = Math.floor(nextExecutionTime.valueOf() / 1000);
    const todosProdutos = await produtos.all();

    const embed = new EmbedBuilder()
        .setColor(`${configuracao.get(`Cores.Principal`) == null ? '0cd4cc' : configuracao.get('Cores.Principal')}`)
        .setTitle(`Repostagem Automática`)
        .setImage("https://cdn.discordapp.com/attachments/1378540757576585297/1379162402720845844/repostagem.png?ex=683f3c94&is=683deb14&hm=9f8a66ae43842b3b24c9cab48c5f773884f9bf16711677555760821b3d512be8&")
        .setDescription(`Seu ${client.user.username} vai repostar seus produtos periodicamente, apagando a mensagem antiga e enviando-a novamente, para evitar denúncias nas mensagens.  
**Observação:** O sistema ajustará automaticamente o intervalo e a frequência dos reposts, considerando o fluxo de interações e a quantidade de produtos postados.`)
        .addFields(
            { name: `Próxima execução`, value: currentStatus ? `\`${nextExecutionTime.format('DD/MM/YYYY HH:mm:ss')}\`` : '`Função desativada.`', inline: true },
            { name: `Produtos existentes`, value: `\`${todosProdutos.length}\``, inline: true },
            { name: `\u200B`, value: `\u200B`, inline: true },
            { name: `Tempo até a próxima execução`, value: currentStatus ? `<t:${nextExecutionTimestamp}:R>` : '`Função desativada.`' },
            { name: `Status atual`, value: currentStatus ? '`Ativado 🟢`' : '`Desativado 🔴`', inline: true }
        )
        .setFooter(
            { text: interaction.guild.name, iconURL: interaction.guild.iconURL({ dynamic: true }) }
        )
        .setTimestamp()

    const row2 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("setTimeRepost")
                .setLabel('Definir horário')
                .setEmoji(`1241819612044197949`)
                .setStyle(ButtonStyle.Primary)
                .setDisabled(!currentStatus),
            new ButtonBuilder()
                .setCustomId(currentStatus ? "desabilityRepost" : "enableRepost")
                .setLabel(currentStatus ? 'Desabilitar função' : 'Habilitar função')
                .setEmoji(`1259569896472182784`)
                .setStyle(currentStatus ? ButtonStyle.Danger : ButtonStyle.Success)
        )

    const botoesvoltar = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("voltar_AcoesAutomaticsConfigs")
            .setEmoji(`1238413255886639104`)
            .setStyle(2),
        new ButtonBuilder()
            .setCustomId(`voltar1`)
            .setEmoji('1292237216915128361')
            .setStyle(1)
    )

   await interaction.update({ content: ``, components: [row2, botoesvoltar], embeds: [embed], ephemeral: true })
}

module.exports = {
    AcoesRepostAutomatics
}