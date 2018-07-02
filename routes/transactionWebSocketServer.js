/*!
 * IOTA Transaction Stream
 * Copyright(c) 2017 Peter Ryszkiewicz
 * MIT Licensed
 */

const WebSocket = require('ws')

// TODO: Clear out dead connections; utilize pinging
let webSocketServer

function publishTransactionToClients(transaction) {
    webSocketServer.broadcast(JSON.stringify(transaction))
}

function startServer(port) {
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

module.exports = function(port) {
    startServer(port)

    return {
        publishTransactionToClients
    }
}

