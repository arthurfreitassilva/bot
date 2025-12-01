const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ChannelType, PermissionFlagsBits, ModalBuilder, TextInputBuilder } = require("discord.js");
const { JsonDatabase } = require("wio.db");
const fs = require("fs")
const path = require('path');

const General = new JsonDatabase({ databasePath: "./DataBaseJson/General.json" })
const GeneralKeys = new JsonDatabase({ databasePath: "./DataBaseJson/GeneralKeys.json", autoWrite: true })
const config = new JsonDatabase({ databasePath: "./DataBaseJson/configbasicasindex.json", autoWrite: true })
const configbot = require("../../config.json"); // Carrega o config.json de forma direta

module.exports = {
    name:"interactionCreate", // Nome do Evento 
    run: async( interaction, client) => {
        if(interaction.isButton() && interaction.customId === "sistemaowner") {

            const userId = interaction.user.id;
            const owner = configbot.owner; // Lista de donos do bot

            if (!owner.includes(userId)) {
                await interaction.reply({ content: `❌ | Somente o dono do bot <@${owners[0]}> pode configurar este sistema.`, ephemeral: true });
                return;
              }

              const embed = new EmbedBuilder()
              .setDescription("# Painel de configuração do Gerador\n\n> - Selecione um dos botões abaixo para configurar.\n> - O sistema do seu gerador está ***`100%`*** otimizado.")
              .setColor(`${General.get(`${interaction.guild.id}.cor_gen`) || `#2e2e2e` }`)

              const botoes = new ActionRowBuilder()
              .addComponents(
                new ButtonBuilder()
                .setCustomId("gerenciarkeys")
                .setLabel(`Configurar Keys`)
                .setEmoji('1386693289117483110')
                .setStyle(1),
                new ButtonBuilder()
                .setCustomId("gerenciarservices")
                .setLabel(`Configurar Serviços`)
                .setEmoji('1377455239829000255')
                .setStyle(1),
                new ButtonBuilder()
                .setCustomId("gerenciarperms")
                .setLabel(`Configurar Permissões`)
                .setEmoji('1295570740501942293')
                .setStyle(1),
                new ButtonBuilder()
                .setCustomId("configgenpainelzika")
                .setEmoji('1371605354605051996')
                .setLabel(`Voltar`)
                .setStyle(2)

              )

              await interaction.update({ embeds: [embed], components: [botoes], ephemeral: true  })

        }

        if(interaction.isButton() && interaction.customId === "voltapainel") {

            const embed = new EmbedBuilder()
            .setDescription("# Painel de configuração do Gerador\n\n> - Selecione um dos botões abaixo para configurar.\n> - O sistema do seu gerador está ***`100%`*** otimizado.")
            .setColor(`${General.get(`${interaction.guild.id}.cor_gen`) || `#2e2e2e` }`)

              const botoes = new ActionRowBuilder()
              .addComponents(
                new ButtonBuilder()
                .setCustomId("gerenciarkeys")
                .setLabel(`Configurar Keys`)
                .setEmoji('1386693289117483110')
                .setStyle(1),
                new ButtonBuilder()
                .setCustomId("gerenciarservices")
                .setLabel(`Configurar Serviços`)
                .setEmoji('1377455239829000255')
                .setStyle(1),
                new ButtonBuilder()
                .setCustomId("gerenciarperms")
                .setLabel(`Configurar Permissões`)
                .setEmoji('1295570740501942293')
                .setStyle(1),
                new ButtonBuilder()
                .setCustomId("configgenpainelzika")
                .setEmoji('1371605354605051996')
                .setLabel(`Voltar`)
                .setStyle(2)


              )

              await interaction.update({ embeds: [embed], components: [botoes], ephemeral: true  })

        }

        if (interaction.isButton() && interaction.customId === "gerenciarkeys") {

            const embed = new EmbedBuilder()
            .setDescription(`# Painel de configuração das Keys !**\n\n> - Crie e apague keys nos botão abaixo.\n> - Configure qual cargo que a pessoa vai receber ao utilizar uma key,`)        

            const botoes = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
              .setCustomId("createkeys")
              .setLabel(`Criar Keys`)
              .setEmoji('1371605186446884864')
              .setStyle(1),
              new ButtonBuilder()
              .setCustomId("deletekeys")
              .setLabel(`Deletar Keys`)
              .setEmoji('1384020979591806986')
              .setStyle(1),
              new ButtonBuilder()
              .setCustomId("cargokeys")
              .setLabel(`Cargo Keys`)
              .setEmoji('1383849308276785336')
              .setStyle(1),
              new ButtonBuilder()
              .setCustomId("voltapainel")
              .setLabel(`Voltar`)
              .setEmoji('1371605354605051996')
              .setStyle(2)
            )

            await interaction.update({ embeds: [embed], components: [botoes], ephemeral: true  })

        }

        if (interaction.isButton() && interaction.customId === "createkeys") {

            const modal = new ModalBuilder()
        .setCustomId("modalcreatekey")
        .setTitle("Criação de Keys");

    const text1 = new TextInputBuilder()
        .setCustomId("quantidadecriar")
        .setRequired(true)
        .setPlaceholder(`Quantas keys quer criar?`)
        .setLabel("Keys")
        .setStyle(1);

    modal.addComponents(
        new ActionRowBuilder().addComponents(text1)
    );

    await interaction.showModal(modal);
} else if (interaction.isModalSubmit() && interaction.customId === 'modalcreatekey') {

    function generateKey(length) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }
    
    const quantidade = interaction.fields.getTextInputValue('quantidadecriar');

    if (quantidade <= 0) {
        return await interaction.reply({ content: 'O minimo para criar e de \`1\` key.', ephemeral: true });
    }

    let keys = [];
        for (let i = 0; i < quantidade; i++) {
            const key = generateKey(12);
            keys.push(key);
            await GeneralKeys.set(key, 'disponível');
        }

        const stockKeyPath = path.join(__dirname, '../../stock_key.txt');

        fs.writeFileSync(stockKeyPath, keys.join('\n'));

        await interaction.reply({
            content: `${quantidade}x keys foram adicionadas ao estoque!`,
            files: [stockKeyPath],
            ephemeral: true
        });

        setTimeout(() => {
            fs.unlink(stockKeyPath, (err) => {
                if (err) {
                    console.error(`Erro ao remover o arquivo ${stockKeyPath}:`, err);
                } else {
                    
                }
            });
        }, 5000);

        }

        if (interaction.isButton() && interaction.customId === "deletekeys") {

            const modal = new ModalBuilder()
        .setCustomId("modaldeletekey")
        .setTitle("Deletação de Keys");

    const text1 = new TextInputBuilder()
        .setCustomId("quantidadedeletar")
        .setRequired(true)
        .setPlaceholder(`Quais as keys que deseja deletar? (por linha)`)
        .setLabel("Keys")
        .setStyle(2);

    modal.addComponents(
        new ActionRowBuilder().addComponents(text1)
    );

    await interaction.showModal(modal);
} else if (interaction.isModalSubmit() && interaction.customId === 'modaldeletekey') {

    const keysInput = interaction.fields.getTextInputValue('quantidadedeletar');
    const keysArray = keysInput.split('\n').filter(key => key.trim() !== '');
    const quantidadesKeys = keysArray.length;

    if (quantidadesKeys <= 0) {
        return await interaction.reply({ content: '❌ | O mínimo para deletar é de \`1\` key.', ephemeral: true });
    }

    let deletedKeysCount = 0;
    const invalidKeys = [];

    for (const key of keysArray) {
        try {
            const keyExists = await GeneralKeys.exists(key);
            if (keyExists) {
                await GeneralKeys.delete(key);
                deletedKeysCount++;
            } else {
                invalidKeys.push(key);
            }
        } catch (error) {
            console.error(`Erro ao deletar a key ${key}: ${error.message}`);
        }
    }

    let replyMessage = `Você deletou ${deletedKeysCount}x keys com sucesso!`;
    if (invalidKeys.length > 0) {
        replyMessage += `\n❌ | As seguintes keys não foram deletadas pois não são válidas: \`${invalidKeys.join(', ')}\`.`;
    }

    await interaction.reply({ content: replyMessage, ephemeral: true });
}

if (interaction.isButton() && interaction.customId === "cargokeys") {

    const modal = new ModalBuilder()
.setCustomId("modalcargokey")
.setTitle("Cargo de Keys");

const text1 = new TextInputBuilder()
.setCustomId("novocargokey")
.setRequired(true)
.setPlaceholder(`Todos que resgatar a keys ira receber este cargo`)
.setLabel("Cargo das Keys")
.setStyle(1);

modal.addComponents(
new ActionRowBuilder().addComponents(text1)
);

await interaction.showModal(modal);
} else if (interaction.isModalSubmit() && interaction.customId === 'modalcargokey') {

    const cargo = interaction.fields.getTextInputValue('novocargokey');
const role = interaction.guild.roles.cache.get(cargo);

if (!role) {
    return interaction.reply({ content: 'Cargo não encontrado. Por favor, forneça um cargo válido.', ephemeral: true });
}


await General.set(`${interaction.guild.id}.cargo_keys`, cargo);

await interaction.reply({ content: `O cargo para as keys foi alterado para <@&${cargo}> com sucesso!`, ephemeral: true });
}

    if (interaction.isButton() && interaction.customId === "gerenciarservices") {

        const embed = new EmbedBuilder()
              .setDescription(`# Painel de configuração dos Serviços !\n\n> - Crie e apague Serviços nos botão abaixo.\n> - Configure o Stock dos Serviços de forma fácil.`)          
              .setColor(`${General.get(`${interaction.guild.id}.cor_gen`) || `#2e2e2e` }`)

              const botoes = new ActionRowBuilder()
              .addComponents(
                new ButtonBuilder()
                .setCustomId("criarservice")
                .setLabel(`Criar um Serviço`)
                .setEmoji('1305243177803972781')
                .setStyle(1),
                new ButtonBuilder()
                .setCustomId("deleteservice")
                .setLabel(`Deletar um serviço`)
                .setEmoji('1384020979591806986')
                .setStyle(1),
                new ButtonBuilder()
                .setCustomId("stockservice")
                .setLabel(`Configurar stock dos Serviços`)
                .setEmoji('1377457174514503690')
                .setStyle(1),
                new ButtonBuilder()
                .setCustomId("sistemaowner")
                .setLabel(`Voltar`)
                .setEmoji('1371605354605051996')
                .setStyle(2)

              )

              await interaction.update({ embeds: [embed], components: [botoes], ephemeral: true })
            }

            if (interaction.isButton() && interaction.customId === "criarservice") {

                const modal = new ModalBuilder()
                .setCustomId("modalcreateservice")
                .setTitle("Criação de Serviço");

            const text1 = new TextInputBuilder()
                .setCustomId("novoservice")
                .setRequired(true)
                .setPlaceholder(`Apos criar, todos irão poder ver o novo serviço do gerador.`)
                .setLabel("Nome do Serviço")
                .setStyle(1);

            modal.addComponents(
                new ActionRowBuilder().addComponents(text1)
            );

            await interaction.showModal(modal);
        } else if (interaction.isModalSubmit() && interaction.customId === 'modalcreateservice') {
            
            const service = interaction.fields.getTextInputValue('novoservice');
            const filePath = path.join(__dirname, "../../Stock", `${service}.txt`);

if (fs.existsSync(filePath)) {
    return interaction.reply({ content: `O serviço \`${service}\` já existe em meu stock!`, ephemeral: true });
}
        
            fs.writeFile(filePath, '', (err) => {
                if (err) {
                    console.error(`Erro ao criar o serviço ${service}: ${err.message}`);
                    return interaction.reply({ content: '❌ | Ocorreu um erro ao criar o serviço.', ephemeral: true });
                }
        
                interaction.reply({ content: `O serviço \`${service}\` foi criado com sucesso!`, ephemeral: true });
            });
        }

        if (interaction.isButton() && interaction.customId === "deleteservice") {

            const modal = new ModalBuilder()
                .setCustomId("modaldeleteservice")
                .setTitle("🛠️ | Deletação de Serviço");

            const text1 = new TextInputBuilder()
                .setCustomId("deleteservice")
                .setRequired(true)
                .setPlaceholder(`Apos deletar, não ira mostrar mais o serviço.`)
                .setLabel("Nome do Serviço")
                .setStyle(1);

            modal.addComponents(
                new ActionRowBuilder().addComponents(text1)
            );

            await interaction.showModal(modal);
        } else if (interaction.isModalSubmit() && interaction.customId === 'modaldeleteservice') {
            
            const service = interaction.fields.getTextInputValue('deleteservice');
    const filePath = path.join(__dirname, "../../Stock", `${service}.txt`);

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            return interaction.reply({ content: `O serviço \`${service}\` não foi encontrado.`, ephemeral: true });
        }

        fs.unlink(filePath, (err) => {
            if (err) {
                console.error(`Erro ao deletar o serviço ${service}: ${err.message}`);
                return interaction.reply({ content: 'Ocorreu um erro ao deletar o serviço.', ephemeral: true });
            }

            interaction.reply({ content: `O serviço \`${service}\` foi deletado com sucesso!`, ephemeral: true });
        });
    });
}

    if (interaction.isButton() && interaction.customId === "stockservice") {

        const stockDirectory = path.join(__dirname, "../../Stock");

    const files = fs.readdirSync(stockDirectory);

    if (files.length === 0) {
        return interaction.reply({ content: `Não tenho nenhum serviço cadastrado.`, ephemeral: true });
    }

    let rank = ''
    let ranka = ''
    let ranks = ''
    let ranke = ''
    let rankd = ''

    files.forEach((file, index) => {
        const serviceName = path.basename(file, '.txt');
        const stockCount = fs.readFileSync(path.join(stockDirectory, file), 'utf-8').split('\n').filter(line => line).length;
        const creationTime = Math.floor(fs.statSync(path.join(stockDirectory, file)).birthtimeMs / 1000);
        const lastUpdatedTime = Math.floor(fs.statSync(path.join(stockDirectory, file)).mtimeMs / 1000);
        
        rank += `**${index + 1}**`;
        ranks += `**${serviceName}\`**`;
        ranka += `${stockCount}`;
        ranke += `<t:${creationTime}:R>`;
        rankd += `<t:${lastUpdatedTime}:R>`;
        });

        const embed = new EmbedBuilder()
              .setDescription(`# Painel de configuração do Estoque
> - Configure o stock, faça backup dele ou até mesmo Limpe todo o Stock
> - Informações sobre o Stock Abaixo !`)
              .addFields(
                { name: `**ID**`, value: rank, inline: true },
                { name: `**Nome:**`, value: ranks, inline: true },
                { name: `**Estoque**`, value: ranka, inline: false },
                { name: `**Criado em**`, value: ranke, inline: true },
                { name: `**Última Atualização**`, value: rankd, inline: true }
              )
              .setColor(`${General.get(`${interaction.guild.id}.cor_gen`) || `#2e2e2e` }`)

              const botoes = new ActionRowBuilder()
              .addComponents(
                new ButtonBuilder()
                .setCustomId("configstock")
                .setLabel(`Configurar Stock`)
                .setEmoji('1386694686235824268')
                .setStyle(1),
                new ButtonBuilder()
                .setCustomId("backupstock")
                .setLabel(`Backup do Stock`)
                .setEmoji('1371607363995439275')
                .setStyle(2),
                new ButtonBuilder()
                .setCustomId("limparstock")
                .setLabel(`Limpar Stock`)
                .setEmoji('1386695074661929061')
                .setStyle(4),
                new ButtonBuilder()
                .setCustomId("gerenciarservices")
                .setLabel(`Voltar`)
                .setEmoji('1371605354605051996')
                .setStyle(2)

              )

              await interaction.update({ embeds: [embed], components: [botoes], ephemeral: true })

    }

    if (interaction.isButton() && interaction.customId === "configstock") {

        const modal = new ModalBuilder()
                .setCustomId("modalconfigstock")
                .setTitle("Configuração de Stock");

            const text1 = new TextInputBuilder()
                .setCustomId("novostock")
                .setRequired(true)
                .setPlaceholder(`Informe o id do serviço que quer adicionar o stock.`)
                .setLabel("ID do serviço")
                .setStyle(1);

                const text2 = new TextInputBuilder()
                .setCustomId("stockadd")
                .setRequired(true)
                .setPlaceholder(`Quais stock serão adicionados no serviço? (por linha)`)
                .setLabel("Stock do serviço")
                .setStyle(2);

            modal.addComponents(
                new ActionRowBuilder().addComponents(text1),
                new ActionRowBuilder().addComponents(text2)
            );

            await interaction.showModal(modal);
        } else if (interaction.isModalSubmit() && interaction.customId === 'modalconfigstock') {
            
            const idservice = interaction.fields.getTextInputValue('novostock');
            const stockadd = interaction.fields.getTextInputValue('stockadd').split('\n');
        
            const stockDirectory = path.join(__dirname, "../../Stock");

            const files = fs.readdirSync(stockDirectory);
        
            if (files[idservice - 1]) {
                const serviceName = files[idservice - 1].replace('.txt', '');
                const servicePath = path.join(stockDirectory, files[idservice - 1]);
        
                fs.appendFile(servicePath, stockadd.join('\n') + '\n', (err) => {
                    if (err) {
                        console.error(`Erro ao adicionar stock ao serviço ${serviceName}: ${err.message}`);
                        return interaction.reply({ content: 'Ocorreu um erro ao adicionar o stock.', ephemeral: true });
                    }
        
                    interaction.reply({ content: `${stockadd.length}x estoque foram atualizados ao serviço \`${serviceName}.txt\``, ephemeral: true });
                });
        
            } else {
                interaction.reply({ content: 'ID do serviço inválido. Verifique e tente novamente.', ephemeral: true });
            }
        }

        if (interaction.isButton() && interaction.customId === "backupstock") {

            const modal = new ModalBuilder()
                .setCustomId("modalbackupstock")
                .setTitle("Backup de Stock");

            const text1 = new TextInputBuilder()
                .setCustomId("idservicebackup")
                .setRequired(true)
                .setPlaceholder(`Informe o id do serviço que deseja guardar o stock.`)
                .setLabel("ID do serviço")
                .setStyle(1);

            modal.addComponents(
                new ActionRowBuilder().addComponents(text1)
            );

            await interaction.showModal(modal);
        } else if (interaction.isModalSubmit() && interaction.customId === 'modalbackupstock') {
            
            const idservice = interaction.fields.getTextInputValue('idservicebackup');
const stockDirectory = path.join(__dirname, "../../Stock");

const files = fs.readdirSync(stockDirectory);

if (files[idservice - 1]) {
    const serviceName = files[idservice - 1].replace('.txt', '');
    const servicePath = path.join(stockDirectory, files[idservice - 1]);
    const backupFilePath = path.join(stockDirectory, `backup_${serviceName}.txt`);

    const stockData = fs.readFileSync(servicePath, 'utf-8');
    const stockCount = stockData.split('\n').filter(line => line.trim()).length;

    if (stockCount === 0) {
        return interaction.reply({ content: `O serviço \`${serviceName}\` está sem stock.`, ephemeral: true });
    }

    fs.copyFile(servicePath, backupFilePath, (err) => {
        if (err) {
            console.error(`Erro ao criar backup do serviço ${serviceName}: ${err.message}`);
            return interaction.reply({ content: 'Ocorreu um erro ao realizar o backup.', ephemeral: true });
        }

        interaction.reply({ content: `O backup do serviço \`${serviceName}\` foi realizado com sucesso! Aqui está o arquivo:`, files: [backupFilePath], ephemeral: true }).then(() => {
            setTimeout(() => {
                fs.unlink(backupFilePath, (unlinkErr) => {
                    if (unlinkErr) {
                        console.error(`Erro ao deletar o backup do serviço ${serviceName}: ${unlinkErr.message}`);
                    }
                });
            }, 5000);
        });
    });

} else {
    interaction.reply({ content: 'ID do serviço inválido. Verifique e tente novamente.', ephemeral: true });
}

            }

            if (interaction.isButton() && interaction.customId === "limparstock") {

                const modal = new ModalBuilder()
                .setCustomId("modalstocklimpar")
                .setTitle("Limpeza de Stock");

            const text1 = new TextInputBuilder()
                .setCustomId("idservicelimpar")
                .setRequired(true)
                .setPlaceholder(`Informe o id do serviço que deseja limpar o stock.`)
                .setLabel("ID do serviço")
                .setStyle(1);

            modal.addComponents(
                new ActionRowBuilder().addComponents(text1)
            );

            await interaction.showModal(modal);
        } else if (interaction.isModalSubmit() && interaction.customId === 'modalstocklimpar') {
            
            const idservice = interaction.fields.getTextInputValue('idservicelimpar');
const stockDirectory = path.join(__dirname, "../../Stock");

const files = fs.readdirSync(stockDirectory);

    if (files[idservice - 1]) {
    const serviceName = files[idservice - 1].replace('.txt', '');
    const servicePath = path.join(stockDirectory, files[idservice - 1]);
    const stockData = fs.readFileSync(servicePath, 'utf-8');
    const stock_antigo = stockData.split('\n').length - 1;

    fs.writeFile(servicePath, '', (err) => {
        if (err) {
            console.error(`Erro ao limpar o serviço ${serviceName}: ${err.message}`);
            return interaction.reply({ content: 'Ocorreu um erro ao limpar o serviço.', ephemeral: true });
        }

        interaction.reply({ content: `O serviço \`${serviceName}\` teve seus ${stock_antigo}x Stocks deletados com sucesso!`, ephemeral: true });
            
    });

} else {
    interaction.reply({ content: 'ID do serviço inválido. Verifique e tente novamente.', ephemeral: true });
                }   
            }

            if (interaction.isButton() && interaction.customId === "gerenciarperms") {

                const embed = new EmbedBuilder()
              .setDescription(`# Painel de Permissões ao gerador 
> - Adicione e remove quem tem perm de configurar o gerador
> - Quem tiver permissão no bot tem perm no gerador ! `)
              .setColor(`${General.get(`${interaction.guild.id}.cor_gen`) || `#2e2e2e` }`)

              const botoes = new ActionRowBuilder()
              .addComponents(
                new ButtonBuilder()
                .setCustomId("adicionarperm")
                .setLabel(`Adicionar Permissão`)
                .setEmoji('1372326106606075956')
                .setStyle(1),
                new ButtonBuilder()
                .setCustomId("removerperm")
                .setLabel(`Remover Permissão`)
                .setEmoji('1296581673596616764')
                .setStyle(1),
                new ButtonBuilder()
                .setCustomId("voltar4")
                .setLabel(`Voltar`)
                .setEmoji('1371605354605051996')
                .setStyle(2)

              )

              await interaction.update({ embeds: [embed], components: [botoes], ephemeral: true  })

            }

            if (interaction.isButton() && interaction.customId === "adicionarperm") {

                const modal = new ModalBuilder()
                .setCustomId("modaladdperm")
                .setTitle("Adicionar permissão pra um usuario");

            const text1 = new TextInputBuilder()
                .setCustomId("userid")
                .setRequired(true)
                .setPlaceholder(`Id da pessoa que tera a permissão`)
                .setLabel("Pessoa")
                .setStyle(1);

            modal.addComponents(
                new ActionRowBuilder().addComponents(text1)
            );

            await interaction.showModal(modal);
        } else if (interaction.isModalSubmit() && interaction.customId === 'modaladdperm') {
            
            const pessoaid = interaction.fields.getTextInputValue('userid');

            const existingPerms = await config.get('perms') || {};

            if (existingPerms[pessoaid]) {
                return interaction.reply({ content: `O usuário <@${pessoaid}> já possui permissão.` , ephemeral: true });
            }

            existingPerms[pessoaid] = pessoaid;

            await config.set('perms', existingPerms);

            await interaction.reply({ content: `Permissão adicionada para o usuário <@${pessoaid}> com sucesso!`, ephemeral: true });

            }

            if (interaction.isButton() && interaction.customId === "removerperm") {

                const modal = new ModalBuilder()
                .setCustomId("modalremoveperm")
                .setTitle("Remover permissão pra um usuario");

            const text1 = new TextInputBuilder()
                .setCustomId("userid")
                .setRequired(true)
                .setPlaceholder(`Id da pessoa que perdera a permissão`)
                .setLabel("Pessoa")
                .setStyle(1);

            modal.addComponents(
                new ActionRowBuilder().addComponents(text1)
            );

            await interaction.showModal(modal);
        } else if (interaction.isModalSubmit() && interaction.customId === 'modalremoveperm') {
            
            const pessoaid = interaction.fields.getTextInputValue('userid');

            const existingPerms = await config.get('perms') || {};

            if (!existingPerms[pessoaid]) {
                return interaction.reply({ content: `O usuário <@${pessoaid}> não possui permissão.` , ephemeral: true });
            }
            delete existingPerms[pessoaid];

            await config.set('perms', existingPerms);

            await interaction.reply({ content: `Permissão removida do usuário <@${pessoaid}> com sucesso!`, ephemeral: true });

            }

            if (interaction.isButton() && interaction.customId === "voltar4") {

                const embed = new EmbedBuilder()
                .setDescription("# Painel de configuração do Gerador\n\n> - Selecione um dos botões abaixo para configurar.\n> - O sistema do seu gerador está ***`100%`*** otimizado.")
                .setColor(`${General.get(`${interaction.guild.id}.cor_gen`) || `#2e2e2e` }`)

              const botoes = new ActionRowBuilder()
              .addComponents(
                new ButtonBuilder()
                .setCustomId("gerenciarkeys")
                .setLabel(`Configurar Keys`)
                .setEmoji('1386694686235824268')
                .setStyle(1),
                new ButtonBuilder()
                .setCustomId("gerenciarservices")
                .setLabel(`Configurar Serviços`)
                .setEmoji('1377455239829000255')
                .setStyle(1),
                new ButtonBuilder()
                .setCustomId("gerenciarperms")
                .setLabel(`Configurar Permissões`)
                .setEmoji('1295570740501942293')
                .setStyle(1),
                new ButtonBuilder()
                .setCustomId("configgenpainelzika")
                .setEmoji('1371605354605051996')
                .setLabel(`Voltar`)
                .setStyle(2)

              )

              await interaction.update({ embeds: [embed], components: [botoes], ephemeral: true  })

            }

        }
    }