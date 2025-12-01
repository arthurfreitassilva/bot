const { EmbedBuilder } = require("discord.js");

async function replyMessage({ interaction, type, message, components }) {
    const embed = new EmbedBuilder();
    switch (type) {
        case "error": {
            embed.setColor("Red");
            embed.setDescription(`${Emojis.get(`negative_dreamm67`)} ${message}`);
            return interaction.reply({ embeds: [embed], components: components ? [components] : [], ephemeral: true });
        }
        case "success": {
            embed.setColor("Green");
            embed.setDescription(`${Emojis.get(`positive_dream`)} ${message}`);
            return interaction.reply({ embeds: [embed], components: components ? [components] : [], ephemeral: true });
        }
        case "loading_dreamapps": {
            embed.setColor("#2b2d31");
            embed.setDescription(`${Emojis.get(`loading_dreamapps`)} ${message}`);
            return interaction.reply({ embeds: [embed], components: components ? [components] : [], ephemeral: true });
        }
    }
}

async function editReplyMessage({ interaction, type, message, components }) {
    const embed = new EmbedBuilder();
    switch (type) {
        case "error": {
            embed.setColor("Red");
            embed.setDescription(`${Emojis.get(`negative_dreamm67`)} ${message}`);
            return interaction.editReply({ embeds: [embed], components: components ? [components] : [], ephemeral: true });
        }
        case "success": {
            embed.setColor("Green");
            embed.setDescription(`${Emojis.get(`positive_dream`)} ${message}`);
            return interaction.editReply({ embeds: [embed], components: components ? [components] : [], ephemeral: true });
        }
        case "loading_dreamapps": {
            embed.setColor("#2b2d31");
            embed.setDescription(`${Emojis.get(`loading_dreamapps`)} ${message}`);
            return interaction.editReply({ embeds: [embed], components: components ? [components] : [], ephemeral: true });
        }
    }
}

async function updateMessage({ interaction, type, message, components }) {
    const embed = new EmbedBuilder();
    switch (type) {
        case "error": {
            embed.setColor("Red");
            embed.setDescription(`${Emojis.get(`negative_dreamm67`)} ${message}`);
            return interaction.update({ embeds: [embed], components: components ? [components] : [], ephemeral: true });
        }
        case "success": {
            embed.setColor("Green");
            embed.setDescription(`${Emojis.get(`positive_dream`)} ${message}`);
            return interaction.update({ embeds: [embed], components: components ? [components] : [], ephemeral: true });
        }
        case "loading_dreamapps": {
            embed.setColor("#2b2d31");
            embed.setDescription(`${Emojis.get(`loading_dreamapps`)} ${message}`);
            return interaction.update({ embeds: [embed], components: components ? [components] : [], ephemeral: true });
        }
    }
}

async function followUpMessage({ interaction, type, message, components }) {
    const embed = new EmbedBuilder();
    switch (type) {
        case "error": {
            embed.setColor("Red");
            embed.setDescription(`${Emojis.get(`negative_dreamm67`)} ${message}`);
            return interaction.followUp({ embeds: [embed], components: components ? [components] : [], ephemeral: true });
        }
        case "success": {
            embed.setColor("Green");
            embed.setDescription(`${Emojis.get(`positive_dream`)} ${message}`);
            return interaction.followUp({ embeds: [embed], components: components ? [components] : [], ephemeral: true });
        }
        case "loading_dreamapps": {
            embed.setColor("#2b2d31");
            embed.setDescription(`${Emojis.get(`loading_dreamapps`)} ${message}`);
            return interaction.followUp({ embeds: [embed], components: components ? [components] : [], ephemeral: true });
        }
    }
}

module.exports = {
    replyMessage,
    editReplyMessage,
    updateMessage,
    followUpMessage
};
