const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  StringSelectMenuBuilder,
  ButtonStyle,
  MessageFlags
} = require("discord.js");

const { produtos, configuracao } = require("../DataBaseJson");
const { QuickDB } = require("quick.db");
const db = new QuickDB();

/**
 * Helper: tenta atualizar a interação; se não for possível, faz reply/followUp safe.
 * Sempre usa flags: 64 (ephemeral) quando for reply/followUp.
 */
async function safeRespond(interaction, payload) {
  try {
    // Se já foi deferido, editar a reply atual
    if (interaction.deferred || interaction.replied) {
      return await interaction.editReply(payload);
    }

    // Se for componente de mensagem e podemos atualizar (não deferido ainda)
    if (interaction.isMessageComponent() && typeof interaction.update === "function") {
      // Prefer update quando for um componente
      return await interaction.update(payload);
    }

    // Caso normal: reply
    return await interaction.reply({ ...payload, flags: MessageFlags.Ephemeral });
  } catch (err) {
    console.error("safeRespond error:", err.message);
    // Tenta editReply se já foi deferido
    if (interaction.deferred || interaction.replied) {
      try {
        return await interaction.editReply(payload);
      } catch (editErr) {
        console.error("safeRespond editReply failed:", editErr.message);
      }
    }
  }
}

/**
 * Formata condições (cargo / min / max) em string legível
 */
function formatCondicoes(cond) {
  if (!cond) return "Não Definido";
  const parts = [];
  if (cond.idcargo) parts.push(`Possuir o cargo <@&${cond.idcargo}>.`);
  if (cond.valorminimo) parts.push(`Comprar no mínimo ${cond.valorminimo} unidades.`);
  if (cond.valormaximo) parts.push(`Comprar no máximo ${cond.valormaximo} unidades.`);
  return parts.length ? parts.join("\n") : "Não Definido";
}

/**
 * Gera embed & componentes para um campo específico (GerenciarCampos2).
 * - interaction: Interaction
 * - campo: nome do campo
 * - produtoname: nome do produto (opcional)
 * - update: se true -> atualiza interação; se false -> reply
 * - reply: quando update=true, reply determina se usa reply no lugar de update (fluxos complexos)
 */
async function GerenciarCampos2(interaction, campo, produtoname, update = true, reply = false) {
  try {
    // CRITICAL: Defer interaction immediately to avoid timeout (3 second limit)
    if (!interaction.deferred && !interaction.replied) {
      // For message components (buttons/selects), use deferUpdate; for commands, use deferReply
      if (interaction.isMessageComponent()) {
        await interaction.deferUpdate().catch(err => {
          console.error("Failed to defer update:", err.message);
        });
      } else {
        await interaction.deferReply({ ephemeral: true }).catch(err => {
          console.error("Failed to defer reply:", err.message);
        });
      }
    }

    // Recupera referência do produto/carrinho: se produtoname fornecido, usa ele; senão pega do DB (mensagem)
    let productRef;
    if (produtoname) {
      productRef = { name: produtoname, camposelect: campo };
    } else {
      // tenta ler do quickdb; se não existir, avisa
      const saved = await db.get(interaction.message?.id || interaction.id);
      if (!saved || !saved.name) {
        return safeRespond(interaction, { content: "Produto não encontrado no contexto dessa mensagem.", embeds: [], components: [] });
      }
      productRef = saved;
      // atualiza camposelect
      await db.set(`${interaction.message.id}.camposelect`, campo).catch(() => {});
    }

    const produtoName = productRef.name;
    const camposDoProduto = produtos.get(`${produtoName}.Campos`);
    if (!camposDoProduto) {
      return safeRespond(interaction, { content: `Produto "${produtoName}" não encontrado.`, embeds: [], components: [] });
    }

    const campoObj = camposDoProduto.find(c => c.Nome === campo);
    if (!campoObj) {
      return safeRespond(interaction, { content: `Campo "${campo}" não existe nesse produto.`, embeds: [], components: [] });
    }

    // Informações formatadas
    const infoCargosAdd = campoObj.roleadd ? `Após a compra, terá o cargo <@&${campoObj.roleadd}> adicionado` : "";
    const infoCargosRemove = campoObj.rolerem ? `Após a compra, terá o cargo <@&${campoObj.rolerem}> removido` : "";
    const infoCargosTemp24 = campoObj.temprole24 ? `Tempo (24h): ${campoObj.temprole24}` : "";
    const cargosCombined = [infoCargosAdd, infoCargosTemp24, infoCargosRemove].filter(Boolean).join("\n") || "Não Definido";

    const condicoesStr = formatCondicoes(campoObj.condicao);

    const ultimaReposicao = produtos.get(`${produtoName}.UltimaReposicao`);
    const detalhes = ultimaReposicao ? `Última reposição no estoque <t:${Math.ceil(ultimaReposicao / 1000)}:R>` : `Criado <t:${Math.ceil((campoObj.criado || Date.now()) / 1000)}:R>`;

    const cor = configuracao.get("Cores.Principal") || "0cd4cc";

    const embed = new EmbedBuilder()
      .setAuthor({ name: `${produtoName}` })
      .setTitle(`${campoObj.Nome}`)
      .setColor(cor)
      .setTimestamp()
      .setFooter({ text: interaction.guild?.name || "", iconURL: interaction.guild?.iconURL?.({ dynamic: true }) || null })
      .addFields(
        { name: "Estoque", value: `\`${(campoObj.estoque || []).length}\``, inline: true },
        { name: "Preço", value: `\`R$ ${Number(campoObj.valor || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\``, inline: true },
        { name: "Condições", value: condicoesStr, inline: true },
        { name: "Cargos", value: cargosCombined, inline: false },
        { name: "Detalhes", value: detalhes, inline: false }
      );

    if (campoObj.desc) embed.setDescription(campoObj.desc);

    // Componentes
    const rowTop = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("editarcampooo").setLabel("Editar").setEmoji("1178079212700188692").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("cargosremadd").setLabel("Cargos").setEmoji("1183066194085953597").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("definircondicoes").setLabel("Definir condições").setEmoji("1178317298793205851").setStyle(ButtonStyle.Primary),
    );

    const rowMid = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("estoquedsadas").setLabel("Ver estoque").setEmoji("1178317490686795836").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("permcomprar").setLabel("Auth Require").setEmoji("1305252886694854669").setStyle(ButtonStyle.Secondary).setDisabled(false),
      new ButtonBuilder().setCustomId("addestoquecampos").setLabel("Adicionar estoque").setEmoji("1178076508150059019").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId("cleanestoquecampos").setLabel("Limpar estoque").setEmoji("1178076767567757312").setStyle(ButtonStyle.Danger)
    );

    const rowBottom = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("Voltar4").setLabel("Voltar").setEmoji("1178068047202893869").setStyle(ButtonStyle.Secondary)
    );

    // Decide como responder (update vs reply) com fallback para reply
    const payload = { embeds: [embed], components: [rowTop, rowMid, rowBottom], content: "" };

    // Salva no QuickDB: usamos messageId caso já exista (quando update), senão aguardamos a fetchReply depois
    try {
      // Se estamos atualizando (provavelmente via componente)
      if (update) {
        await safeRespond(interaction, payload);

        // salvar contexto no DB: se interaction.message existir (update), usamos ela
        const messageId = interaction.message?.id || (interaction.replied ? (await interaction.fetchReply()).id : null);
        if (messageId) {
          await db.set(messageId, { name: produtoName, camposelect: campo }).catch(() => {});
        }
        return;
      }

      // Caso reply (nova mensagem)
      const replyResult = await interaction.reply({ ...payload, flags: MessageFlags.Ephemeral, fetchReply: true }).catch(async () => {
        // fallback safeRespond
        await safeRespond(interaction, payload);
        return interaction.fetchReply();
      });

      const msg = replyResult || (await interaction.fetchReply().catch(() => null));
      if (msg && msg.id) await db.set(msg.id, { name: produtoName, camposelect: campo }).catch(() => {});
    } catch (err) {
      console.error("GerenciarCampos2 error:", err);
      await safeRespond(interaction, { content: "Ocorreu um erro ao gerar o painel do campo.", embeds: [], components: [] });
    }
  } catch (err) {
    console.error("GerenciarCampos2 outer error:", err);
    await safeRespond(interaction, { content: "Erro inesperado ao gerenciar campo.", embeds: [], components: [] });
  }
}

/**
 * GerenciarCampos: painel dos campos do produto (lista / resumo)
 * - interaction: Interaction
 * - produtoname: string
 */
async function GerenciarCampos(interaction, produtoname) {
  try {
    // CRITICAL: Defer interaction immediately to avoid timeout (3 second limit)
    if (!interaction.deferred && !interaction.replied) {
      // For message components (buttons/selects), use deferUpdate; for commands, use deferReply
      if (interaction.isMessageComponent()) {
        await interaction.deferUpdate().catch(err => {
          console.error("Failed to defer update:", err.message);
        });
      } else {
        await interaction.deferReply({ ephemeral: true }).catch(err => {
          console.error("Failed to defer reply:", err.message);
        });
      }
    }

    const produto = produtos.get(produtoname);
    if (!produto) {
      return safeRespond(interaction, { content: `Produto ${produtoname} não encontrado.`, embeds: [], components: [] });
    }

    // Monta resumo dos campos (até 5 últimos)
    let camposText = "";
    if (!Array.isArray(produto.Campos) || produto.Campos.length === 0) {
      camposText = "Nenhum campo adicionado";
    } else {
      const limit = Math.min(5, produto.Campos.length);
      const slice = produto.Campos.slice(-limit).reverse();
      for (const camp of slice) {
        camposText += `- Nome: \`${camp.Nome}\` Estoque: \`${(camp.estoque || []).length}\` Valor: \`R$ ${Number(camp.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\`\n`;
      }
      if (produto.Campos.length > 5) camposText += `E mais ${produto.Campos.length - 5}...`;
    }

    // Monta resumo de cupons (até 3 últimos)
    let cupomText = "";
    if (!Array.isArray(produto.Cupom) || produto.Cupom.length === 0) {
      cupomText = "Nenhum cupom";
    } else {
      const limit = Math.min(3, produto.Cupom.length);
      const slice = produto.Cupom.slice(-limit).reverse();
      for (const c of slice) {
        const a1 = c.condicoes?.cargospodeusar ? `Possuí o cargo <@&${c.condicoes.cargospodeusar}>` : "";
        const a2 = c.condicoes?.precominimo ? `Comprar no mínimo \`${c.condicoes.precominimo}\` unidades` : "";
        const a3 = c.condicoes?.qtdmaxima ? `Comprar no máximo \`${c.condicoes.qtdmaxima}\` unidades` : "";
        const cond = [a1, a2, a3].filter(Boolean).join(", ") || "Não Definido";

        cupomText += `- Código: \`${c.Nome}\` Quantidade: \`${c.qtd == undefined ? `Ilimitado` : c.qtd}\` Desconto: \`${c.desconto}%\` Max. Usos: \`${c.maxuse == undefined ? `Ilimitado` : c.maxuse}\` Validade: \`${c.diasvalidos2 == undefined ? `Não expira` : c.diasvalidos2}\` N. Usos: \`${c.usos || 0}\` Condições: ${cond}\n`;
      }
      if (produto.Cupom.length > 3) cupomText += `E mais ${produto.Cupom.length - 3}...`;
    }

    const cor = configuracao.get("Cores.Principal") || "0cd4cc";

    const embed = new EmbedBuilder()
      .setAuthor({ name: produto.Config?.name || produtoname, iconURL: interaction.guild?.iconURL?.({ dynamic: true }) || null })
      .setTitle("Detalhes")
      .addFields(
        { name: "Campos", value: camposText || "Nenhum campo", inline: false },
        { name: "Cupons", value: cupomText || "Nenhum cupom", inline: false },
        { name: "Entrega automática", value: `${produto.Config?.entrega ?? "Não definido"}`, inline: false }
      )
      .setFooter({ text: interaction.guild?.name || "", iconURL: interaction.guild?.iconURL?.({ dynamic: true }) || null })
      .setTimestamp()
      .setColor(cor);

    // Select menu com todos os campos
    const camposArray = produto.Campos || [];
    const select = new StringSelectMenuBuilder()
      .setCustomId("configurarcampooo")
      .setPlaceholder("Clique aqui para gerenciar algum campo")
      .setMinValues(0)
      .setMaxValues(1);

    for (const campo of camposArray) {
      const desc = campo.desc ? (campo.desc.length > 70 ? campo.desc.slice(0, 67) + "..." : campo.desc) : "Não definido";
      select.addOptions({ label: campo.Nome, description: desc, value: campo.Nome });
    }

    const rowSelect = new ActionRowBuilder().addComponents(select);
    const rowActions = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("addcampoo").setLabel("Adicionar campo").setEmoji("1178076508150059019").setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId("remcampo").setLabel("Remover campo").setEmoji("1178076767567757312").setStyle(ButtonStyle.Danger)
    );
    const rowBack = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId("voltargerenciarproduto").setLabel("Voltar").setEmoji("1178068047202893869").setStyle(ButtonStyle.Secondary)
    );

    // Decide se mostra select (se existirem opções) ou só botões
    const payload = camposArray.length ? { embeds: [embed], components: [rowSelect, rowActions, rowBack], content: "" }
                                       : { embeds: [embed], components: [rowActions, rowBack], content: "" };

    // tenta update e salva contexto
    await safeRespond(interaction, payload);

    // guarda referência do produto na mensagem
    try {
      const messageId = interaction.message?.id || (interaction.replied ? (await interaction.fetchReply()).id : null);
      if (messageId) await db.set(messageId, { name: produtoname }).catch(() => {});
    } catch (err) {
      // ignore
    }
  } catch (err) {
    console.error("GerenciarCampos error:", err);
    await safeRespond(interaction, { content: "Erro ao exibir gerenciamento de campos.", embeds: [], components: [] });
  }
}

module.exports = {
  GerenciarCampos,
  GerenciarCampos2
};
