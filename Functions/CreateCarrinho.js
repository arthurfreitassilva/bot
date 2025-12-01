const { EmbedBuilder, ApplicationCommandType, ActionRowBuilder, ButtonBuilder, ChannelType, ButtonStyle } = require("discord.js");
const { configuracao, produtos, Emojis } = require("../DataBaseJson");
const { DentroCarrinho1 } = require("./DentroCarrinho");
const { carrinhos } = require("../DataBaseJson");
const { owner } = require("../config.json");
const fs = require('fs').promises;
const path = require('path');

// Função para garantir que o diretório existe
async function ensureDirectoryExists(dirPath) {
    try {
        if (!await fs.access(dirPath).then(() => true).catch(() => false)) {
            await fs.mkdir(dirPath, { recursive: true });
        }
    } catch (error) {
        console.error(`Erro ao criar diretório ${dirPath}: ${error}`);
    }
}

// Função para carregar configurações do JSON
async function loadConfig() {
    const configPath = './DataBaseJson/configuracao.json';
    try {
        await ensureDirectoryExists(path.dirname(configPath));
        const data = await fs.readFile(configPath, 'utf8').catch(() => '{}');
        return JSON.parse(data) || { email: "", vendasstatus: false, Repostagem: { Status: false }, feedbackChannelId: null, termsEnabled: false, termsText: "" };
    } catch (error) {
        console.error(`Erro ao carregar configuracao.json: ${error}`);
        return { email: "", vendasstatus: false, Repostagem: { Status: false }, feedbackChannelId: null, termsEnabled: false, termsText: "" };
    }
}

// Função para carregar usuários que aceitaram os termos
async function loadAcceptedUsers() {
    const termsAcceptedPath = './DataBaseJson/termosaceitos.json';
    try {
        await ensureDirectoryExists(path.dirname(termsAcceptedPath));
        const data = await fs.readFile(termsAcceptedPath, 'utf8').catch(() => '[]');
        return JSON.parse(data) || [];
    } catch (error) {
        console.error(`Erro ao carregar termosaceitos.json: ${error}`);
        return [];
    }
}

function VerificaçõesCarrinho(infos) {
    if (infos.estoque <= 0) return { error: 400, message: `Sem Stock Disponível` };
    return { status: 202 };
}

async function CreateCarrinho(interaction, infos) {
    const config = await loadConfig();
    const termsEnabled = config.termsEnabled || false;

    // Verificar se os termos estão ativados e se o usuário já aceitou
    if (termsEnabled && config.termsText) {
        const acceptedUsers = await loadAcceptedUsers();
        const userId = interaction.user.id;

        if (!acceptedUsers.some(user => user.userId === userId)) {
            // Mostrar os termos para o usuário com o ícone do servidor como thumbnail
            const guildIcon = interaction.guild.iconURL({ dynamic: true, size: 1024 });

            const embed = new EmbedBuilder()
                .setTitle(`\`\📩\` Termos De __${interaction.guild.name}__`)
                .setDescription(config.termsText)
                .setColor("#313838")
                .setAuthor({ name: interaction.guild.name, iconURL: guildIcon })
                .setThumbnail(guildIcon);

            const acceptButton = new ButtonBuilder()
                .setCustomId('acceptTerms')
                .setLabel('Eu, Concordo!')
                .setEmoji("1305153239821324319")
                .setStyle(ButtonStyle.Success);

            const row = new ActionRowBuilder().addComponents(acceptButton);

            // Armazenar temporariamente as informações do carrinho
            interaction.client.tempCartInfos = infos;

            await interaction.reply({
                embeds: [embed],
                components: [row],
                ephemeral: true
            });
            return;
        }
    }

    const status = configuracao.get("vendasstatus") || false;
    if (status === true) {
        await interaction.reply({
            content: `${Emojis.get('negative_dreamm67')} As vendas estão desabilitadas nesse momento`,
            ephemeral: true
        });
        return;
    }

    try {
        // Defer the initial reply to allow multiple updates
        await interaction.deferReply({ ephemeral: true });

        // Update the deferred reply with progress messages
        await interaction.editReply({ content: `${Emojis.get('loading_dreamapps')} Verificando Seu Cargo...` });
        await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay for visual feedback

        const statusAtivo = configuracao.get("ConfigRoles.statuscomprar");
        const cargoNecessario = configuracao.get("ConfigRoles.cargocarrinho");
        const linkConfigurado = configuracao.get("ConfigLinks.link") || `https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id}`;

        // Verifica se o membro tem o cargo necessário
        if (statusAtivo && cargoNecessario && !interaction.member.roles.cache.has(cargoNecessario)) {
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel('Obter Acesso')
                    .setStyle(ButtonStyle.Link)
                    .setEmoji("1371607363995439275")
                    .setURL(linkConfigurado)
            );

            await interaction.editReply({
                content: `# Verificação **__${interaction.guild.name}__**\n\n-# - **Este servidor requer que os membros estejam verificados para abrir carrinhos. Por favor, clique no botão abaixo e autorize para continuar.**`,
                components: [row]
            });
            return;
        }

        await interaction.editReply({ content: `${Emojis.get('loading_dreamapps')} Verificando Seu Acesso...` });
        await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay for visual feedback

        // Verifica se o canal de logs de pedidos foi configurado
        if (configuracao.get("ConfigChannels.logpedidos") == null) {
            await interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setDescription(`Ops... o canal de logs pedidos ainda não foi configurado, faça um retorno em breve!`)
                    .setColor(configuracao.get('Cores.Erro') || 'ff0000')
                ]
            });
            return;
        }

        // Verifica se a forma de pagamento está configurada
        if (configuracao.get("pagamentos.MpOnOff") != true && configuracao.get("pagamentos.SemiAutomatico.status") != true && configuracao.get("pagamentos.EfiOnOff") != true) {
            await interaction.editReply({
                embeds: [new EmbedBuilder()
                    .setDescription(`Ops... a forma de pagamento não foi configurada ainda, faça um retorno em breve!`)
                    .setColor(configuracao.get('Cores.Erro') || 'ff0000')
                ]
            });
            return;
        }

        await interaction.editReply({ content: `${Emojis.get('loading_dreamapps')} Criando Seu Carrinho...` });
        await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay for visual feedback

        // Verifica se já existe um carrinho ou thread de troca
        const cartThread = interaction.channel.threads.cache.find(x => x.name === `🛒・${interaction.user.username}・${interaction.user.id}`);
        const exchangeThread = interaction.channel.threads.cache.find(x => x.name === `💱・${interaction.user.username}・${interaction.user.id}`);

        // Caso já exista, envia um botão para o usuário acessar o carrinho
        if (cartThread || exchangeThread) {
            const row4 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setURL(`https://discord.com/channels/${interaction.guild.id}/${cartThread ? cartThread.id : exchangeThread.id}`)
                        .setLabel('Ir para o carrinho')
                        .setStyle(ButtonStyle.Link)
                );

            await interaction.editReply({
                content: `${Emojis.get('negative_dreamm67')} Você já possui um carrinho aberto.`,
                components: [row4]
            });
            return;
        }

        // Cria a thread do carrinho
        const thread = await interaction.channel.threads.create({
            name: `🛒・${interaction.user.username}・${interaction.user.id}`,
            autoArchiveDuration: 60,
            type: ChannelType.PrivateThread,
            reason: 'Needed a separate thread for moderation',
            members: [interaction.user.id],
        });

        // Envia o link para o carrinho recém-criado
        const row4 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setURL(`https://discord.com/channels/${interaction.guild.id}/${thread.id}`)
                    .setLabel('Ir para o carrinho')
                    .setStyle(ButtonStyle.Link)
            );

        await interaction.editReply({
            content: `${Emojis.get('positive_dream')} Seu carrinho foi criado com êxito.`,
            components: [row4]
        });

        // Armazena o carrinho na base de dados
        await carrinhos.set(thread.id, { user: interaction.user.id, guild: interaction.guild.id, threadid: thread.id, infos: infos });

        // Chama a função para adicionar o usuário ao carrinho
        DentroCarrinho1(thread, undefined, interaction.client);
    } catch (error) {
        console.error(error);
        await interaction.editReply({
            content: "Ocorreu um erro ao tentar criar o carrinho. Tente novamente mais tarde.",
            components: []
        });
    }
}

module.exports = {
    VerificaçõesCarrinho,
    CreateCarrinho
};