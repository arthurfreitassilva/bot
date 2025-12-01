const { StringSelectMenuBuilder, TextDisplayBuilder } = require("discord.js");
const { ActionRowBuilder, ButtonBuilder, MessageFlags, EmbedBuilder } = require("discord.js");
const { getSaudacao } = require('../PermissionAPI/PermissionGet');
async function PageNubank(client, interaction, a) {
    let typebank = client.db.General.get('ConfigGeral.Nubank.typebank');
    let status = client.db.General.get('ConfigGeral.Nubank.status') ? true : false
    let emoji
    let label
    let buttonColor

    if (status == true) {
        status = `\`Ligado\``
        emoji = "<:desligar:1238978047504547871>"
        label = 'Desligar Imap'
        buttonColor = 4
    } else {
        status = `\`Desligado\``
        emoji = "<:Ligado:1238977621220655125>"
        label = 'Ligar Imap'
        buttonColor = 3
    }

    let embed = new EmbedBuilder()
        .setColor('Blue')
        .setTitle('Painel De IMAP')
        .setDescription(`${getSaudacao()} ${interaction.user.username}, seja muito bem-vindo(a) ao nosso sistema de vendas, desenvolvido especialmente para impulsionar suas vendas e elevar sua autoestima durante o processo, com uma divulgação automática, constante e estratégica em nossos canais parceiros.`)
        .addFields(
            {
                name: `Informações`,
                value: `-# - Nome da Aplicação: ${client.user}\n-# - Estou trabalhando <t:${Math.floor(client.readyAt.getTime() / 1000)}:R>`,
                inline: true
            },
            {
                name: `Efí Bank`,
                value: `-# - Status: ${client.db.General.get('ConfigGeral.Nubank.status') !== true ? '\`Desativado\`' : '\`Ativado\`'}\n-# - Email: \`${client.db.General.get('ConfigGeral.Nubank.email') ?? 'Não configurado'}\`\n-# - Senha: \`${client.db.General.get('ConfigGeral.Nubank.senha') ?? 'Não configurado'}\`\n-# - Banco Selecionado: \`${typebank ?? 'Nenhum banco selecionado'}\``,
                inline: false
            },
        );

    const components1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('nubankStatus')
            .setLabel(label)
            .setEmoji(emoji)
            .setStyle(buttonColor),
        new ButtonBuilder()
            .setCustomId('nubankConfig')
            .setLabel('Configurar Imap')
            .setEmoji('1282395493263081532')
            .setStyle(2)
    );

    const components2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('returnUpdatePagamento')
            .setEmoji('1237055536885792889')
            .setStyle(2)
    );

    const components3 = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('selecttypebank')
            .setPlaceholder('Selecione qual banco deseja utilizar')
            .addOptions([
                {
                    label: 'Nubank - IMAP',
                    value: 'nubank',
                    emoji: '1237055536885792889'
                },
                {
                    label: 'Picpay - IMAP',
                    value: 'picpay',
                    emoji: '1237055536885792889'
                }
            ])
    );

    if (a === 1) {
        return await interaction.editReply({
            content: ``,
            embeds: [embed],
            components: [components1, components3, components2]
        });
    }

    await interaction.update({
        content: ``,
        embeds: [embed],
        components: [components1, components3, components2]
    });
}

module.exports = {
    PageNubank
}