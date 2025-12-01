module.exports = {
    name: 'guildRoleDelete',
    run: async (client, role) => {
        try {
            if (!role || !role.guild) {
                console.log('Dados do role ou guild inválidos.');
                return;
            }

            const logChannelId = configuracao.get(`ConfigChannels.systemlogs`);
            if (!logChannelId) return;

            const logChannel = client.channels.cache.get(logChannelId);
            if (!logChannel) return;

            const embed = new EmbedBuilder()
                .setTitle('Cargo Deletado')
                .setDescription(`O cargo **${role.name}** foi deletado no servidor **${role.guild.name}**.`)
                .setColor('#FF0000')
                .setTimestamp();

            await logChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('Erro ao processar guildRoleDelete:', error);
        }
    }
};