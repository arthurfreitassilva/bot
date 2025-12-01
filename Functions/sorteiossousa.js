const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

function loadSorteios() {
  const sorteiosPath = path.join(__dirname, '..', 'databasejson', 'sorteios.json');
  if (!fs.existsSync(sorteiosPath)) {
    fs.writeFileSync(sorteiosPath, JSON.stringify({}));
  }
  try {
    const data = JSON.parse(fs.readFileSync(sorteiosPath));
    return data || {};
  } catch (error) {
    console.error('Erro ao ler sorteios.json:', error);
    return {};
  }
}

function saveSorteios(sorteios) {
  const sorteiosPath = path.join(__dirname, '..', 'databasejson', 'sorteios.json');
  fs.writeFileSync(sorteiosPath, JSON.stringify(sorteios, null, 2));
}

module.exports = {
  async handleSorteio(interaction) {
    console.log(`handleSorteio iniciado às ${new Date().toISOString()} por ${interaction.user.tag}`);
    if (interaction.customId !== 'sorteiosousa') {
      console.log('CustomId inválido, ignorando.');
      return;
    }

    const sorteios = loadSorteios();
    let currentSorteioId = Object.keys(sorteios)[0] || null;

    // Resposta inicial rápida para evitar timeout
    if (!interaction.replied && !interaction.deferred) {
      await interaction.deferReply({ ephemeral: true }).catch(err => console.error('Erro ao deferir:', err));
    }

    const updatePanel = (sorteioId = currentSorteioId) => {
      const embed = new EmbedBuilder()
        .setTitle('Painel de Sorteios')
        .setColor('#00FF00')
        .setTimestamp();

      if (!sorteioId) {
        embed.setDescription('Nenhum sorteio ativo. Use os botões abaixo para gerenciar.');
        const row = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('editSorteio')
              .setLabel('Editar Sorteio')
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId('createSorteio')
              .setLabel('Criar Sorteio')
              .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
              .setCustomId('deleteSorteio')
              .setLabel('Deletar Sorteio')
              .setStyle(ButtonStyle.Danger)
          );
        return { embed, components: [row] };
      }

      const sorteio = sorteios[sorteioId];
      embed.setDescription(
        `**Sorteio: ${sorteio.nome || 'Sem nome'}**\n` +
        `${sorteio.descricao || 'Sem descrição'}\n` +
        `Prêmio: ${sorteio.premio || 'Não configurado'}\n` +
        `Tempo Restante: ${sorteio.tempo ? `${Math.max(0, Math.floor((sorteio.tempo - Date.now()) / 1000))} segundos` : 'Não configurado'}\n` +
        `Status: ${sorteio.pausado ? 'Pausado' : 'Ativo'}`
      );
      if (sorteio.banner) embed.setImage(sorteio.banner);
      if (sorteio.icon) embed.setAuthor({ name: sorteio.nome, iconURL: sorteio.icon });
      if (sorteio.thumb) embed.setThumbnail(sorteio.thumb);

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('pauseResumeSorteio')
            .setLabel(sorteio.pausado ? 'Despausar' : 'Pausar')
            .setStyle(sorteio.pausado ? ButtonStyle.Success : ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('configPrize')
            .setLabel('Configurar Prêmio')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('configFake')
            .setLabel('Configurar Fake')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('configTime')
            .setLabel('Configurar Tempo')
            .setStyle(ButtonStyle.Primary)
        );

      return { embed, components: [row] };
    };

    const { embed, components } = updatePanel();
    try {
      if (interaction.replied) {
        await interaction.editReply({ embeds: [embed], components });
      } else if (interaction.deferred) {
        await interaction.editReply({ embeds: [embed], components });
      } else {
        await interaction.reply({ embeds: [embed], components, ephemeral: true });
      }
    } catch (err) {
      console.error('Erro ao enviar painel:', err);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: 'Erro ao carregar o painel. Tente novamente.', ephemeral: true }).catch(console.error);
      }
    }

    const filter = i => i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 120000 });

    collector.on('collect', async i => {
      console.log(`Interação coletada: ${i.customId} por ${i.user.tag}`);
      if (i.customId === 'editSorteio') {
        const select = new StringSelectMenuBuilder()
          .setCustomId('selectSorteio')
          .setPlaceholder('Selecione um sorteio para editar');
        Object.keys(sorteios).forEach(id => {
          select.addOptions({ label: sorteios[id].nome || `Sorteio ${id}`, value: id });
        });
        await i.update({ components: [new ActionRowBuilder().addComponents(select)] });
      } else if (i.customId === 'createSorteio') {
        const modal = new ModalBuilder()
          .setCustomId('createSorteioModal')
          .setTitle('Criar Sorteio');
        const nameInput = new TextInputBuilder()
          .setCustomId('nameInput')
          .setLabel('Nome')
          .setStyle(TextInputStyle.Short)
          .setRequired(true);
        const descInput = new TextInputBuilder()
          .setCustomId('descInput')
          .setLabel('Descrição')
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true);
        const bannerInput = new TextInputBuilder()
          .setCustomId('bannerInput')
          .setLabel('URL do Banner (Opcional)')
          .setStyle(TextInputStyle.Short);
        const iconInput = new TextInputBuilder()
          .setCustomId('iconInput')
          .setLabel('URL do Ícone (Opcional)')
          .setStyle(TextInputStyle.Short);
        const thumbInput = new TextInputBuilder()
          .setCustomId('thumbInput')
          .setLabel('URL da Thumbnail (Opcional)')
          .setStyle(TextInputStyle.Short);
        modal.addComponents(
          new ActionRowBuilder().addComponents(nameInput),
          new ActionRowBuilder().addComponents(descInput),
          new ActionRowBuilder().addComponents(bannerInput),
          new ActionRowBuilder().addComponents(iconInput),
          new ActionRowBuilder().addComponents(thumbInput)
        );
        await i.showModal(modal);
      } else if (i.customId === 'deleteSorteio') {
        const select = new StringSelectMenuBuilder()
          .setCustomId('deleteSorteioSelect')
          .setPlaceholder('Selecione um sorteio para deletar');
        Object.keys(sorteios).forEach(id => {
          select.addOptions({ label: sorteios[id].nome || `Sorteio ${id}`, value: id });
        });
        await i.update({ components: [new ActionRowBuilder().addComponents(select)] });
      } else if (i.customId === 'pauseResumeSorteio') {
        sorteios[currentSorteioId].pausado = !sorteios[currentSorteioId].pausado;
        saveSorteios(sorteios);
        await i.update(updatePanel());
      } else if (i.customId === 'configPrize') {
        const modal = new ModalBuilder()
          .setCustomId('configPrizeModal')
          .setTitle('Configurar Prêmio');
        const prizeInput = new TextInputBuilder()
          .setCustomId('prizeInput')
          .setLabel('Prêmio')
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true);
        modal.addComponents(new ActionRowBuilder().addComponents(prizeInput));
        await i.showModal(modal);
      } else if (i.customId === 'configFake') {
        const modal = new ModalBuilder()
          .setCustomId('configFakeModal')
          .setTitle('Configurar Fake');
        const fakeInput = new TextInputBuilder()
          .setCustomId('fakeInput')
          .setLabel('ID do Usuário Fake')
          .setStyle(TextInputStyle.Short)
          .setRequired(true);
        modal.addComponents(new ActionRowBuilder().addComponents(fakeInput));
        await i.showModal(modal);
      } else if (i.customId === 'configTime') {
        const modal = new ModalBuilder()
          .setCustomId('configTimeModal')
          .setTitle('Configurar Tempo');
        const timeInput = new TextInputBuilder()
          .setCustomId('timeInput')
          .setLabel('Tempo em Segundos')
          .setStyle(TextInputStyle.Short)
          .setRequired(true);
        modal.addComponents(new ActionRowBuilder().addComponents(timeInput));
        await i.showModal(modal);
      } else if (i.customId === 'selectSorteio') {
        currentSorteioId = i.values[0];
        await i.update(updatePanel(currentSorteioId));
      } else if (i.customId === 'deleteSorteioSelect') {
        const idToDelete = i.values[0];
        delete sorteios[idToDelete];
        saveSorteios(sorteios);
        currentSorteioId = Object.keys(sorteios)[0] || null;
        await i.update(updatePanel());
      }
    });

    collector.on('end', collected => {
      console.log('Collector encerrado.');
      if (interaction.replied) {
        interaction.editReply({ components: [] }).catch(console.error);
      }
    });

    const modalFilter = i => i.customId.startsWith('createSorteioModal') || i.customId.startsWith('config') && i.user.id === interaction.user.id;
    interaction.awaitModalSubmit({ filter: modalFilter, time: 60000 })
      .then(async modalInteraction => {
        const sorteios = loadSorteios();
        if (modalInteraction.customId === 'createSorteioModal') {
          const nome = modalInteraction.fields.getTextInputValue('nameInput');
          const descricao = modalInteraction.fields.getTextInputValue('descInput');
          const banner = modalInteraction.fields.getTextInputValue('bannerInput') || null;
          const icon = modalInteraction.fields.getTextInputValue('iconInput') || null;
          const thumb = modalInteraction.fields.getTextInputValue('thumbInput') || null;
          const newId = Date.now().toString();
          sorteios[newId] = { nome, descricao, banner, icon, thumb, premio: null, tempo: null, pausado: false };
          saveSorteios(sorteios);
          currentSorteioId = newId;
          await modalInteraction.update(updatePanel(newId));
        } else if (modalInteraction.customId === 'configPrizeModal') {
          sorteios[currentSorteioId].premio = modalInteraction.fields.getTextInputValue('prizeInput');
          saveSorteios(sorteios);
          await modalInteraction.update(updatePanel());
        } else if (modalInteraction.customId === 'configFakeModal') {
          sorteios[currentSorteioId].fakeId = modalInteraction.fields.getTextInputValue('fakeInput');
          saveSorteios(sorteios);
          await modalInteraction.update(updatePanel());
        } else if (modalInteraction.customId === 'configTimeModal') {
          const time = parseInt(modalInteraction.fields.getTextInputValue('timeInput'));
          if (!isNaN(time) && time > 0) {
            sorteios[currentSorteioId].tempo = Date.now() + time * 1000;
            saveSorteios(sorteios);
          }
          await modalInteraction.update(updatePanel());
        }
      })
      .catch(err => console.error('Erro ao aguardar modal:', err));
  },
};