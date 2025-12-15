const { EmbedBuilder, ApplicationCommandType, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ComponentType, PermissionFlagsBits } = require("discord.js");
const { JsonDatabase } = require("wio.db");
const fs = require("fs");
const { Emojis } = require("../../DataBaseJson");

const path = require("path");

const General = new JsonDatabase({ databasePath: "./DataBaseJson/General.json" });
const config = new JsonDatabase({ databasePath: "./DataBaseJson/configbasicasindex.json" });

module.exports = {
    name: "stockgen",
    description: "[ Gerador ] Veja os serviços do bot",
    type: ApplicationCommandType.ChatInput,
    autoDeferReply: false, // Desabilita defer automático para evitar conflito com replies diretos
    default_member_permissions: PermissionFlagsBits.Administrator,
    run: async (client, interaction) => {
        const stockDirectory = path.join(__dirname, "../../Stock");
        const files = fs.readdirSync(stockDirectory);

        if (files.length === 0) {
            return interaction.reply({
                content: `❌ | Não tenho nenhum serviço cadastrado no momento, contate ao <@${General.get(`owner`)}>!`,
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setTitle(`${General.get(`${interaction.guild.id}.titulo_gen`) || `${client.user.username}`} | Meus Serviços (${files.length})`)
            .setThumbnail(config.get(`thumbnail_bot`) || client.user.displayAvatarURL())
            .setColor(`${General.get(`${interaction.guild.id}.cor_gen`) || `#2e2e2e`}`)
            .setFooter({ text: `${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        files.forEach(file => {
            if (file.endsWith('.txt')) {
                const serviceName = file.replace('.txt', '');
                const servicePath = path.join(stockDirectory, file);
                const stock = fs.readFileSync(servicePath, 'utf-8').split('\n').filter(line => line.trim() !== '');

                const stockCount = stock.length.toLocaleString('pt-BR').replace('.', ',');

                embed.addFields({
                    name: `${Emojis.get(`_transfer_emoji`)} | ${serviceName}`,
                    value: `\`\`\`${stockCount} Produto(s)\`\`\``,
                    inline: true
                });
            }
        });

        const serverBanner = General.get(`${interaction.guild.id}.banner_gen`);
        const botBanner = config.get(`banner_bot`);
        const imageUrl = serverBanner || botBanner;

        if (imageUrl) {
            embed.setImage(imageUrl);
        }

        await interaction.reply({ embeds: [embed] });
    }
};
