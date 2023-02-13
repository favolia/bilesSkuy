const {
    default: defaSocket,
    useSingleFileAuthState,
    DisconnectReason,
} = require('@adiwajshing/baileys')
const { Boom } = require('@hapi/boom')
const P = require('pino')
// const moment = require('moment')
// const chalk = require('chalk')

const { state, saveState } = useSingleFileAuthState('defaSession.json')

    function startDefa() {

        const defa = defaSocket({
            auth: state,
            printQRInTerminal: true,
            logger: P({ level: 'silent' }),
            browser: ['defa', 'Safari', '1.0.0'],
        })

        defa.ev.on('connection.update', ({ connection, lastDisconnect }) => {

            if (connection === "close") {
                const error = new Boom(lastDisconnect.error)
                const dcReason = error?.output?.statusCode

                if (dcReason ===  DisconnectReason.loggedOut) {
                    defa.logout()
                } else {
                    startDefa()
                }

            } else if (connection === 'open') {

                console.log("Bot is online!");
                defa.ev.on('messages.upsert', async ({ messages, type }) => {

                    console.log(messages, type);
                    const jid = messages[0].key.remoteJid
                    const msg = messages[0].message.conversation

                    try {

                        msg === 'Hi' ? await defa.sendMessage(jid, {text: 'Hello'}) : console.log(false);
        
                    } catch (err) {
                        console.log(err);
                    }
        
                })

            }
            
        })

        defa.ev.on('creds.update', saveState)

    }

startDefa()

