const { ButtonBuilder, ButtonStyle, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder, PermissionFlagsBits, Client, GatewayIntentBits } = require('discord.js');

module.exports = (client) => {
  client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    // Painel inicial ao clicar no botão criarservidordo0
    if (interaction.customId === 'criarservidordo0') {
      const embed = new EmbedBuilder()
        .setTitle('Painel de Criação de Servidor')
        .setDescription('Clique no botão abaixo para logar com seu token.')
        .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
        .setColor('#00ff00');

      const loginButton = new ButtonBuilder()
        .setCustomId('login_token')
        .setLabel('Logar Token')
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(loginButton);

      await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }

    // Modal para inserir o token
    if (interaction.customId === 'login_token') {
      const modal = new ModalBuilder()
        .setCustomId('token_modal')
        .setTitle('Login com Token');

      const tokenInput = new TextInputBuilder()
        .setCustomId('token_input')
        .setLabel('Digite seu Token')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const row = new ActionRowBuilder().addComponents(tokenInput);
      modal.addComponents(row);

      await interaction.showModal(modal);
    }
  });

  client.on('interactionCreate', async interaction => {
    if (!interaction.isModalSubmit()) return;

    // Processar o token submetido no modal
    if (interaction.customId === 'token_modal') {
      await interaction.reply({ content: 'Carregando...', ephemeral: true });

      const token = interaction.fields.getTextInputValue('token_input');
      const tempClient = new Client({ intents: [GatewayIntentBits.Guilds] });

      await interaction.editReply({ content: 'Verificando Token...', ephemeral: true });

      try {
        await tempClient.login(token);
        await interaction.editReply({ content: 'Token Válido!', ephemeral: true });
        await tempClient.destroy();

        await interaction.editReply({ content: 'Carregando...', ephemeral: true });

        const embed = new EmbedBuilder()
          .setTitle('Criação de Servidor')
          .setDescription('Qual tipo de servidor deseja criar?')
          .setColor('#00ff00');

        const lojaButton = new ButtonBuilder()
          .setCustomId(`create_server_loja_${token}`)
          .setLabel('Loja')
          .setStyle(ButtonStyle.Success);

        const vazamentosButton = new ButtonBuilder()
          .setCustomId(`create_server_vazamentos_${token}`)
          .setLabel('Vazamentos')
          .setStyle(ButtonStyle.Success);

        const appsButton = new ButtonBuilder()
          .setCustomId(`create_server_apps_${token}`)
          .setLabel('Apps')
          .setStyle(ButtonStyle.Success);

        const row = new ActionRowBuilder().addComponents(lojaButton, vazamentosButton, appsButton);

        await interaction.editReply({ embeds: [embed], content: '', components: [row], ephemeral: true });
      } catch (error) {
        await interaction.editReply({ content: 'Token Inválido!', ephemeral: true });
      }
    }
  });

  client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    // Criar o servidor com base no tipo selecionado
    if (interaction.customId.startsWith('create_server_')) {
      const [_, type, token] = interaction.customId.split('_');
      await interaction.reply({ content: 'Criando servidor...', ephemeral: true });

      const tempClient = new Client({ intents: [GatewayIntentBits.Guilds] });

      try {
        await tempClient.login(token);

        const guild = await tempClient.guilds.create({
          name: `${type.charAt(0).toUpperCase() + type.slice(1)} Server`,
          icon: null,
        });

        // Criar cargos
        const adminRole = await guild.roles.create({
          name: 'Admin',
          color: '#ff0000',
          permissions: [PermissionFlagsBits.Administrator],
        });

        const memberRole = await guild.roles.create({
          name: 'Membro',
          color: '#00ff00',
          permissions: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
        });

        // Criar canais
        const welcomeChannel = await guild.channels.create({
          name: 'bem-vindo',
          type: 0, // Canal de texto
          permissionOverwrites: [
            { id: guild.id, allow: [PermissionFlagsBits.ViewChannel], deny: [PermissionFlagsBits.SendMessages] },
            { id: adminRole.id, allow: [PermissionFlagsBits.SendMessages] },
          ],
        });

        const generalChannel = await guild.channels.create({
          name: 'geral',
          type: 0,
          permissionOverwrites: [
            { id: guild.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] },
          ],
        });

        // Configurações específicas por tipo de servidor
        let category, specificChannel;
        if (type === 'loja') {
          category = await guild.channels.create({ name: 'Loja', type: 4 }); // Categoria
          specificChannel = await guild.channels.create({
            name: 'produtos',
            type: 0,
            parent: category.id,
            permissionOverwrites: [{ id: guild.id, allow: [PermissionFlagsBits.ViewChannel] }],
          });
        } else if (type === 'vazamentos') {
          category = await guild.channels.create({ name: 'Vazamentos', type: 4 });
          specificChannel = await guild.channels.create({
            name: 'leaks',
            type: 0,
            parent: category.id,
            permissionOverwrites: [{ id: guild.id, allow: [PermissionFlagsBits.ViewChannel] }],
          });
        } else if (type === 'apps') {
          category = await guild.channels.create({ name: 'Apps', type: 4 });
          specificChannel = await guild.channels.create({
            name: 'downloads',
            type: 0,
            parent: category.id,
            permissionOverwrites: [{ id: guild.id, allow: [PermissionFlagsBits.ViewChannel] }],
          });
        }

        await welcomeChannel.send(`Bem-vindo ao ${guild.name}! Configure seu servidor e divirta-se!`);
        await interaction.editReply({ content: `Servidor "${guild.name}" criado com sucesso!`, ephemeral: true });

        await tempClient.destroy();
      } catch (error) {
        await interaction.editReply({ content: 'Erro ao criar o servidor. Verifique o token ou tente novamente.', ephemeral: true });
      }
    }
  });
};