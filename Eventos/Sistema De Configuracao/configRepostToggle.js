const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { configuracao, produtos } = require("../../DataBaseJson");
const { agendarRepostagem, pararRepostagem } = require("../../Functions/repostagem");
const moment = require('moment-timezone');
const { AcoesRepostAutomatics } = require('../../Functions/ConfigRepostAuto');

module.exports = {
    name: 'interactionCreate',

    run: async (interaction, client) => {
        if (!interaction.isButton()) return;

        if (interaction.customId === "desabilityRepost" || interaction.customId === "enableRepost") {
            const currentStatus = configuracao.get(`Repostagem.Status`);
            const newStatus = !currentStatus;

            configuracao.set(`Repostagem.Status`, newStatus);

            const statusText = newStatus ? 'habilitada' : 'desabilitada';
            const replyContent = `A função de repostagem foi ${statusText}. Novo status: ${newStatus ? 'Ativo' : 'Inativo'}`;

            await AcoesRepostAutomatics(interaction, client);
            // console.log(`Repostagem ${statusText} por ${interaction.user.tag} (${interaction.user.id})`);

            if (newStatus) {
                agendarRepostagem(client);
            } else {
                pararRepostagem();
            }
        }
    }
};

async function createUpdatedEmbed(interaction, client) {
    const repostagemHora = configuracao.get(`Repostagem.Hora`) || "00:01";
    const currentStatus = configuracao.get(`Repostagem.Status`);
    const currentTime = moment.tz("America/Sao_Paulo");

    const [hours, minutes] = repostagemHora.split(':').map(Number);
    let nextExecutionTime = moment.tz("America/Sao_Paulo").set({ hour: hours, minute: minutes, second: 0, millisecond: 0 });

    if (nextExecutionTime.isBefore(currentTime)) {
        nextExecutionTime.add(1, 'day');
    }

    const nextExecutionTimestamp = Math.floor(nextExecutionTime.valueOf() / 1000);
    const todosProdutos = await produtos.all();

    return new EmbedBuilder()
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
        .setTimestamp();
}

function createUpdatedRow(currentStatus) {
    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("setTimeRepost")
                .setLabel('Definir horário')
                .setEmoji('1241819612044197949')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(!currentStatus),
            new ButtonBuilder()
                .setCustomId(currentStatus ? "desabilityRepost" : "enableRepost")
                .setLabel(currentStatus ? 'Desabilitar função' : 'Habilitar função')
                .setEmoji('1259569896472182784')
                .setStyle(currentStatus ? ButtonStyle.Danger : ButtonStyle.Success)
        );
}