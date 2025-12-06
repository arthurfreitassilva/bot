const { MessageFlags } = require("discord.js");

/**
 * Garante que uma interação foi deferida antes de processar.
 * Previne o erro "Unknown interaction" (timeout de 3 segundos).
 * 
 * @param {Interaction} interaction - A interação do Discord
 * @param {Object} options - Opções de deferimento
 * @param {boolean} options.ephemeral - Se a resposta deve ser efêmera (padrão: true)
 * @param {boolean} options.update - Se deve usar deferUpdate para componentes (padrão: auto-detectar)
 * @returns {Promise<void>}
 */
async function ensureDeferred(interaction, options = {}) {
  // Se já foi deferido ou respondido, não faz nada
  if (interaction.deferred || interaction.replied) {
    return;
  }

  const { ephemeral = true, update = null } = options;

  try {
    // Auto-detecta se é componente de mensagem
    const shouldUpdate = update !== null ? update : interaction.isMessageComponent?.();

    if (shouldUpdate) {
      // Para botões e select menus, usa deferUpdate
      await interaction.deferUpdate();
    } else {
      // Para comandos slash, usa deferReply
      const flags = ephemeral ? MessageFlags.Ephemeral : undefined;
      await interaction.deferReply({ flags });
    }
  } catch (error) {
    console.error("Erro ao deferir interação:", error.message);
  }
}

/**
 * Responde a uma interação de forma segura, lidando com casos onde já foi deferida.
 * Substitui o uso direto de interaction.reply/update/editReply.
 * 
 * @param {Interaction} interaction - A interação do Discord
 * @param {Object} payload - O payload da resposta (embeds, components, content, etc)
 * @param {Object} options - Opções adicionais
 * @param {boolean} options.ephemeral - Se a resposta deve ser efêmera (padrão: true)
 * @returns {Promise<Message>}
 */
async function safeReply(interaction, payload, options = {}) {
  const { ephemeral = true } = options;

  try {
    // Adiciona flags de ephemeral se necessário e não foi especificado
    if (ephemeral && !payload.flags && !payload.ephemeral) {
      payload.flags = MessageFlags.Ephemeral;
    }

    // Se já foi deferido ou respondido, usa editReply
    if (interaction.deferred || interaction.replied) {
      return await interaction.editReply(payload);
    }

    // Se é componente de mensagem e não foi deferido, usa update
    if (interaction.isMessageComponent?.() && typeof interaction.update === "function") {
      return await interaction.update(payload);
    }

    // Caso padrão: reply
    return await interaction.reply(payload);
  } catch (error) {
    console.error("Erro em safeReply:", error.message);

    // Fallback: tenta editReply se possível
    if (interaction.deferred || interaction.replied) {
      try {
        return await interaction.editReply(payload);
      } catch (editError) {
        console.error("Erro no fallback editReply:", editError.message);
      }
    }

    throw error;
  }
}

/**
 * Wrapper conveniente para comandos que garante defer automático.
 * Use isto para envolver a lógica do seu comando.
 * 
 * @param {Interaction} interaction - A interação do Discord
 * @param {Function} callback - Função assíncrona a ser executada
 * @param {Object} options - Opções de deferimento
 * @returns {Promise<any>}
 * 
 * @example
 * await withDefer(interaction, async () => {
 *   // Seu código aqui - a interação já está deferida
 *   const data = await fetchData();
 *   await interaction.editReply({ content: "Pronto!" });
 * });
 */
async function withDefer(interaction, callback, options = {}) {
  await ensureDeferred(interaction, options);
  return await callback();
}

module.exports = {
  ensureDeferred,
  safeReply,
  withDefer
};
