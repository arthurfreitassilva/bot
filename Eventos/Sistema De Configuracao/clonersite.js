const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");
const axios = require("axios");
const cheerio = require("cheerio");
const path = require("path");
const url = require("url");

module.exports = {
    name: "interactionCreate",
    run: async (interaction) => {
        if (interaction.isButton() && interaction.customId === "ClonerSite") {
            const modal = new ModalBuilder()
                .setCustomId("url-cop")
                .setTitle("Insira a URL do site");

            const option1 = new TextInputBuilder()
                .setCustomId("name-site")
                .setLabel("Nome para o site")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("Portfólio")
                .setMaxLength(50)
                .setRequired(true);

            const option2 = new TextInputBuilder()
                .setCustomId("url-input")
                .setLabel("URL do site")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder("https://")
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(option1),
                new ActionRowBuilder().addComponents(option2)
            );

            await interaction.showModal(modal);
        }

        if (interaction.isModalSubmit() && interaction.customId === "url-cop") {
            try {
                const filename = interaction.fields.getTextInputValue("name-site");
                const siteUrl = interaction.fields.getTextInputValue("url-input");

                await interaction.reply({ content: `🔁 | Espere um momento, estamos trabalhando nisso...`, ephemeral: true });

                const fetchPage = async (pageUrl) => {
                    try {
                        const response = await axios.get(pageUrl);
                        return response.data;
                    } catch (error) {
                        console.error(`Erro ao buscar a página: ${error.message}`);
                        return null;
                    }
                };

                const updateLinks = async (html, baseUrl) => {
                    const $ = cheerio.load(html);

                    const updateLink = async (elem, attr) => {
                        const link = $(elem).attr(attr);
                        if (link) {
                            const absoluteLink = url.resolve(baseUrl, link);
                            const parsedUrl = url.parse(absoluteLink);
                            const localPath = path.join(__dirname, "downloads", parsedUrl.pathname);

                            try {
                                const response = await axios.get(absoluteLink, { responseType: "arraybuffer" });
                                $(elem).attr(attr, parsedUrl.pathname);
                            } catch (error) {
                                console.error(`Erro ao baixar recurso ${absoluteLink}: ${error.message}`);
                                $(elem).attr(attr, link);
                            }
                        }
                    };

                    const promises = [];
                    $("a[href]").each((i, elem) => promises.push(updateLink(elem, "href")));
                    $("img[src]").each((i, elem) => promises.push(updateLink(elem, "src")));
                    $("link[href]").each((i, elem) => promises.push(updateLink(elem, "href")));
                    $("script[src]").each((i, elem) => promises.push(updateLink(elem, "src")));

                    await Promise.all(promises);

                    return $.html();
                };

                const sendHtml = async (htmlContent) => {
                    const buffer = Buffer.from(htmlContent, "utf-8");
                    return buffer;
                };

                const cloneSite = async (siteUrl) => {
                    const htmlContent = await fetchPage(siteUrl);
                    if (!htmlContent) return null;

                    const updatedHtml = await updateLinks(htmlContent, siteUrl);

                    return sendHtml(updatedHtml);
                };

                const htmlBuffer = await cloneSite(siteUrl);

                if (htmlBuffer) {
                    await interaction.editReply({
                        content: `✅ | Olá ${interaction.user}, o seu clone do site está pronto!`,
                        files: [{ attachment: htmlBuffer, name: `${filename}.html` }],
                        ephemeral: true
                    });
                } else {
                    await interaction.editReply({ content: `❌ | Ocorreu um erro ao tentar clonar o site. Por favor, tente novamente mais tarde.`, ephemeral: true });
                }

            } catch (error) {
                console.error("Erro durante a clonagem do site:", error);
                await interaction.editReply({ content: `❌ | Ocorreu um erro ao tentar clonar o site. Por favor, tente novamente mais tarde.`, ephemeral: true });
            }
        }
    }
};
