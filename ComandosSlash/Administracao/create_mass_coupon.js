const {
  PermissionFlagsBits,
  ApplicationCommandType,
  ActionRowBuilder,
  ButtonBuilder
} = require("discord.js");

const Discord = require("discord.js");
const { produtos } = require("../../DataBaseJson");
const { getPermissions } = require("../../Functions/PermissionsCache.js");
const { Emojis } = require("../../DataBaseJson");

module.exports = {
  name: "cupom",
  description: "[🤖] Criar e configurar cupons",
  type: ApplicationCommandType.ChatInput,
  autoDeferReply: false, // Desabilita defer automático para evitar conflito com replies diretos
  options: [
    { name: "name", description: "-", type: Discord.ApplicationCommandOptionType.String, required: true },
    { name: "discount", description: "-", type: Discord.ApplicationCommandOptionType.Number, required: true },
    { name: "days", description: "-", type: Discord.ApplicationCommandOptionType.Number, required: false },
    { name: "max_uses", description: "-", type: Discord.ApplicationCommandOptionType.Number, required: false },
    { name: "amount", description: "-", type: Discord.ApplicationCommandOptionType.Number, required: false },
    { name: "role", description: "-", type: Discord.ApplicationCommandOptionType.Role, required: false },
    { name: "buy_amount_max", description: "-", type: Discord.ApplicationCommandOptionType.Number, required: false },
    { name: "buy_amount", description: "-", type: Discord.ApplicationCommandOptionType.Number, required: false }
  ],
  default_member_permissions: PermissionFlagsBits.Administrator,

  run: async (client, interaction) => {

    // PERMISSÃO CUSTOMIZADA
    const perm = await getPermissions(client.user.id);
    if (!perm || !perm.includes(interaction.user.id)) {
      return interaction.reply({
        content: `${Emojis.get(`negative_dreamm67`)} Faltam permissões.`,
        ephemeral: true
      });
    }

    // CAPTURA DAS OPTIONS
    const nome = interaction.options.getString("name");
    const discount = interaction.options.getNumber("discount");
    const days = interaction.options.getNumber("days") ?? null;
    const max_uses = interaction.options.getNumber("max_uses") ?? null;
    const amount = interaction.options.getNumber("amount") ?? null;
    const role = interaction.options.getRole("role") ?? null;
    const buy_amount_max = interaction.options.getNumber("buy_amount_max") ?? null;
    const buy_amount = interaction.options.getNumber("buy_amount") ?? null;

    // VALIDAÇÕES
    if (discount > 100) return interaction.reply({ content: "O desconto não pode ser maior que 100%.", ephemeral: true });
    if (discount < 0) return interaction.reply({ content: "O desconto não pode ser menor que 0.", ephemeral: true });

    const validarNumber = (valor, nome) => {
      if (valor !== null && valor < 0) {
        return interaction.reply({ content: `${nome} não pode ser menor que 0.`, ephemeral: true });
      }
    };

    validarNumber(days, "Os dias");
    validarNumber(max_uses, "O máximo de usos");
    validarNumber(amount, "A quantidade");
    validarNumber(buy_amount_max, "A quantidade de compra máxima");
    validarNumber(buy_amount, "A quantidade de compra");

    // DATA DE EXPIRAÇÃO DO CUPOM
    let expira = null;
    if (days !== null) {
      const dataFinal = new Date();
      dataFinal.setDate(dataFinal.getDate() + days);
      expira = dataFinal.getTime();
    }

    // CONDIÇÕES OPCIONAIS
    const condicoes = {};
    if (buy_amount_max !== null) condicoes.qtdmaxima = buy_amount_max;
    if (buy_amount !== null) condicoes.precominimo = buy_amount;
    if (role) condicoes.cargospodeusar = role.id;

    // OBJETO DO CUPOM
    const cupom = {
      Nome: nome,
      desconto: discount,
      usos: 0,
      criado: Date.now(),
      ...(expira && { diasvalidos: expira, diasvalidos2: days }),
      ...(max_uses !== null && { maxuse: max_uses }),
      ...(amount !== null && { qtdcupom: amount }),
      ...(Object.keys(condicoes).length > 0 && { condicoes })
    };

    // SALVAR CUPOM EM TODOS OS PRODUTOS
    const listaProdutos = produtos.fetchAll();
    const adicionados = [];
    const existentes = [];

    if (!listaProdutos.length) {
      return interaction.reply({
        content: "⚠️ Nenhum produto encontrado para aplicar o cupom.",
        ephemeral: true
      });
    }

    listaProdutos.forEach(item => {
      const jaTem = item.data.Cupom.find(c => c.Nome === nome);

      if (!jaTem) {
        item.data.Cupom.push(cupom);
        adicionados.push(item.ID);
      } else {
        existentes.push(item.ID);
      }
    });

    // SALVAR NO JSON
    listaProdutos.forEach(item => {
      produtos.set(`${item.ID}.Cupom`, item.data.Cupom);
    });

    // RESPOSTA FINAL
    return interaction.reply({
      content:
        `🎟️ Cupom **${nome}** criado com sucesso!\n\n` +
        `📦 Aplicado em **${adicionados.length}** produtos.\n` +
        (existentes.length > 0
          ? `⚠️ Já existia em **${existentes.length}** produtos.\n` +
            `IDs repetidos:\n\`${existentes.slice(0, 10).join("\n")}${existentes.length > 10 ? `\n... e mais ${existentes.length - 10}` : ""}\``
          : ""),
      ephemeral: true
    });

  }
};
