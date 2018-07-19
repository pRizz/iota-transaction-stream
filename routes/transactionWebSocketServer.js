/*!
 * IOTA Transaction Stream
 * Copyright(c) 2017 Peter Ryszkiewicz
 * MIT Licensed
 */

const WebSocket = require('ws')

// TODO: Clear out dead connections; utilize pinging
let webSocketServer = null

function publishTransactionToClients(transaction) {
    if(!webSocketServer) {
        throw 'Must start() server first!'
    }
    webSocketServer.broadcast(JSON.stringify(transaction))
}

function startServer(port) {
    if(webSocketServer) {
        console.error('Server already running')
        return
    }

    webSocketServer = new WebSocket.Server({
        port
    })

    console.log(`${new Date().toISOString()}: started WebSocket server on port ${port}`)

    webSocketServer.on('connection', webSocketClient => {
        webSocketClient.on('message', message => {
            webSocketClient.send('I ack you')
        })

        webSocketServer.broadcast(JSON.stringify({
            clientCount: webSocketServer.clients.size
        }))
    })

    webSocketServer.broadcast = function(data) {
        webSocketServer.clients.forEach(client => {
            if(client.readyState === WebSocket.OPEN) {
                client.send(data)
            }
        })
    }
}

function start({ port }) {
    startServer(port)
}

async function stop() {
    return await new Promise((resolve, reject) => {
        if(!webSocketServer) {
            return reject('No server to stop')
        }
        webSocketServer.close((error) => {
            if(error) {
                return reject(error)
            }
            resolve()
        })
    })
}

module.exports = {
    start,
    stop,
    publishTransactionToClients
}
