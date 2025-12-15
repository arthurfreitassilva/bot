
const Discord = require("discord.js")
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js")
const { produtos, configuracao, Emojis } = require("../../DataBaseJson");
const { QuickDB } = require("quick.db");
const { GerenciarCampos, GerenciarCampos2 } = require("../../Functions/GerenciarCampos");
const { MessageStock } = require("../../Functions/ConfigEstoque.js");
const { UpdateMessageProduto } = require("../../Functions/SenderMessagesOrUpdates");
const { Gerenciar2 } = require("../../Functions/Painel.js");
const axios = require("axios")
const db = new QuickDB();


module.exports = {
    name: 'interactionCreate',

    run: async (interaction, client) => {

        if (interaction.type == Discord.InteractionType.ModalSubmit) {
            if (interaction.customId === 'sdaju11111idsjjs123dua123') {
                let a1 = interaction.fields.getTextInputValue('tokenMP');
                let a2 = interaction.fields.getTextInputValue('tokenMP2');
                let a3 = interaction.fields.getTextInputValue('tokenMP3');
                let a4 = interaction.fields.getTextInputValue('tokenMP5');
                let a5 = interaction.fields.getTextInputValue('tokenMP6');
                const regexPadrao = /^#[0-9a-fA-F]{6}$/;

                if (a1 !== '') {
                    if (regexPadrao.test(a1)) {
                        configuracao.set(`Cores.Principal`, a1)
                    } else {
                        return interaction.reply({ ephemeral: true, content: `${Emojis.get(`negative_dreamm67`)} Cor \`${a1}\` inválida (Principal).` })
                    }
                }
                if (a2 !== '') {
                    if (regexPadrao.test(a2)) {
                        configuracao.set(`Cores.Processamento`, a2)
                    } else {
                        return interaction.reply({ ephemeral: true, content: `${Emojis.get(`negative_dreamm67`)} Cor \`${a2}\` inválida (Processamento).` })
                    }
                }
                if (a3 !== '') {
                    if (regexPadrao.test(a3)) {
                        configuracao.set(`Cores.Sucesso`, a3)
                    } else {
                        return interaction.reply({ ephemeral: true, content: `${Emojis.get(`negative_dreamm67`)} Cor \`${a3}\` inválida (Sucesso).` })
                    }
                }
                if (a4 !== '') {
                    if (regexPadrao.test(a4)) {
                        configuracao.set(`Cores.Erro`, a4)
                    } else {
                        return interaction.reply({ ephemeral: true, content: `${Emojis.get(`negative_dreamm67`)} Cor \`${a4}\` inválida (Falha).` })
                    }
                }
                if (a5 !== '') {
                    if (regexPadrao.test(a5)) {
                        configuracao.set(`Cores.Finalizado`, a5)
                    } else {
                        return interaction.reply({ ephemeral: true, content: `${Emojis.get(`negative_dreamm67`)} Cor \`${a5}\` inválida (Finalizado).` })
                    }
                }

                interaction.reply({ content: `${Emojis.get(`positive_dream`)} Cores atualizadas com sucesso!`, ephemeral: true })


            }


            if (interaction.customId === 'sdaju11111231idsjjs123dua123') {
                let a1 = interaction.fields.getTextInputValue('tokenMP');
                let a2 = interaction.fields.getTextInputValue('tokenMP2');
                let a3 = interaction.fields.getTextInputValue('tokenMP3');
                let a4 = interaction.fields.getTextInputValue('tokenMP5');

                if (a1 !== '') {
                    try {
                        await client.user.setUsername(a1)
                    } catch (error) {
                        return interaction.reply({ ephemeral: true, content: `${Emojis.get(`negative_dreamm67`)} Nome inserido \`${a1}\` inválido ou então você alterou mais de 3 vezes o nome em 1 hora!` })
                    }
                }
                if (a2 !== '') {
                    try {
                        await client.user.setAvatar(a2)
                    } catch (error) {
                        return interaction.reply({ ephemeral: true, content: `${Emojis.get(`negative_dreamm67`)} Avatar inserido \`${a2}\` inválido.` })
                    }
                }

                if (a3 !== '') {
                    configuracao.set(`Status1`, a3)
                }
                if (a4 !== '') {
                    configuracao.set(`Status2`, a4)
                }

                await interaction.reply({ content: `${Emojis.get(`positive_dream`)} Configurações atualizadas com sucesso!`, ephemeral: true })

            }


            if (interaction.customId === 'dassdadassddsdasddassddasd') {
                let ADD = interaction.fields.getTextInputValue('tokenMP');
                let temprole24 = interaction.fields.getTextInputValue('tokenMP24');
                let REM = interaction.fields.getTextInputValue('tokenMP2');
            
                const ggg = await db.get(interaction.message.id);
                const hhhh = produtos.get(`${ggg.name}.Campos`);
                const gggaaa = hhhh.find(campo => campo.Nome === ggg.camposelect);
            
                if (ADD !== '') {
                    const ddd = await interaction.guild.roles.fetch(ADD);
                    if (ddd == null) return interaction.reply({ ephemeral: true, content: `${Emojis.get(`negative_dreamm67`)} Cargo inserido \`${ADD}\` inválido.` });
                    gggaaa.roleadd = ddd.id;
                } else {
                    delete gggaaa.roleadd;
                }
            
                // Função para validar e formatar a entrada de tempo
                function validarTempo(tempo) {
                    const regex = /^\d+(S|M|D)$/i;
                    return regex.test(tempo);
                }
            
                if (temprole24 !== '') {
                    if (validarTempo(temprole24)) {
                        gggaaa.temprole24 = temprole24;
                    } else {
                        return interaction.reply({ ephemeral: true, content: 'Formato inválido para o tempo. Use o formato: <número><S|M|D> (por exemplo, 20S para 20 segundos).' });
                    }
                }
            
                if (REM !== '') {
                    const ddd = await interaction.guild.roles.fetch(REM);
                    if (ddd == null) return interaction.reply({ ephemeral: true, content: `${Emojis.get(`negative_dreamm67`)} Cargo inserido \`${REM}\` inválido.` });
                    gggaaa.rolerem = ddd.id;
                } else {
                    delete gggaaa.rolerem;
                }
            
                await produtos.set(`${ggg.name}.Campos`, hhhh);
            
                await GerenciarCampos2(interaction, ggg.camposelect);
            
                interaction.followUp({ content: `${Emojis.get(`positive_dream`)} Alterações realizadas com sucesso!`, ephemeral: true });
            }
            








            if (interaction.customId === 'configcampoo') {

                const ggg = await db.get(interaction.message.id);
                let nomecampo = interaction.fields.getTextInputValue('tokenMP');
                let preco = interaction.fields.getTextInputValue('tokenMP2');
                let desc = interaction.fields.getTextInputValue('tokenMP3');
                let emoji = interaction.fields.getTextInputValue('tokenMP7');
            
                // Se o campo emoji estiver vazio ou indefinido, adiciona o emoji padrão
                if (!emoji || emoji.trim() === '') {
                    emoji = '<:carrinho1:1351387558680072292>';
                }
            
                const hhhh = produtos.get(`${ggg.name}.Campos`);
            
                const campoParaAtualizar = hhhh.find(campo => campo.Nome === ggg.camposelect);

                if (!campoParaAtualizar) {
                    return interaction.reply({ ephemeral: true, content: `${Emojis.get(`negative_dreamm67`)} Campo não encontrado.` });
                }
            
                // Corrigir parsing de preço formatado (ex: "1.234,56" ou "1234,56" ou "12.34")
                // Remove todos os pontos (separadores de milhar) e troca vírgula por ponto (decimal)
                let precoLimpo = preco.replace(/\./g, '').replace(',', '.');
                let precoNumerico = parseFloat(precoLimpo);
                
                if (isNaN(precoNumerico) || precoNumerico < 0) {
                    return interaction.reply({ ephemeral: true, content: `${Emojis.get(`negative_dreamm67`)} Preço inserido \`${preco}\` inválido. Deve ser um número positivo.` });
                }

                // Validação de nome vazio
                nomecampo = nomecampo.trim();
                if (!nomecampo || nomecampo.length === 0) {
                    return interaction.reply({ ephemeral: true, content: `${Emojis.get(`negative_dreamm67`)} Nome do campo não pode ser vazio.` });
                }
            
                if (ggg.camposelect !== nomecampo) {
                    const produtoExistente = produtos
                        .filter(produto => produto.data.Campos)
                        .some(produto => produto.data.Campos.some(campo => campo.Nome === nomecampo));
            
                    if (produtoExistente) {
                        return interaction.reply({ ephemeral: true, content: `${Emojis.get(`negative_dreamm67`)} Nome do campo já existente.` });
                    }
                }
            
                // Atualizando o campo com os novos valores
                campoParaAtualizar.valor = precoNumerico;
                campoParaAtualizar.Nome = nomecampo;
                campoParaAtualizar.desc = desc || '';
                campoParaAtualizar.emoji = emoji;
            
                await produtos.set(`${ggg.name}.Campos`, hhhh);
            
                GerenciarCampos2(interaction, nomecampo);
            }
            



            if (interaction.customId == 'definircondicoes') {

                const ggg = await db.get(interaction.message.id)
                let idcargo = interaction.fields.getTextInputValue('tokenMP');
                let valorminimo = interaction.fields.getTextInputValue('tokenMP2');
                let valormaximo = interaction.fields.getTextInputValue('tokenMP3');

                const hhhh = produtos.get(`${ggg.name}.Campos`)
                const campoParaAtualizar = hhhh.find(campo => campo.Nome === ggg.camposelect);

                if (!campoParaAtualizar) {
                    return interaction.reply({ ephemeral: true, content: `${Emojis.get(`negative_dreamm67`)} Campo não encontrado.` });
                }

                if (idcargo !== '' && idcargo.trim() !== '') {
                    try {
                        const ddd = await interaction.guild.roles.fetch(idcargo.trim())
                        if (ddd == null) return interaction.reply({ ephemeral: true, content: `${Emojis.get(`negative_dreamm67`)} Cargo inserido \`${idcargo}\` inválido.` })
                    } catch (error) {
                        return interaction.reply({ ephemeral: true, content: `${Emojis.get(`negative_dreamm67`)} Erro ao buscar cargo. Verifique o ID.` })
                    }
                }

                if (valorminimo !== '' && valorminimo.trim() !== '') {
                    valorminimo = parseInt(valorminimo, 10);
                    if (!Number.isInteger(valorminimo) || valorminimo < 0) {
                        return interaction.reply({ ephemeral: true, content: `${Emojis.get(`negative_dreamm67`)} Quantidade mínima \`${valorminimo}\` inválida. Insira apenas números inteiros positivos.` });
                    }
                }

                if (valormaximo !== '' && valormaximo.trim() !== '') {
                    valormaximo = parseInt(valormaximo, 10);
                    if (!Number.isInteger(valormaximo) || valormaximo < 0) {
                        return interaction.reply({ ephemeral: true, content: `${Emojis.get(`negative_dreamm67`)} Quantidade máxima \`${valormaximo}\` inválida. Insira apenas números inteiros positivos.` });
                    }
                }

                // Validar se valorminimo não é maior que valormaximo
                if (valorminimo !== '' && valormaximo !== '' && valorminimo > valormaximo) {
                    return interaction.reply({ ephemeral: true, content: `${Emojis.get(`negative_dreamm67`)} A quantidade mínima não pode ser maior que a máxima.` });
                }

                campoParaAtualizar.condicao = {
                    ...(idcargo !== '' && idcargo.trim() !== '' ? { idcargo: idcargo.trim() } : {}),
                    ...(valorminimo !== '' && valorminimo.trim() !== '' ? { valorminimo } : {}),
                    ...(valormaximo !== '' && valormaximo.trim() !== '' ? { valormaximo } : {}),
                };

                await produtos.set(`${ggg.name}.Campos`, hhhh)

                GerenciarCampos2(interaction, ggg.camposelect)

            }

            if (interaction.customId == 'addestoquemodalaaa') {
                const ggg = await db.get(interaction.message.id)
                
                if (!ggg || !ggg.camposelect) {
                    return interaction.reply({ ephemeral: true, content: `${Emojis.get(`negative_dreamm67`)} Erro ao identificar o campo. Tente novamente.` });
                }

                let idcargo = interaction.fields.getTextInputValue('tokenMP');

                if (!idcargo || idcargo.trim() === '') {
                    return interaction.reply({ ephemeral: true, content: `${Emojis.get(`negative_dreamm67`)} Nenhum item de estoque foi fornecido.` });
                }

                const linhas = idcargo.split('\n').filter(linha => linha.trim() !== ''); // Remove linhas vazias
                
                if (linhas.length === 0) {
                    return interaction.reply({ ephemeral: true, content: `${Emojis.get(`negative_dreamm67`)} Nenhum item válido de estoque foi fornecido.` });
                }

                const tresPrimeirasLinhas = linhas.slice(0, 3); // Pegando as três primeiras linhas
                const linhasNumeradas = tresPrimeirasLinhas.map((linha, index) => `${index + 1}・${linha}`);

                const row4 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("simestoque")
                            .setLabel('Sim')
                            .setEmoji(`1178076954029731930`)
                            .setStyle(3),

                        new ButtonBuilder()
                            .setCustomId("definirlimitador")
                            .setLabel('Definir delimitador')
                            .setEmoji(`1178317298793205851`)
                            .setStyle(2)
                    )

                interaction.reply({
                    components: [row4],
                    content: `Total de \`${linhas.length}\` itens detectados, cada item será adicionado como um produto no estoque de \`${ggg.camposelect}\`, exemplo:\`\`\`${linhasNumeradas.join('\n')}\`\`\`\nEsse valor será entregue como **uma** unidade para o cliente.\n**Deseja adicionar o valor de \`${linhas.length}\` itens ao estoque de \`${ggg.camposelect}\`?**`,
                    ephemeral: true
                }).then(async msg222 => {
                    await db.set(`${interaction.user.id}.delimitadorStock`, { estoque: idcargo, delimitador: null, produto: ggg.name, campo: ggg.camposelect });
                }).catch(err => {
                    console.error('Erro ao salvar delimitador de estoque:', err);
                });
            }






















            if (interaction.customId == 'definirlimitadororrr') {
                const ggg22 = await db.get(`${interaction.user.id}.delimitadorStock`)
                let delimitador = interaction.fields.getTextInputValue('tokenMP');



                var arraysSeparados2222 = ``
                var qtdlinhas = 0
                if (delimitador !== '') {

                    const linhasSeparadas = ggg22.estoque.split(delimitador);
                    const arraysSeparados = linhasSeparadas.map(item => item.trim()).filter(item => item !== '');


                    await db.set(`${interaction.user.id}.delimitadorStock.delimitador`, delimitador);


                    for (let i = arraysSeparados.length - 1; i >= Math.max(0, arraysSeparados.length - 4); i--) {
                        const campooo = arraysSeparados[i];
                        arraysSeparados2222 += `${campooo}\n`;
                    }

                    if (arraysSeparados.length > 4) {
                        arraysSeparados2222 += `E mais ${arraysSeparados.length - 4}...`;
                    }

                    qtdlinhas = arraysSeparados.length
                } else {
                    await db.set(`${interaction.user.id}.delimitadorStock`, { estoque: ggg22.estoque, delimitador: null, produto: ggg22.produto, campo: ggg22.campo });


                    const linhas = ggg22.estoque.split('\n');
                    const primeiraLinha = linhas[0];
                    qtdlinhas = linhas.length
                    arraysSeparados2222 = primeiraLinha
                }

                interaction.update({
                    content: `
                Seu delimitador agora é \`${delimitador == '' ? `Não Definido` : delimitador}\`, cade item será adicionado como um produto no estoque de \`${ggg22.campo}\`, exemplo:\n\`${arraysSeparados2222}\`
                
Esse valor será entregue como **uma** unidade para o cliente.
**Deseja adicionar o valor de \`${qtdlinhas}\`\ itens ao estoque de \`${ggg22.campo}\`?**
                                    `})

            }


            if (interaction.customId == 'sd1213aju11111idsjjsdua') {

                const ggg = await db.get(interaction.message.id)
                let qtd = interaction.fields.getTextInputValue('tokenMP');
                let produto = interaction.fields.getTextInputValue('tokenMP2');

                if (qtd > 100000) return interaction.reply({ content: `${Emojis.get(`negative_dreamm67`)} Não foi possível adicionar esse estoque.`, ephemeral: true })

                if (isNaN(qtd)) return interaction.reply({ content: `${Emojis.get(`negative_dreamm67`)} Esse número não é válido \`${qtd}\`.`, ephemeral: true })

                const arrayItens = [];
                if (produto == '') {
                    for (let i = 0; i < qtd; i++) {
                        const linha = `Item fantasma ${i + 1}/${qtd}`;
                        arrayItens.push(linha);
                    }
                } else {
                    for (let i = 0; i < qtd; i++) {
                        const linha = `${produto} ${i + 1}/${qtd}`;
                        arrayItens.push(linha);
                    }
                }

                
                const Entrega24 = configuracao.get(`Emojis_carrinho`)

                let msg = ``
            
                if (Entrega24 !== null) {
                    Entrega24.sort((a, b) => {
                        const numA = parseInt(a.name.replace('ea', ''), 10);
                        const numB = parseInt(b.name.replace('ea', ''), 10);
                        return numA - numB;
                    });
                
                    Entrega24.forEach(element => {
                        msg += `<a:${element.name}:${element.id}>`
                    });
                }
              
                await interaction.reply({ content: `${msg} | Aguarde...`, ephemeral: true }).then(async tt => {

                    await tt.edit({ content: `${msg} | Atualizando estoque...` }).then(async msg => {

                        const hhhh = produtos.get(`${ggg.name}.Campos`)
                        const gggaaa = hhhh.find(campo22 => campo22.Nome === ggg.camposelect)
                        gggaaa.estoque.push(...arrayItens);

                        await produtos.set(`${ggg.name}.Campos`, hhhh)
                        await produtos.set(`${ggg.name}.UltimaReposicao`, Date.now())

                    })

                    await tt.edit({ content: `${msg} | Sincronizando mensagens...`, ephemeral: true }).then(async msg => {
                        await UpdateMessageProduto(client, ggg.name)

                    })

                    await tt.edit({ content: `${Emojis.get(`positive_dream`)} Total de \`${qtd}\` itens fantasma adicionado ao estoque.`, ephemeral: true })
                })


            }


            if (interaction.customId == 'sdaju11124124111231idsjjs123dua123') {
                const ggg = await db.get(interaction.message.id);
                let qtd = interaction.fields.getTextInputValue('tokenMP');

                if (qtd !== 'sim') return interaction.reply({ content: `${Emojis.get(`negative_dreamm67`)} Confirmação não validada.`, ephemeral: true });

                const hhhh = produtos.get(`${ggg.name}.Campos`);
                const gggaaa = hhhh.find(campo22 => campo22.Nome === ggg.camposelect);

                gggaaa.estoque = [];

                await produtos.set(`${ggg.name}.Campos`, hhhh);

                await GerenciarCampos2(interaction, ggg.camposelect);

                const Entrega24 = configuracao.get(`Emojis_carrinho`)

                let msg = ``
            
                if (Entrega24 !== null) {
                    Entrega24.sort((a, b) => {
                        const numA = parseInt(a.name.replace('ea', ''), 10);
                        const numB = parseInt(b.name.replace('ea', ''), 10);
                        return numA - numB;
                    });
                
                    Entrega24.forEach(element => {
                        msg += `<a:${element.name}:${element.id}>`
                    });
                }
            

                try {
                    const syncMessage = await interaction.followUp({ content: `${msg} | Sincronizando mensagens...`, ephemeral: true, fetchReply: true });
                    await UpdateMessageProduto(client, ggg.name);

                    interaction.editReply({ message: syncMessage, content: `${Emojis.get(`positive_dream`)} Processo concluído!` })

                } catch (error) {
                    console.error("Error editing message:", error);
                }



            }

        }

        if (interaction.isButton()) {

            if (interaction.customId == 'cleanestoquecampos') {

                const modalaAA = new ModalBuilder()
                    .setCustomId('sdaju11124124111231idsjjs123dua123')
                    .setTitle(`Limpar o estoque`);

                const newnameboteN = new TextInputBuilder()
                    .setCustomId('tokenMP')
                    .setLabel(`CONFIRMAÇÃO`)
                    .setPlaceholder(`Digite "sim" para apagar todo estoque.`)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false)



                const firstActionRow3 = new ActionRowBuilder().addComponents(newnameboteN);
                modalaAA.addComponents(firstActionRow3);
                await interaction.showModal(modalaAA);

            }




            if (interaction.customId == 'estoquefantasma') {


                const modalaAA = new ModalBuilder()
                    .setCustomId('sd1213aju11111idsjjsdua')
                    .setTitle(`Adicionando estoque fantasma`);

                const newnameboteN = new TextInputBuilder()
                    .setCustomId('tokenMP')
                    .setLabel(`Quantidade`)
                    .setPlaceholder(`Insira aqui a quantidade de estoque fantasma desejada`)

                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)

                const newnameboteN2 = new TextInputBuilder()
                    .setCustomId('tokenMP2')
                    .setLabel(`Valor fantasma (OPCIONAL)`)
                    .setPlaceholder(`Insira aqui um valor fantasma, ex: abra ticket para resgatar`)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false)

                const firstActionRow3 = new ActionRowBuilder().addComponents(newnameboteN);
                const firstActionRow4 = new ActionRowBuilder().addComponents(newnameboteN2);


                modalaAA.addComponents(firstActionRow3, firstActionRow4);

                await interaction.showModal(modalaAA);


            }





if (interaction.customId === 'estoquearquivo') {
    // Abrindo o modal para solicitar o link de download
    const modal = new ModalBuilder()
        .setCustomId('linkModal')
        .setTitle('Adicionar Arquivo ao Estoque')
        .addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('downloadLink')
                    .setLabel('Link de Download do Arquivo')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
            )
        );

    await interaction.showModal(modal);

    // Coletando a resposta do modal
    const filter = i => i.customId === 'linkModal' && i.user.id === interaction.user.id;
    interaction.awaitModalSubmit({ filter, time: 60000 })
        .then(async (modalInteraction) => {
            const downloadLink = modalInteraction.fields.getTextInputValue('downloadLink');

            try {
                const response = await axios.get(downloadLink, { responseType: 'arraybuffer' });
                const fileType = response.headers['content-type'];

                const fileContent = response.data.toString('utf-8');
                const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line);

                const ggg = await db.get(interaction.message.id);

                const row4 = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("simestoque")
                        .setLabel('Sim')
                        .setEmoji(`1178076954029731930`)
                        .setStyle(3),
                    new ButtonBuilder()
                        .setCustomId("definirlimitador")
                        .setLabel('Definir delimitador')
                        .setEmoji(`1178317298793205851`)
                        .setStyle(2)
                );

                await modalInteraction.reply({
                    components: [row4],
                    content: `Total de \`${lines.length}\` itens detectados. Cada item será adicionado como um produto no estoque de \`${ggg.camposelect}\`. Exemplo:\n\`\`\`${lines[0]}\`\`\`\nEsse valor será entregue como **uma** unidade para o cliente.\n**Deseja adicionar o valor de \`${lines.length}\` itens ao estoque de \`${ggg.camposelect}\`?**`,
                    ephemeral: true
                });

                await db.set(`${interaction.user.id}.delimitadorStock`, {
                    estoque: lines.join('\n'),
                    delimitador: null,
                    produto: ggg.name,
                    campo: ggg.camposelect
                });
            } catch (error) {
                console.error('Erro ao fazer o download do arquivo:', error);
                await modalInteraction.reply({ content: `${Emojis.get(`negative_dreamm67`)} Erro ao fazer o download do arquivo. Verifique se o link está acessível.`, ephemeral: true });
            }
        })
}





            if (interaction.customId == 'cargosremadd') {

                const ggg = await db.get(interaction.message.id);
                const hhhh = produtos.get(`${ggg.name}.Campos`);
                const gggaaa = hhhh.find(campo22 => campo22.Nome === ggg.camposelect);


                const modalaAA = new ModalBuilder()
                    .setCustomId('dassdadassddsdasddassddasd')
                    .setTitle(`Definir cargos`);

                const newnameboteN = new TextInputBuilder()
                    .setCustomId('tokenMP')
                    .setLabel(`CARGO PARA ADICIONAR APÓS COMPRA`)
                    .setPlaceholder(`Insira o id de algum cargo`)
                    .setStyle(TextInputStyle.Short)
                    .setValue(gggaaa.roleadd || '')
                    .setRequired(false)

                const newnameboteN24 = new TextInputBuilder()
                    .setCustomId('tokenMP24')
                    .setLabel(`Tempo de cargo ( Opcional )`)
                    .setPlaceholder(`Tempo que a pessoa ficara com o cargo`)
                    .setStyle(TextInputStyle.Short)
                    .setValue(gggaaa.temprole24 || '')
                    .setRequired(false)

                const newnameboteN2 = new TextInputBuilder()
                    .setCustomId('tokenMP2')
                    .setLabel(`CARGO PARA REMOVER APÓS COMPRA`)
                    .setPlaceholder(`Insira o id de algum cargo`)
                    .setStyle(TextInputStyle.Short)
                    .setValue(gggaaa.rolerem || '')
                    .setRequired(false)

                const firstActionRow5 = new ActionRowBuilder().addComponents(newnameboteN);
                const firstActionRow24 = new ActionRowBuilder().addComponents(newnameboteN24);
                const firstActionRow52 = new ActionRowBuilder().addComponents(newnameboteN2);



                modalaAA.addComponents(firstActionRow5, firstActionRow24, firstActionRow52);
                await interaction.showModal(modalaAA);








            }



            if (interaction.customId == 'simestoque') {
                await interaction.update({ content: `🔄 Aguarde...`, components: [] })
                
                const ggg = await db.get(`${interaction.user.id}.delimitadorStock`)
                
                if (!ggg || !ggg.estoque || !ggg.produto || !ggg.campo) {
                    return interaction.editReply({ content: `${Emojis.get(`negative_dreamm67`)} Erro ao buscar dados do estoque. Tente novamente.`, components: [] });
                }

                let estoque;
                if (ggg.delimitador !== null) {
                    const linhasSeparadas = ggg.estoque.split(ggg.delimitador);
                    estoque = linhasSeparadas.map(item => item.trim()).filter(item => item !== '');
                } else {
                    estoque = ggg.estoque.split('\n').map(item => item.trim()).filter(item => item !== '');
                }

                if (estoque.length === 0) {
                    return interaction.editReply({ content: `${Emojis.get(`negative_dreamm67`)} Nenhum item válido de estoque foi encontrado.`, components: [] });
                }

                const hhhh = produtos.get(`${ggg.produto}.Campos`)
                
                if (!hhhh) {
                    return interaction.editReply({ content: `${Emojis.get(`negative_dreamm67`)} Produto não encontrado.`, components: [] });
                }

                const campoParaAtualizar = hhhh.find(campo => campo.Nome === ggg.campo);

                if (!campoParaAtualizar) {
                    return interaction.editReply({ content: `${Emojis.get(`negative_dreamm67`)} Campo não encontrado.`, components: [] });
                }

                // Inicializar array de estoque se não existir
                if (!Array.isArray(campoParaAtualizar.estoque)) {
                    campoParaAtualizar.estoque = [];
                }

                campoParaAtualizar.estoque.push(...estoque);

                await produtos.set(`${ggg.produto}.Campos`, hhhh)
                await produtos.set(`${ggg.produto}.UltimaReposicao`, Date.now())

                await interaction.editReply({ content: `🔄 Sincronizando mensagens...`, ephemeral: true })
                
                try {
                    await UpdateMessageProduto(client, ggg.produto)
                } catch (err) {
                    console.error('Erro ao atualizar mensagem do produto:', err);
                }

                const ggggg = campoParaAtualizar?.avisar;
                const buttonEnabled = Array.isArray(ggggg) && ggggg.length > 0;

                const row3 = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`avisarestoqueeeee_${ggg?.produto}_${ggg?.campo}_${estoque.length}`)
                            .setLabel(`Avisar ${ggggg?.length || 0} usuário(s) (Com atalho de compra)`)
                            .setEmoji(`1178068047202893869`)
                            .setStyle(2)
                            .setDisabled(!buttonEnabled)
                    );

                await interaction.editReply({
                    components: [row3], 
                    content: `${Emojis.get(`positive_dream`)} Estoque de \`${ggg.campo}\` atualizado com sucesso! ${estoque.length} itens adicionados.`
                })

                // Limpar dados temporários
                await db.delete(`${interaction.user.id}.delimitadorStock`).catch(() => {});
            }


            if (interaction.customId.startsWith('avisarestoqueeeee')) {

                const regex = /avisarestoqueeeee_(.*?)_(.*)_(.*)/;
                const correspondencias = interaction.customId.match(regex);

                const produto = correspondencias[1];
                const campo = correspondencias[2];
                const qtd = correspondencias[3];


                const hhhh2 = produtos.get(`${produto}`)

                const hhhh = produtos.get(`${produto}.Campos`)
                const gggaaa = hhhh.find(campo22 => campo22.Nome === campo)


                const yy = gggaaa.avisar

                if (yy == 0 || yy == undefined) return interaction.update({ content: `${Emojis.get(`negative_dreamm67`)} Nenhum usuário para avisar.`, ephemeral: true, components: [] })

                yy.forEach(async element => {
                    try {
                        const member = await client.users.fetch(element)
                        const channela = await client.channels.fetch(hhhh2.mensagens[0].channelid);

                        const row4 = new ActionRowBuilder()
                            .addComponents(

                                new ButtonBuilder()
                                    .setURL(`https://discord.com/channels/${hhhh2.mensagens[0].guildid}/${hhhh2.mensagens[0].channelid}/${hhhh2.mensagens[0].mesageid}`)
                                    .setLabel('Comprar Produto')
                                    .setEmoji(`1178076954029731930`)
                                    .setStyle(5)
                            )


                        await member.send({ components: [row4], content: `# ${gggaaa.Nome} Foi reeabastecido!\n- Olá <@${element}>, vim lhe anunciar que graças ao \`${interaction.user.username}\`, o produto \`${gggaaa.Nome}\` teve \`${qtd}\` itens reeabastecidos.` })
                    } catch (error) {

                    }


                });

                interaction.update({ content: `${Emojis.get(`positive_dream`)} Avisamos os ${yy.length} que seu produto foi reabastecido com sucesso!`, ephemeral: true, components: [] })

                gggaaa.avisar = []
                produtos.set(`${produto}.Campos`, hhhh)

            }

            if (interaction.customId == 'definirlimitador') {
                const ggg = await db.get(`${interaction.user.id}.delimitadorStock`)

                const modalaAA = new ModalBuilder()
                    .setCustomId('definirlimitadororrr')
                    .setTitle(`Definir delimitador personalisado`);

                const newnameboteN = new TextInputBuilder()
                    .setCustomId('tokenMP')
                    .setLabel(`DELIMITADOR`)
                    .setPlaceholder(`Insira o seu delimitador`)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false)

                if (ggg.delimitador !== null) {
                    newnameboteN.setValue(`${ggg.delimitador}`)
                }



                const firstActionRow3 = new ActionRowBuilder().addComponents(newnameboteN);
                modalaAA.addComponents(firstActionRow3);
                await interaction.showModal(modalaAA);







            }


            if (interaction.customId == 'addestoque1') {

                const modalaAA = new ModalBuilder()
                    .setCustomId('addestoquemodalaaa')
                    .setTitle(`Adicionando estoque`);

                const newnameboteN = new TextInputBuilder()
                    .setCustomId('tokenMP')
                    .setLabel(`Estoque`)
                    .setPlaceholder(`Insira aqui o estoque que deseja adicionar, um abaixo do outro.`)
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true)
                    .setMaxLength(4000)

                const firstActionRow5 = new ActionRowBuilder().addComponents(newnameboteN);



                modalaAA.addComponents(firstActionRow5);
                await interaction.showModal(modalaAA);



            }


            if (interaction.customId == 'estoquedsadas') {
                const ggg = await db.get(interaction.message.id)
                const hhhh = produtos.get(`${ggg.name}.Campos`)

                const gggaaa = hhhh.find(campo22 => campo22.Nome === ggg.camposelect)


                if (gggaaa.estoque == 0) {
                    interaction.reply({ content: `⚠️ O estoque desse item está vazio.`, ephemeral: true })
                } else {


                    await interaction.reply({ content: `🔄 Aguarde...`, ephemeral: true }).then(async tt => {
                        const conteudoEstoque = gggaaa.estoque.join('\n');
                        const fileName = `stock_${ggg.camposelect}.txt`;
                        const fileBuffer = Buffer.from(conteudoEstoque, 'utf-8');


                        await tt.edit({
                            ephemeral: true, files: [{
                                attachment: fileBuffer,
                                name: fileName
                            }],
                            content: `Estoque anexado na mensagem abaixo, total de \`${gggaaa.estoque.length}\` itens. `
                        })


                    })



                }
            }


            if (interaction.customId == 'addestoquecampos') {


                MessageStock(interaction)
            }

            if (interaction.customId == 'excluirproduto') {
                const ggg = await db.get(interaction.message.id)

                await produtos.delete(`${ggg.name}`)
                await Gerenciar2(interaction, client)
                interaction.followUp({ content: `${Emojis.get(`positive_dream`)} | Produto excluído com sucesso!`, ephemeral: true })
            }


            if (interaction.customId == 'gwdawdwadawawderenciarcampossss') {

                const ggg = await db.get(interaction.message.id)
                const hhhh = produtos.get(`${ggg.name}.Campos`)

                const gggaaa = hhhh.find(campo22 => campo22.Nome === ggg.camposelect)


                const modalaAA = new ModalBuilder()
                    .setCustomId('definircondicoes')
                    .setTitle(`Definir condições`);

                const newnameboteN = new TextInputBuilder()
                    .setCustomId('tokenMP')
                    .setLabel(`ID DO CARGO`)
                    .setPlaceholder(`Insira algum id de cargo que será necessário`)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false)

                const newnameboteN2 = new TextInputBuilder()
                    .setCustomId('tokenMP2')
                    .setLabel(`VALOR MÍNIMO DE COMPRA`)
                    .setPlaceholder(`Insira um valor mínimo necessário`)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false)

                const newnameboteN4 = new TextInputBuilder()
                    .setCustomId('tokenMP3')
                    .setLabel(`VALOR MÁXIMO DE COMPRA`)
                    .setPlaceholder(`Insira um valor máximo necessário`)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(false)

                if (gggaaa.condicao?.idcargo !== undefined) {
                    newnameboteN.setValue(`${gggaaa.condicao.idcargo}`)
                }

                if (gggaaa.condicao?.valorminimo !== undefined) {
                    newnameboteN2.setValue(`${gggaaa.condicao.valorminimo}`)
                }

                if (gggaaa.condicao?.valormaximo !== undefined) {
                    newnameboteN4.setValue(`${gggaaa.condicao.valormaximo}`)
                }


                const firstActionRow3 = new ActionRowBuilder().addComponents(newnameboteN);
                const firstActionRow4 = new ActionRowBuilder().addComponents(newnameboteN2);
                const firstActionRow5 = new ActionRowBuilder().addComponents(newnameboteN4);





                modalaAA.addComponents(firstActionRow3, firstActionRow4, firstActionRow5);
                await interaction.showModal(modalaAA);


            }




            if (interaction.customId == 'editarcampooo') {

                const ggg = await db.get(interaction.message.id)
                const hhhh = produtos.get(`${ggg.name}.Campos`)

                const gggaaa = hhhh.find(campo22 => campo22.Nome === ggg.camposelect)

                const modalaAA = new ModalBuilder()
                    .setCustomId('configcampoo')
                    .setTitle(`Editando o campo`);

                const newnameboteN = new TextInputBuilder()
                    .setCustomId('tokenMP')
                    .setLabel(`NOME DO CAMPO`)
                    .setPlaceholder(`Insira o nome desejado`)
                    .setValue(`${gggaaa.Nome}`)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)

                const newnameboteN2 = new TextInputBuilder()
                    .setCustomId('tokenMP2')
                    .setLabel(`PREÇO DO CAMPO`)
                    .setPlaceholder(`Insira um preço desejado (BRL)`)
                    .setValue(`${Number(gggaaa.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)

                const newnameboteN24 = new TextInputBuilder()
                    .setCustomId('tokenMP7')
                    .setLabel(`EMOJI DO CAMPO`)
                    .setPlaceholder(`Somente id de emojis.`)
                    .setStyle(TextInputStyle.Short)
                    .setMaxLength(20)
                    .setRequired(false)    

                const newnameboteN4 = new TextInputBuilder()
                    .setCustomId('tokenMP3')
                    .setLabel(`DESCRIÇÃO DO CAMPO (OPCIONAL)`)
                    .setPlaceholder(`Insira um descrição desejada`)
                    .setStyle(TextInputStyle.Paragraph)

                    .setMaxLength(4000)
                    .setRequired(false)



                if (gggaaa.desc !== '') {
                    newnameboteN4.setValue(gggaaa.desc)
                }



                const firstActionRow3 = new ActionRowBuilder().addComponents(newnameboteN);
                const firstActionRow4 = new ActionRowBuilder().addComponents(newnameboteN2);
                const firstActionRow5 = new ActionRowBuilder().addComponents(newnameboteN4);
                const firstActionRow24 = new ActionRowBuilder().addComponents(newnameboteN24)





                modalaAA.addComponents(firstActionRow3, firstActionRow4, firstActionRow24, firstActionRow5);
                await interaction.showModal(modalaAA);

            }
        }
    }
}