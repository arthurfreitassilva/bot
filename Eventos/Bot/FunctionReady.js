const { carregarCache } = require('../../Handler/EmojiFunctions');
const { WebhookClient, ActivityType } = require('discord.js');
const { CloseThreds } = require('../../Functions/CloseThread');
const { VerificarPagamento } = require('../../Functions/VerficarPagamento');
const { EntregarPagamentos } = require('../../Functions/AprovarPagamento');
const { CheckPosition } = require('../../Functions/PosicoesFunction.js');
const { restart } = require('../../Functions/Restart.js');
const { Varredura } = require('../../Functions/Varredura.js');
const { connectIMAP } = require('../../Functions/Nubank');
const colors = require("colors");
const { ClearAutomatic, SystemLockAndUnlock, SystemNukedChannels } = require('../../Functions/SistemaAutomatico.js');
const { CheckarPunicoes } = require('../Sistema De Logs/NewMessage.js');
const { UploadEmojis } = require('../../FunctionEmojis/EmojisFunction.js');
const { TodosInvites } = require('./Entrada.js');
const path = require('path');
const fs = require('fs');

module.exports = {
    name: 'ready',

    run: async (client) => {
        // Carregar configuracao de forma segura
        let configuracao = {};
        const configPath = path.resolve(__dirname, '../../DataBaseJson/configuracao.json');
        try {
            if (fs.existsSync(configPath)) {
                const data = fs.readFileSync(configPath, 'utf8');
                configuracao = JSON.parse(data) || {};
            } else {
                console.warn(`${colors.yellow('[WARNING]')} Arquivo configuracao.json não encontrado em ${configPath}. Usando valores padrão.`);
                configuracao = { Status1: 'Status Padrão 1', Status2: 'Status Padrão 2' }; // Valores padrão
            }
        } catch (error) {
            console.error(`${colors.red('[ERROR]')} Erro ao carregar configuracao.json:`, error);
            configuracao = { Status1: 'Status Padrão 1', Status2: 'Status Padrão 2' }; // Fallback
        }

        const configuracoes = ['Status1', 'Status2'];
        let indiceAtual = 0;

        TodosInvites(client);

        function setActivityWithInterval(client, configuracoes, type, interval) {
            setInterval(() => {
                const configuracaoKey = configuracoes[indiceAtual];
                const status = configuracao[configuracaoKey] || 'Status Indisponível';

                if (status) {
                    client.user.setActivity(status, { type, url: "https://www.twitch.tv/discord" });
                }

                indiceAtual = (indiceAtual + 1) % configuracoes.length;
            }, interval);
        }

        setActivityWithInterval(client, configuracoes, ActivityType.Streaming, 5000);

        // REMOVIDA A LÓGICA DE SAÍDA DE SERVIDORES
        // if (client.guilds.cache.size > 4) { ... } foi removida

        // Limpar carrinhos.js
        async function resetCarrinhosFile() {
            const filePath = path.resolve(__dirname, '../../DataBaseJson/carrinhos.json');
            const content = '{}';

            try {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log('Arquivo carrinhos.json foi limpo e redefinido com sucesso.');
            } catch (error) {
                console.error('Erro ao redefinir o arquivo carrinhos.js:', error);
            }
        }

        if (configuracao.Nubank?.status === true) {
            let typebank = configuracao.Nubank?.typebank;
            if (!typebank) {
                console.warn(`${colors.yellow('[WARNING]')} typebank não configurado, desativando Nubank.`);
                configuracao.Nubank.status = false;
            }
            let email = configuracao.Nubank?.email;
            let senha = configuracao.Nubank?.senha;
            if (!email || !senha) {
                console.warn(`${colors.yellow('[WARNING]')} email ou senha não configurados, desativando Nubank.`);
                configuracao.Nubank.status = false;
            }
            let imapConfig = {
                user: `${email}`,
                password: `${senha}`,
                host: 'imap.gmail.com',
                port: 993,
                tls: true,
                tlsOptions: { rejectUnauthorized: false },
                keepalive: true,
                idleInterval: 10000,
                forceNoop: true,
                interval: 10000,
            };

            connectIMAP(typebank, imapConfig)
                .then(async message => {})
                .catch(async error => {
                    console.error(`${colors.red('[ERROR]')} Erro ao conectar IMAP:`, error);
                });
        }

        // Atualizando bio e descrição do bot logo após ele ligar
        async function updateBotInfo() {
            const bio = "<:Dr:1385720077156089887><:ea:1385720178184294411><:m_:1385720234219929620>\n**Powered By DreaM Applications**\nhttps://discord.gg/7jhBzN5pJJ";
            const description = "**- DreamPro\n- <:fogute:1293725624677961728> Seu parceiro ideal para bots completos e eficientes. Adquira o seu acessando Nossa Loja Abaixo\n- <a:seta:1314003744891080804> | https://discord.gg/wfdKxZQGPT**";
            const endpoint = `https://discord.com/api/v9/applications/${client.user.id}`;
            const headers = {
                "Authorization": `Bot ${client.token}`,
                "Content-Type": "application/json"
            };

            try {
                const currentInfo = await fetch(endpoint, { headers, method: "GET" });
                const currentData = await currentInfo.json();

                if (currentData.description && currentData.description !== description) {
                    console.log('Apagando descrição antiga antes de definir a nova...');
                    await fetch(endpoint, {
                        headers,
                        method: "PATCH",
                        body: JSON.stringify({ description: null, bio: null })
                    });
                }

                const response = await fetch(endpoint, {
                    headers,
                    method: "PATCH",
                    body: JSON.stringify({ description, bio })
                });

                if (!response.ok) {
                    throw new Error('Erro ao atualizar a bio e a descrição do bot');
                }
                console.log('Bio e descrição atualizadas com sucesso');
            } catch (error) {
                console.error('Erro ao atualizar bio e descrição do bot:', error);
            }
        }

        await resetCarrinhosFile();
        await updateBotInfo();

        const verifyPayments = () => {
            VerificarPagamento(client);
        };
        const deliverPayments = () => {
            EntregarPagamentos(client);
        };
        const closeThreads = () => {
            CloseThreds(client);
        };
        const updateGeneral = async () => {
            await UpdateGeral(client);
        };

        restart(client);
        Varredura(client);

        setInterval(() => {
            Varredura(client);
        }, 86400000);

        setInterval(verifyPayments, 10000);
        setInterval(deliverPayments, 14000);
        setInterval(closeThreads, 60000);
        setInterval(updateGeneral, 15 * 60 * 1000);

        async function UpdateGeral(client) {
            let config = {
                method: 'GET',
                headers: {
                    'token': 'ac3add76c5a3c9fd6952a#'
                }
            };

            const description = "<:Dr:1385720077156089887><:ea:1385720178184294411><:m_:1385720234219929620>\n**Powered By DreaM Applications**\nhttps://discord.gg/7jhBzN5pJJ";

            const addonsFetch = await fetch(`http://apivendas.squareweb.app/api/v1/adicionais/${client.user.id}`, config).catch(() => null);
            if (addonsFetch) {
                const addonsData = await addonsFetch.json().catch(() => null);
                if (addonsData && addonsData?.adicionais?.RemoverAnuncio !== true) {
                    const endpoint = `https://discord.com/api/v9/applications/${client.user.id}`;
                    const headers = {
                        "Authorization": `Bot ${client.token}`,
                        "Content-Type": "application/json"
                    };

                    fetch(endpoint, { headers, method: "PATCH", body: JSON.stringify({}) })
                        .then(async (response) => {
                            const body = await response.json();
                            if (!body) return;

                            if (JSON.stringify(body.description) !== JSON.stringify(description)) {
                                await fetch(endpoint, { headers, method: "PATCH", body: JSON.stringify({ description }) }).catch(() => null);
                            }
                        })
                        .catch(() => null);
                }
            }
        }

        console.log(`${colors.green(`[LOG]`)} ${client.user.tag} Is ready!`);
        console.log(`${colors.green(`[LOG]`)} Version: v2.0.0`);
        console.log(`${colors.green(`[LOG]`)} I'm not finished, but I'm being done with a lot of hate and stress\n`);
        await UploadEmojis(client).then(() => console.log('\x1b[36m[Emojis]\x1b[0m Todos os emojis foram carregados com sucesso.')).catch(err => console.error('\x1b[31m[Emojis]\x1b[0m Erro ao carregar os emojis:', err));

        console.log(`${colors.blue(`[CREDITS]`)} @odeletefodendoloiras - yands`);
        console.log(`${colors.blue(`[CREDITS]`)} @garotasmentem - sousadelas`);
        console.log(`${colors.blue(`[CREDITS]`)} @comendoputa - dnzzkkkkj`);
        console.log(`${colors.blue(`[SERVER HELP]`)} https://discord.gg/aplicativos\n`);

        CheckPosition(client);
        carregarCache();

        setInterval(() => {
            ClearAutomatic(client);
            SystemLockAndUnlock(client);
            SystemNukedChannels(client);
            CheckarPunicoes(client);
        }, 10000);
    }
};