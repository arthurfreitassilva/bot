const { carrinhos, produtos, Emojis } = require("../DataBaseJson");
const { DentroCarrinho1 } = require("./DentroCarrinho");
const { client } = require('../index');

async function VerificarCupom(interaction, cupom, client) {

    const ggg = carrinhos.get(interaction.channel.id);
    const hhhh = produtos.get(`${ggg.infos.produto}.Cupom`);
    const gggaaa = hhhh?.find(campo22 => campo22.Nome === cupom);

    // 1: Cupom já aplicado
    if (ggg.cupomadicionado !== undefined) 
        return interaction.followUp({
            content: `${Emojis.get(`negative_dreamm67`)}  Você já possuí um cupom aplicado.`,
            flags: 64
        });

    // 2: Cupom não existe
    if (!gggaaa) 
        return interaction.followUp({
            content: `${Emojis.get(`negative_dreamm67`)}  Cupom não encontrado para esse produto!`,
            flags: 64
        });

    // 3: Cupom expirado
    if (Date.now() > gggaaa.diasvalidos) {

        const indexToDelete = hhhh.findIndex(campo22 => campo22.Nome === cupom);
        if (indexToDelete !== -1) {
            hhhh.splice(indexToDelete, 1);
        }

        await produtos.set(`${ggg.infos.produto}.Cupom`, hhhh);

        return interaction.followUp({
            content: `${Emojis.get(`negative_dreamm67`)}  Cupom não encontrado para esse produto!`,
            flags: 64
        });
    }

    // 4: Condição de cargo
    if (gggaaa.condicoes?.cargospodeusar !== undefined) {
        const member = await interaction.guild.members.fetch(interaction.user.id);
        const temCargo = member.roles.cache.has(gggaaa.condicoes?.cargospodeusar);

        if (!temCargo)
            return interaction.followUp({
                content: `${Emojis.get(`negative_dreamm67`)}  Você não possui permissão para utilizar esse cupom!`,
                flags: 64
            });
    }

    // 5: Cupom com quantidade total
    if (gggaaa.qtd !== undefined) {
        if (gggaaa.usos >= gggaaa.qtd)
            return interaction.followUp({
                content: `${Emojis.get(`negative_dreamm67`)}  Esse cupom foi limitado em \`${gggaaa.qtd}\` usos (que já foram utilizados).`,
                flags: 64
            });
    }

    // 6: Máximo por pessoa
    if (gggaaa.maxuse !== undefined) {
        if (gggaaa?.users !== undefined) {
            const occurrences = gggaaa.users.filter(id => id === interaction.user.id).length;

            if (occurrences >= gggaaa.maxuse) {
                return interaction.followUp({
                    content: `${Emojis.get(`negative_dreamm67`)}  Você já utilizou esse cupom o máximo de vezes permitidas \`${gggaaa.maxuse}\` (POR PESSOA).`,
                    flags: 64
                });
            }
        }
    }

    // 7: Preço mínimo
    if (gggaaa?.condicoes?.precominimo !== undefined) {
        if (Number(ggg.quantidadeselecionada) < Number(gggaaa.condicoes.precominimo))
            return interaction.followUp({
                content: `${Emojis.get(`negative_dreamm67`)}  Para utilizar o cupom \`${cupom}\`, você precisa inserir uma quantia igual ou acima de \`${Number(gggaaa.condicoes.precominimo)}\`.`,
                flags: 64
            });
    }

    // 8: Preço máximo
    if (gggaaa?.condicoes?.qtdmaxima !== undefined) {
        if (Number(ggg.quantidadeselecionada) > Number(gggaaa.condicoes.qtdmaxima))
            return interaction.followUp({
                content: `${Emojis.get(`negative_dreamm67`)}  Para utilizar o cupom \`${cupom}\`, você precisa inserir uma quantia igual ou abaixo de \`${Number(gggaaa.condicoes.qtdmaxima)}\`.`,
                flags: 64
            });
    }

    // 9: Atualizar contador de usos
    gggaaa.usos = (gggaaa.usos ?? 0) + 1;

    // 10: Salvar usuário no histórico de uso
    gggaaa.users = gggaaa?.users || [];
    gggaaa.users.push(interaction.user.id);

    await produtos.set(`${ggg.infos.produto}.Cupom`, hhhh);

    // 11: Salvar cupom no carrinho
    await carrinhos.set(`${interaction.channel.id}.cupomadicionado`, cupom);

    // 12: Atualizar interface
    await DentroCarrinho1(interaction, 1, client, cupom);
}

module.exports = {
    VerificarCupom
};
