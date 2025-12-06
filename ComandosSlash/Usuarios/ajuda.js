const { EmbedBuilder, ApplicationCommandType, ActionRowBuilder, StringSelectMenuBuilder, MessageFlags } = require("discord.js");
const { configuracao } = require("../../DataBaseJson");

module.exports = {
  name: "ajuda",
  description: "📚 Exibe todos os comandos disponíveis do bot",
  type: ApplicationCommandType.ChatInput,
  deferEphemeral: false, // Este comando não precisa ser efêmero

  run: async (client, interaction) => {
    
    const corPrincipal = configuracao.get("Cores.Principal") ?? "#00ff44";

    // Embed principal
    const embedPrincipal = new EmbedBuilder()
      .setTitle(`📚 Central de Ajuda - ${client.user.username}`)
      .setDescription(
        `Olá ${interaction.user}! Aqui está a lista completa de comandos disponíveis.\n\n` +
        `**Selecione uma categoria abaixo para ver os comandos:**\n` +
        `🛠️ **Administração** - Comandos para gerenciar o servidor\n` +
        `👤 **Usuários** - Comandos para todos os membros\n` +
        `📦 **Produtos & Vendas** - Gerenciar produtos e vendas\n` +
        `🎫 **Tickets & Suporte** - Sistema de tickets\n` +
        `🎲 **Gerador** - Sistema de geração de contas\n\n` +
        `💡 *Use o menu abaixo para navegar entre as categorias*`
      )
      .setColor(corPrincipal)
      .setThumbnail(client.user.displayAvatarURL())
      .setFooter({ 
        text: `Solicitado por ${interaction.user.username}`, 
        iconURL: interaction.user.displayAvatarURL() 
      })
      .setTimestamp();

    // Menu de seleção
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('help_category')
      .setPlaceholder('📋 Selecione uma categoria')
      .addOptions([
        {
          label: '🛠️ Administração',
          description: 'Comandos administrativos e de configuração',
          value: 'admin',
          emoji: '🛠️'
        },
        {
          label: '👤 Usuários',
          description: 'Comandos disponíveis para todos',
          value: 'users',
          emoji: '👤'
        },
        {
          label: '📦 Produtos & Vendas',
          description: 'Gerenciamento de produtos e vendas',
          value: 'products',
          emoji: '📦'
        },
        {
          label: '🎫 Tickets & Suporte',
          description: 'Sistema de atendimento',
          value: 'tickets',
          emoji: '🎫'
        },
        {
          label: '🎲 Gerador',
          description: 'Sistema de geração de contas',
          value: 'generator',
          emoji: '🎲'
        },
        {
          label: '🏠 Menu Principal',
          description: 'Voltar ao menu inicial',
          value: 'home',
          emoji: '🏠'
        }
      ]);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    // Se já foi deferido, usa editReply; caso contrário, reply
    const replyMethod = interaction.deferred ? 'editReply' : 'reply';
    await interaction[replyMethod]({ 
      embeds: [embedPrincipal], 
      components: [row]
    });

    // Coletor para o menu
    const collector = interaction.channel.createMessageComponentCollector({ 
      filter: i => i.user.id === interaction.user.id,
      time: 300000 // 5 minutos
    });

    collector.on('collect', async i => {
      if (i.customId === 'help_category') {
        const category = i.values[0];
        let embed;

        switch(category) {
          case 'admin':
            embed = new EmbedBuilder()
              .setTitle('🛠️ Comandos de Administração')
              .setDescription('Lista completa de comandos administrativos:')
              .setColor(corPrincipal)
              .addFields(
                { 
                  name: '`/botconfig`', 
                  value: '⚙️ Painel principal de configuração do bot', 
                  inline: false 
                },
                { 
                  name: '`/vendas`', 
                  value: '💰 Visualizar estatísticas de vendas (hoje, 7 dias, 30 dias, total)', 
                  inline: false 
                },
                { 
                  name: '`/anunciar`', 
                  value: '📢 Enviar anúncios em canais específicos', 
                  inline: false 
                },
                { 
                  name: '`/say`', 
                  value: '💬 Fazer o bot enviar uma mensagem', 
                  inline: false 
                },
                { 
                  name: '`/lock`', 
                  value: '🔒 Trancar um canal específico', 
                  inline: false 
                },
                { 
                  name: '`/lockall`', 
                  value: '🔐 Trancar todos os canais do servidor', 
                  inline: false 
                },
                { 
                  name: '`/nuke`', 
                  value: '💣 Limpar todas as mensagens de um canal', 
                  inline: false 
                },
                { 
                  name: '`/roleall`', 
                  value: '👥 Adicionar/remover cargo de todos os membros', 
                  inline: false 
                },
                { 
                  name: '`/backup`', 
                  value: '💾 Fazer backup das configurações do bot', 
                  inline: false 
                },
                { 
                  name: '`/webhook`', 
                  value: '🔗 Gerenciar webhooks do servidor', 
                  inline: false 
                },
                { 
                  name: '`/contar`', 
                  value: '🔢 Contar membros do servidor', 
                  inline: false 
                },
                { 
                  name: '`/rank`', 
                  value: '🏆 Visualizar ranking de vendas', 
                  inline: false 
                },
                { 
                  name: '`/perm_add`', 
                  value: '➕ Adicionar permissão a um usuário', 
                  inline: false 
                },
                { 
                  name: '`/perm_remove`', 
                  value: '➖ Remover permissão de um usuário', 
                  inline: false 
                },
                { 
                  name: '`/perm_list`', 
                  value: '📋 Listar todos com permissão', 
                  inline: false 
                },
                { 
                  name: '`/createemojis`', 
                  value: '😊 Criar emojis personalizados', 
                  inline: false 
                }
              )
              .setFooter({ 
                text: `Página 1/1 • Comandos de Administração`, 
                iconURL: interaction.user.displayAvatarURL() 
              })
              .setTimestamp();
            break;

          case 'users':
            embed = new EmbedBuilder()
              .setTitle('👤 Comandos de Usuários')
              .setDescription('Comandos disponíveis para todos os membros:')
              .setColor(corPrincipal)
              .addFields(
                { 
                  name: '`/meu_perfil`', 
                  value: '👤 Visualizar e configurar seu perfil', 
                  inline: false 
                },
                { 
                  name: '`/ajuda`', 
                  value: '📚 Exibir este menu de ajuda', 
                  inline: false 
                }
              )
              .setFooter({ 
                text: `Comandos de Usuários`, 
                iconURL: interaction.user.displayAvatarURL() 
              })
              .setTimestamp();
            break;

          case 'products':
            embed = new EmbedBuilder()
              .setTitle('📦 Comandos de Produtos & Vendas')
              .setDescription('Gerenciamento de produtos, estoque e vendas:')
              .setColor(corPrincipal)
              .addFields(
                { 
                  name: '`/manage_product`', 
                  value: '📦 Gerenciar produtos do sistema', 
                  inline: false 
                },
                { 
                  name: '`/manage_stock`', 
                  value: '📊 Gerenciar estoque de produtos', 
                  inline: false 
                },
                { 
                  name: '`/manage_item`', 
                  value: '🏷️ Gerenciar itens individuais', 
                  inline: false 
                },
                { 
                  name: '`/entregar`', 
                  value: '📮 Fazer entrega manual de produtos', 
                  inline: false 
                },
                { 
                  name: '`/generate_pay`', 
                  value: '💳 Gerar pagamento manual', 
                  inline: false 
                },
                { 
                  name: '`/create_mass_coupon`', 
                  value: '🎟️ Criar cupons em massa', 
                  inline: false 
                },
                { 
                  name: '`/remove_mass_coupon`', 
                  value: '🗑️ Remover cupons em massa', 
                  inline: false 
                },
                { 
                  name: '`/cupomwin`', 
                  value: '🎁 Gerenciar cupons de desconto', 
                  inline: false 
                }
              )
              .setFooter({ 
                text: `Comandos de Produtos & Vendas`, 
                iconURL: interaction.user.displayAvatarURL() 
              })
              .setTimestamp();
            break;

          case 'tickets':
            embed = new EmbedBuilder()
              .setTitle('🎫 Comandos de Tickets & Suporte')
              .setDescription('Sistema de atendimento e tickets:')
              .setColor(corPrincipal)
              .addFields(
                { 
                  name: '`/close_ticket`', 
                  value: '🔒 Fechar um ticket específico', 
                  inline: false 
                },
                { 
                  name: '`/closetickets`', 
                  value: '🔐 Fechar múltiplos tickets', 
                  inline: false 
                },
                { 
                  name: '`/archive_ticket`', 
                  value: '📁 Arquivar ticket', 
                  inline: false 
                },
                { 
                  name: '**Menus de Contexto:**', 
                  value: 'Clique com o botão direito em mensagens para acessar:', 
                  inline: false 
                },
                { 
                  name: '📝 Gerenciar Produto', 
                  value: 'Menu de contexto para gerenciar produtos', 
                  inline: true 
                },
                { 
                  name: '📊 Gerenciar Estoque', 
                  value: 'Menu de contexto para estoque', 
                  inline: true 
                },
                { 
                  name: '👤 Perfil do Usuário', 
                  value: 'Ver perfil via menu de contexto', 
                  inline: true 
                }
              )
              .setFooter({ 
                text: `Comandos de Tickets & Suporte`, 
                iconURL: interaction.user.displayAvatarURL() 
              })
              .setTimestamp();
            break;

          case 'generator':
            embed = new EmbedBuilder()
              .setTitle('🎲 Comandos do Gerador')
              .setDescription('Sistema de geração automática de contas:')
              .setColor(corPrincipal)
              .addFields(
                { 
                  name: '`/gerar [serviço]`', 
                  value: '🎲 Gerar uma conta de um serviço específico\n*Exemplo: `/gerar serviço:Netflix`*', 
                  inline: false 
                },
                { 
                  name: '`/stockgen`', 
                  value: '📊 Ver todos os serviços disponíveis e seus estoques', 
                  inline: false 
                },
                { 
                  name: '📝 Como funciona:', 
                  value: 
                    '1️⃣ Use `/stockgen` para ver os serviços disponíveis\n' +
                    '2️⃣ Use `/gerar` no canal configurado\n' +
                    '3️⃣ Receba sua conta por mensagem privada\n' +
                    '4️⃣ Clique no botão para copiar os dados', 
                  inline: false 
                },
                { 
                  name: '⚠️ Requisitos:', 
                  value: 
                    '• Estar no canal de geração correto\n' +
                    '• Ter o cargo necessário (se configurado)\n' +
                    '• Respeitar o cooldown entre gerações\n' +
                    '• DM aberta para receber a conta', 
                  inline: false 
                }
              )
              .setFooter({ 
                text: `Sistema de Gerador`, 
                iconURL: interaction.user.displayAvatarURL() 
              })
              .setTimestamp();
            break;

          case 'home':
            embed = embedPrincipal;
            break;
        }

        await i.update({ embeds: [embed], components: [row] });
      }
    });

    collector.on('end', async () => {
      try {
        // Desabilitar o menu após o timeout
        const disabledRow = new ActionRowBuilder().addComponents(
          selectMenu.setDisabled(true)
        );
        await interaction.editReply({ components: [disabledRow] });
      } catch (error) {
        // Mensagem já pode ter sido deletada
      }
    });
  }
};
