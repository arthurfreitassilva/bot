const {
    PermissionFlagsBits,
    EmbedBuilder,
    ApplicationCommandType,
    ActionRowBuilder,
    ButtonBuilder,
    AttachmentBuilder,
    ApplicationCommandOptionType
} = require("discord.js");

const { pedidos, pagamentos, carrinhos, configuracao, produtos } = require("../../DataBaseJson");
const { getPermissions } = require("../../Functions/PermissionsCache.js");
const mercadopago = require("mercadopago");
const { Emojis } = require("../../DataBaseJson");
const path = require("path");

module.exports = {
    name: "payments",
    description: "[💰] Gere um pagamento",
    type: ApplicationCommandType.ChatInput,
    default_member_permissions: PermissionFlagsBits.Administrator,

    options: [
        {
            name: "price",
            description: "-",
            type: ApplicationCommandOptionType.Number,
            required: true
        },
        {
            name: "description",
            description: "-",
            type: ApplicationCommandOptionType.String,
            required: true
        },
        {
            name: "user",
            description: "-",
            type: ApplicationCommandOptionType.User,
            required: true
        },
        {
            name: "method",
            description: "-",
            type: ApplicationCommandOptionType.String,
            required: true,
            choices: [
                { name: "Pix (Mercado Pago)", value: "pix" },
                { name: "Semi-automático (Mercado Pago)", value: "semi" }
            ]
        }
    ],

    run: async (client, interaction) => {

        // 🔐 PERMISSÃO INTERNA DO BOT
        const perm = await getPermissions(client.user.id);
        if (!perm || !perm.includes(interaction.user.id)) {
            return interaction.reply({
                content: `${Emojis.get("negative_dreamm67")} Faltam permissões.`,
                ephemeral: true
            });
        }

        const price = interaction.options.getNumber("price");
        const description = interaction.options.getString("description");
        const user = interaction.options.getUser("user");
        const method = interaction.options.getString("method");

        if (price < 1 || isNaN(price)) {
            return interaction.reply({
                content: `${Emojis.get("negative_dreamm67")} O preço deve ser maior que 0.`,
                ephemeral: true
            });
        }

        await interaction.reply({
            content: `${Emojis.get("loading_dreamapps")} Gerando pagamento...`,
            ephemeral: true
        });

        // ---------------------------------------------------------------------
        // 🔵 MÉTODO: PIX MERCADO PAGO
        // ---------------------------------------------------------------------
        if (method === "pix") {

            const agora = new Date();
            agora.setMinutes(agora.getMinutes() + 10);
            agora.setMinutes(agora.getMinutes() - agora.getTimezoneOffset() + 240);
            agora.setHours(agora.getHours() - 5);
            const dataExp = agora.toISOString().replace("Z", "-04:00");

            const payment_data = {
                transaction_amount: Number(price),
                description: `Pagamento - ${interaction.user.username}`,
                date_of_expiration: dataExp,
                payment_method_id: "pix",
                payer: {
                    email: `${interaction.user.id}@gmail.com`,
                    first_name: `${interaction.user.username}`,
                    last_name: `${interaction.user.id}`,
                    identification: {
                        type: "CPF",
                        number: "12345678909"
                    },
                    address: {
                        zip_code: "86063190",
                        street_name: "Rua Jácomo Piccinin",
                        street_number: "168",
                        neighborhood: "Pinheiros",
                        city: "Londrina",
                        federal_unit: "PR"
                    }
                }
            };

            mercadopago.configurations.setAccessToken(configuracao.get("pagamentos.MpAPI"));

            try {
                const data = await mercadopago.payment.create(payment_data);

                // ------------------------- QR Code -------------------------
                const { qrGenerator } = require("../../Lib/QRCodeLib.js");
                const qr = new qrGenerator({
                    imagePath: path.resolve(__dirname, "../../Lib/aaaaa.png")
                });

                const qrcode = await qr.generate(
                    data.body.point_of_interaction.transaction_data.qr_code
                );

                const buffer = Buffer.from(qrcode.response, "base64");
                const attachment = new AttachmentBuilder(buffer, { name: "payment.png" });

                // ------------------------- EMBED PIX ------------------------
                const embed = new EmbedBuilder()
                    .setColor(configuracao.get("Cores.Principal") || "#2b2d31")
                    .setAuthor({
                        name: interaction.user.username,
                        iconURL: interaction.user.displayAvatarURL({ dynamic: true })
                    })
                    .setTitle("`📡` Pagamento via PIX criado")
                    .addFields({
                        name: "`👨‍💻` Código copia e cola",
                        value: `\`\`\`${data.body.point_of_interaction.transaction_data.qr_code}\`\`\``
                    })
                    .setFooter({
                        text: `${interaction.guild.name} - Pagamento expira em 10 minutos.`,
                        iconURL: interaction.guild.iconURL({ dynamic: true })
                    })
                    .setTimestamp();

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("codigocopiaecola")
                        .setLabel("Código copia e cola")
                        .setEmoji("1377455298545061918")
                        .setStyle(2),

                    new ButtonBuilder()
                        .setCustomId("deletchannel")
                        .setLabel("Cancelar")
                        .setEmoji("1386535436113019050")
                        .setStyle(4)
                );

                if (configuracao.get("pagamentos.QRCode") === "miniatura") {
                    embed.setDescription(
                        `Se preferir pagar via **QR code**, basta clicar na imagem ao lado.`
                    );
                    embed.setThumbnail("attachment://payment.png");
                } else {
                    embed.setImage("attachment://payment.png");
                }

                // Salva informações do pagamento
                pagamentos.set(`${interaction.channel.id}`, {
                    user: user.id,
                    price,
                    description,
                    staff: interaction.user.id
                });

                pagamentos.set(`${interaction.channel.id}`, {
                    method: "site",
                    tipo: "gerado"
                });

                pagamentos.set(`${interaction.channel.id}.pagamentos2`, {
                    id: data.body.id,
                    cp: data.body.point_of_interaction.transaction_data.qr_code,
                    pix: data.body.point_of_interaction.transaction_data.qr_code,
                    method: "pix",
                    data: Date.now(),
                    generated: "Command-Generate"
                });

                const msg = await interaction.channel.send({
                    embeds: [embed],
                    files: [attachment],
                    components: [row]
                });

                pagamentos.set(`${interaction.channel.id}.message`, {
                    messageid: msg.id,
                    channelid: msg.channel.id
                });

                interaction.editReply({
                    content: `${Emojis.get("positive_dream")} Pagamento gerado com sucesso!`,
                    ephemeral: true
                });

            } catch (error) {
                return interaction.editReply({
                    content:
                        `${Emojis.get("negative_dreamm67")} Erro ao gerar pagamento.\n\`\`\`${error}\`\`\``,
                    ephemeral: true
                });
            }
        }

        // ---------------------------------------------------------------------
        // 🟡 MÉTODO: SEMI-AUTOMÁTICO
        // ---------------------------------------------------------------------
        if (method === "semi") {
            const chavepix =
                configuracao.get("pagamentos.SemiAutomatico.chavepix") ||
                "Nenhuma chave Pix configurada.";

            const embed = new EmbedBuilder()
                .setAuthor({
                    name: "Pagamento semi-automático",
                    iconURL: "https://cdn.discordapp.com/emojis/1230562913790595133.webp"
                })
                .setColor("Yellow")
                .setDescription("Um pagamento foi gerado com sucesso!")
                .setFields(
                    {
                        name: "Preço:",
                        value: `\`${price.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL"
                        })}\``,
                        inline: true
                    },
                    {
                        name: "Método:",
                        value: "`Semi-automático (Mercado Pago)`",
                        inline: true
                    },
                    {
                        name: "Chave Pix:",
                        value: `\`\`\`${chavepix}\`\`\``
                    }
                )
                .setFooter({
                    text: "Após realizar o pagamento, envie o comprovante abaixo."
                });

            await interaction.channel.send({ embeds: [embed] });

            interaction.editReply({
                content: `${Emojis.get("positive_dream")} Pagamento gerado com sucesso!`,
                ephemeral: true
            });
        }
    }
};
