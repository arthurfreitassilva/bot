const { Client, GatewayIntentBits, ModalBuilder, TextInputStyle, TextInputBuilder, ActionRowBuilder, ChannelType, Events } = require('discord.js');
const { owner } = require("../../config.json");

module.exports = {
    name: Events.InteractionCreate,
    run: async (interaction) => {
        if (!interaction.isButton() && !interaction.isModalSubmit()) return;

        const { customId, user, client } = interaction;

        // Abrindo o modal ao clicar no botão
        if (customId === "panelclonerslaoq") {
            const modal = new ModalBuilder()
                .setCustomId("panelclonermodal")
                .setTitle("Dream Clone");

            const originalInput = new TextInputBuilder()
                .setCustomId("original")
                .setLabel("SERVIDOR ORIGINAL")
                .setPlaceholder("ID DO SERVIDOR QUE QUER COPIAR")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const tokenInput = new TextInputBuilder()
                .setCustomId("token")
                .setLabel("TOKEN")
                .setPlaceholder("TOKEN QUE ESTEJA EM AMBOS SERVIDORES")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const alvoInput = new TextInputBuilder()
                .setCustomId("alvo")
                .setLabel("SERVIDOR CÓPIA")
                .setPlaceholder("ID DO SEU SERVIDOR PADRÃO")
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(originalInput),
                new ActionRowBuilder().addComponents(tokenInput),
                new ActionRowBuilder().addComponents(alvoInput)
            );

            await interaction.showModal(modal);
        }

        // Processando o modal de clonagem
        if (customId === "panelclonermodal") {
            const original = interaction.fields.getTextInputValue("original");
            const token = interaction.fields.getTextInputValue("token");
            const target = interaction.fields.getTextInputValue("alvo");

            await interaction.reply({ content: `Clonando servidor... Por favor, aguarde.`, ephemeral: true });

            const self = new Client({
                intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
            });
            let invalidToken;

            try {
                await self.login(token).catch(() => invalidToken = true);
            } catch {
                invalidToken = true;
            }

            if (invalidToken) return interaction.editReply({ content: `Token inválido.`, ephemeral: true });

            const guilds = [await self.guilds.cache.get(original), await self.guilds.cache.get(target)];
            if (!guilds[0] || !guilds[1]) {
                return interaction.editReply({ content: `A conta não está nos dois servidores.`, ephemeral: true });
            }

            // Clonando configurações do servidor
            await guilds[1].channels.cache.forEach(c => c.delete().catch(() => {}));
            await guilds[1].roles.cache.forEach(r => r.delete().catch(() => {}));
            await guilds[1].emojis.cache.forEach(e => e.delete().catch(() => {}));

            await guilds[1].setIcon(guilds[0].iconURL());
            await guilds[1].setName(`${guilds[0].name}`);

            for (const role of guilds[0].roles.cache.sort((a, b) => b.position - a.position)) {
                if (guilds[1].roles.cache.has(role.id)) continue;

                await guilds[1].roles.create({
                    name: role.name,
                    color: role.color,
                    permissions: role.permissions,
                    mentionable: role.mentionable,
                    position: role.position,
                }).catch(() => {});
            }

            for (const category of guilds[0].channels.cache.filter(c => c.type === ChannelType.GuildCategory).values()) {
                const newCategory = await guilds[1].channels.create({
                    name: category.name,
                    type: ChannelType.GuildCategory,
                    position: category.position,
                    permissionOverwrites: category.permissionOverwrites.cache.map(o => ({
                        id: guilds[1].roles.cache.find(r => r.name === o.id) || guilds[1].id,
                        allow: o.allow,
                        deny: o.deny
                    }))
                }).catch(() => {});

                for (const channel of category.children.values()) {
                    await guilds[1].channels.create({
                        name: channel.name,
                        type: channel.type,
                        parent: newCategory,
                        position: channel.position,
                        permissionOverwrites: channel.permissionOverwrites.cache.map(o => ({
                            id: guilds[1].roles.cache.find(r => r.name === o.id) || guilds[1].id,
                            allow: o.allow,
                            deny: o.deny
                        }))
                    }).catch(() => {});
                }
            }

            await interaction.editReply({ content: `Servidor clonado com sucesso!`, ephemeral: true });
            await self.destroy();
        }
    }
};
