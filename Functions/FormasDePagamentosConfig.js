const { ActionRowBuilder, TextInputBuilder, TextInputStyle, InteractionType, ModalBuilder, EmbedBuilder, ButtonBuilder } = require("discord.js");
const { configuracao, Emojis } = require("../DataBaseJson");



async function FormasDePagamentos(interaction) {

    const semiAutoStatus = configuracao.get("pagamentos.SemiAutomatico.status") ?? false;
    const semiAutoPix = configuracao.get("pagamentos.SemiAutomatico.pix") ?? null;

    const embed = new EmbedBuilder()
    .setTitle(`\`\📦\` **Configurar Formas de Pagamento**`)
    .setDescription(`-# > Gerencie abaixo as formas de pagamento disponíveis no sistema.\n> Ative, desative e verifique se estão corretamente configuradas.`)
    .setFields(
        {
            name: `\`\💳\` **Mercado Pago**`,
            value: `> - Status: \`${configuracao.get("pagamentos.MpOnOff") != true ? "❌ Desabilitado" : "✅ Habilitado"}\`\n> - API: \`${configuracao.get("pagamentos.MpAPI") != "" ? "✅ Configurada" : "❌ Não configurada"}\``,
            inline: true
        },
        {
            name: `\`🏦\` **Efi Bank**`,
            value: `> - Status: \`${configuracao.get("pagamentos.EfiOnOff") != true ? "❌ Desabilitado" : "✅ Habilitado"}\`\n> - API: \`${configuracao.get("pagamentos.EfiAPI") != "" ? "✅ Configurada" : "❌ Não configurada"}\``,
            inline: true
        },
        {
            name: `\`\🪙\` **Litecoin Wallet ( em breve )**`,
            value: `> - Status: \`❌ Desabilitado\`\n> - API: \`❌ Não configurada\``,
            inline: true
        },
        {
            name: `\`\💸\` **Stripe** ( em breve )`,
            value: `> - Status: \`❌ Desabilitado\`\n> - API: \`❌ Não configurada\``,
            inline: true
        },
        {
            name: `\`\📲\` **Pix Manual**`,
            value: `> - Status: \`${semiAutoStatus != true ? "❌ Desabilitado" : "✅ Habilitado"}\`\n> - Chave: \`${semiAutoPix != null ? "✅ Configurada" : "❌ Não configurada"}\``,
            inline: true
        },
        {
            name: `\`\🏡\` **Nubank & Picpay ( em breve )**`,
            value: `> - Status: \`\❌\` Desabilitado\n> - Chave: \`${semiAutoPix != null ? "✅ Configurada" : "❌ Não configurada"}\``,
            inline: true
        }
    )
    .setColor(configuracao.get(`Cores.Principal`) ?? '#660f7e')
    .setFooter({
        text: interaction.guild.name,
        iconURL: interaction.guild.iconURL({ dynamic: true })
    })
    .setTimestamp();



    const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("configurarmercadopago")
            .setLabel('Configurar Mercado Pago')
            .setEmoji(`<:Sky_mercado_pago:1345211086361858168>`)
            .setStyle(1),
        new ButtonBuilder()
            .setCustomId("configurarefibank")
            .setLabel('Configurar Efi Bank')
            .setEmoji(`1346246854299488356`)
            .setStyle(1),
        new ButtonBuilder()
                .setCustomId("ConfigNuBankImap")
                .setLabel('Nubank ou PicPay')
                .setEmoji(`<:buy:1354209634939830372>`)
                .setDisabled(true)
                .setStyle(2),
                
    )

    const row3 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("formasdepagamentos")
            .setLabel('Configurar Litecoin Wallet')
            .setEmoji(`1256710417343053866`)
            .setDisabled(true)
            .setStyle(1),
        new ButtonBuilder()
            .setCustomId("ConfigStripe")
            .setLabel('Configurar Stripe')
            .setEmoji(`1256710384669425777`)
            .setDisabled(true)
            .setStyle(1),

    )

    const row4 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("ConfigurarPagamentoManual")
            .setLabel('Configurar Pagamento Manual')
            .setEmoji(`1193427093158105129`)
            .setStyle(1),
        new ButtonBuilder()
            .setCustomId("voltaradawdwa")
            .setLabel('Voltar')
            .setEmoji(`1238413255886639104`)
            .setStyle(2),
    )

    await interaction.update({ content: ``, embeds: [embed], ephemeral: true, components: [row2, row3, row4] })
}
async function EfiBankConfiguracao(client, interaction, a) {

    const embed = new EmbedBuilder()
        .setTitle(`\`\🏦\` Configurar Efi Bank - ${configuracao.get("pagamentos.EfiOnOff") ? `HABILITADO` : `DESABILITADO`}`)
        .setDescription(`-# \`\🕵️‍♂️\` Aqui, você pode configurar tudo referente ao Efi bank. Pode definir ou redefinir seu access token, vincular seu Efibank caso seja de menor e queira fazer vendas automáticas (botão "Autorizar"), bloquear ou desbloquear bancos que não deseja aceitar pagamentos e editar as formas de pagamento que serão aceitas por ele.`)
        .setColor(`${configuracao.get(`Cores.Principal`) == null ? '#660f7e' : configuracao.get('Cores.Principal')}`)


    if (configuracao.get("pagamentos.EfiAPI.client_id")) {
        embed.addFields(
            { name: `${Emojis.get(`positive_dream`)} Vinculado`, value: `Sua aplicação da Efi Bank está vinculada a seu Epro Bot.`, inline: true },
            { name: `Chave PIX`, value: `\`${configuracao.get(`pagamentos.EfiAPI.chavepix`)}\``, inline: false },
        )
    }

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`efionoff`)
            .setLabel(`${configuracao.get("pagamentos.EfiOnOff") ? `Desabilitar` : `Habilitar`}`)
            .setEmoji(`1336028620627382272`)
            .setDisabled(configuracao.get("pagamentos.EfiAPI") ? false : true)
            .setStyle(configuracao.get("pagamentos.EfiOnOff") ? 4 : 3),
        new ButtonBuilder()
            .setCustomId(`alterarcredenciais`)
            .setLabel(`Autorizar`)
            .setEmoji(`1309962609591713822`)
            .setStyle(2),
        new ButtonBuilder()
            .setURL(`https://www.youtube.com/watch?v=DKyFF65McYQ`)
            .setLabel(`Demonstração`)
            .setEmoji(`1305152407100981341`)
            .setStyle(5),
        
    )

    const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`formasdepagamentos`)
            .setLabel(`Voltar`)
            .setEmoji(`1238413255886639104`)
            .setStyle(2),
    )

    if (a != 1) {
        await interaction.update({ content: ``, embeds: [embed], components: [row, row2], ephemeral: true })
    } else {
        await interaction.editReply({ content: ``, embeds: [embed], components: [row, row2], ephemeral: true })
    }
}

module.exports = {
    FormasDePagamentos,
    EfiBankConfiguracao
}