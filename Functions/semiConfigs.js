const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { configuracao } = require("../DataBaseJson")

async function semiConfigs(interaction, client) {

    const semiAutoStatus = configuracao.get("pagamentos.SemiAutomatico.status") ?? false;
    const semiAutoPix = configuracao.get("pagamentos.SemiAutomatico.pix") ?? null;
    const semiAutoMsg = configuracao.get("pagamentos.SemiAutomatico.msg") ?? null;

    const embed = new EmbedBuilder()
        .setColor(`${configuracao.get(`Cores.Principal`) ?? '0cd4cc'}`)
        .setTitle(`Configurar Pagamento Manual - ${semiAutoStatus == false ? "Desabilitado" : "Habilitado"}`)
        .setDescription(`-# > Aqui, você pode definir uma chave Pix e uma mensagem para o seu ${client.user.username} enviar quando a forma de pagamento "Pix" for selecionada. Ele irá gerar um QR Code com o valor exato do carrinho para essa chave. Lembre-se de que ele não consegue verificar se o pagamento foi aprovado, então você precisará clicar em "Confirmar pagamento" para iniciar o processo de entrega.\n- \`\⚠\` Caso tente alterar o pix com a função ativada, isso fara com que o bot de erro, configure e depois, ligue!\n-# caso o erro tenha sumido, ele foi resolvido!`)
        .addFields(
            {
                name: `\`\🔑\` Chave PIX`, value: `\`${semiAutoPix == null ? "Não configurado" : semiAutoPix}\``
            },
            {
                name: `\`\💬\` Mensagem De Auxílio`, value: `- ${semiAutoMsg == null ? "Não configurado" : semiAutoMsg}`
            }
        )
        .setFooter({ text: `Aviso: Manter esta função habilitada sobrescreverá a função automática do Mercado Pago.`, iconURL: interaction.guild.iconURL() })
        .setTimestamp()

    const row1 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder().setCustomId(`onOffSemi`).setLabel(semiAutoStatus != false ? "Desabilitar" : "Habilitar").setEmoji(`1246953228655132772`).setStyle(semiAutoStatus != false ? 4 : 3),
            new ButtonBuilder().setCustomId(`editConfigSemi`).setLabel(`Alterar Configurações`).setEmoji(`1246953149009367173`).setStyle(1),
            
        )

    const row2 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("formasdepagamentos")
                .setEmoji(`1238413255886639104`)
                .setStyle(2),
            new ButtonBuilder()
                .setCustomId(`voltar1`)
                .setEmoji('1292237216915128361')
                .setStyle(1)
        )

    interaction.editReply({ content: ``, embeds: [embed], components: [row1, row2] })

}

module.exports = {
    semiConfigs
}