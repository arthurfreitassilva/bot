const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder } = require("discord.js");
const { JsonDatabase } = require("wio.db");

const General = new JsonDatabase({ databasePath: "./DataBaseJson/General.json" })
const GeneralKeys = new JsonDatabase({ databasePath: "./DataBaseJson/GeneralKeys.json" })

module.exports = {
    name:"interactionCreate", // Nome do Evento 
    run: async( interaction, client) => {


        if(interaction.isButton() && interaction.customId === "sistemagerador") {

            const isSystemOn = General.get(`${interaction.guild.id}.sistema`) === "on";

            const embed = new EmbedBuilder()
            .setColor(`${General.get(`${interaction.guild.id}.cor_gen`) || `#2e2e2e` }`)
            .setDescription(`**# Painel de Personalização do seu Bot de gerador**\n> - Personalize o bot do jeito que você quiser.\n> - O Gerador está na versão **\`1.0.0\`**`)

            const botoes = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId("toggle_sistema")
                .setLabel(`Gerador ${isSystemOn ? 'On' : 'Off'}`) 
                .setEmoji(isSystemOn ? '1383399544448090205' : '1383407510136029204') 
                .setStyle(isSystemOn ? 3 : 4), 
                new ButtonBuilder()
                .setCustomId("titlegen")
                .setLabel(`Alterar título do gerador`)
                .setEmoji('1377455273857515552')
                .setStyle(1),
                new ButtonBuilder()
                .setCustomId("bannergen")
                .setLabel(`Alterar banner do gerador`)
                .setEmoji('1382444869074550924')
                .setStyle(1),
                new ButtonBuilder()
                .setCustomId("corgen")
                .setLabel(`Alterar cor do gerador`)
                .setEmoji('1383849315621015716')
                .setStyle(1),
                new ButtonBuilder()
                .setCustomId("cooldawngen")
                .setLabel(`Alterar cooldown do gerador`)
                .setEmoji('1309962546718969908')
                .setStyle(1)
            )
        
        const botoes2 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId("canalgen")
                .setLabel(`Canal do gerador`)
                .setEmoji('1383849343781437484')
                .setStyle(1),
                new ButtonBuilder()
                .setCustomId("cargogen")
                .setLabel(`Cargo do gerador`)
                .setEmoji('1385230886370545895')
                .setStyle(1),
                new ButtonBuilder()
                .setCustomId("configgenpainelzika")
                .setLabel(`Voltar`)
                .setEmoji('1371580877598887996')
                .setStyle(2)
            )
        
            await interaction.update({ embeds: [embed], components: [botoes, botoes2], ephemeral: true });
        }

            if (interaction.isButton() && interaction.customId === "toggle_sistema") { 
            const currentSystemStatus = General.get(`${interaction.guild.id}.sistema`);
            const isSystemOn = currentSystemStatus === "on" ? "off" : "on";
        
            await General.set(`${interaction.guild.id}.sistema`, isSystemOn);
        
            const embed = new EmbedBuilder()
                .setAuthor({ name: `${client.user.username}`, iconURL: client.user.avatarURL({ dynamic: true }) })
                .setTitle('Personalização do Gerador rOS')
                .setColor(`${General.get(`${interaction.guild.id}.cor_gen`) || `#2e2e2e`}`)
                .addFields({ name: '**Versão do Gerador**', value: `1.0.0` })
                .setDescription(`**Painel de configuração do gerador no seu bot**\n\n# > - Personalize o bot do jeito que você quiser.`);
        
            // Atualiza os botões dinamicamente com o novo status do sistema
            const botoesAtualizados = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId("toggle_sistema")
                    .setLabel(`Gerador ${isSystemOn === "on" ? 'On' : 'Off'}`)
                    .setEmoji(isSystemOn === "on" ? '1383399544448090205' : '1383407510136029204')
                    .setStyle(isSystemOn === "on" ? 3 : 4),
                    new ButtonBuilder()
                    .setCustomId("titlegen")
                    .setLabel(`Alterar título do gerador`)
                    .setEmoji('1377455273857515552')
                    .setStyle(1),
                    new ButtonBuilder()
                    .setCustomId("bannergen")
                    .setLabel(`Alterar banner do gerador`)
                    .setEmoji('1382444869074550924')
                    .setStyle(1),
                    new ButtonBuilder()
                    .setCustomId("corgen")
                    .setLabel(`Alterar cor do gerador`)
                    .setEmoji('1383849315621015716')
                    .setStyle(1),
                    new ButtonBuilder()
                    .setCustomId("cooldawngen")
                    .setLabel(`Alterar cooldown do gerador`)
                    .setEmoji('1309962546718969908')
                    .setStyle(1)
                );
        
                const botoes2Atualizados = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId("canalgen")
                    .setLabel(`Canal do gerador`)
                    .setEmoji('1383849343781437484')
                    .setStyle(1),
                    new ButtonBuilder()
                    .setCustomId("cargogen")
                    .setLabel(`Cargo do gerador`)
                    .setEmoji('1385230886370545895')
                    .setStyle(1),
                    new ButtonBuilder()
                    .setCustomId("configgenpainelzika")
                    .setLabel(`Voltar`)
                    .setEmoji('1371580877598887996')
                    .setStyle(2)
                )
                    
            await interaction.update({ embeds: [embed], components: [botoesAtualizados, botoes2Atualizados], ephemeral: true });
        }
                  

        if (interaction.isButton() && interaction.customId === "titlegen") {

            const modal = new ModalBuilder()
                .setCustomId("modaltitle")
                .setTitle("Alterar titulo do Gerador");

            const text1 = new TextInputBuilder()
                .setCustomId("novotitle")
                .setRequired(true)
                .setPlaceholder(`Apos trocar, todos irão poder ver o novo titulo do gerador.`)
                .setLabel("Titulo do Gerador")
                .setStyle(1);

            modal.addComponents(
                new ActionRowBuilder().addComponents(text1)
            );

            await interaction.showModal(modal);
        } else if (interaction.isModalSubmit() && interaction.customId === 'modaltitle') {
            
            const title = interaction.fields.getTextInputValue('novotitle');

            await General.set(`${interaction.guild.id}.titulo_gen`, title)

            await interaction.reply({ content: `O titulo do gerador foi alterado para \`${title}\` com sucesso!`, ephemeral: true });

        }

        if (interaction.isButton() && interaction.customId === "bannergen") {

            const modal = new ModalBuilder()
                .setCustomId("modalbannergen")
                .setTitle("Alterar banner do Gerador");

            const text1 = new TextInputBuilder()
                .setCustomId("novobannergen")
                .setRequired(true)
                .setPlaceholder(`Apos trocar, todos irão poder ver o novo banner do gerador.`)
                .setLabel("Banner do Gerador")
                .setStyle(1);

            modal.addComponents(
                new ActionRowBuilder().addComponents(text1)
            );

            await interaction.showModal(modal);
        } else if (interaction.isModalSubmit() && interaction.customId === 'modalbannergen') {
            
            const banner = interaction.fields.getTextInputValue('novobannergen');

            const isValidUrl = (url) => {
                try {
                    new URL(url);
                    return true;
                } catch (e) {
                    return false;
                }
            };
        
            if (!isValidUrl(banner)) {
                return interaction.reply({ content: `URL do banner inválida!`, ephemeral: true });
            }

            await General.set(`${interaction.guild.id}.banner_gen`, banner)

            await interaction.reply({ content: `O banner do gerador foi alterado com sucesso!`, ephemeral: true });

        }

        if (interaction.isButton() && interaction.customId === "corgen") {

            const modal = new ModalBuilder()
                .setCustomId("modalcor")
                .setTitle("Alterar cor do Gerador");

            const text1 = new TextInputBuilder()
                .setCustomId("novacorgen")
                .setRequired(true)
                .setPlaceholder(`Apos trocar, todos irão poder ver a nova cor do gerador.`)
                .setLabel("Cor do Gerador")
                .setStyle(1);

            modal.addComponents(
                new ActionRowBuilder().addComponents(text1)
            );

            await interaction.showModal(modal);
        } else if (interaction.isModalSubmit() && interaction.customId === 'modalcor') {
            
            const cor = interaction.fields.getTextInputValue('novacorgen');

    const isValidColor = (color) => {
        const hexColorPattern = /^[0-9A-Fa-f]{6}$/;
        return hexColorPattern.test(color);
    };

    if (!isValidColor(cor)) {
        return interaction.reply({ content: `Cor da Embed inválida! Exemplo: \`0ea3e2\``, ephemeral: true });
    }

    await General.set(`${interaction.guild.id}.cor_gen`, `#${cor}`);

    await interaction.reply({ content: `A cor do gerador foi alterada para \`#${cor}\` com sucesso!`, ephemeral: true });
}

        if (interaction.isButton() && interaction.customId === "cooldawngen") {

            const modal = new ModalBuilder()
                .setCustomId("modalcooldawn")
                .setTitle("Alterar cooldawn do Gerador");

            const text1 = new TextInputBuilder()
                .setCustomId("novocooldawn")
                .setRequired(true)
                .setPlaceholder(`s = segundos, m = minutos e h = horas`)
                .setLabel("Cooldawn do Gerador")
                .setStyle(1);

            modal.addComponents(
                new ActionRowBuilder().addComponents(text1)
            );

            await interaction.showModal(modal);
        } else if (interaction.isModalSubmit() && interaction.customId === 'modalcooldawn') {
            
            const cooldawn = interaction.fields.getTextInputValue('novocooldawn');

    const parseCoolDown = (input) => {
        const regex = /(\d+)([smh])/g;
        let totalMilliseconds = 0;
        let match;

        while ((match = regex.exec(input)) !== null) {
            const value = parseInt(match[1], 10);
            const unit = match[2];

            if (unit === 's') totalMilliseconds += value * 1000;
            else if (unit === 'm') totalMilliseconds += value * 60 * 1000;
            else if (unit === 'h') totalMilliseconds += value * 60 * 60 * 1000;
        }

        return totalMilliseconds > 0 ? totalMilliseconds : null;
    };

    const cooldawnMilliseconds = parseCoolDown(cooldawn);
    
    if (cooldawnMilliseconds === null) {
        return interaction.reply({ content: `Tempo inválido! Utilize um formato como \`10s\`, \`5m\` ou \`2h\`.`, ephemeral: true });
    }

    const cooldawnInfoSouMouH = cooldawn.replace(/(\d+)([smh])/g, '$1 $2').replace('s', 'segundos').replace('m', 'minutos').replace('h', 'horas');

    await General.set(`${interaction.guild.id}.gen_cooldawn`, cooldawnMilliseconds);

    await interaction.reply({ content: `O cooldawn do gerador foi alterado para \`${cooldawnInfoSouMouH}\` com sucesso!`, ephemeral: true });
}

if (interaction.isButton() && interaction.customId === "canalgen") {

    const modal = new ModalBuilder()
        .setCustomId("modalcanalgen")
        .setTitle("Alterar canal do Gerador");

    const text1 = new TextInputBuilder()
        .setCustomId("novocanalgen")
        .setRequired(true)
        .setPlaceholder(`Todos so irão poder gerar neste canal.`)
        .setLabel("Canal do Gerador")
        .setStyle(1);

    modal.addComponents(
        new ActionRowBuilder().addComponents(text1)
    );

    await interaction.showModal(modal);
} else if (interaction.isModalSubmit() && interaction.customId === 'modalcanalgen') {
    
    const canal = interaction.fields.getTextInputValue('novocanalgen');

    const channel = interaction.guild.channels.cache.get(canal);

if (!channel) {
    return interaction.reply({ content: `Canal não encontrado. Por favor, forneça um canal de texto válido.`, ephemeral: true });
}

if (channel.type !== 0) {
    return interaction.reply({ content: `Por favor, forneça um canal de texto válido. Canais de categoria ou de voz não são permitidos.`, ephemeral: true });
}

await General.set(`${interaction.guild.id}.canal_gerador`, canal);

await interaction.reply({ content: `O canal do gerador foi alterado para <#${canal}> com sucesso!`, ephemeral: true });
}

if (interaction.isButton() && interaction.customId === "cargogen") {

    const modal = new ModalBuilder()
        .setCustomId("modalcargogen")
        .setTitle("Alterar cargo do Gerador");

    const text1 = new TextInputBuilder()
        .setCustomId("novocargogen")
        .setRequired(true)
        .setPlaceholder(`Caso queira ter um cargo pro gerador.`)
        .setLabel("Cargo do Gerador")
        .setStyle(1);

    modal.addComponents(
        new ActionRowBuilder().addComponents(text1)
    );

    await interaction.showModal(modal);
} else if (interaction.isModalSubmit() && interaction.customId === 'modalcargogen') {
    
    const cargo = interaction.fields.getTextInputValue('novocargogen');

    const role = interaction.guild.roles.cache.get(cargo);

    if (!role) {
        return interaction.reply({ content: `Cargo não encontrado. Por favor, forneça um cargo válido.`, ephemeral: true });
    }


await General.set(`${interaction.guild.id}.cargo_gerador`, cargo);

await interaction.reply({ content: `O cargo do gerador foi alterado para <@&${cargo}> com sucesso!`, ephemeral: true });
}

    }
}