const Discord = require("discord.js");
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");
const { Painel } = require("../../Functions/Painel");
const { Gerenciar } = require("../../Functions/Gerenciar");
const { ConfigRoles } = require("../../Functions/ConfigRoles");
const { produtos, configuracao, perms, pagamentos } = require("../../DataBaseJson");
const { GerenciarProduto } = require("../../Functions/CreateProduto");
const { QuickDB } = require("quick.db");
const { GerenciarCampos, GerenciarCampos2 } = require("../../Functions/GerenciarCampos");
const { UpdateMessageProduto } = require("../../Functions/SenderMessagesOrUpdates");
const { FormasDePagamentos } = require("../../Functions/FormasDePagamentosConfig");
const { semiConfigs } = require("../../Functions/semiConfigs");
const { gerenciarPerms } = require("../../Functions/modUsersPerms");
const { Emojis } = require("../../DataBaseJson");
const db = new QuickDB();


module.exports = {
    name: 'interactionCreate',

    run: async (interaction, client) => {

        if (interaction.isButton() && interaction.customId === "unlockChannel") {

            interaction.channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: true })

            interaction.update({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(`Este canal ${interaction.channel} foi destrancado por (${interaction.user})`)
                        .setColor(`#00FF00`)
                ],
                components: [
                    new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder().setCustomId(`unlockChannel`).setLabel(`Destrancar`).setStyle(2)
                        )
                ]
            });

        }


        if (interaction.isStringSelectMenu()) {
            if (interaction.customId.startsWith('configproduto_')) {
                GerenciarProduto(interaction, 2, interaction.values[0])
            }


            if (interaction.customId == 'deletarprodutocampo') {

                const ggg2 = await db.get(interaction.message.id)
                if (interaction.values.length == 0) {
                    GerenciarCampos(interaction, ggg2.name)
                    return
                }

                const modalaAA = new ModalBuilder()
                    .setCustomId('duigawd8wa8dtgvaw7')
                    .setTitle(`Remover campo`);

                const newnameboteN = new TextInputBuilder()
                    .setCustomId('tokenMP')
                    .setLabel(`Confirmação`)
                    .setPlaceholder(`Digite "sim" para apagar ${interaction.values.length} campos`)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)

                const firstActionRow5 = new ActionRowBuilder().addComponents(newnameboteN);



                modalaAA.addComponents(firstActionRow5);
                await interaction.showModal(modalaAA);


                await db.set(`${interaction.message.id}.delcampo`, interaction.values)
            }



            if (interaction.customId == 'configurarcampooo') {



                GerenciarCampos2(interaction, interaction.values[0])
            }

        }

        if (interaction.type == Discord.InteractionType.ModalSubmit) {
            if (interaction.customId === 'ConfigurarPagamentoManual2') {
                let a2 = interaction.fields.getTextInputValue('tokenMP2');
                let a3 = interaction.fields.getTextInputValue('tokenMP3');

                const atual = await configuracao.get("pagamentos.SemiAutomatico.status") ?? false

                configuracao.set(`pagamentos.SemiAutomatico`, { status: atual, pix: a2, msg: a3 })

                await interaction.update({ content: `${Emojis.get(`loading_emoji`)} Carregando...`, embeds: [], components: [] })

                semiConfigs(interaction, client);

            }
        }

        if (interaction.isButton()) {

            if (interaction.customId == "ConfigurarPagamentoManual") {

                await interaction.update({ content: `${Emojis.get(`loading_emoji`)} Carregando...`, embeds: [], components: [] })

                semiConfigs(interaction, client);

            }

            if (interaction.customId == 'editConfigSemi') {

                const dd = configuracao.get(`pagamentos.SemiAutomatico`) ?? { pix: '', msg: '' }

                const modalaAA = new ModalBuilder()
                    .setCustomId('ConfigurarPagamentoManual2')
                    .setTitle(`Configurar Pagamento Manual`);

                const newnameboteE = new TextInputBuilder()
                    .setCustomId('tokenMP2')
                    .setLabel(`CHAVE PIX`)
                    .setPlaceholder(`Insira uma chave pix válida`)
                    .setStyle(TextInputStyle.Short)
                    .setValue(`${dd?.pix ?? ''}`)
                    .setRequired(true)

                const newnameboteD = new TextInputBuilder()
                    .setCustomId('tokenMP3')
                    .setLabel(`MENSAGEM APÓS REQUISIÇÃO DO PEDIDO`)
                    .setPlaceholder(`Insira aqui uma mensagem, ex: após o pagamento, envie o comprovante aqui.`)
                    .setStyle(TextInputStyle.Short)
                    .setValue(`${dd?.msg ?? ''}`)
                    .setRequired(true)

                const firstActionRow6 = new ActionRowBuilder().addComponents(newnameboteE);
                const firstActionRow7 = new ActionRowBuilder().addComponents(newnameboteD);


                modalaAA.addComponents(firstActionRow6, firstActionRow7);
                await interaction.showModal(modalaAA);

            }

            if (interaction.customId == 'onOffSemi') {
                const currentStatus = configuracao.get("pagamentos.SemiAutomatico.status") ?? false;
                if (currentStatus == false) {
                    configuracao.set("pagamentos.SemiAutomatico.status", true);
                    await interaction.update({ content: `${Emojis.get(`loading_emoji`)} Carregando...`, embeds: [], components: [] })
                    semiConfigs(interaction, client);
                } else {
                    configuracao.set("pagamentos.SemiAutomatico.status", false);
                    await interaction.update({ content: `${Emojis.get(`loading_emoji`)} Carregando...`, embeds: [], components: [] })
                    semiConfigs(interaction, client);
                }
            }

            if (interaction.customId == 'Voltar4') {
                const ggg2 = await db.get(interaction.message.id)
                GerenciarCampos(interaction, ggg2.name)
            }

            if (interaction.customId == 'Voltar10') {
                const ggg2 = await db.get(interaction.message.id)
                GerenciarCampos2(interaction, ggg2.camposelect, ggg2.name, true)
            }



            if (interaction.customId == 'gerenciarcampossss') {

                const ggg2 = await db.get(interaction.message.id)
                const ggg = produtos.get(`${ggg2.name}.Campos`)
                const gggaa = produtos.get(`${ggg2.name}`)


                if (ggg.length == 1) {
                    GerenciarCampos2(interaction, ggg[0].Nome)

                } else {


                    const selectMenuBuilder = new Discord.StringSelectMenuBuilder()
                        .setCustomId('configurarcampooo')
                        .setPlaceholder('Clique aqui para selecionar')
                        .setMinValues(0)

                    for (const gggg of ggg) {

                        const gggag = gggg.desc == '' ? `Não definido` : `${gggg.desc}`

                        const option = {
                            label: `${gggg.Nome}`,
                            description: `${gggag}`,
                            value: gggg.Nome,
                            emoji: '1178163524443316285'
                        };

                        selectMenuBuilder.addOptions(option);
                    }

                    const style2row = new ActionRowBuilder().addComponents(selectMenuBuilder);
                    try {
                        await interaction.update({ components: [style2row], content: `${interaction.user} Quais campos de \`${gggaa.Config.name}\` deseja gerenciar?`, embeds: [] })
                    } catch (error) {
                    }
                }
            }





            if (interaction.customId == 'remcampo') {
                const selectMenuBuilder = new Discord.StringSelectMenuBuilder()
                    .setCustomId('deletarprodutocampo')
                    .setPlaceholder('Clique aqui para selecionar')
                    .setMinValues(0)

                const ggg2 = await db.get(interaction.message.id)
                const ggg = produtos.get(`${ggg2.name}.Campos`)

                if (ggg == 0) {
                    interaction.reply({ ephemeral: true, content: `${Emojis.get(`negative_dreamm67`)}  Esse produto ainda não possuí nenhum campo.` })
                    return
                }

                const ggg22 = produtos.get(`${ggg2.name}`)

                for (const gggg of ggg) {

                    const gggag = gggg.desc == '' ? `Não definido` : `${gggg.desc}`
                    const option = {
                        label: `${gggg.Nome}`,
                        description: `${gggag}`,
                        value: gggg.Nome,
                        emoji: '1178163524443316285'
                    };

                    selectMenuBuilder.addOptions(option);
                }

                selectMenuBuilder.setMaxValues(selectMenuBuilder.options.length)
                const style2row = new ActionRowBuilder().addComponents(selectMenuBuilder);

                try {


                    await interaction.update({ components: [style2row], content: `❓ Quais campos de \`${ggg22.Config.name}\` deseja remover?`, embeds: [] })
                } catch (error) {
                }
            }


            if (interaction.customId == 'addcampoo') {
                const ggg2 = await db.get(interaction.message.id)
                const ggg = produtos.get(`${ggg2.name}.Campos`)
                if (ggg.length >= 24) return interaction.reply({ ephemeral: true, content: `${Emojis.get(`negative_dreamm67`)}  Você já adicionou o máximo de campos possível nesse produto.` })


                const modalaAA = new ModalBuilder()
                    .setCustomId('sdaju112341111idsjjsdua')
                    .setTitle(`Criar campo`);

                const newnameboteN = new TextInputBuilder()
                    .setCustomId('tokenMP')
                    .setLabel(`NOME DO CAMPO`)
                    .setPlaceholder(`Insira o nome desejado`)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)

                const newnameboteN2 = new TextInputBuilder()
                    .setCustomId('tokenMP2')
                    .setLabel(`DESCRIÇÃO DO CAMPO`)
                    .setPlaceholder(`Insira uma descriação desejada`)
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(false)
                    .setMaxLength(4000)

                const newnameboteN24 = new TextInputBuilder()
                    .setCustomId('tokenMP7')
                    .setLabel(`Ponha um emoji`)
                    .setPlaceholder(`Ponha Um Emoji`)
                    .setStyle(TextInputStyle.Short)
                    .setMaxLength(20)
                    .setRequired(false)

                const newnameboteN4 = new TextInputBuilder()
                    .setCustomId('tokenMP3')
                    .setLabel(`PREÇO DO CAMPO`)
                    .setPlaceholder(`Insira um preço desejado (BRL)`)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)


                const firstActionRow3 = new ActionRowBuilder().addComponents(newnameboteN);
                const firstActionRow4 = new ActionRowBuilder().addComponents(newnameboteN2);
                const firstActionRow5 = new ActionRowBuilder().addComponents(newnameboteN4);
                const firstActionRow6 = new ActionRowBuilder().addComponents(newnameboteN24)




                modalaAA.addComponents(firstActionRow3, firstActionRow4, firstActionRow5, firstActionRow6);
                await interaction.showModal(modalaAA);


            }




            if (interaction.customId == 'voltargerenciarproduto') {
                const ggg = await db.get(interaction.message.id)
                GerenciarProduto(interaction, 2, ggg.name)
            }


            if (interaction.customId == 'gencampos') {

                const ggg = await db.get(interaction.message.id)
                GerenciarCampos(interaction, ggg.name)


            }



            if (interaction.customId == 'editproduto') {

                const ggg = await db.get(interaction.message.id)

                const hhh = produtos.get(ggg.name)

                const modalaAA = new ModalBuilder()
                    .setCustomId('Editar')
                    .setTitle(`Criação`);

                const newnameboteN = new TextInputBuilder()
                    .setCustomId('tokenMP')
                    .setLabel(`NOME`)
                    .setPlaceholder(`Insira o nome desejado`)
                    .setValue(`${hhh.Config.name}`)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false)

                const newnameboteN2 = new TextInputBuilder()
                    .setCustomId('tokenMP2')
                    .setLabel(`DESCRIÇÃO`)
                    .setPlaceholder(`Insira uma descriação desejada`)
                    .setStyle(TextInputStyle.Paragraph)
                    .setValue(`${hhh.Config.desc}`)
                    .setRequired(false)
                    .setMaxLength(1024)

                const newnameboteN4 = new TextInputBuilder()
                    .setCustomId('tokenMP3')
                    .setLabel(`ENTREGA AUTOMÁTICA?`)
                    .setPlaceholder(`Digite "sim" ou "não"`)
                    .setStyle(TextInputStyle.Short)
                    .setValue(`${hhh.Config.entrega}`)
                    .setMaxLength(3)
                    .setRequired(false)

                const newnameboteN5 = new TextInputBuilder()
                    .setCustomId('tokenMP4')
                    .setLabel(`ICONE`)
                    .setPlaceholder(`Insira uma URL de uma imagem ou gif`)
                    .setStyle(TextInputStyle.Short)
                    .setValue(`${hhh.Config.icon == undefined ? '' : hhh.Config.icon}`)
                    .setRequired(false)

                const newnameboteN6 = new TextInputBuilder()
                    .setCustomId('tokenMP5')
                    .setLabel(`BANNER`)
                    .setPlaceholder(`Insira uma URL de uma imagem ou gif`)
                    .setStyle(TextInputStyle.Short)
                    .setValue(`${hhh.Config.banner == undefined ? '' : hhh.Config.banner}`)
                    .setRequired(false)

                const firstActionRow3 = new ActionRowBuilder().addComponents(newnameboteN);
                const firstActionRow4 = new ActionRowBuilder().addComponents(newnameboteN2);
                const firstActionRow5 = new ActionRowBuilder().addComponents(newnameboteN4);
                const firstActionRow6 = new ActionRowBuilder().addComponents(newnameboteN5);
                const firstActionRow7 = new ActionRowBuilder().addComponents(newnameboteN6);



                modalaAA.addComponents(firstActionRow3, firstActionRow4, firstActionRow5, firstActionRow6, firstActionRow7);
                await interaction.showModal(modalaAA);


            }




            if (interaction.customId == "gerenciarotemae") {
                await interaction.update({
                    embeds: [],
                    components: [],
                    content: `${Emojis.get(`loading_emoji`)} Aguarde...`,
                });

                const ggg = produtos.fetchAll();
                const placeholderPrefix = "Clique aqui para selecionar";

                const allSelectMenus = [];
                let optionsCount = 0;
                let currentSelectMenuBuilder;


                for (const gggg of ggg) {

                    let aaaaaa;


                    let desc = gggg?.data?.Config?.desc

                    if (desc == undefined) {
                        desc = "Não definido";
                    }
                    if (desc && desc.length > 0) {
                        aaaaaa = desc.slice(0, 70);
                    } else {
                        aaaaaa = "Não definido";
                    }


                    let name = gggg?.data?.Config?.name
                    if (name == undefined) {
                        name = "Não definido";
                    }
                    const option = {
                        label: `${name}`,
                        description: `${aaaaaa}`,
                        value: gggg.ID,
                        emoji: "1178163524443316285",
                    }

                    if (optionsCount % 25 === 0) {
                        if (currentSelectMenuBuilder) {
                            allSelectMenus.push(currentSelectMenuBuilder);
                        }

                        currentSelectMenuBuilder = new Discord.StringSelectMenuBuilder()
                            .setCustomId(`configproduto_${optionsCount / 25 + 1}`)
                            .setPlaceholder(
                                `[${optionsCount / 25 + 1}] ${placeholderPrefix}`
                            );
                    }

                    currentSelectMenuBuilder.addOptions(option);
                    optionsCount++;
                }

                if (currentSelectMenuBuilder) {
                    allSelectMenus.push(currentSelectMenuBuilder);
                }

                const rows = allSelectMenus.map((selectMenuBuilder) => {
                    return new ActionRowBuilder().addComponents(selectMenuBuilder);
                });

                interaction.editReply({
                    components: [...rows],
                    content: `${interaction.user} Qual produto deseja gerenciar?`,
                });
            }

        }

        if (interaction.isModalSubmit) {
            if (interaction.customId === 'duigawd8wa8dtgvaw7') {
                let confirm = interaction.fields.getTextInputValue('tokenMP');
                if (confirm !== 'sim') return interaction.reply({ content: `${Emojis.get(`negative_dreamm67`)}  Confirmação não validada.`, ephemeral: true })

                const ggg22 = await db.get(`${interaction.message.id}.delcampo`)
                const ggg = await db.get(`${interaction.message.id}`)
                for (const iterator of ggg22) {

                    produtos.pull(`${ggg.name}.Campos`, (element, index, array) => element.Nome == iterator);
                }

                GerenciarCampos(interaction, ggg.name)
                await UpdateMessageProduto(client, ggg.name)
            }
            if (interaction.customId === 'sdaju112341111idsjjsdua') {
                let nomecampo = interaction.fields.getTextInputValue('tokenMP');
                let desccampo = interaction.fields.getTextInputValue('tokenMP2');
                let precocampo = interaction.fields.getTextInputValue('tokenMP3');
                let emojicampo = interaction.fields.getTextInputValue('tokenMP7');
            
                // Se o campo emoji estiver vazio ou não definido, adiciona o emoji padrão
                if (!emojicampo || emojicampo.trim() === '') {
                    emojicampo = '<:CarrinhoDeCompras:1250848496987406487>';
                }
            
                nomecampo = nomecampo.replace(/\./g, '').trim();
                const ggg = await db.get(interaction.message.id);

                // Validação melhorada de preço
                const precoNumerico = Number(precocampo);
                if (isNaN(precoNumerico) || precoNumerico < 0) {
                    return interaction.reply({ ephemeral: true, content: `${Emojis.get(`negative_dreamm67`)}  Preço inserido \`${precocampo}\` inválido. Deve ser um número positivo.` });
                }

                // Validação de nome vazio
                if (!nomecampo || nomecampo.length === 0) {
                    return interaction.reply({ ephemeral: true, content: `${Emojis.get(`negative_dreamm67`)}  Nome do campo não pode ser vazio.` });
                }

                const produtoExistente = produtos
                    .filter(produto => produto.data.Campos)
                    .some(produto => produto.data.Campos.some(campo => campo.Nome === nomecampo));

                if (produtoExistente) return interaction.reply({ ephemeral: true, content: `${Emojis.get(`negative_dreamm67`)}  Nome do campo já existente.` })

                produtos.push(`${ggg.name}.Campos`, {
                    estoque: [],
                    valor: precoNumerico,
                    Nome: nomecampo,
                    desc: desccampo || '',
                    emoji: emojicampo,
                    criado: Date.now()
                })

                await GerenciarCampos(interaction, ggg.name)

                interaction.followUp({ content: `${Emojis.get(`positive_dream`)} Campo adicionado.`, ephemeral: true })
                await UpdateMessageProduto(client, ggg.name)
            }

            // Função auxiliar para validar URLs
            function isURL(str) {
                if (!str || str.trim() === '') return false;
                const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
                return urlRegex.test(str);
            }

            if (interaction.customId === 'Editar') {
                await interaction.update({ embeds: [], components: [], content: `${Emojis.get(`loading_emoji`)} Aguarde...` })

                let nome = interaction.fields.getTextInputValue('tokenMP');
                let desc = interaction.fields.getTextInputValue('tokenMP2');
                let enttrega = interaction.fields.getTextInputValue('tokenMP3');
                let icon = interaction.fields.getTextInputValue('tokenMP4');
                let banner = interaction.fields.getTextInputValue('tokenMP5');

                const ggg = await db.get(interaction.message.id);

                // Validação melhorada de entrega automática
                if (enttrega !== '') {
                    const entregaLower = enttrega.toLowerCase().trim();
                    if (entregaLower === 'não' || entregaLower === 'nao') {
                        enttrega = 'Não';
                    } else if (entregaLower === 'sim') {
                        enttrega = 'Sim';
                    } else {
                        return interaction.editReply({ content: `${Emojis.get(`negative_dreamm67`)}  Entrega automática deve ser "sim" ou "não".` });
                    }
                    produtos.set(`${ggg.name}.Config.entrega`, enttrega);
                }

                produtos.set(`${ggg.name}.Config.name`, nome.trim());

                if (desc !== '') {
                    produtos.set(`${ggg.name}.Config.desc`, desc);
                } else {
                    produtos.set(`${ggg.name}.Config.desc`, "Não definido");
                }

                // Verificar se icon é uma URL válida
                if (icon !== '' && icon.trim() !== '') {
                    if (isURL(icon)) {
                        produtos.set(`${ggg.name}.Config.icon`, icon);
                    } else {
                        return interaction.editReply({ content: `${Emojis.get(`negative_dreamm67`)}  URL do ícone inválida. Use formato: https://exemplo.com/imagem.png` });
                    }
                } else {
                    produtos.delete(`${ggg.name}.Config.icon`);
                }

                // Verificar se banner é uma URL válida
                if (banner !== '' && banner.trim() !== '') {
                    if (isURL(banner)) {
                        produtos.set(`${ggg.name}.Config.banner`, banner);
                    } else {
                        return interaction.editReply({ content: `${Emojis.get(`negative_dreamm67`)}  URL do banner inválida. Use formato: https://exemplo.com/imagem.png` });
                    }
                } else {
                    produtos.delete(`${ggg.name}.Config.banner`);
                }

                GerenciarProduto(interaction, 1, ggg.name);
            }

            if (interaction.customId === 'sdaju11111idsjjsdua') {

                let nome = interaction.fields.getTextInputValue('tokenMP');
                let desc = interaction.fields.getTextInputValue('tokenMP2');
                let enttrega = interaction.fields.getTextInputValue('tokenMP3');
                let icon = interaction.fields.getTextInputValue('tokenMP4');
                let banner = interaction.fields.getTextInputValue('tokenMP5');

                nome = nome.replace(/\./g, '').trim();

                // Validação de nome vazio
                if (!nome || nome.length === 0) {
                    return interaction.reply({ ephemeral: true, content: `${Emojis.get(`negative_dreamm67`)}  Nome do produto não pode ser vazio.` });
                }

                // Validação melhorada de entrega automática
                const entregaLower = enttrega.toLowerCase().trim();
                if (entregaLower === 'não' || entregaLower === 'nao') {
                    enttrega = 'Não';
                } else if (entregaLower === 'sim') {
                    enttrega = 'Sim';
                } else {
                    return interaction.reply({ ephemeral: true, content: `${Emojis.get(`negative_dreamm67`)}  Entrega automática deve ser "sim" ou "não".` });
                }

                if (desc == '' || !desc) {
                    desc = 'Não definido';
                }

                await interaction.update({ embeds: [], components: [], content: `${Emojis.get(`loading_emoji`)} Aguarde...` })

                if (produtos.get(`${nome}`) !== null) return interaction.editReply({ content: `${Emojis.get(`negative_dreamm67`)}  Opss, ja existe um produto com esse nome.` })

                // Validação de URLs antes de salvar
                let iconUrl = '';
                let bannerUrl = '';

                if (icon && icon.trim() !== '') {
                    if (isURL(icon)) {
                        iconUrl = icon;
                    } else {
                        return interaction.editReply({ content: `${Emojis.get(`negative_dreamm67`)}  URL do ícone inválida. Use formato: https://exemplo.com/imagem.png` });
                    }
                }

                if (banner && banner.trim() !== '') {
                    if (isURL(banner)) {
                        bannerUrl = banner;
                    } else {
                        return interaction.editReply({ content: `${Emojis.get(`negative_dreamm67`)}  URL do banner inválida. Use formato: https://exemplo.com/imagem.png` });
                    }
                }

                produtos.set(`${nome}`, {
                    Config: {
                        name: nome,
                        desc: desc,
                        entrega: enttrega,
                        ...(iconUrl && { icon: iconUrl }),
                        ...(bannerUrl && { banner: bannerUrl })
                    },
                    Campos: [],
                    Cupom: []
                })

                GerenciarProduto(interaction, 1, nome)
            }
        }



        if (interaction.isModalSubmit() && interaction.customId === "removemember_modal") {
            const userx = interaction.fields.getTextInputValue("text");
            const user = interaction.guild.members.cache.get(userx);

            if (!user) {
                interaction.reply({ content: `${Emojis.get(`negative_dreamm67`)}  Não foi possivel encontrar o usuario de ID \`${userx}\``, ephemeral: true });
            } else {
                if (!perms.has(userx)) return interaction.reply({ content: `${Emojis.get(`negative_dreamm67`)}  O usúario não possui permissão.`, ephemeral: true })

                perms.delete(userx);

                await interaction.update({ content: `${Emojis.get(`loading_emoji`)} Carregando...`, embeds: [], components: [] })

                gerenciarPerms(interaction, client);
            }
        }

        if (interaction.isModalSubmit() && interaction.customId === "adicionarmember_modal") {
            const userx = interaction.fields.getTextInputValue("text");
            const user = interaction.guild.members.cache.get(userx);

            if (!user) {
                interaction.reply({ content: `${Emojis.get(`negative_dreamm67`)}  Não foi possivel encontrar o usuario de ID \`${userx}\``, ephemeral: true });
            } else {
                if (perms.has(userx)) return interaction.reply({ content: `${Emojis.get(`negative_dreamm67`)}  O usúario selecionado já possui permissão.`, ephemeral: true })

                perms.set(userx, userx);

                await interaction.update({ content: `${Emojis.get(`loading_emoji`)} Carregando...`, embeds: [], components: [] })

                gerenciarPerms(interaction, client);
            }

        }

        if (interaction.isModalSubmit() && interaction.customId === "resetmember_modal") {
            const confirm = interaction.fields.getTextInputValue("text").toLowerCase();

            if (confirm === "sim") {
                perms.deleteAll();

                await interaction.update({ content: `${Emojis.get(`loading_emoji`)} Carregando...`, embeds: [], components: [] })

                gerenciarPerms(interaction, client);
            } else {
                interaction.reply({ content: `${Emojis.get(`negative_dreamm67`)} Você não escreveu **sim** corretamente.`, ephemeral: true })
            }
        }

        if (interaction.isStringSelectMenu() && interaction.customId == "selectAdd&RemPerm") {

            const option = interaction.values[0];

            if (option == 'addPermUser') {

                const modal = new ModalBuilder()
                    .setCustomId("adicionarmember_modal")
                    .setTitle("Adicionar");

                const text = new TextInputBuilder()
                    .setCustomId("text")
                    .setLabel("QUEM DESEJA ADICIONAR?")
                    .setPlaceholder(`ID do usuário aqui, ex: 12345678`)
                    .setStyle(1)
                    .setRequired(true)

                modal.addComponents(new ActionRowBuilder().addComponents(text));

                return interaction.showModal(modal);

            }

            if (option == 'remPermUser') {

                const modal = new ModalBuilder()
                    .setCustomId("removemember_modal")
                    .setTitle("Remover");

                const text = new TextInputBuilder()
                    .setCustomId("text")
                    .setLabel("QUEM DESEJA REMOVER?")
                    .setPlaceholder(`ID do usuário aqui, ex: 12345678`)
                    .setStyle(1)
                    .setRequired(true)

                modal.addComponents(new ActionRowBuilder().addComponents(text));

                return interaction.showModal(modal);

            }

        }

            if (interaction.isButton()) {

            if (interaction.customId == 'resetPerms') {

                const modal = new ModalBuilder()
                    .setCustomId("resetmember_modal")
                    .setTitle("Resetar");

                const text = new TextInputBuilder()
                    .setCustomId("text")
                    .setLabel(`Confirmar`)
                    .setPlaceholder(`Digite "sim" para resetar ${perms.all().length} permissões`)
                    .setStyle(1)
                    .setRequired(true)

                modal.addComponents(new ActionRowBuilder().addComponents(text));

                return interaction.showModal(modal);

            }
        }

    }
}